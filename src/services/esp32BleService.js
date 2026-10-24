/**
 * ==============================================================================
 * KneeAid Prototype — ESP32 Hardware Communication Layer (Web Bluetooth)
 * ==============================================================================
 * Physical Hardware Prototype:
 *  - Microcontroller : ESP32  (BLE Server, name = "KneeAid-ESP32")
 *  - IMU Sensor      : MPU6050  (accel + gyro + temperature)
 *  - Contact Sensor  : Single FSR (insole ground-contact pressure)
 *  - Motor Driver    : TB6612FNG Dual H-Bridge
 *  - Actuator        : Small DC Gear Motor via Bowden Cable to knee sleeve
 *
 * PACKET FORMAT  (comma-separated, 9 fields, sent as UTF-8 text):
 *
 *   FSR,AX,AY,AZ,GX,GY,GZ,TEMP,MOTOR
 *
 *   FSR   – raw FSR ADC reading   (integer, e.g. 681)
 *   AX    – accelerometer X  (g)  (float, e.g. -0.07)
 *   AY    – accelerometer Y  (g)  (float, e.g. -9.77)
 *   AZ    – accelerometer Z  (g)  (float, e.g.  1.84)
 *   GX    – gyroscope X  (°/s)   (float)
 *   GY    – gyroscope Y  (°/s)   (float)
 *   GZ    – gyroscope Z  (°/s)   (float)
 *   TEMP  – MPU6050 die temperature (°C, float, e.g. 28.4)
 *   MOTOR – 1 = TB6612FNG active, 0 = idle
 *
 * Example:  "681,-0.07,-9.77,1.84,0.01,-0.02,-0.00,28.4,1"
 * ==============================================================================
 */

// Nordic UART Service (NUS) UUIDs — match your ESP32 BLE GATT server
export const BLE_CONFIG = {
  SERVICE_UUID:       '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  TX_CHAR_UUID:       '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // ESP32 → Web App (Notify)
  RX_CHAR_UUID:       '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // Web App → ESP32 (Write)
  DEVICE_NAME:        'KneeAid-ESP32',
};

/**
 * Estimate a knee flexion angle (degrees) from the MPU6050 accelerometer pitch.
 *
 * The MPU6050 is mounted on the knee brace such that AY ≈ –g when the leg is
 * extended.  As the knee flexes, AZ increases.  We use atan2(AZ, |AY|) which
 * gives 0° at full extension and grows positive during flexion.
 *
 * This is a rough heuristic; NOT clinically accurate.
 * Clamp output to [0, 140] degrees.
 */
function estimateFlexionAngle(ax, ay, az) {
  // Pitch angle in the sagittal plane (simplified, gravity-based)
  const pitch = Math.atan2(az, Math.sqrt(ax * ax + ay * ay)) * (180 / Math.PI);
  // Map pitch → positive angle, clamped
  return Math.max(0, Math.min(140, Math.abs(pitch)));
}

// FSR threshold: readings above this are considered "foot contact / pressure detected"
// Adjust to match your physical FSR + resistor divider characteristic
const FSR_THRESHOLD = 100;

class Esp32BleService {
  constructor() {
    this.device        = null;
    this.server        = null;
    this.service       = null;
    this.txChar        = null;
    this.rxChar        = null;
    this.isConnected   = false;
    this.dataCallbacks   = new Set();
    this.statusCallbacks = new Set();
    this.errorCallbacks  = new Set();

    this.onDisconnected = this.onDisconnected.bind(this);
    this.handleCharacteristicValueChanged =
      this.handleCharacteristicValueChanged.bind(this);
  }

  /** Check if Web Bluetooth API is available */
  isSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /** Subscribe to incoming telemetry packets */
  onData(cb) {
    this.dataCallbacks.add(cb);
    return () => this.dataCallbacks.delete(cb);
  }

  /** Subscribe to connection status changes: 'disconnected' | 'connecting' | 'connected' */
  onStatusChange(cb) {
    this.statusCallbacks.add(cb);
    return () => this.statusCallbacks.delete(cb);
  }

  /** Subscribe to error notifications */
  onError(cb) {
    this.errorCallbacks.add(cb);
    return () => this.errorCallbacks.delete(cb);
  }

  emitStatus(status, details = null) {
    this.statusCallbacks.forEach(cb => { try { cb(status, details); } catch (e) { console.error(e); } });
  }
  emitError(err) {
    this.errorCallbacks.forEach(cb => { try { cb(err); } catch (e) { console.error(e); } });
  }
  emitData(parsed) {
    this.dataCallbacks.forEach(cb => { try { cb(parsed); } catch (e) { console.error(e); } });
  }

  /** Connect to KneeAid-ESP32 over Web Bluetooth */
  async connect() {
    if (!this.isSupported()) {
      const err = new Error(
        'Web Bluetooth is not supported in this browser. Please use Chrome or Edge over HTTPS/localhost.'
      );
      this.emitError(err);
      throw err;
    }

    try {
      this.emitStatus('connecting');

      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: BLE_CONFIG.DEVICE_NAME },
          { namePrefix: 'KneeAid' },
        ],
        optionalServices: [BLE_CONFIG.SERVICE_UUID],
      });

      this.device.addEventListener('gattserverdisconnected', this.onDisconnected);

      this.server  = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService(BLE_CONFIG.SERVICE_UUID);

      // TX: notifications from ESP32
      this.txChar = await this.service.getCharacteristic(BLE_CONFIG.TX_CHAR_UUID);
      await this.txChar.startNotifications();
      this.txChar.addEventListener(
        'characteristicvaluechanged',
        this.handleCharacteristicValueChanged
      );

      // RX: optional write-back (motor commands, calibration)
      try {
        this.rxChar = await this.service.getCharacteristic(BLE_CONFIG.RX_CHAR_UUID);
      } catch {
        console.warn('RX characteristic not found — app will be read-only.');
      }

      this.isConnected = true;
      this.emitStatus('connected', {
        deviceName: this.device.name || BLE_CONFIG.DEVICE_NAME,
        deviceId:   this.device.id,
      });

      return true;
    } catch (err) {
      this.isConnected = false;
      this.emitStatus('disconnected', { error: err.message });
      if (err.name !== 'NotFoundError') {
        this.emitError(err);
      }
      throw err;
    }
  }

  /** Handle incoming BLE characteristic packet */
  handleCharacteristicValueChanged(event) {
    try {
      const raw = new TextDecoder('utf-8').decode(event.target.value).trim();
      if (!raw) return;
      const parsed = this.parsePacket(raw);
      if (parsed) this.emitData(parsed);
    } catch (err) {
      console.warn('Error processing BLE packet:', err);
    }
  }

  /**
   * Parse packet format:  FSR,AX,AY,AZ,GX,GY,GZ,TEMP,MOTOR
   * Returns null if packet is invalid.
   */
  parsePacket(raw) {
    const parts = raw.split(',').map(s => s.trim());
    if (parts.length < 9) {
      console.warn('Incomplete BLE packet (expected 9 fields):', raw);
      return null;
    }

    const fsr   = parseInt(parts[0],   10) || 0;
    const ax    = parseFloat(parts[1]) || 0;
    const ay    = parseFloat(parts[2]) || 0;
    const az    = parseFloat(parts[3]) || 0;
    const gx    = parseFloat(parts[4]) || 0;
    const gy    = parseFloat(parts[5]) || 0;
    const gz    = parseFloat(parts[6]) || 0;
    const temp  = parseFloat(parts[7]) || 0;
    const motor = parseInt(parts[8],  10) === 1;

    const fsrPressed     = fsr > FSR_THRESHOLD;
    const fsrPercent     = Math.min(100, Math.round((fsr / 4095) * 100)); // 12-bit ADC assumed
    const estimatedAngle = estimateFlexionAngle(ax, ay, az);

    // Magnitude of angular velocity — used downstream for motion detection
    const gyroMagnitude = Math.sqrt(gx * gx + gy * gy + gz * gz);
    // Magnitude of linear acceleration (minus gravity) — proxy for dynamic movement
    const accelMag      = Math.sqrt(ax * ax + ay * ay + az * az);

    // Simple gait-phase heuristic (for display only — not clinically validated)
    let gaitPhase = 'idle';
    if (fsrPressed) {
      gaitPhase = 'stance';
    } else if (estimatedAngle > 10 || gyroMagnitude > 5) {
      gaitPhase = 'swing';
    }

    return {
      timestamp:      Date.now(),
      // Raw sensor values
      fsr,
      fsrPressed,
      fsrPercent,
      ax, ay, az,
      gx, gy, gz,
      temperature:    temp,
      // Derived
      motorActive:    motor,
      estimatedAngle,
      gyroMagnitude,
      accelMag,
      gaitPhase,
      // Keep legacy aliases so existing UI code continues to work
      kneeAngle:  estimatedAngle,
      fsrValue:   fsrPercent,
      battery:    null,   // No battery sensor on this prototype
      cadence:    0,      // Derived in LiveDataContext, not in the packet
      rawPacket:  raw,
    };
  }

  /** Send a raw command string or JSON object to the ESP32 */
  async sendCommand(payload) {
    if (!this.isConnected || !this.rxChar) {
      console.warn('Cannot send command: not connected or no RX characteristic.');
      return false;
    }
    try {
      const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
      await this.rxChar.writeValue(new TextEncoder().encode(msg + '\n'));
      return true;
    } catch (err) {
      console.error('Failed to send command to ESP32:', err);
      this.emitError(err);
      return false;
    }
  }

  /** Send motor assistance intensity (0–100 %) to ESP32 */
  async sendMotorAssistance(pct) {
    return this.sendCommand({ cmd: 'assist', val: Math.max(0, Math.min(100, pct)) });
  }

  /** Send MPU6050 zero-calibration command */
  async sendCalibrate() {
    return this.sendCommand({ cmd: 'zero_mpu' });
  }

  /** Cleanly disconnect */
  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.onDisconnected();
  }

  onDisconnected() {
    this.isConnected = false;
    this.server  = null;
    this.service = null;
    this.txChar  = null;
    this.rxChar  = null;
    this.emitStatus('disconnected');
  }
}

export const esp32Ble = new Esp32BleService();
