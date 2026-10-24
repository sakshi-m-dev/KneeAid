import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Activity, Clock, Footprints, AlertCircle, Bluetooth, Zap } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import './GaitAnalytics.css';

// ─── Placeholder previous-session sample (shown only when no live session) ──
const PREV_SESSION_DATA = [
  { time: '0:00',  cadence: 0   },
  { time: '0:30',  cadence: 62  },
  { time: '1:00',  cadence: 74  },
  { time: '1:30',  cadence: 78  },
  { time: '2:00',  cadence: 76  },
  { time: '2:30',  cadence: 80  },
  { time: '3:00',  cadence: 77  },
];

const PHASE_COLORS = ['var(--teal)', 'var(--blue)'];

const SummaryCard = ({ icon: Icon, title, value, subnote }) => (
  <div className="summary-card surface-card">
    <div className="summary-icon">
      <Icon size={24} color="var(--accent)" />
    </div>
    <div className="summary-details">
      <h3>{value}</h3>
      <p>{title}</p>
      {subnote && <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#666' }}>{subnote}</span>}
    </div>
  </div>
);

const GaitAnalytics = () => {
  const { connected, session } = useLiveData();

  // Use live session data if connected and walking, otherwise show previous-session sample
  const hasLiveData = connected && session.cadenceHistory.length > 0;
  const cadenceData = hasLiveData ? session.cadenceHistory : PREV_SESSION_DATA;
  const dataLabel   = hasLiveData ? 'LIVE SESSION' : 'PREVIOUS SESSION SAMPLE';

  const phaseData = [
    { name: `Stance (FSR contact: ${session.stanceRatio}%)`, value: session.stanceRatio },
    { name: `Swing (air: ${session.swingRatio}%)`,            value: session.swingRatio },
  ];

  const formatDuration = (secs) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}m ${s}s`;
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gait Analytics</h1>
          <p className="subtitle">Derived Metrics · MPU6050 + FSR Activity</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <div className={`badge ${connected ? 'badge-green' : 'badge-orange'}`}>
            <Bluetooth size={12} style={{ marginRight:'4px' }} />
            {connected ? 'LIVE SESSION' : 'HARDWARE DISCONNECTED'}
          </div>
          <button className="btn-primary" disabled={!connected || !hasLiveData}>Export Report</button>
        </div>
      </div>

      {/* Accuracy notice */}
      <div style={{
        background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:'4px',
        padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:'0.75rem',
        fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--muted)'
      }}>
        <AlertCircle size={16} color="var(--accent)" style={{ flexShrink:0 }} />
        <span>
          {connected
            ? `Live session active. Metrics are derived from FSR contact events and MPU6050 gyro oscillations — not from clinically validated sensors. ${hasLiveData ? '' : 'Walk to begin accumulating session data.'}`
            : 'Connect to KneeAid-ESP32 to begin a live session. The chart below shows a previous session sample.'}
        </span>
      </div>

      {/* Summary cards */}
      <div className="summary-grid">
        <SummaryCard
          icon={Footprints}
          title="Session Steps"
          value={connected ? session.steps.toLocaleString() : '--'}
          subnote="FSR lift-off events · debounced"
        />
        <SummaryCard
          icon={Clock}
          title="Active Duration"
          value={connected ? formatDuration(session.walkingDuration) : '--'}
          subnote="Movement detected"
        />
        <SummaryCard
          icon={Activity}
          title="Est. Cadence"
          value={connected && session.cadence > 0 ? `${session.cadence} SPM` : '--'}
          subnote="Steps / active minutes"
        />
        <SummaryCard
          icon={Zap}
          title="Motor Assist Time"
          value={connected && session.motorActiveTime > 0 ? `${session.motorActiveTime}s` : '--'}
          subnote="TB6612FNG active duration"
        />
      </div>

      <div className="charts-grid">
        {/* Cadence trend */}
        <div className="chart-card surface-card cadence-chart">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3 className="card-title">Cadence Trend (steps/min)</h3>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#666' }}>
              {dataLabel}
            </span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cadenceData}>
                <defs>
                  <linearGradient id="colorCadence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--teal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--muted)"
                  tick={{ fill:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:10 }} />
                <YAxis stroke="var(--muted)"
                  tick={{ fill:'var(--muted)', fontFamily:'var(--font-mono)', fontSize:10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor:'var(--bg-secondary)', borderColor:'var(--border)',
                    borderRadius:'4px', fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--paper)' }}
                  itemStyle={{ color:'var(--teal)' }}
                />
                <Area type="monotone" dataKey="cadence" stroke="var(--teal)"
                  strokeWidth={2} fillOpacity={1} fill="url(#colorCadence)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stance/Swing pie */}
        <div className="chart-card surface-card pie-chart-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3 className="card-title">Stance / Swing Ratio</h3>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#666' }}>
              FSR CONTACT DURATION
            </span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={phaseData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value" stroke="none"
                >
                  {phaseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PHASE_COLORS[index % PHASE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor:'var(--bg-secondary)', borderColor:'var(--border)',
                    borderRadius:'4px', fontFamily:'var(--font-mono)', fontSize:'11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: PHASE_COLORS[0] }}></div>
                <span>Stance (FSR contact: {session.stanceRatio}%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: PHASE_COLORS[1] }}></div>
                <span>Swing (air flexion: {session.swingRatio}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaitAnalytics;
