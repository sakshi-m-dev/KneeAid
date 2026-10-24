import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            const cursor = document.getElementById('cursor');
            const ring = document.getElementById('cursor-ring');
            if (cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }
            if (ring) { setTimeout(() => { const r = document.getElementById('cursor-ring'); if(r){r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';} }, 80); }
        };
        document.addEventListener('mousemove', handleMouseMove);
        setTimeout(() => { const l = document.getElementById('loader'); if(l) l.classList.add('done'); }, 2400);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
        return () => { document.removeEventListener('mousemove', handleMouseMove); observer.disconnect(); };
    }, []);

    return (
        <div className="landing-body">
            <div id="cursor"></div><div id="cursor-ring"></div>

            {/* LOADER */}
            <div id="loader">
                <div className="loader-knee">
                    <svg viewBox="0 0 80 120" fill="none">
                        <g className="knee-upper"><rect x="28" y="0" width="24" height="60" rx="12" fill="#1e1e1e" stroke="#333" strokeWidth="1"/><rect x="34" y="8" width="12" height="44" rx="6" fill="#2a2a2a"/></g>
                        <ellipse cx="40" cy="62" rx="14" ry="12" fill="#4af0b0" opacity="0.3"/>
                        <ellipse cx="40" cy="62" rx="8" ry="7" fill="#4af0b0" opacity="0.8"/>
                        <g className="knee-lower" style={{transformOrigin:'40px 62px'}}><rect x="28" y="62" width="24" height="55" rx="12" fill="#1e1e1e" stroke="#333" strokeWidth="1"/><rect x="34" y="68" width="12" height="40" rx="6" fill="#2a2a2a"/></g>
                        <circle cx="40" cy="30" r="3" fill="#4af0b0" opacity="0.6"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite"/></circle>
                        <circle cx="40" cy="95" r="3" fill="#4af0b0" opacity="0.6"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" begin="0.7s" repeatCount="indefinite"/></circle>
                    </svg>
                </div>
                <div className="loader-bar"><div className="loader-fill"></div></div>
                <div className="loader-text">Initialising KneeAid</div>
            </div>

            {/* NAV */}
            <nav className="landing-nav">
                <div className="nav-logo">KNEEAID</div>
                <div className="nav-right">
                    <a href="#why" className="nav-link">Why KneeAid</a>
                    <a href="#how" className="nav-link">How It Works</a>
                    <a href="#device" className="nav-link">The Device</a>
                    <a href="#features" className="nav-link">Features</a>
                    <button onClick={() => navigate('/app')} className="nav-cta">Open App →</button>
                </div>
            </nav>

            {/* HERO */}
            <div className="hero">
                <div className="hero-bg">
                    <div className="hero-grid"></div>
                    <div className="hero-leg-wrap">
                        <svg width="600" height="900" viewBox="0 0 200 300" fill="none">
                            <path d="M60 0 Q80 20 85 80 Q88 120 80 150" stroke="#0d0c0a" strokeWidth="40" strokeLinecap="round" fill="none"/>
                            <ellipse cx="78" cy="155" rx="22" ry="18" fill="#0d0c0a"/>
                            <path d="M80 155 Q85 200 75 250 Q70 270 72 290" stroke="#0d0c0a" strokeWidth="36" strokeLinecap="round" fill="none"/>
                            <circle cx="78" cy="155" r="8" fill="#0d0c0a" opacity="0.6"/>
                        </svg>
                    </div>
                </div>
                <div className="hero-tag reveal"><span>[KNEEAID v1.0]</span><span>[MAY 2026]</span><span>[RESEARCH PROTOTYPE]</span></div>
                <h1 className="hero-title reveal" style={{transitionDelay:'.1s'}}>WEARABLE<br/><em>knee assist.</em><br/>PROTOTYPE.</h1>
                <div className="hero-sub-row reveal" style={{transitionDelay:'.25s'}}>
                    <p className="hero-desc">A low-cost wearable knee assistance prototype with pressure-triggered cable assist and a companion monitoring app.</p>
                    <div className="hero-badge">
                        <span className="badge green">Active Cable Assist</span>
                        <span className="badge">ESP32 + BLE</span>
                        <span className="badge">FSR-Triggered Motor</span>
                    </div>
                </div>
                <div className="hero-ctas reveal" style={{transitionDelay:'.35s'}}>
                    <button onClick={() => navigate('/app')} className="hero-btn-primary">Open App Interface →</button>
                    <a href="#how" className="hero-btn-ghost">See How It Works</a>
                </div>
                <div className="scroll-hint"><div className="scroll-line"></div>Scroll to explore</div>
            </div>

            {/* MARQUEE */}
            <div className="marquee-wrap">
                <div className="marquee-inner">
                    {['KNEE FLEXION','BLE CONNECTIVITY','ACTIVE CABLE ASSIST','FSR PRESSURE SENSING','IMU MONITORING','MOTOR DRIVER','ESP32 FIRMWARE','PROTOTYPE v1.0','COMPANION APP',
                      'KNEE FLEXION','BLE CONNECTIVITY','ACTIVE CABLE ASSIST','FSR PRESSURE SENSING','IMU MONITORING','MOTOR DRIVER','ESP32 FIRMWARE','PROTOTYPE v1.0','COMPANION APP'].map((t,i)=>(
                        <div className="marquee-item" key={i}>{t}<div className="marquee-sep"></div></div>
                    ))}
                </div>
            </div>

            {/* WHY */}
            <section className="why-section" id="why">
                <div className="section-tag reveal">01 — The Problem</div>
                <h2 className="section-title reveal" style={{transitionDelay:'.1s'}}>HOME REHAB<br/><em>feedback gap.</em></h2>
                <div className="why-grid reveal" style={{transitionDelay:'.2s'}}>
                    <div className="why-card why-card--problem">
                        <div className="why-card-num">[01]</div>
                        <div className="why-card-title">Limited real-time feedback</div>
                        <div className="why-card-desc">During home rehabilitation, patients typically have no way to monitor knee movement or motor assistance status in real time between clinical visits.</div>
                    </div>
                    <div className="why-card why-card--problem">
                        <div className="why-card-num">[02]</div>
                        <div className="why-card-title">No visibility into assistive device state</div>
                        <div className="why-card-desc">Standard consumer wearables do not expose raw IMU or pressure data, making it hard to confirm when a cable-driven actuator is actually engaged during movement.</div>
                    </div>
                    <div className="why-card why-card--problem">
                        <div className="why-card-num">[03]</div>
                        <div className="why-card-title">Lack of low-cost open platforms</div>
                        <div className="why-card-desc">Existing powered knee orthoses are expensive and closed-source. There is a need for open, low-cost research platforms for studying pressure-triggered cable assistance.</div>
                    </div>
                    <div className="why-card why-card--solution">
                        <div className="why-solution-label">THIS PROTOTYPE</div>
                        <div className="why-card-title">KneeAid provides a low-cost research platform: FSR-triggered motor assist, IMU monitoring, and BLE sensor status in one companion app.</div>
                        <div className="why-card-desc">Sensors on the brace stream live status to the app via BLE. Intended for academic research and prototype validation only — not for clinical use.</div>
                        <button onClick={() => navigate('/app')} className="why-cta">Try the App →</button>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="how-section" id="how">
                <div className="section-tag reveal" style={{color:'#4a4a4a'}}>02 — How It Works</div>
                <h2 className="section-title reveal" style={{transitionDelay:'.1s', color:'var(--paper)'}}>THREE<br/><em>steps</em><br/>HOW IT WORKS</h2>
                <div className="how-steps reveal" style={{transitionDelay:'.2s'}}>
                    <div className="how-step">
                        <div className="how-step-num">01</div>
                        <div className="how-step-icon">
                            <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                                <rect x="16" y="4" width="16" height="18" rx="8" fill="#1e1e1e" stroke="#333" strokeWidth="1"/>
                                <ellipse cx="24" cy="24" rx="10" ry="8" fill="#4af0b0" opacity="0.4"/>
                                <ellipse cx="24" cy="24" rx="5" ry="4" fill="#4af0b0"/>
                                <rect x="16" y="26" width="16" height="18" rx="8" fill="#1e1e1e" stroke="#333" strokeWidth="1"/>
                            </svg>
                        </div>
                        <div className="how-step-title">Wear the Brace</div>
                        <div className="how-step-desc">Strap on the knee brace. The MPU6050 IMU, insole FSR, and TB6612FNG motor driver are mounted on it and activate when the ESP32 is powered.</div>
                    </div>
                    <div className="how-step-arrow">→</div>
                    <div className="how-step">
                        <div className="how-step-num">02</div>
                        <div className="how-step-icon">
                            <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                                <rect x="8" y="6" width="32" height="36" rx="4" stroke="#4af0b0" strokeWidth="1.5" fill="none"/>
                                <path d="M14 20 L20 14 L26 20 L34 12" stroke="#c8f03c" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                <circle cx="34" cy="12" r="3" fill="#c8f03c"/>
                                <rect x="14" y="28" width="20" height="4" rx="2" fill="#333"/>
                                <rect x="14" y="34" width="12" height="4" rx="2" fill="#222"/>
                            </svg>
                        </div>
                        <div className="how-step-title">FSR Pressure Triggers Motor Assist</div>
                        <div className="how-step-desc">When foot pressure on the FSR crosses the preset threshold, the ESP32 activates the DC motor via the TB6612FNG driver, pulling the cable for knee assistance. Motor turns OFF when pressure is removed.</div>
                    </div>
                    <div className="how-step-arrow">→</div>
                    <div className="how-step">
                        <div className="how-step-num">03</div>
                        <div className="how-step-icon">
                            <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                                <path d="M8 36 Q16 12 24 20 Q32 28 40 8" stroke="#4af0b0" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                <circle cx="24" cy="20" r="4" fill="#c8f03c" opacity="0.6"/>
                                <circle cx="24" cy="20" r="2" fill="#c8f03c"/>
                                <path d="M0 28 L10 28 L14 20 L18 34 L22 22 L26 32 L32 28 L48 28" stroke="#4af0b0" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
                            </svg>
                        </div>
                        <div className="how-step-title">Monitor Sensor Status Over BLE</div>
                        <div className="how-step-desc">Pair via Bluetooth Low Energy. The companion app shows live FSR contact state, estimated IMU angle, and motor assist ON/OFF status. IMU data is acquired for monitoring only — it does not currently control the motor.</div>
                    </div>
                </div>
            </section>

            {/* DEVICE ANATOMY */}
            <section className="anatomy-section" id="device">
                <div className="section-tag reveal">03 — The Device</div>
                <h2 className="section-title reveal" style={{transitionDelay:'.1s'}}>THE<br/><em>anatomy</em><br/>OF THE BRACE</h2>
                <div className="anatomy-grid">
                    <div className="anatomy-diagram reveal" style={{transitionDelay:'.15s'}}>
                        <svg width="260" height="440" viewBox="0 0 260 440" fill="none">
                            <path d="M100 10 Q130 30 135 120 Q138 150 130 180" stroke="#d4cfc5" strokeWidth="28" strokeLinecap="round" fill="none"/>
                            <path d="M100 10 Q130 30 135 120 Q138 150 130 180" stroke="#e3ddd2" strokeWidth="20" strokeLinecap="round" fill="none"/>
                            <ellipse cx="128" cy="188" rx="30" ry="24" fill="#e3ddd2" stroke="#d4cfc5" strokeWidth="1.5"/>
                            <path d="M130 188 Q135 250 120 320 Q115 360 118 400" stroke="#d4cfc5" strokeWidth="26" strokeLinecap="round" fill="none"/>
                            <path d="M130 188 Q135 250 120 320 Q115 360 118 400" stroke="#e3ddd2" strokeWidth="18" strokeLinecap="round" fill="none"/>
                            <path d="M78 20 Q68 80 72 170" stroke="#0d0c0a" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7"/>
                            <path d="M78 20 L90 20 M76 60 L88 60 M74 110 L86 110 M73 150 L85 150" stroke="#0d0c0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
                            <path d="M72 210 Q62 270 64 380" stroke="#0d0c0a" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7"/>
                            <path d="M72 230 L84 230 M70 270 L82 270 M68 320 L80 320 M66 360 L78 360" stroke="#0d0c0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
                            <rect x="54" y="55" width="22" height="14" rx="3" fill="#1a3aff" opacity="0.9"/>
                            <text x="65" y="66" textAnchor="middle" fontFamily="Geist Mono" fontSize="5" fill="white" opacity="0.9">IMU</text>
                            <path d="M76 62 L118 62" stroke="#1a3aff" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
                            <circle cx="118" cy="62" r="3" fill="#1a3aff" opacity="0.6"/>
                            <circle cx="128" cy="188" r="14" fill="#c8f03c" opacity="0.3"/>
                            <circle cx="128" cy="188" r="8" fill="#c8f03c" opacity="0.7"/>
                            <circle cx="128" cy="188" r="4" fill="#0d0c0a"/>
                            <path d="M128 174 A14 14 0 0 1 141 188" stroke="#c8f03c" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <rect x="150" y="178" width="28" height="20" rx="3" fill="#0d0c0a" opacity="0.8"/>
                            <text x="164" y="191" textAnchor="middle" fontFamily="Geist Mono" fontSize="4.2" fill="#4af0b0">DC MOTOR</text>
                            <ellipse cx="105" cy="415" rx="14" ry="8" fill="#f0924a" opacity="0.6"/>
                            <circle cx="105" cy="415" r="5" fill="#f0924a" opacity="0.9"/>
                            <text x="105" y="430" textAnchor="middle" fontFamily="Geist Mono" fontSize="5" fill="#8a8278">FSR</text>
                            <rect x="152" y="268" width="32" height="22" rx="3" fill="#0d0c0a" opacity="0.9"/>
                            <text x="168" y="281" textAnchor="middle" fontFamily="Geist Mono" fontSize="4.5" fill="#4af0b0">ESP32</text>
                            <text x="168" y="287" textAnchor="middle" fontFamily="Geist Mono" fontSize="3.5" fill="#444">+TB6612</text>
                            <path d="M105 408 Q110 370 150 289" stroke="#f0924a" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.4"/>
                            <path d="M141 188 Q148 220 154 270" stroke="#c8f03c" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.4"/>
                            <path d="M76 62 Q100 80 140 180" stroke="#1a3aff" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.4"/>
                            <circle cx="168" cy="279" r="22" stroke="#4af0b0" strokeWidth="0.5" fill="none" opacity="0.2"/>
                            <circle cx="168" cy="279" r="32" stroke="#4af0b0" strokeWidth="0.5" fill="none" opacity="0.1"/>
                            <text x="36" y="52" fontFamily="Geist Mono" fontSize="7" fill="#1a3aff" opacity="0.9">IMU</text>
                            <text x="36" y="61" fontFamily="Geist Mono" fontSize="6" fill="#8a8278">MPU6050</text>
                            <text x="150" y="173" fontFamily="Geist Mono" fontSize="7" fill="#c8f03c">CABLE</text>
                            <text x="150" y="182" fontFamily="Geist Mono" fontSize="6" fill="#8a8278">Bowden drive</text>
                            <text x="150" y="262" fontFamily="Geist Mono" fontSize="7" fill="#4af0b0">MCU</text>
                            <text x="150" y="271" fontFamily="Geist Mono" fontSize="6" fill="#8a8278">+TB6612 driver</text>
                        </svg>
                    </div>
                    <div className="anatomy-labels reveal" style={{transitionDelay:'.25s'}}>
                        <div className="anatomy-label-item">
                            <div className="anatomy-dot" style={{background:'#1a3aff'}}></div>
                            <div>
                                <div className="anatomy-label-name">IMU — MPU6050</div>
                                <div className="anatomy-label-desc">Measures estimated knee flexion angle, angular velocity, and acceleration. Data is streamed to the companion app for monitoring only. IMU output does not currently control the motor.</div>
                            </div>
                        </div>
                        <div className="anatomy-label-item">
                            <div className="anatomy-dot" style={{background:'#c8f03c'}}></div>
                            <div>
                                <div className="anatomy-label-name">Bowden cable actuator</div>
                                <div className="anatomy-label-desc">High-tensile cable routed along the knee brace. Delivers assistive pulling force when the DC gear motor is energised by the TB6612FNG driver in response to FSR threshold crossing.</div>
                            </div>
                        </div>
                        <div className="anatomy-label-item">
                            <div className="anatomy-dot" style={{background:'#0d0c0a'}}></div>
                            <div>
                                <div className="anatomy-label-name">DC Gear Motor + TB6612FNG Driver</div>
                                <div className="anatomy-label-desc">Compact DC gear motor controlled via the TB6612FNG H-bridge driver. Turns ON when the FSR reading crosses the preset threshold; turns OFF when foot pressure is removed.</div>
                            </div>
                        </div>
                        <div className="anatomy-label-item">
                            <div className="anatomy-dot" style={{background:'#4af0b0'}}></div>
                            <div>
                                <div className="anatomy-label-name">ESP32 — MCU + BLE</div>
                                <div className="anatomy-label-desc">Reads FSR and IMU sensors, applies the FSR threshold logic to drive the motor via TB6612FNG, and streams sensor status to the companion app via Bluetooth Low Energy.</div>
                            </div>
                        </div>
                        <div className="anatomy-label-item">
                            <div className="anatomy-dot" style={{background:'#f0924a'}}></div>
                            <div>
                                <div className="anatomy-label-name">Single FSR sensor — Insole contact</div>
                                <div className="anatomy-label-desc">Force-sensitive resistor in the insole detects foot pressure. When the reading crosses the preset threshold the motor assist is activated; pressure release turns it off.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* APP FEATURES */}
            <section className="features-section" id="features">
                <div className="section-tag reveal" style={{color:'#4a4a4a'}}>04 — App Features</div>
                <h2 className="section-title reveal" style={{transitionDelay:'.1s', color:'var(--paper)'}}>WHAT THE<br/><em>app shows</em><br/>TODAY</h2>
                <div className="features-grid reveal" style={{transitionDelay:'.2s'}}>
                    <div className="feature-card feature-card--large">
                        <div className="feature-tag">Live Monitor</div>
                        <div className="feature-title">Sensor status &amp; assist state</div>
                        <div className="feature-desc">Watch estimated IMU angle, FSR contact state, motor assist ON/OFF, and BLE connection status update live from the prototype hardware.</div>
                        <div className="feature-visual">
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                <circle cx="40" cy="40" r="32" stroke="#1e2a1e" strokeWidth="8"/>
                                <circle cx="40" cy="40" r="32" stroke="#4af0b0" strokeWidth="8" strokeDasharray="164" strokeDashoffset="60" transform="rotate(-90 40 40)"/>
                                <text x="40" y="37" textAnchor="middle" fontFamily="Geist Mono" fontSize="14" fill="#e8ecf4">68.4</text>
                                <text x="40" y="50" textAnchor="middle" fontFamily="Geist Mono" fontSize="8" fill="#4af0b0">°</text>
                            </svg>
                            <div style={{fontFamily:'var(--font-mono)',fontSize:'8px',color:'#555',marginTop:'4px',textAlign:'center',letterSpacing:'0.05em'}}>Sample data</div>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-tag">Gait Analytics — <span style={{color:'#f0924a'}}>Planned</span></div>
                        <div className="feature-title">Derived step metrics</div>
                        <div className="feature-desc">Step count and estimated cadence derived from FSR cycles. Stance/swing ratio and step symmetry score are planned features not yet implemented in this prototype.</div>
                        <div className="feature-visual feature-bars">
                            {[40,60,55,80,100,75,30].map((h,i)=>(
                                <div key={i} className="feature-bar" style={{height:`${h}%`}}></div>
                            ))}
                        </div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:'8px',color:'#555',marginTop:'4px',letterSpacing:'0.05em'}}>Sample data</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-tag">Rehab Goals — <span style={{color:'#f0924a'}}>Planned</span></div>
                        <div className="feature-title">Manual milestone tracking</div>
                        <div className="feature-desc">Manually mark exercise milestones during a session. Automatic adaptive goal updates based on real sensor performance are a planned feature, not yet implemented.</div>
                        <div className="feature-visual feature-progress">
                            <div className="feature-prog-bar" style={{background:'#4af0b0', width:'62%'}}></div>
                            <div className="feature-prog-bar" style={{background:'#f0924a', width:'48%'}}></div>
                            <div className="feature-prog-bar" style={{background:'#4a8ff0', width:'85%'}}></div>
                        </div>
                    </div>
                    <div className="feature-card feature-card--alert">
                        <div className="feature-tag">Safety — <span style={{color:'#f0924a'}}>Planned</span></div>
                        <div className="feature-title">Impact alert (UI prototype)</div>
                        <div className="feature-desc">The app shows an in-app alert when the MPU6050 registers a sudden acceleration spike. Automated SOS message dispatch and real-time location sharing are not yet implemented.</div>
                        <div className="feature-visual">
                            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                                <circle cx="28" cy="28" r="20" stroke="#e83c2a" strokeWidth="1.5" fill="none" opacity="0.3"><animate attributeName="r" values="20;24;20" dur="1.2s" repeatCount="indefinite"/></circle>
                                <circle cx="28" cy="28" r="12" fill="#e83c2a" opacity="0.2"/>
                                <circle cx="28" cy="28" r="7" fill="#e83c2a"/>
                                <text x="28" y="32" textAnchor="middle" fontFamily="Geist Mono" fontSize="7" fill="#fff">SOS</text>
                            </svg>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-tag">Profile &amp; Settings</div>
                        <div className="feature-title">Device &amp; session config</div>
                        <div className="feature-desc">Enter your BLE device name, session preferences, and emergency contacts. Stores profile data locally. Automatic sensor calibration driven by profile is not currently implemented.</div>
                        <div className="feature-visual" style={{display:'flex',flexDirection:'column',gap:'6px',width:'100%'}}>
                            {[70,50,85].map((w,i)=>(
                                <div key={i} style={{height:'6px',background:'#1a1a1a',borderRadius:'3px',width:'100%'}}>
                                    <div style={{width:`${w}%`,height:'100%',background:'#c8f03c',borderRadius:'3px'}}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="cta-section">
                <div className="cta-inner reveal">
                    <div className="cta-label">Explore the prototype</div>
                    <h2 className="cta-title">Open the<br/><em>companion app.</em></h2>
                    <p className="cta-sub">Connect to the ESP32 hardware over BLE to start a live monitoring session.</p>
                    <button onClick={() => navigate('/app')} className="cta-btn">Open App Interface →</button>
                </div>
            </section>

            {/* FOOTER */}
            <footer>
                <div>
                    <div className="foot-logo">KNEEAID</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:'10px',color:'#333',marginTop:'8px'}}>Wearable Knee Assistance Prototype · v1.0 · May 2026</div>
                    <div style={{marginTop:'24px'}}>
                        <button onClick={() => navigate('/app')} style={{background:'var(--accent)',color:'var(--ink)',fontFamily:'var(--font-mono)',fontSize:'11px',padding:'12px 24px',borderRadius:'2px',border:'none',cursor:'pointer',letterSpacing:'0.1em',textTransform:'uppercase',transition:'background .2s'}}>Open App Interface →</button>
                    </div>
                </div>
                <div className="foot-right">
                    WEARABLE KNEE ASSISTANCE PROTOTYPE<br/>
                    ESP32 · MPU6050 · FSR · TB6612FNG<br/>
                    BLE COMPANION APPLICATION<br/>
                    <br/>
                    © 2026 KNEEAID
                </div>
            </footer>

            {/* DISCLAIMER */}
            <div style={{
                background:'#0d0c0a',
                borderTop:'1px solid #1e1e1e',
                padding:'20px 40px',
                fontFamily:'var(--font-mono)',
                fontSize:'11px',
                color:'#666',
                lineHeight:'1.8',
                textAlign:'center',
                letterSpacing:'0.03em'
            }}>
                ⚠️&nbsp;
                <strong style={{color:'#888'}}>
                    KneeAid is an academic research prototype. It is not a medical device and has not been clinically validated. Do not use it for diagnosis, treatment, or fall protection.
                </strong>
            </div>
        </div>
    );
}
