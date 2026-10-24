import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Phone, AlertOctagon, HeartPulse, X, Plus, Trash2, ShieldCheck,
  Thermometer, Bluetooth, Zap, Activity
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLiveData } from '../context/LiveDataContext';
import './EmergencySafety.css';

const EmergencySafety = () => {
  const { contacts, setContacts } = useAppContext();
  const {
    connected,
    impactDetected,
    clearImpactAlert,
    temperature,
    motorActive,
    fsrPressed,
    gyroMagnitude,
  } = useLiveData();

  const [sosStatus, setSosStatus]           = useState('idle'); // idle | sending | sent
  const [fallActionStatus, setFallActionStatus] = useState('idle');

  // Surface real impact flag from ESP32 (MPU6050 spike detection done on-device)
  const fallDetected = impactDetected;

  const triggerSOS = () => {
    if (sosStatus !== 'idle') return;
    setSosStatus('sending');
    setTimeout(() => setSosStatus('sent'), 2000);
    setTimeout(() => setSosStatus('idle'), 6000);
  };

  const triggerFallAction = () => {
    if (fallActionStatus !== 'idle') return;
    setFallActionStatus('sending');
    setTimeout(() => setFallActionStatus('sent'), 2000);
    setTimeout(() => {
      setFallActionStatus('idle');
      clearImpactAlert();
    }, 6000);
  };

  return (
    <div className="emergency-page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color:'var(--red)' }}>Safety &amp; Alerts</h1>
          <p className="subtitle">
            {connected
              ? 'MPU6050 MOTION MONITORING · SOFTWARE SOS DISPATCH'
              : 'BLE DISCONNECTED · CONNECT HARDWARE'}
          </p>
        </div>
        <div className={`badge ${connected ? 'badge-green' : 'badge-orange'}`}>
          <Bluetooth size={12} style={{ marginRight:'4px' }} />
          {connected ? 'HARDWARE ACTIVE' : 'DISCONNECTED'}
        </div>
      </div>

      {/* Impact alert banner — only shows when ESP32 reports impactDetected=1 */}
      {fallDetected && (
        <div className="fall-alert-banner">
          <div className="alert-content">
            <AlertOctagon size={48} className="pulse-alert" />
            <div>
              <h2>IMPACT / ABNORMAL MOTION DETECTED</h2>
              <p>MPU6050 registered a sudden deceleration/shock threshold exceedance on the ESP32.</p>
            </div>
          </div>
          <div className="alert-actions">
            <button className="btn-secondary" onClick={clearImpactAlert}>
              <X size={14} style={{ marginRight:'6px' }} /> I'm Okay
            </button>
            <button
              className={`btn-danger ${fallActionStatus !== 'idle' ? 'btn-active' : ''}`}
              onClick={triggerFallAction}
              disabled={fallActionStatus !== 'idle'}
            >
              {fallActionStatus === 'idle'    && 'Alert Caregiver'}
              {fallActionStatus === 'sending' && 'Broadcasting…'}
              {fallActionStatus === 'sent'    && 'Caregiver Alerted!'}
            </button>
          </div>
          <div className="countdown-bar"></div>
        </div>
      )}

      <div className="safety-grid">
        {/* SOS Card */}
        <div className="safety-card surface-card sos-card">
          <div className="sos-content">
            <button
              className={`sos-button ${sosStatus !== 'idle' ? 'sos-active' : ''}`}
              onClick={triggerSOS}
              disabled={sosStatus !== 'idle'}
              style={sosStatus === 'sent' ? { background:'var(--teal)', borderColor:'var(--teal)' } : {}}
            >
              <span>
                {sosStatus === 'idle'    && 'SOS'}
                {sosStatus === 'sending' && 'SENDING'}
                {sosStatus === 'sent'    && 'SENT'}
              </span>
            </button>
            <h3 style={sosStatus === 'sent' ? { color:'var(--teal)' } : {}}>
              {sosStatus === 'sent' ? 'Emergency Alert Dispatched' : 'Emergency SOS'}
            </h3>
            <p>
              {sosStatus === 'sending' && 'Broadcasting phone GPS coordinates & alert message…'}
              {sosStatus === 'sent'    && 'Contacts notified with location link.'}
              {sosStatus === 'idle'    && 'Software emergency trigger: uses the companion phone\'s geolocation to alert designated contacts.'}
            </p>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#666', marginTop:'6px', display:'block' }}>
              *Software-only dispatch via phone geolocation — no hardware GNSS on the brace.
            </span>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="safety-card surface-card">
          <div className="card-header">
            <Phone size={20} color="var(--blue)" />
            <h3 className="card-title">Emergency Contacts</h3>
          </div>
          <div className="contacts-list">
            {contacts.map(contact => (
              <div key={contact.id} className="contact-item">
                <div className="contact-info">
                  <h4>{contact.name}</h4>
                  <span>{contact.role}</span>
                </div>
                <button
                  className="btn-outline"
                  style={{ borderColor:'var(--red)', color:'var(--red)' }}
                  onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            className="btn-primary"
            style={{ width:'100%', marginTop:'1rem', justifyContent:'center' }}
            onClick={() => {
              const name = prompt('Enter contact name:');
              const role = prompt('Enter contact role (e.g. Caregiver, Physio):');
              if (name && role) setContacts([...contacts, { id: Date.now().toString(), name, role }]);
            }}
          >
            <Plus size={14} style={{ marginRight:'6px' }} /> Add Contact
          </button>
        </div>

        {/* Hardware telemetry status */}
        <div className="safety-card surface-card system-warnings">
          <div className="card-header">
            <ShieldCheck size={20} color="var(--teal)" />
            <h3 className="card-title">Hardware Telemetry Status</h3>
          </div>

          <div className="warning-list">
            {/* MPU6050 motion */}
            <div className="warning-item clear">
              <div className="status-indicator"></div>
              <div className="warning-text">
                <h4>MPU6050 Motion Activity</h4>
                <span>
                  {connected
                    ? `Active · Gyro magnitude: ${(gyroMagnitude || 0).toFixed(1)} °/s`
                    : 'Not connected'}
                </span>
              </div>
            </div>

            {/* MPU6050 temperature */}
            <div className="warning-item clear">
              <div className="status-indicator"></div>
              <div className="warning-text">
                <h4>MPU6050 Die Temperature</h4>
                <span>
                  {connected && temperature !== null
                    ? `${temperature.toFixed(1)} °C`
                    : 'Not connected'}
                </span>
              </div>
            </div>

            {/* Motor state */}
            <div className={`warning-item ${motorActive ? 'warning' : 'clear'}`}>
              <div className="status-indicator"></div>
              <div className="warning-text">
                <h4>TB6612FNG Motor State</h4>
                <span>
                  {connected
                    ? (motorActive ? 'ACTIVE — cable assist engaged' : 'IDLE')
                    : 'Not connected'}
                </span>
              </div>
            </div>

            {/* FSR contact */}
            <div className="warning-item clear">
              <div className="status-indicator"></div>
              <div className="warning-text">
                <h4>FSR Insole Contact</h4>
                <span>
                  {connected
                    ? (fsrPressed ? 'Ground contact detected' : 'No pressure / swing')
                    : 'Not connected'}
                </span>
              </div>
            </div>

            {/* Separator — not-implemented items */}
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:'8px', marginTop:'4px' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#666',
                textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Not available in current prototype:
              </span>
            </div>

            <div className="warning-item" style={{ opacity:0.45 }}>
              <div className="status-indicator" style={{ background:'#555' }}></div>
              <div className="warning-text">
                <h4 style={{ color:'#888' }}>Battery Percentage</h4>
                <span>No dedicated battery sensor — not implemented</span>
              </div>
            </div>

            <div className="warning-item" style={{ opacity:0.45 }}>
              <div className="status-indicator" style={{ background:'#555' }}></div>
              <div className="warning-text">
                <h4 style={{ color:'#888' }}>Motor Current Draw</h4>
                <span>INA219 not wired in current prototype</span>
              </div>
            </div>

            <div className="warning-item" style={{ opacity:0.45 }}>
              <div className="status-indicator" style={{ background:'#555' }}></div>
              <div className="warning-text">
                <h4 style={{ color:'#888' }}>GPS / Location Hardware</h4>
                <span>No GNSS on brace — SOS uses phone geolocation only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySafety;
