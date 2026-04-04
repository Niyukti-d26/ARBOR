import { useState, useEffect } from 'react';
import { T } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function SimulationPanel({ user, onToast }) {
  const [data, setData] = useState(null);
  const [firing, setFiring] = useState(null);
  const [autoClaimActive, setAutoClaimActive] = useState(false);
  const [claimPhase, setClaimPhase] = useState(null);
  const [upiPhase, setUpiPhase] = useState(null);
  const svc = getRealtimeService();

  useEffect(() => {
    svc.start();
    setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return unsub;
  }, []);

  const triggers = [
    { type: 'rainfall', icon: '🌧️', label: 'Heavy Rainfall', desc: 'Simulate >50mm/hr downpour', color: T.blue },
    { type: 'aqi',      icon: '🌫️', label: 'AQI Emergency',  desc: 'Simulate AQI >300 hazard', color: '#7C3AED' },
    { type: 'heat',     icon: '🌡️', label: 'Extreme Heat',   desc: 'Simulate >42°C heat wave', color: T.red },
    { type: 'platform', icon: '📵', label: 'Platform Outage', desc: 'Simulate Swiggy/Zomato down', color: T.orange },
    { type: 'traffic',  icon: '🚧', label: 'Zone Lockdown',   desc: 'Simulate congestion >8/10', color: T.amber },
  ];

  const fireTrigger = (type) => {
    setFiring(type);
    svc.simulateTrigger(type);

    setTimeout(() => {
      const snap = svc.getSnapshot();
      const trigger = snap.triggerLog[0];
      if (trigger) {
        setAutoClaimActive(true);
        setClaimPhase('evaluating');
        const claim = svc.generateClaim(trigger, user);

        // Auto-progress claim
        const steps = ['ai_validated', 'fraud_checked', 'approved', 'upi_sent', 'confirmed'];
        steps.forEach((_, i) => {
          setTimeout(() => {
            svc.progressClaim(claim.id);
            setData(svc.getSnapshot());
            if (i === 3) setUpiPhase('sending');
            if (i === 4) {
              setUpiPhase('success');
              setClaimPhase('complete');
              onToast?.(`🎉 ₹${claim.amount} auto-paid via UPI!`);
              setTimeout(() => { setAutoClaimActive(false); setFiring(null); setClaimPhase(null); setUpiPhase(null); }, 4000);
            }
          }, (i + 1) * 1200);
        });
      }
    }, 800);
  };

  if (!data) return null;

  const activeClaim = data.claimsQueue[0];

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            ⚡ Simulation Panel
          </h2>
          <p style={{ fontSize: 13, color: T.textSec }}>
            Fire triggers to test the end-to-end claim pipeline
          </p>
        </div>
        <span style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: T.redLight, color: T.red, border: `1px solid ${T.red}20`
        }}>DEMO MODE</span>
      </div>

      {/* Trigger Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {triggers.map((t, i) => (
          <button key={i} onClick={() => !firing && fireTrigger(t.type)} disabled={!!firing}
            className="card fade-up" style={{
              padding: 20, textAlign: 'center', cursor: firing ? 'not-allowed' : 'pointer',
              border: firing === t.type ? `2px solid ${t.color}` : `1px solid ${T.border}`,
              boxShadow: firing === t.type ? `0 0 20px ${t.color}20` : T.shadow,
              opacity: firing && firing !== t.type ? 0.5 : 1,
              animationDelay: `${i * 60}ms`, transition: 'all .3s',
              background: firing === t.type ? `${t.color}08` : 'white'
            }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{t.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: firing === t.type ? t.color : T.text }}>{t.label}</p>
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{t.desc}</p>
            {firing === t.type && (
              <div style={{ marginTop: 10 }}>
                <div className="risk-pulse" style={{ background: t.color }} />
                <span style={{ fontSize: 10, color: t.color, fontWeight: 700, marginLeft: 6 }}>FIRING</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Auto-Claim Flow */}
      {autoClaimActive && activeClaim && (
        <div className="card pop-in" style={{ padding: 24, marginBottom: 24, border: `2px solid ${T.orange}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div className="risk-pulse" style={{ background: T.orange }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.orange }}>Auto-Claim Pipeline</h3>
            <span style={{
              marginLeft: 'auto', padding: '4px 12px', borderRadius: 20,
              background: T.greenLight, color: T.green,
              fontSize: 10, fontWeight: 700, border: `1px solid ${T.green}20`
            }}>ZERO-TOUCH</span>
          </div>

          {/* Claim Steps */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {activeClaim.steps.map((s, i) => {
              const labels = ['Triggered', 'AI Validated', 'Fraud Check', 'Approved', 'UPI Sent', 'Confirmed'];
              const icons = ['🌧️', '🤖', '🔍', '✅', '💸', '🎉'];
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: 36, borderRadius: 8, marginBottom: 6,
                    background: s.done ? T.greenLight : T.bg,
                    border: `1px solid ${s.done ? T.green + '30' : T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    transition: 'all .5s'
                  }}>{s.done ? icons[i] : '⏳'}</div>
                  <p style={{ fontSize: 9, fontWeight: 600, color: s.done ? T.green : T.textMuted }}>
                    {labels[i]}
                  </p>
                  {s.time && <p style={{ fontSize: 8, color: T.textMuted }}>{s.time}</p>}
                </div>
              );
            })}
          </div>

          {/* UPI Animation */}
          {upiPhase === 'sending' && (
            <div className="fade-up" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="upi-money-flow" style={{ height: 60, marginBottom: 12 }}>
                <div className="money-particle" style={{ animationDelay: '0s' }}>₹</div>
                <div className="money-particle" style={{ animationDelay: '0.2s' }}>₹</div>
                <div className="money-particle" style={{ animationDelay: '0.4s' }}>₹</div>
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, color: T.orange }}>Sending ₹{activeClaim.amount} via UPI</p>
              <div className="upi-progress-bar" style={{ marginTop: 12, maxWidth: 300, margin: '12px auto 0' }}>
                <div className="upi-progress-fill sending" />
              </div>
            </div>
          )}

          {upiPhase === 'success' && (
            <div className="pop-in" style={{ textAlign: 'center', padding: '20px 0' }}>
              <svg width="60" height="60" viewBox="0 0 60 60" style={{ marginBottom: 12 }}>
                <circle cx="30" cy="30" r="27" fill={T.greenLight} stroke={T.green} strokeWidth="3" />
                <path d="M18 32 L26 40 L42 24" fill="none" stroke={T.green} strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 24, fontWeight: 800, color: T.green }}>₹{activeClaim.amount} Received!</p>
              <p style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>Auto-paid in {Math.floor(Math.random() * 30 + 40)}s · Zero touch</p>
              <div style={{
                marginTop: 12, padding: '8px 16px', borderRadius: 10,
                background: T.greenLight, display: 'inline-flex', alignItems: 'center', gap: 6,
                border: `1px solid ${T.green}20`, fontSize: 11, fontWeight: 600, color: T.green
              }}>🏦 Txn: {activeClaim.id}</div>
            </div>
          )}

          {!upiPhase && (
            <div style={{
              padding: '14px 18px', borderRadius: 12, background: T.bg,
              border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{activeClaim.trigger}</p>
                <p style={{ fontSize: 11, color: T.textMuted }}>AI Score: {activeClaim.aiScore}% · {activeClaim.zone}</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: T.green }}>₹{activeClaim.amount}</p>
            </div>
          )}
        </div>
      )}

      {/* Live Data Feed */}
      <div className="two-col">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <div className="pulse-dot" style={{ background: T.red, width: 5, height: 5 }} />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Live Data Feed</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Rainfall', value: `${data.weather.rainfall} mm/hr`, icon: '🌧️', threshold: 50 },
              { label: 'AQI', value: data.aqi.aqi.toString(), icon: '💨', threshold: 300 },
              { label: 'Heat Index', value: `${data.weather.heatIndex}°C`, icon: '🌡️', threshold: 46 },
              { label: 'Traffic', value: `${data.traffic.congestion}/10`, icon: '🚗', threshold: 8 },
              { label: 'Wind', value: `${data.weather.windSpeed} km/h`, icon: '💨', threshold: 40 },
              { label: 'Humidity', value: `${data.weather.humidity}%`, icon: '💧', threshold: 90 },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '10px 12px', background: T.bg, borderRadius: 10,
                border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</p>
                  <p style={{ fontSize: 10, color: T.textMuted }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📋 Trigger Log</h3>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {data.triggerLog.length === 0 ? (
              <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 20 }}>
                No triggers fired yet. Press a button above to start!
              </p>
            ) : data.triggerLog.slice(0, 10).map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                borderBottom: `1px solid ${T.border}`, fontSize: 12
              }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                <span style={{ flex: 1 }}>{t.title}</span>
                <span style={{ fontSize: 10, color: T.textMuted, fontFamily: 'monospace' }}>{t.time}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                  background: t.severity === 'critical' ? T.redLight : T.amberLight,
                  color: t.severity === 'critical' ? T.red : T.amber
                }}>{t.severity?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
