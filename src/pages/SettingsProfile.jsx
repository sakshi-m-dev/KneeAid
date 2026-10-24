import React, { useState } from 'react';
import { Sliders, User, RefreshCw, Smartphone, Bluetooth } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLiveData } from '../context/LiveDataContext';
import './SettingsProfile.css';

const SettingsProfile = () => {
  const { profile, setProfile, settings, setSettings } = useAppContext();
  const { connected, calibrateMpu, setMotorAssistance } = useLiveData();
  
  // Local state for editing before saving
  const [localProfile, setLocalProfile] = useState(profile);
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  const handleAssistanceChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setLocalSettings(prev => ({ ...prev, assistance: val }));
    if (connected) {
      setMotorAssistance(val);
    }
  };

  const handleCalibration = async () => {
    setIsCalibrating(true);
    await calibrateMpu();
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrated(true);
      setTimeout(() => setCalibrated(false), 3000);
    }, 1000);
  };

  const handleSave = () => {
    setProfile(localProfile);
    setSettings(localSettings);
    if (connected) {
      setMotorAssistance(localSettings.assistance);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Profile</h1>
          <p className="subtitle">Prototype Configuration · Patient Profile</p>
        </div>
        <div className={`badge ${connected ? 'badge-green' : 'badge-orange'}`}>
          <Bluetooth size={12} style={{ marginRight: '4px' }} />
          {connected ? 'SYNCED TO ESP32' : 'OFFLINE PROFILE'}
        </div>
      </div>

      <div className="settings-grid">
        <div className="device-config-card surface-card">
          <div className="card-header">
            <Sliders size={20} color="var(--blue)" />
            <h3 className="card-title">Prototype Configuration</h3>
          </div>
          
          <div className="slider-group">
            <div className="slider-header">
              <label>Motor Assistance Intensity (PWM)</label>
              <span>{localSettings.assistance}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={localSettings.assistance} 
              onChange={handleAssistanceChange}
              className="range-slider"
            />
            <p className="help-text">
              Adjusts TB6612FNG PWM duty cycle for the DC gear motor / Bowden cable swing assist.
              <br />
              <span style={{ color: connected ? 'var(--teal)' : 'var(--muted)' }}>
                {connected
                  ? '● Transmitting live PWM command to ESP32'
                  : '○ Saved locally — will sync on next BLE connection'}
              </span>
            </p>
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <label>Gait Detection Sensitivity</label>
              <span>{localSettings.sensitivity}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={localSettings.sensitivity} 
              onChange={(e) => setLocalSettings({...localSettings, sensitivity: parseInt(e.target.value, 10)})}
              className="range-slider"
            />
            <p className="help-text">
              Configures threshold filtering for detecting foot contact from the single insole FSR and MPU6050 swing oscillations.
            </p>
          </div>

          <div className="actions-group">
            <button 
              className="btn-primary" 
              onClick={handleCalibration}
              disabled={isCalibrating}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <RefreshCw size={14} className={isCalibrating ? "spin" : ""} /> 
              {isCalibrating 
                ? 'Zeroing MPU6050 IMU...' 
                : (calibrated ? 'MPU6050 Zero-Point Calibrated!' : 'Calibrate MPU6050 Sensor (Zero Point)')}
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#666', textAlign: 'center', display: 'block', marginTop: '6px' }}>
              Hold leg straight while zeroing to calibrate base reference angle.
            </span>
          </div>
        </div>

        <div className="right-col">
          <div className="profile-card surface-card">
            <div className="card-header">
              <User size={20} color="var(--teal)" />
              <h3 className="card-title">Patient Profile</h3>
            </div>
            <div className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={localProfile.name} onChange={e => setLocalProfile({...localProfile, name: e.target.value})} className="form-input" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" value={localProfile.height} onChange={e => setLocalProfile({...localProfile, height: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" value={localProfile.weight} onChange={e => setLocalProfile({...localProfile, weight: e.target.value})} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Injury Diagnosis</label>
                <select className="form-select" value={localProfile.injuryType} onChange={e => setLocalProfile({...localProfile, injuryType: e.target.value})}>
                  <option>Post-ACL Reconstruction</option>
                  <option>Meniscus Tear</option>
                  <option>Osteoarthritis</option>
                </select>
              </div>
              <button onClick={handleSave} className="btn-primary" style={{marginTop: '1rem', justifyContent: 'center'}}>
                {saved ? 'Saved Successfully!' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="ota-card surface-card">
            <div className="card-header">
              <Smartphone size={20} color="var(--accent)" />
              <h3 className="card-title">Firmware & Hardware Build</h3>
            </div>
            <div className="ota-content">
              <div className="version-info">
                <span>Hardware: ESP32 + MPU6050 + FSR</span>
                <span className="badge badge-green">Proto v1.0</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginTop: '6px' }}>
                Flashed via USB / ESP-IDF / Arduino IDE. TB6612FNG motor driver & Bowden cable actuator.
              </p>
              <button className="btn-primary" disabled style={{ opacity: 0.4, justifyContent: 'center', marginTop: '10px' }}>
                Wireless OTA: Production Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfile;
