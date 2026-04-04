import { useState } from 'react';
import { T, PLANS, POLICY_HISTORY } from '../data/constants';
import { PillTag, ProgressBar } from '../components/shared';

const statusColors = {
  active: T.green, upgraded: T.blue, verified: T.purple, created: T.orange, expired: T.textMuted
};
const statusIcons = {
  active: '✅', upgraded: '⬆️', verified: '🔐', created: '📝', expired: '⏰'
};

export default function PolicyManagement({ user, onPlanChange, onToast }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(user.plan);
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[1];
  const daysLeft = Math.max(0, Math.floor((new Date(user.policyEnd) - new Date()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.floor((new Date(user.policyEnd) - new Date(user.policyStart)) / (1000 * 60 * 60 * 24));
  const progressPct = Math.round(((totalDays - daysLeft) / totalDays) * 100);

  const handlePlanSwitch = () => {
    if (onPlanChange) onPlanChange(selectedPlan);
    setShowUpgrade(false);
    if (onToast) onToast(`✅ Plan ${selectedPlan === user.plan ? 'unchanged' : 'switched to ' + PLANS.find(p => p.id === selectedPlan)?.name}!`);
  };

  const coverageItems = [
    { icon: '🌧️', name: 'Heavy Rainfall', limit: `₹${plan.dailyPayout}/day`, active: true },
    { icon: '🌊', name: 'Flood / Waterlogging', limit: `₹${plan.dailyPayout}/day`, active: true },
    { icon: '🌡️', name: 'Extreme Heat (>42°C)', limit: `₹${Math.round(plan.dailyPayout * 0.8)}/day`, active: true },
    { icon: '💻', name: 'Platform Outage', limit: `₹${Math.round(plan.dailyPayout * 0.7)}/day`, active: true },
    { icon: '🚗', name: 'Zone Traffic Lock', limit: `₹${Math.round(plan.dailyPayout * 0.6)}/day`, active: plan.id !== 'starter' },
    { icon: '💨', name: 'AQI Hazard (>300)', limit: `₹${Math.round(plan.dailyPayout * 0.5)}/day`, active: plan.id === 'pro' },
  ];

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Policy Management
          </h2>
          <p style={{ fontSize: 13, color: T.textSec }}>Manage your insurance plan, coverage, and renewals</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PillTag color={T.green}>ACTIVE</PillTag>
          <PillTag color={T.blue}>{user.policyId}</PillTag>
        </div>
      </div>

      {/* Active Policy Hero */}
      <div className="card fade-up" style={{
        padding: 0, marginBottom: 20, overflow: 'hidden',
        border: `2px solid ${plan.color}30`
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`,
          padding: '28px 28px 20px', color: 'white', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: '.06em' }}>ACTIVE POLICY</span>
                <span style={{ background: 'rgba(255,255,255,.2)', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>✓ LIVE</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{plan.name} Plan</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>₹{plan.dailyPayout}/day · {plan.days} payout days/week · ₹{plan.cap} weekly cap</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Weekly Premium</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>₹{plan.price}</div>
              <button onClick={() => setShowUpgrade(!showUpgrade)} style={{
                marginTop: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,.18)', color: 'white',
                border: '1px solid rgba(255,255,255,.35)', borderRadius: 10,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
                transition: 'all .15s'
              }}>
                {showUpgrade ? 'Cancel' : '↕ Change Plan'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            {[
              { label: 'Policy Number', value: user.policyId, color: T.text },
              { label: 'Started', value: new Date(user.policyStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), color: T.green },
              { label: 'Expires', value: new Date(user.policyEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), color: daysLeft < 14 ? T.red : T.text },
              { label: 'Auto-Renew', value: user.autoRenew ? 'Enabled ✓' : 'Disabled', color: user.autoRenew ? T.green : T.red },
            ].map((item, i) => (
              <div key={i} style={{ background: T.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: '.04em', marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: T.textMuted }}>Coverage period</span>
              <span style={{ fontWeight: 700, color: daysLeft < 14 ? T.red : T.text }}>{daysLeft} days remaining</span>
            </div>
            <ProgressBar value={totalDays - daysLeft} max={totalDays} color={daysLeft < 14 ? T.red : plan.color} />
          </div>
        </div>
      </div>

      {/* Upgrade/Downgrade Panel */}
      {showUpgrade && (
        <div className="card fade-up" style={{ padding: 24, marginBottom: 20, border: `2px solid ${T.orange}30` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Switch Your Plan</h3>
          <p style={{ fontSize: 12, color: T.textSec, marginBottom: 18 }}>Changes take effect next billing cycle. Prorated refund for downgrades.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
            {PLANS.map(p => {
              const isActive = p.id === user.plan;
              const isSelected = p.id === selectedPlan;
              const diff = p.price - plan.price;
              return (
                <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                  className={`plan-card${isSelected ? ' selected' : ''}`}
                  style={{
                    borderColor: isSelected ? p.color : T.border, padding: 18,
                    boxShadow: isSelected ? `0 0 0 4px ${p.color}14` : 'none',
                    cursor: 'pointer', position: 'relative'
                  }}>
                  {isActive && <div style={{
                    position: 'absolute', top: -1, right: 12, background: T.green, color: 'white',
                    fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: '0 0 6px 6px'
                  }}>CURRENT</div>}
                  <div style={{ fontSize: 18, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: p.color }}>₹{p.price}<span style={{ fontSize: 12, color: T.textMuted }}>/wk</span></div>
                  <p style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>₹{p.dailyPayout}/day · {p.days}d/wk</p>
                  {!isActive && (
                    <div style={{
                      marginTop: 10, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: diff > 0 ? T.orangeLight : T.greenLight,
                      color: diff > 0 ? T.orange : T.green
                    }}>
                      {diff > 0 ? `+₹${diff}/wk upgrade` : `−₹${Math.abs(diff)}/wk savings`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button className="btn-primary" onClick={handlePlanSwitch} disabled={selectedPlan === user.plan}>
            {selectedPlan === user.plan ? 'This is your current plan' : `Switch to ${PLANS.find(p => p.id === selectedPlan)?.name} Plan →`}
          </button>
        </div>
      )}

      <div className="two-col">
        {/* Coverage Details */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Coverage Details</h3>
            <PillTag color={plan.color}>{plan.name} Plan</PillTag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {coverageItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: item.active ? T.bg : '#F9F9F9', borderRadius: 10,
                border: `1px solid ${item.active ? T.border : '#E5E5E5'}`,
                opacity: item.active ? 1 : 0.5
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.active ? T.green : T.textMuted }}>
                  {item.active ? item.limit : 'Not covered'}
                </span>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: item.active ? T.greenLight : T.redLight,
                  color: item.active ? T.green : T.red
                }}>{item.active ? '✓' : '✕'}</span>
              </div>
            ))}
          </div>
          {plan.id !== 'pro' && (
            <div style={{
              marginTop: 14, padding: '12px 16px', borderRadius: 10,
              background: T.blueLight, border: `1px solid ${T.blue}20`,
              fontSize: 12, color: T.blue
            }}>
              💡 Upgrade to <strong>{plan.id === 'starter' ? 'Standard' : 'Pro'}</strong> to unlock{' '}
              {plan.id === 'starter' ? 'Traffic Lock coverage' : 'AQI Hazard + all premium features'}
            </div>
          )}
        </div>

        {/* Policy Timeline */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Policy History</h3>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{
              position: 'absolute', left: 7, top: 4, bottom: 4, width: 2,
              background: `linear-gradient(to bottom, ${T.green}, ${T.border})`
            }} />
            {POLICY_HISTORY.map((item, i) => {
              const color = statusColors[item.status] || T.textMuted;
              const icon = statusIcons[item.status] || '📋';
              return (
                <div key={i} className="fade-up" style={{
                  position: 'relative', marginBottom: i < POLICY_HISTORY.length - 1 ? 20 : 0,
                  animationDelay: `${i * 80}ms`
                }}>
                  <div style={{
                    position: 'absolute', left: -20, top: 2, width: 16, height: 16, borderRadius: '50%',
                    background: color + '20', border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8
                  }}>{icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{item.action}</span>
                      {item.plan !== '—' && <PillTag color={color}>{item.plan}</PillTag>}
                    </div>
                    <p style={{ fontSize: 11, color: T.textMuted }}>{item.date} · {item.note}</p>
                    {item.premium && <p style={{ fontSize: 12, color, fontWeight: 600, marginTop: 2 }}>₹{item.premium}/week</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
