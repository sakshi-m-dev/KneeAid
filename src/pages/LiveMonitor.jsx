import React from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { Activity, Zap, Thermometer, Bluetooth, AlertCircle, PlayCircle } from 'lucide-react';
import './LiveMonitor.css';

// ─── Gauge — keeps existing design ──────────────────────────────────────────
const Gauge = ({ angle, connected }) => {
  const radius       = 80;
  const circumference = radius * 2 * Math.PI;
  const clampedAngle  = Math.min(140, Math.max(0, angle || 0));
  const strokeDashoffset = circumference - (clampedAngle / 140) * (circumference * 0.75);

  return (
    <div className="gauge-container">
      <svg className="gauge-svg" width="240" height="240" viewBox="0 0 200 200">
        {/* Background Arc */}
        <circle
          className="gauge-bg"
          cx="100" cy="100" r={radius}
          fill="transparent" strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          transform="rotate(135 100 100)"
        />
        {/* Foreground Arc */}
        <circle
          className="gauge-fill"
          cx="100" cy="100" r={radius}
          fill="transparent" strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={connected ? (strokeDashoffset + circumference * 0.25) : circumference}
          transform="rotate(135 100 100)"
          style={{ transition: 'stroke-dashoffset 80ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="gauge-value">
        {connected
          ? <span className="angle-text">{Math.round(clampedAngle)}°</span>
          : <span className="angle-text" style={{ color: '#444', fontSize: '22px' }}>--</span>
        }
        <span className="angle-label">Est. Knee Motion</span>
        <span className="angle-subnote">MPU6050 pitch (heuristic)</span>
      </div>
    </div>
  );
};

// ─── FSR Indicator — keeps existing design ───────────────────────────────────
const FsrIndicator = ({ fsrPressed, fsrPercent, fsr, connected }) => (
  <div className="heatmap-container surface-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
      <h3 className="card-title">FSR Contact Sensor</h3>
      <span className="badge" style={{ fontSize: '9px', padding: '2px 6px' }}>Single FSR Insole</span>
    </div>

    <div className="foot-svg-container">
      <svg viewBox="0 0 100 250" className="foot-svg">
        <path
          d="M 30 50 C 30 10, 70 10, 70 50 C 80 100, 90 150, 80 200 C 70 240, 30 240, 20 200 C 10 150, 20 100, 30 50 Z"
          fill="#0f1115" stroke="var(--border)" strokeWidth="2"
        />
        <ellipse cx="50" cy="130" rx="16" ry="25" fill="none" stroke="#222" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50" cy="210" r="14"       fill="none" stroke="#222" strokeWidth="1" strokeDasharray="3 3" />
        {/* Actual FSR placement — ball-of-foot area */}
        <circle
          cx="50" cy="65" r="22"
          fill={connected && fsrPressed ? 'var(--teal)' : 'rgba(255,255,255,0.04)'}
          stroke={connected && fsrPressed ? 'rgba(74,240,176,0.8)' : '#333'}
          strokeWidth={connected && fsrPressed ? '3' : '1.5'}
          style={{
            transition: 'all 0.1s ease',
            filter: connected && fsrPressed ? 'drop-shadow(0 0 8px rgba(74,240,176,0.6))' : 'none',
          }}
        />
        <text x="50" y="69" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7"
          fill={connected && fsrPressed ? '#0d0c0a' : '#555'} fontWeight="bold">FSR</text>
      </svg>
    </div>

    <div style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
      <div
        className={`badge ${connected && fsrPressed ? 'badge-green' : 'badge-orange'}`}
        style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '11px', letterSpacing: '0.08em' }}
      >
        {!connected
          ? '○ BLE DISCONNECTED'
          : fsrPressed
            ? '● GROUND CONTACT DETECTED'
            : '○ NO PRESSURE (SWING / IDLE)'}
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginTop: '6px' }}>
        {connected
          ? `FSR raw: ${fsr}  (${fsrPercent}%)`
          : 'Connect hardware to see FSR data'}
      </p>
    </div>
  </div>
);

// ─── Status Card — keeps existing design ────────────────────────────────────
const StatusCard = ({ icon: Icon, label, value, subtext, type }) => (
  <div className={`status-card surface-card ${type}`}>
    <div className="icon-wrapper"><Icon size={24} /></div>
    <div className="status-info">
      <span className="status-label">{label}</span>
      <span className="status-value">{value}</span>
      {subtext && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>{subtext}</span>}
    </div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const LiveMonitor = () => {
  const {
    kneeAngle,
    estimatedAngle,
    gaitPhase,
    fsrPressed,
    fsrPercent,
    fsr,
    motorActive,
    temperature,
    connected,
    connectionStatus,
    connectHardware,
    bleError,
    isBleSupported,
    session,
  } = useLiveData();

  const getPhaseBadgeColor = (phase) => {
    switch (phase) {
      case 'stance': return 'badge-green';
      case 'swing':  return 'badge-blue';
      default:       return 'badge-orange';
    }
  };

  // ── Format walking duration ────────────────────────────────────────────
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="live-monitor-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Dashboard</h1>
          <p className="subtitle">
            {connected
              ? 'ESP32 HARDWARE CONNECTED · LIVE SENSOR DATA'
              : 'WAITING FOR ESP32 · BLE DISCONNECTED'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className={`badge ${connected ? 'badge-green' : 'badge-orange'}`}>
            <Bluetooth size={14} style={{ marginRight: '6px' }} />
            {connected ? 'ESP32 CONNECTED' : connectionStatus === 'connecting' ? 'CONNECTING…' : 'DISCONNECTED'}
          </div>
        </div>
      </div>

      {/* ── Disconnected state ──────────────────────────────────────────── */}
      {!connected ? (
        <div className="waiting-state surface-card"
          style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                   minHeight:'60vh', textAlign:'center', padding:'3rem 2rem', gap:'1.5rem' }}>
          <div className="loader-knee" style={{ transform: 'scale(1.2)' }}>
            <svg viewBox="0 0 80 120" fill="none" width="80" height="120">
              <g className="knee-upper">
                <rect x="28" y="0" width="24" height="60" rx="12" fill="#1e1e1e" stroke="#333" strokeWidth="1" />
                <rect x="34" y="8" width="12" height="44" rx="6" fill="#2a2a2a" />
              </g>
              <ellipse cx="40" cy="62" rx="14" ry="12" fill="#4af0b0" opacity="0.3" />
              <ellipse cx="40" cy="62" rx="8" ry="7" fill="#4af0b0" opacity="0.8" />
              <g className="knee-lower" style={{ transformOrigin:'40px 62px', animation:'knee-ext 2s ease-in-out infinite alternate' }}>
                <rect x="28" y="62" width="24" height="55" rx="12" fill="#1e1e1e" stroke="#333" strokeWidth="1" />
                <rect x="34" y="68" width="12" height="40" rx="6" fill="#2a2a2a" />
              </g>
            </svg>
          </div>

          <div>
            <h2 style={{ fontFamily:'var(--font-disp)', fontSize:'28px', letterSpacing:'0.05em', color:'var(--paper)', textTransform:'uppercase' }}>
              WAITING FOR ESP32 HARDWARE
            </h2>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--muted)', marginTop:'6px', maxWidth:'480px', lineHeight:'1.5' }}>
              Power on your KneeAid prototype (ESP32 + MPU6050 + FSR) and click below to pair via Web Bluetooth.
            </p>
          </div>

          {!isBleSupported && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(232,60,42,0.1)',
                          border:'1px solid rgba(232,60,42,0.3)', padding:'8px 16px', borderRadius:'4px',
                          color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:'11px', maxWidth:'480px' }}>
              <AlertCircle size={16} />
              <span>Web Bluetooth is not supported in this browser. Please use Chrome or Edge over HTTPS/localhost.</span>
            </div>
          )}

          {bleError && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(232,60,42,0.1)',
                          border:'1px solid rgba(232,60,42,0.3)', padding:'8px 16px', borderRadius:'4px',
                          color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:'11px', maxWidth:'480px' }}>
              <AlertCircle size={16} />
              <span>{bleError}</span>
            </div>
          )}

          <button
            onClick={connectHardware}
            className="btn-primary"
            disabled={!isBleSupported || connectionStatus === 'connecting'}
            style={{ padding:'12px 24px', fontSize:'12px', letterSpacing:'0.08em' }}
          >
            <Bluetooth size={16} style={{ marginRight:'8px' }} />
            {connectionStatus === 'connecting' ? 'CONNECTING TO ESP32…' : 'CONNECT KneeAid-ESP32 (BLE) →'}
          </button>

          <div style={{ marginTop:'1rem', borderTop:'1px solid var(--border)', paddingTop:'1.5rem', width:'100%', maxWidth:'480px' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.1em' }}>
              Active Prototype Configuration:
            </span>
            <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginTop:'8px', flexWrap:'wrap' }}>
              <span className="badge">ESP32 BLE</span>
              <span className="badge">MPU6050 IMU</span>
              <span className="badge">Single FSR</span>
              <span className="badge">TB6612FNG Driver</span>
              <span className="badge">DC Gear Motor</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Connected — live data ──────────────────────────────────────── */
        <div className="monitor-grid">
          {/* Gauge Card */}
          <div className="main-gauge-card surface-card">
            <div style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
              <h3 className="card-title">Joint Kinematics</h3>
              <span className="badge" style={{ fontSize:'9px', padding:'2px 6px' }}>MPU6050 · heuristic</span>
            </div>

            <Gauge angle={estimatedAngle || kneeAngle} connected={connected} />

            <div className="gait-phase-display">
              <span style={{ fontSize:'10px' }}>Gait Cycle Phase</span>
              <div className={`badge ${getPhaseBadgeColor(gaitPhase)} phase-badge`}>
                {gaitPhase.toUpperCase()}
              </div>
            </div>
          </div>

          {/* FSR Indicator */}
          <FsrIndicator
            fsrPressed={fsrPressed}
            fsrPercent={fsrPercent}
            fsr={fsr}
            connected={connected}
          />

          {/* Status Cards */}
          <div className="status-cards-column">
            <StatusCard
              icon={Zap}
              label="TB6612FNG Motor Assist"
              value={motorActive ? 'ACTIVE' : 'IDLE'}
              subtext="DC Gear Motor · Bowden Cable"
              type={motorActive ? 'active' : 'idle'}
            />

            <StatusCard
              icon={Thermometer}
              label="MPU6050 Temperature"
              value={temperature !== null ? `${temperature.toFixed(1)} °C` : '--'}
              subtext="Die temperature (not ambient)"
              type="normal"
            />

            <StatusCard
              icon={Activity}
              label="Est. Cadence"
              value={session.cadence > 0 ? `${session.cadence} SPM` : '-- SPM'}
              subtext={`${session.steps} steps · ${formatDuration(session.walkingDuration)} active`}
              type="normal"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitor;
