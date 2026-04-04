import { useState, useEffect } from 'react';
import { T, PLANS } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function AdminDashboard({ onNavigate, onToast }) {
  const [data, setData] = useState(null);
  const svc = getRealtimeService();

  useEffect(() => {
    svc.start();
    setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return unsub;
  }, []);

  if (!data) return null;

  const { weather, aqi, traffic, platforms, triggerLog, claimsQueue, payoutLedger, workers } = data;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalPremiums = workers.reduce((sum, w) => sum + (PLANS.find(p => p.id === w.plan)?.price || 80), 0);
  const totalPayouts = payoutLedger.reduce((sum, p) => sum + p.amount, 0);
  const pendingClaims = claimsQueue.filter(c => c.status === 'pending').length;
  const fraudAlerts = workers.filter(w => w.trustScore < 45).length;

  const fireCityTrigger = (type) => {
    svc.simulateTrigger(type);
    // Generate claims for affected workers
    const trigger = data.triggerLog[0] || { title: type, type };
    const affected = workers.slice(0, Math.floor(3 + Math.random() * 5));
    affected.forEach(w => svc.generateClaim(trigger, w));
    setData(svc.getSnapshot());
    onToast?.(`⚡ ${type} triggered — ${affected.length} workers affected!`);
  };

  return (
    <div className="page-section">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Admin Dashboard
          </h2>
          <p style={{ fontSize: 13, color: T.textSec }}>Real-time platform monitoring and management</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="pulse-dot" style={{ background: T.green }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>ALL SYSTEMS LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 20 }}>
        {[
          { label: 'Active Workers', value: activeWorkers.toString(), icon: '👥', color: T.blue },
          { label: 'Premiums/wk', value: `₹${(totalPremiums / 1000).toFixed(0)}K`, icon: '💰', color: T.green },
          { label: 'Payouts Today', value: `₹${totalPayouts.toLocaleString()}`, icon: '💸', color: T.orange },
          { label: 'Pending Claims', value: pendingClaims.toString(), icon: '📋', color: T.amber, badge: pendingClaims > 0 },
          { label: 'Fraud Alerts', value: fraudAlerts.toString(), icon: '🚨', color: T.red, badge: fraudAlerts > 0 },
        ].map((s, i) => (
          <div key={i} className="stat-card fade-up" style={{ textAlign: 'center', animationDelay: `${i * 50}ms` }}>
            <p style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginTop: 3 }}>{s.label}</p>
            {s.badge && <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, margin: '6px auto 0', animation: 'pulse 1.5s infinite' }} />}
          </div>
        ))}
      </div>

      {/* Platform Health */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {platforms.map((p, i) => (
          <div key={i} style={{
            flex: 1, padding: '14px 16px', borderRadius: 12,
            background: p.status === 'operational' ? T.greenLight : p.status === 'degraded' ? T.amberLight : T.redLight,
            border: `1px solid ${p.statusColor}30`, display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div className="risk-pulse" style={{ background: p.statusColor, width: 8, height: 8 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</p>
              <p style={{ fontSize: 11, color: T.textMuted }}>
                {p.status === 'operational' ? `${p.orderVolume} orders · ↑${p.uptime}%` : `Down since ${p.downSince}`}
              </p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: p.statusColor }}>{p.status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="main-side">
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Live Trigger Feed */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="pulse-dot" style={{ background: T.red, width: 5, height: 5 }} />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Live Trigger Monitor</h3>
              </div>
              <span style={{ fontSize: 11, color: T.textMuted }}>{triggerLog.length} events</span>
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {triggerLog.length === 0 ? (
                <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 24 }}>
                  No triggers yet. Use simulation panel below.
                </p>
              ) : triggerLog.slice(0, 12).map((t, i) => (
                <div key={i} className="fade-in" style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderBottom: `1px solid ${T.border}`, fontSize: 12
                }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{t.title}</p>
                    <p style={{ fontSize: 10, color: T.textMuted }}>{t.value} · {t.time}</p>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                    background: t.severity === 'critical' ? T.redLight : T.amberLight,
                    color: t.severity === 'critical' ? T.red : T.amber
                  }}>{(t.severity || 'info').toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Claims Queue */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>📋 Claims Queue</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: T.amberLight, color: T.amber }}>
                  {pendingClaims} pending
                </span>
                <span style={{ cursor: 'pointer', fontSize: 12, color: T.orange, fontWeight: 600 }}
                  onClick={() => onNavigate('claimsQueue')}>View All →</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {claimsQueue.slice(0, 5).map((c, i) => {
                const statusColor = c.status === 'paid' ? T.green : c.status === 'rejected' ? T.red : T.amber;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, background: statusColor + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: statusColor, flexShrink: 0
                    }}>{c.aiScore}%</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600 }}>{c.workerName} · {c.trigger}</p>
                      <p style={{ fontSize: 10, color: T.textMuted }}>{c.date} · {c.zone}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>₹{c.amount}</p>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                      background: statusColor + '15', color: statusColor
                    }}>{c.status.toUpperCase()}</span>
                    {c.status === 'pending' && (
                      <button onClick={() => { svc.approveClaim(c.id); setData(svc.getSnapshot()); onToast?.(`✅ Claim ${c.id} approved`); }}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                          background: T.green, color: 'white', border: 'none', cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans',sans-serif"
                        }}>✓</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Simulation Controls */}
          <div className="card" style={{ padding: 20, border: `1px solid ${T.red}20` }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🔥 Admin Simulation</h3>
            <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 14 }}>Fire zone-wide triggers and watch claims populate</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { type: 'rainfall', icon: '🌧️', label: 'City-Wide Rainfall' },
                { type: 'aqi', icon: '🌫️', label: 'AQI Emergency' },
                { type: 'heat', icon: '🌡️', label: 'Heat Wave' },
                { type: 'platform', icon: '📵', label: 'Platform Outage' },
                { type: 'traffic', icon: '🚧', label: 'Zone Lockdown' },
              ].map((t, i) => (
                <button key={i} onClick={() => fireCityTrigger(t.type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg,
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.text,
                    fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .15s',
                    textAlign: 'left', width: '100%'
                  }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ flex: 1 }}>{t.label}</span>
                  <span style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>FIRE</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Weather */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🌦️ Live Conditions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { icon: '🌧️', label: 'Rainfall', value: `${weather.rainfall} mm/hr`, warn: weather.rainfall > 50 },
                { icon: '🌡️', label: 'Temperature', value: `${weather.temperature}°C`, warn: weather.temperature > 42 },
                { icon: '💨', label: 'AQI', value: aqi.aqi.toString(), warn: aqi.aqi > 300 },
                { icon: '🚗', label: 'Traffic', value: `${traffic.congestion}/10`, warn: traffic.congestion > 7 },
                { icon: '💧', label: 'Humidity', value: `${weather.humidity}%`, warn: false },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  background: item.warn ? T.redLight : T.bg, borderRadius: 8,
                  border: `1px solid ${item.warn ? T.red + '20' : T.border}`
                }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 12 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.warn ? T.red : T.text }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payouts */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>💸 Recent Payouts</h3>
              <span style={{ cursor: 'pointer', fontSize: 12, color: T.orange, fontWeight: 600 }}
                onClick={() => onNavigate('payoutLedger')}>View All →</span>
            </div>
            {payoutLedger.length === 0 ? (
              <p style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', padding: 16 }}>No payouts yet</p>
            ) : payoutLedger.slice(0, 4).map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderBottom: `1px solid ${T.border}`, fontSize: 12
              }}>
                <span style={{ fontSize: 14 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{p.worker}</p>
                  <p style={{ fontSize: 10, color: T.textMuted }}>{p.trigger} · {p.time}</p>
                </div>
                <p style={{ fontWeight: 700, color: T.green }}>₹{p.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
