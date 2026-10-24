import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Login.css';

export default function Login() {
  const { login } = useAppContext();
  const navigate  = useNavigate();
  const [pin, setPin]     = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin.length >= 4) {
      login();
      navigate('/app');
    } else {
      setError('Please enter a 4-digit PIN');
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-logo">KNEEAID</div>
        <h1 className="login-title">HARDWARE<br/><em>access</em></h1>
        <p className="login-desc">
          Enter your 4-digit PIN to access the KneeAid monitoring app.
          <br/><br/>
          <span style={{ color: 'var(--muted)', fontSize: '0.9em' }}>
            Connect to your ESP32 prototype via Web Bluetooth once inside.
          </span>
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength="4"
            placeholder="••••"
            className="login-input"
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn">ENTER PORTAL →</button>
        </form>

        <div className="login-footer">
          <span className="badge">ESP32 + BLE</span>
          <span className="badge green">RESEARCH PROTOTYPE</span>
        </div>
      </div>
    </div>
  );
}
