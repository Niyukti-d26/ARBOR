import { useState } from 'react';
import { T, PLANS } from '../data/constants';

export default function MyPolicy({ user, onPlanChange, onToast }) {
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[1];
  const [showUpgrade, setShowUpgrade] = useState(false);

  const daysLeft = Math.max(0, Math.ceil((new Date(user.policyEnd || '2026-06-30') - Date.now()) / 86400000));
  const pctUsed = Math.max(0, Math.min(100, ((90 - daysLeft) / 90) * 100));

  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>My Policy</h2>

      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 20, overflow: 'hidden',
        background: `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`
      }}>
        <div style={{ padding: '24px 28px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: 10, opacity: 0.8, letterSpacing: 1, fontWeight: 700 }}>ACTIVE POLICY</span>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{plan.name} Plan</h3>
              <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Policy #{user.policyId}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 20,
                fontSize: 11, fontWeight: 700
              }}>✅ ACTIVE</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Premium', value: `₹${plan.price}/wk` },
              { label: 'Daily Payout', value: `₹${plan.dailyPayout}` },
              { label: 'Weekly Cap', value: `₹${plan.cap.toLocaleString()}` },
              { label: 'Payout Days', value: `${plan.days}/wk` },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1 }}>
                <p style={{ fontSize: 10, opacity: 0.7 }}>{item.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '14px 28px', background: 'rgba(0,0,0,.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8, marginBottom: 6 }}>
            <span>Coverage Period</span>
            <span>{daysLeft} days remaining</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,.2)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pctUsed}%`, background: 'white', borderRadius: 3, transition: 'width 1s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.6, marginTop: 4 }}>
            <span>{user.policyStart || '2026-04-01'}</span>
            <span>{user.policyEnd || '2026-06-30'}</span>
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🛡 What's Covered</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { peril: 'Heavy Rainfall (>50mm/hr)', covered: true },
              { peril: 'AQI Emergency (>300)', covered: true },
              { peril: 'Extreme Heat (>42°C)', covered: true },
              { peril: 'Platform Outage (>30min)', covered: user.plan !== 'starter' },
              { peril: 'Zone Congestion Lock', covered: user.plan !== 'starter' },
              { peril: 'Community Shield', covered: user.plan !== 'starter' },
              { peril: 'Priority Processing', covered: user.plan === 'pro' },
              { peril: 'Full Auto-Payout', covered: user.plan === 'pro' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: item.covered ? T.greenLight : T.bg, borderRadius: 8,
                opacity: item.covered ? 1 : 0.5
              }}>
                <span style={{ color: item.covered ? T.green : T.textMuted, fontWeight: 700, fontSize: 12 }}>
                  {item.covered ? '✓' : '✕'}
                </span>
                <span style={{ fontSize: 12 }}>{item.peril}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📊 Usage This Week</h3>
            {[
              { label: 'Cap Used', value: `₹${user.weeklyCapUsed || 0}`, max: plan.cap, color: T.orange },
              { label: 'Payout Days', value: `${user.payoutDaysUsed || 0}/${plan.days}`, max: plan.days, pct: ((user.payoutDaysUsed || 0) / plan.days) * 100, color: T.blue },
              { label: 'Income Protected', value: `₹${user.earningsProtected || 0}`, max: null, color: T.green },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: T.textSec }}>{item.label}</span>
                  <span style={{ fontWeight: 700 }}>{item.value}</span>
                </div>
                {item.max && (
                  <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, background: item.color,
                      width: `${item.pct || ((user.weeklyCapUsed || 0) / item.max) * 100}%`,
                      transition: 'width 1s'
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={() => setShowUpgrade(!showUpgrade)}>
            {showUpgrade ? 'Close' : '⬆ Upgrade Plan'}
          </button>
        </div>
      </div>

      {/* Upgrade Flow */}
      {showUpgrade && (
        <div className="three-col fade-up">
          {PLANS.map(p => (
            <div key={p.id} className={`plan-card ${user.plan === p.id ? 'selected' : ''}`}
              onClick={() => { onPlanChange?.(p.id); setShowUpgrade(false); onToast?.(`✅ Switched to ${p.name} plan`); }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.name}</h3>
              <p style={{ fontSize: 28, fontWeight: 800, color: p.color }}>₹{p.price}<span style={{ fontSize: 12, color: T.textMuted }}>/wk</span></p>
              <p style={{ fontSize: 12, color: T.textSec, margin: '6px 0 12px' }}>₹{p.dailyPayout}/day · {p.days} days · ₹{p.cap} cap</p>
              <button className="btn-primary" style={{
                background: user.plan === p.id ? T.green : `linear-gradient(135deg, ${p.color}, ${p.color}CC)`,
                boxShadow: 'none', fontSize: 12
              }}>
                {user.plan === p.id ? '✓ Current Plan' : `Select ${p.name}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
