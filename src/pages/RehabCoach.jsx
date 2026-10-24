import React, { useState, useEffect, useRef } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAppContext } from '../context/AppContext';
import { Play, Pause, CheckCircle, FileText, Target, RotateCcw, Bluetooth } from 'lucide-react';
import './RehabCoach.css';

const RehabCoach = () => {
  const { kneeAngle, connected, session, gaitPhase } = useLiveData();
  const { rehabGoals, setRehabGoals } = useAppContext();

  const [reps, setReps]         = useState(0);
  const [targetReps]            = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const wasAtPeakRef            = useRef(false);

  // ── Rep counting from MPU6050 angle ──────────────────────────────────────
  // Only count reps while connected and not paused
  useEffect(() => {
    if (!connected || isPaused) return;

    if (kneeAngle >= 50) {
      wasAtPeakRef.current = true;
    } else if (kneeAngle <= 15 && wasAtPeakRef.current) {
      setReps(r => Math.min(targetReps, r + 1));
      wasAtPeakRef.current = false;
    }
  }, [kneeAngle, connected, isPaused, targetReps]);

  // Reset rep counter when hardware disconnects
  useEffect(() => {
    if (!connected) {
      setReps(0);
      wasAtPeakRef.current = false;
      setIsPaused(false);
    }
  }, [connected]);

  const toggleGoal = (id) => {
    setRehabGoals(goals => goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  // Live angle → flexion progress bar (target 60°)
  const repProgress    = connected ? Math.min((kneeAngle / 60) * 100, 100) : 0;
  const sessionProgress = Math.min(100, Math.round((reps / targetReps) * 100));

  const formatDuration = (secs) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="rehab-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rehab Goals</h1>
          <p className="subtitle">Milestones · Progress · Activity tracking</p>
        </div>
        <div className={`badge ${connected ? 'badge-green' : 'badge-orange'}`}>
          <Bluetooth size={12} style={{ marginRight:'4px' }} />
          {connected ? 'MPU6050 LIVE TRACKING' : 'WAITING FOR HARDWARE'}
        </div>
      </div>

      <div className="rehab-grid">
        {/* Active exercise session card */}
        <div className="active-session-card surface-card">
          <div className="session-header">
            <div>
              <h3 className="card-title">Active Exercise: Knee Flexion Cycles</h3>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--teal)' }}>
                {connected
                  ? `Target: 50° Flexion · Current: ${Math.round(kneeAngle)}° · Phase: ${gaitPhase.toUpperCase()}`
                  : 'Connect ESP32 to begin tracking'}
              </span>
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              <button
                className="btn-primary start-btn"
                onClick={() => setIsPaused(!isPaused)}
                disabled={!connected}
                style={{ background: isPaused ? 'var(--teal)' : undefined }}
              >
                {isPaused
                  ? <><Play  size={12} fill="currentColor" /> Resume</>
                  : <><Pause size={12} fill="currentColor" /> Pause</>}
              </button>
              <button
                className="btn-secondary"
                onClick={() => { setReps(0); wasAtPeakRef.current = false; }}
                disabled={!connected}
                title="Reset Reps"
                style={{ padding:'6px 10px' }}
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>

          <div className="rep-counter-container">
            <svg viewBox="0 0 200 200" className="rep-progress-svg">
              <circle cx="100" cy="100" r="80" className="rep-bg" />
              <circle
                cx="100" cy="100" r="80"
                className="rep-fill"
                style={{
                  strokeDashoffset: `${502 - (502 * repProgress) / 100}`,
                  transition: 'stroke-dashoffset 80ms ease',
                  opacity: connected ? 1 : 0.25,
                }}
              />
            </svg>
            <div className="rep-info">
              <span className="rep-count">
                {connected ? reps : '--'}
                <span className="rep-total">/{targetReps}</span>
              </span>
              <span className="rep-label">Reps Completed</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'#666', marginTop:'4px' }}>
                {connected ? 'MPU6050 angle feed' : 'Hardware required'}
              </span>
            </div>
          </div>

          <div className="session-progress">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width:`${sessionProgress}%` }}></div>
            </div>
            <div className="progress-labels">
              <span>Session activity: {formatDuration(session.walkingDuration)}</span>
              <span>{sessionProgress}% complete</span>
            </div>
          </div>
        </div>

        <div className="side-cards">
          {/* Daily goals */}
          <div className="goals-card surface-card">
            <div className="card-header">
              <Target size={20} color="var(--accent)" />
              <h3 className="card-title">Daily Goals</h3>
            </div>
            <ul className="goals-list">
              {rehabGoals.map(goal => (
                <li
                  key={goal.id}
                  className={goal.completed ? 'completed' : (goal.active ? 'active' : '')}
                  onClick={() => toggleGoal(goal.id)}
                  style={{ cursor:'pointer' }}
                >
                  {goal.completed
                    ? <CheckCircle size={18} color="var(--teal)" />
                    : <div className="empty-circle"></div>}
                  <span>{goal.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes — static placeholder */}
          <div className="notes-card surface-card">
            <div className="card-header">
              <FileText size={20} color="var(--blue)" />
              <h3 className="card-title">Physio Notes</h3>
            </div>
            <div className="note-content">
              <p className="note-date">May 7, 2026</p>
              <p className="note-text">
                "Great progress on extension! Try to push for 60° during today's session. Don't forget to ice if swelling occurs."
              </p>
              <div className="doctor-sig">
                <img
                  src="https://ui-avatars.com/api/?name=Dr+Smith&background=1a3aff&color=fff"
                  alt="Doctor"
                  className="avatar"
                />
                <span>Dr. Smith, PT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RehabCoach;
