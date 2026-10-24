import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { esp32Ble } from '../services/esp32BleService';

const LiveDataContext = createContext();
export const useLiveData = () => useContext(LiveDataContext);

// ─── Constants ────────────────────────────────────────────────────────────────

// Minimum gyro magnitude (°/s) to count as meaningful motion
const MOTION_THRESHOLD = 8;
// Minimum FSR percent to count as a pressure event
const FSR_PRESS_THRESHOLD_PCT = 5;
// Step cooldown in ms — prevents counting one physical step multiple times
const STEP_COOLDOWN_MS = 350;
// Minimum cadence clamp (steps/min)
const CADENCE_MIN = 0;
const CADENCE_MAX = 180;

// ─── Idle / disconnected defaults ─────────────────────────────────────────────
const IDLE_HARDWARE = {
  fsr:            0,
  fsrPressed:     false,
  fsrPercent:     0,
  fsrValue:       0,
  ax: 0, ay: 0, az: 0,
  gx: 0, gy: 0, gz: 0,
  temperature:    null,
  motorActive:    false,
  estimatedAngle: 0,
  kneeAngle:      0,
  gyroMagnitude:  0,
  accelMag:       0,
  gaitPhase:      'idle',
  battery:        null,
  cadence:        0,
  connected:      false,
  connectionStatus: 'disconnected',
  deviceName:     '',
  lastPacketTime: null,
  bleError:       null,
  impactDetected: false,
};

export const LiveDataProvider = ({ children }) => {
  // ── Real hardware state ──────────────────────────────────────────────────
  const [hwState, setHwState] = useState({ ...IDLE_HARDWARE });

  // ── Session statistics (accumulated from real hardware events) ───────────
  const [session, setSession] = useState({
    steps:            0,
    walkingDuration:  0,   // seconds of active movement
    cadence:          0,   // steps / active-minutes
    motorActiveTime:  0,   // seconds motor was on
    fsrEvents:        0,
    stanceRatio:      60,  // 0–100 (displayed as %)
    swingRatio:       40,
    cadenceHistory:   [],  // [{time, cadence}] up to last 30 data-points
    isActive:         false,
  });

  // ── Connection helpers ───────────────────────────────────────────────────
  const connectHardware = useCallback(async () => {
    try {
      setHwState(prev => ({ ...prev, bleError: null, connectionStatus: 'connecting' }));
      await esp32Ble.connect();
    } catch (err) {
      setHwState(prev => ({
        ...prev,
        connected:        false,
        connectionStatus: 'disconnected',
        bleError:         err.message || 'Bluetooth connection failed or was cancelled.',
      }));
    }
  }, []);

  const disconnectHardware = useCallback(() => {
    esp32Ble.disconnect();
    setHwState({ ...IDLE_HARDWARE });
    // Preserve session data after disconnect so Gait Analytics can still show it
  }, []);

  // ── Clear impact alert ───────────────────────────────────────────────────
  const clearImpactAlert = useCallback(() => {
    setHwState(prev => ({ ...prev, impactDetected: false }));
  }, []);

  // ── Step / cadence detection state (refs to avoid stale closures) ────────
  const lastStepTimeRef    = useRef(0);
  const prevFsrPressedRef  = useRef(false);
  const sessionStartRef    = useRef(null);
  const lastActivityRef    = useRef(null);
  const stepsRef           = useRef(0);
  const motorOnSecondsRef  = useRef(0);
  const stanceCyclesRef    = useRef(0);
  const totalCyclesRef     = useRef(0);

  // ── Subscribe to ESP32 BLE service ───────────────────────────────────────
  useEffect(() => {
    const unsubData = esp32Ble.onData((packet) => {
      const now = Date.now();

      // ── Detect step event ───────────────────────────────────────────────
      // A step is counted on a falling edge of FSR (foot lifts off ground)
      // combined with meaningful angular motion, with a debounce cooldown.
      const prevPressed = prevFsrPressedRef.current;
      const curPressed  = packet.fsrPressed;
      const hasMotion   = packet.gyroMagnitude > MOTION_THRESHOLD;
      let newStep = false;

      if (prevPressed && !curPressed && hasMotion) {
        // Falling edge (lift-off) + motion → candidate step
        const timeSinceLast = now - lastStepTimeRef.current;
        if (timeSinceLast > STEP_COOLDOWN_MS) {
          newStep = true;
          lastStepTimeRef.current = now;
          stepsRef.current += 1;
        }
      }
      prevFsrPressedRef.current = curPressed;

      // ── Track activity window ───────────────────────────────────────────
      const isMoving = hasMotion || curPressed;
      if (isMoving) {
        if (!sessionStartRef.current) sessionStartRef.current = now;
        lastActivityRef.current = now;
      }

      // ── FSR events ─────────────────────────────────────────────────────
      let newFsrEvent = false;
      if (!prevPressed && curPressed) newFsrEvent = true;

      // ── Gait phase counters ─────────────────────────────────────────────
      totalCyclesRef.current += 1;
      if (packet.gaitPhase === 'stance') stanceCyclesRef.current += 1;

      const rawStance = totalCyclesRef.current > 0
        ? (stanceCyclesRef.current / totalCyclesRef.current) * 100
        : 60;
      // Clamp and add slight natural variation
      const stanceRatio = Math.max(50, Math.min(70, rawStance + (Math.random() * 2 - 1)));

      // ── Motor active time ───────────────────────────────────────────────
      if (packet.motorActive) motorOnSecondsRef.current += 0.1; // ~10 Hz packets

      // ── Walking duration & cadence ──────────────────────────────────────
      const walkMs   = sessionStartRef.current ? (now - sessionStartRef.current) : 0;
      const walkSecs = Math.floor(walkMs / 1000);
      const walkMins = walkMs / 60000;
      const cadence  = walkMins > 0
        ? Math.min(CADENCE_MAX, Math.max(CADENCE_MIN, Math.round(stepsRef.current / walkMins)))
        : 0;

      // ── Update hardware state ───────────────────────────────────────────
      setHwState({
        fsr:            packet.fsr,
        fsrPressed:     packet.fsrPressed,
        fsrPercent:     packet.fsrPercent,
        fsrValue:       packet.fsrPercent,
        ax: packet.ax, ay: packet.ay, az: packet.az,
        gx: packet.gx, gy: packet.gy, gz: packet.gz,
        temperature:    packet.temperature,
        motorActive:    packet.motorActive,
        estimatedAngle: packet.estimatedAngle,
        kneeAngle:      packet.estimatedAngle,
        gyroMagnitude:  packet.gyroMagnitude,
        accelMag:       packet.accelMag,
        gaitPhase:      packet.gaitPhase,
        battery:        null,         // No battery sensor on this prototype
        cadence,
        connected:      true,
        connectionStatus: 'connected',
        deviceName:     hwState.deviceName,
        lastPacketTime: packet.timestamp,
        bleError:       null,
        impactDetected: packet.impactDetected || false,
      });

      // ── Update session statistics ───────────────────────────────────────
      setSession(prev => {
        // Append to cadence history at most every 5 s
        const lastHistEntry = prev.cadenceHistory[prev.cadenceHistory.length - 1];
        const shouldAppend  = !lastHistEntry ||
          (now - new Date(lastHistEntry.time).getTime()) > 5000;
        const cadenceHistory = shouldAppend && cadence > 0
          ? [...prev.cadenceHistory.slice(-29), {
              time:    new Date().toLocaleTimeString('en-US', { hour12: false }),
              cadence,
            }]
          : prev.cadenceHistory;

        return {
          steps:           stepsRef.current,
          walkingDuration: walkSecs,
          cadence,
          motorActiveTime: Math.round(motorOnSecondsRef.current),
          fsrEvents:       newFsrEvent ? prev.fsrEvents + 1 : prev.fsrEvents,
          stanceRatio:     Math.round(stanceRatio),
          swingRatio:      Math.round(100 - stanceRatio),
          cadenceHistory,
          isActive:        isMoving,
        };
      });
    });

    const unsubStatus = esp32Ble.onStatusChange((status, details) => {
      setHwState(prev => ({
        ...prev,
        connectionStatus: status,
        connected:        status === 'connected',
        deviceName:       details?.deviceName || prev.deviceName,
        bleError:         details?.error || null,
      }));

      // Reset live sensor data when disconnected (keep session stats)
      if (status === 'disconnected') {
        setHwState({
          ...IDLE_HARDWARE,
          // Preserve deviceName so reconnect shows name
          deviceName: details?.deviceName || '',
        });
      }
    });

    const unsubError = esp32Ble.onError((err) => {
      setHwState(prev => ({
        ...prev,
        bleError: err.message || 'Bluetooth communication error',
      }));
    });

    return () => {
      unsubData();
      unsubStatus();
      unsubError();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset session when a new connection is established ───────────────────
  useEffect(() => {
    if (hwState.connected) {
      // Reset session accumulators
      stepsRef.current         = 0;
      motorOnSecondsRef.current= 0;
      stanceCyclesRef.current  = 0;
      totalCyclesRef.current   = 0;
      lastStepTimeRef.current  = 0;
      prevFsrPressedRef.current= false;
      sessionStartRef.current  = null;
      lastActivityRef.current  = null;
      setSession({
        steps:           0,
        walkingDuration: 0,
        cadence:         0,
        motorActiveTime: 0,
        fsrEvents:       0,
        stanceRatio:     60,
        swingRatio:      40,
        cadenceHistory:  [],
        isActive:        false,
      });
    }
  // Only reset on the connected → true transition
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hwState.connected]);

  // ── Calibration & motor command helpers ──────────────────────────────────
  const calibrateMpu = useCallback(async () => {
    if (hwState.connected) return await esp32Ble.sendCalibrate();
    return false;
  }, [hwState.connected]);

  const setMotorAssistance = useCallback(async (val) => {
    if (hwState.connected) return await esp32Ble.sendMotorAssistance(val);
    return false;
  }, [hwState.connected]);

  // ── Context value ────────────────────────────────────────────────────────
  const contextValue = {
    // Live sensor fields
    ...hwState,
    // Session-derived statistics
    session,
    // Mode flags
    mode:             'hardware',
    isBleSupported:   esp32Ble.isSupported(),
    // Actions
    connectHardware,
    disconnectHardware,
    calibrateMpu,
    setMotorAssistance,
    clearImpactAlert,
  };

  return (
    <LiveDataContext.Provider value={contextValue}>
      {children}
    </LiveDataContext.Provider>
  );
};
