import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, Activity } from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';
import './AppLayout.css';

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { connected } = useLiveData();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="app-container">
      {/* Mobile / Tablet Top App Bar */}
      <header className="mobile-header">
        <div className="mobile-header-logo" onClick={() => navigate('/')}>
          <Activity color="var(--accent)" size={24} />
          <span>KNEEAID</span>
        </div>

        <div className="mobile-header-actions">
          <div className={`badge ${connected ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '9px', padding: '3px 8px' }}>
            {connected ? 'ESP32 ON' : 'WAITING'}
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Dimmed Backdrop for Mobile / Tablet Drawer */}
      <div 
        className={`mobile-backdrop ${mobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Responsive Sidebar */}
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
