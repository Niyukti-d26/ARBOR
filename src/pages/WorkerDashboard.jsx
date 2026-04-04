import { useState, useEffect } from 'react';
import { T, PLANS, PAYOUTS } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function WorkerDashboard({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const svc = getRealtimeService();

  useEffect(() => {
    svc.start();
    setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return () => { unsub(); };
  }, []);

  if (!data) return null;

  const plan = PLANS.find(p => p.id === user.plan) || PLANS[1];
  const { weather, aqi, traffic, platforms } = data;
  const userPlatforms = platforms.filter(p => (user.platforms || [user.platform]).includes(p.name));

  return (
    <div className="page-section">
      {/* Hero */}
      <div className="card fade-up" style={{
        padding: 0, marginBottom: 20, overflow: 'hidden',
        background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`
      }}>
        <div style={{ padding: '24px 28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Welcome back</p>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{user.name} 👋</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  🛡 {plan.name} Plan
                </span>
                <span style={{ background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  ⭐ Trust: {user.trustScore}
                </span>
                <span style={{ background: 'rgba(29,185,84,.3)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  ✅ Coverage Active
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>🛵</div>
              <p style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{user.zone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Conditions */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textMuted, letterSpacing: '.06em', marginBottom: 12 }}>
        📡 LIVE CONDITIONS — {user.zone}, {user.city}
      </h3>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          {
            icon: '🌧️', label: 'Rainfall', value: `${weather.rainfall}mm/hr`,
            status: weather.rainfall > 50 ? 'danger' : weather.rainfall > 20 ? 'warn' : 'safe',
            sub: weather.condition.replace(/_/g, ' ')
          },
          {
            icon: '🌡️', label: 'Temperature', value: `${weather.temperature}°C`,
            status: weather.temperature > 42 ? 'danger' : weather.temperature > 38 ? 'warn' : 'safe',
            sub: `Feels ${weather.feelsLike}°C`
          },
          {
            icon: '💨', label: 'AQI', value: aqi.aqi.toString(),
            status: aqi.aqi > 300 ? 'danger' : aqi.aqi > 200 ? 'warn' : 'safe',
            sub: aqi.category
          },
          {
            icon: '🚗', label: 'Traffic', value: `${traffic.congestion}/10`,
            status: traffic.congestion > 7 ? 'danger' : traffic.congestion > 4 ? 'warn' : 'safe',
            sub: traffic.status
          },
        ].map((c, i) => (
          <div key={i} className="stat-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <span className={`weather-status ${c.status}`}>{c.status.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800 }}>{c.value}</p>
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{c.label} · {c.sub}</p>
          </div>
        ))}
      </div>

      {/* Platform Status */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {userPlatforms.length > 0 ? userPlatforms.map((p, i) => (
          <div key={i} style={{
            flex: 1, padding: '12px 16px', borderRadius: 12,
            background: p.status === 'operational' ? T.greenLight : p.status === 'degraded' ? T.amberLight : T.redLight,
            border: `1px solid ${p.statusColor}30`,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div className="risk-pulse" style={{ background: p.statusColor, width: 8, height: 8 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</p>
              <p style={{ fontSize: 11, color: T.textMuted }}>{p.status === 'operational' ? `↑${p.uptime}%` : `Down since ${p.downSince}`}</p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: p.statusColor }}>
              {p.status.toUpperCase()}
            </span>
          </div>
        )) : platforms.slice(0, 2).map((p, i) => (
          <div key={i} style={{
            flex: 1, padding: '12px 16px', borderRadius: 12,
            background: p.status === 'operational' ? T.greenLight : T.redLight,
            border: `1px solid ${p.statusColor}30`, display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div className="risk-pulse" style={{ background: p.statusColor, width: 8, height: 8 }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: p.statusColor }}>{p.status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="main-side">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* My Policy Card */}
          <div className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigate('policy')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>📑 My Policy</h3>
              <span style={{ fontSize: 12, color: T.orange, fontWeight: 600 }}>View Details →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Plan', value: plan.name, color: plan.color },
                { label: 'Premium', value: `₹${plan.price}/wk`, color: T.text },
                { label: 'Renewal', value: '27 Mar', color: T.green },
              ].map((item, i) => (
                <div key={i} style={{ background: T.bg, borderRadius: 10, padding: 12, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</p>
                  <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Premium */}
          <div className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigate('premium')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>💰 This Week's Premium</h3>
              <span style={{ fontSize: 12, color: T.orange, fontWeight: 600 }}>See Breakdown →</span>
            </div>
            <div style={{
              padding: '18px 20px', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: `linear-gradient(135deg, ${plan.color}15, ${plan.color}08)`,
              border: `1px solid ${plan.color}25`
            }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: plan.color }}>₹{plan.price + Math.floor(weather.rainfall > 30 ? 15 : 0)}</p>
                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Dynamic rate · {weather.rainfall > 30 ? 'weather surcharge' : 'normal period'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {weather.rainfall > 30 && (
                  <p style={{ fontSize: 11, color: T.amber, fontWeight: 600 }}>
                    +₹15 rain surcharge
                  </p>
                )}
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 18px', fontSize: 12, marginTop: 6 }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('payment'); }}>
                  Pay Now
                </button>
              </div>
            </div>
          </div>

          {/* Active Claim Timeline */}
          {data.claimsQueue.filter(c => c.status !== 'paid' && c.status !== 'rejected').length > 0 && (
            <div className="card pop-in" style={{ padding: 20, border: `2px solid ${T.orange}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div className="risk-pulse" style={{ background: T.orange }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.orange }}>⚡ Active Claim</h3>
              </div>
              {data.claimsQueue.filter(c => c.status === 'pending').slice(0, 1).map(claim => (
                <div key={claim.id}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{claim.trigger} · ₹{claim.amount}</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {claim.steps.map((s, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          height: 4, borderRadius: 2, marginBottom: 4,
                          background: s.done ? T.green : T.border,
                          transition: 'background .5s'
                        }} />
                        <span style={{ fontSize: 9, color: s.done ? T.green : T.textMuted, fontWeight: 600 }}>
                          {s.step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Trust Score */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>⭐ My Trust Score</h3>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ position: 'relative', width: 100, height: 54, margin: '0 auto' }}>
                <svg viewBox="0 0 100 54" style={{ width: '100%', height: '100%' }}>
                  <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke={T.border} strokeWidth="8" strokeLinecap="round" />
                  <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none"
                    stroke={user.trustScore > 75 ? T.green : user.trustScore > 50 ? T.amber : T.red}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${user.trustScore * 1.41} 141`}
                    style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: user.trustScore > 75 ? T.green : T.amber }}>
                    {user.trustScore}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                {user.trustScore > 80 ? 'Excellent' : user.trustScore > 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'On-time claims', value: '+5', color: T.green },
                { label: 'GPS verified', value: '+3', color: T.green },
                { label: 'Account age', value: '+2', color: T.blue },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
                  fontSize: 12, borderRadius: 6, background: T.bg
                }}>
                  <span style={{ color: T.textSec }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payouts */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>💸 Recent Payouts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PAYOUTS.slice(0, 3).map((p, i) => (
                <div key={i} className="payout-item">
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: T.greenLight, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 16, flexShrink: 0
                  }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{p.event}</p>
                    <p style={{ fontSize: 11, color: T.textMuted }}>{p.date}</p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: T.green }}>+₹{p.amount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Log */}
          {data.triggerLog.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <div className="pulse-dot" style={{ background: T.red, width: 5, height: 5 }} />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Alerts</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.triggerLog.slice(0, 4).map((t, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', background: T.bg, borderRadius: 8,
                    border: `1px solid ${T.border}`, fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span>{t.icon}</span>
                    <span style={{ flex: 1 }}>{t.title}</span>
                    <span style={{ fontSize: 10, color: T.textMuted }}>{t.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
