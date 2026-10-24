import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, BarChart2, User, Settings, AlertTriangle, LogOut, Bluetooth, X } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import { useAppContext } from '../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { connected, connectHardware, disconnectHardware, connectionStatus } = useLiveData();
  const { logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (connected) disconnectHardware();
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (onClose) onClose();
    navigate('/');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <Activity color="var(--accent)" size={32} />
            <h2>kneeAid</h2>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* BLE Connection State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className={`status-badge ${connected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            {connected ? 'ESP32 CONNECTED' : 'WAITING FOR ESP32'}
          </div>

          {!connected && (
            <button
              onClick={connectHardware}
              disabled={connectionStatus === 'connecting'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(74, 240, 176, 0.1)',
                border: '1px solid rgba(74, 240, 176, 0.4)',
                color: 'var(--teal)',
                padding: '6px 10px',
                borderRadius: '3px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Bluetooth size={12} />
              {connectionStatus === 'connecting' ? 'Connecting…' : 'Connect KneeAid-ESP32'}
            </button>
          )}

          {connected && (
            <button
              onClick={disconnectHardware}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(232, 60, 42, 0.1)',
                border: '1px solid rgba(232, 60, 42, 0.3)',
                color: 'var(--red)',
                padding: '6px 10px',
                borderRadius: '3px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Bluetooth size={12} />
              Disconnect
            </button>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/app"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
          onClick={onClose}
        >
          <Activity size={20} />
          <span>Live Monitor</span>
        </NavLink>
        <NavLink
          to="/app/analytics"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <BarChart2 size={20} />
          <span>Gait Analytics</span>
        </NavLink>
        <NavLink
          to="/app/rehab"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <User size={20} />
          <span>Rehab Goals</span>
        </NavLink>
        <NavLink
          to="/app/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <NavLink
          to="/app/emergency"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <AlertTriangle size={20} />
          <span>Safety &amp; Alerts</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {/* Power source note — no battery sensor on this prototype */}
        <div className="battery-status" style={{ marginTop: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
            Power: USB / 3.7 V LiPo (unmonitored)
          </span>
        </div>

        <div className="version-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <span>ESP32 Proto v1.0</span>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
