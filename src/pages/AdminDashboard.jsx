import { useState, useEffect, useRef } from 'react';
import { T, MOCK_FRAUD_ALERTS, MOCK_WORKERS, ML_MODELS } from '../data/constants';
import { readState, EVENT_NAME } from '../utils/cropInsuranceState';
import { eventBus, EVENTS } from '../utils/eventBus';

const PLATFORM_HEALTH = [
  { name: 'Swiggy', uptime: 99.4, status: 'operational' },
  { name: 'Zomato', uptime: 99.1, status: 'operational' },
  { name: 'Uber', uptime: 99.6, status: 'operational' },
  { name: 'Ola', uptime: 97.3, status: 'degraded' },
];

const ZONE_PREDICTIONS = [
  { zone: 'Vidarbha', risk: 'High', reason: 'Drought Index: 72% — above threshold', color: '#E23744', bg: '#FEF0F1' },
  { zone: 'Bellandur, Bengaluru', risk: 'High', reason: 'Rain forecast >25mm', color: '#E23744', bg: '#FEF0F1' },
  { zone: 'Velachery, Chennai', risk: 'High', reason: 'AQI expected >220', color: '#E23744', bg: '#FEF0F1' },
  { zone: 'Kurla, Mumbai', risk: 'Medium', reason: 'Platform stress expected', color: '#F59E0B', bg: '#FFFBEB' },
  { zone: 'Hadapsar, Pune', risk: 'Low', reason: 'Clear conditions forecast', color: '#60B246', bg: '#EDF7EA' },
];

// Status badge config for claims
const STATUS_BADGE = {
  'Detected':     { color: '#E23744', bg: '#FEF0F1', label: 'Detected' },
  'AI Verifying': { color: '#F59E0B', bg: '#FFFBEB', label: 'AI Verifying' },
  'Approved':     { color: '#3B82F6', bg: '#EFF6FF', label: 'Approved' },
  'Paid':         { color: '#60B246', bg: '#EDF7EA', label: 'Paid' },
  'pending':      { color: '#E23744', bg: '#FEF0F1', label: 'Pending' },
  'approved':     { color: '#60B246', bg: '#EDF7EA', label: 'Approved' },
  'rejected':     { color: '#6B7280', bg: '#F3F4F6', label: 'Rejected' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status] || STATUS_BADGE['pending'];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5,
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  );
}

// Event alert banner
function EventAlertBanner({ event, onDismiss }) {
  if (!event) return null;
  return (
    <div className="fade-up" style={{
      background: 'linear-gradient(135deg, #FFF8C5, #FFF3CD)',
      border: '1.5px solid #F59E0B', borderRadius: 10,
      padding: '12px 18px', marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 24 }}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
          Event Alert — {event} detected in Vidarbha
        </div>
        <div style={{ fontSize: 12, color: '#78350F' }}>
          1 claim triggered — ₹2,400 processing via AI pipeline
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
        color: '#92400E', fontFamily: 'Inter, sans-serif', padding: '0 4px',
      }}>✕</button>
    </div>
  );
}

export default function AdminDashboard({ onNavigate, onToast }) {
  // ── Shared state: from cropInsuranceState ──
  const [totalClaimsPaid, setTotalClaimsPaid] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [liveClaims, setLiveClaims]           = useState([]);
  const [liveFraudAlerts, setLiveFraudAlerts] = useState([]);
  const [vidarbhaRisk, setVidarbhaRisk]       = useState('HIGH');
  const [vidarbhaPremium, setVidarbhaPremium] = useState(100);
  const [alertEvent, setAlertEvent]           = useState(null);
  const alertTimerRef = useRef(null);
  const lastEventRef  = useRef(null);

  // ── Listen for cropStateUpdated ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      setTotalClaimsPaid(state.totalClaimsPaid ?? 0);
      setTotalAmountPaid(state.totalAmountPaid ?? 0);
      setLiveClaims(Array.isArray(state.claims) ? state.claims : []);
      setLiveFraudAlerts(Array.isArray(state.fraudEvents) ? state.fraudEvents : []);
      setVidarbhaRisk(state.zoneRisk ?? 'HIGH');
      setVidarbhaPremium(state.currentPremium ?? 100);

      // Show banner when lastEvent changes
      if (state.lastEvent && state.lastEvent !== lastEventRef.current) {
        lastEventRef.current = state.lastEvent;
        setAlertEvent(state.lastEvent);
        clearTimeout(alertTimerRef.current);
        alertTimerRef.current = setTimeout(() => setAlertEvent(null), 8000);
      }
    };
    handler();
    window.addEventListener(EVENT_NAME, handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      clearTimeout(alertTimerRef.current);
    };
  }, []);

  const allFraudAlerts = [...liveFraudAlerts, ...MOCK_FRAUD_ALERTS];

  // Dynamic stats
  const STATS = [
    { label: 'Active Workers',      value: '52,841',           icon: '👥', color: T?.primary || '#FF5200', change: '+124 today' },
    { label: 'Premiums Collected',  value: '₹41.2L',           icon: '💰', color: '#60B246',            change: '+₹3.8L today' },
    { label: 'Claims Paid (Live)',  value: totalClaimsPaid,    icon: '💸', color: '#F59E0B',            change: `₹${totalAmountPaid.toLocaleString('en-IN')} disbursed` },
    { label: 'Fraud Blocked',       value: allFraudAlerts.length, icon: '🚨', color: '#E23744',         change: `${liveFraudAlerts.length} live alerts` },
  ];

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>

      {/* ── Event Alert Banner ── */}
      <EventAlertBanner event={alertEvent} onDismiss={() => setAlertEvent(null)} />

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {STATS.map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 22 }}>{stat.icon}</div>
            </div>
            <div className="stat-number" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label" style={{ marginTop: 4, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#60B246', fontWeight: 600 }}>↑ {stat.change}</div>
          </div>
        ))}
      </div>

      {/* ── Live Claims from Simulator (cropInsuranceState) ── */}
      {liveClaims.length > 0 && (
        <div className="card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Live Claims — Real-time</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
              color: '#60B246', background: '#EDF7EA', padding: '3px 10px', borderRadius: 5,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
              Live
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Zone</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {liveClaims.map(claim => (
                <tr key={claim.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{claim.farmer}</td>
                  <td style={{ fontSize: 12, color: T.textSec }}>{claim.zone}</td>
                  <td style={{ fontSize: 13 }}>{claim.event}</td>
                  <td style={{ fontSize: 14, fontWeight: 700 }}>₹{claim.amount}</td>
                  <td style={{ fontSize: 11, color: T.textMuted }}>
                    {new Date(claim.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td><StatusBadge status={claim.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Platform Health */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Platform Health</div>
          {PLATFORM_HEALTH.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10, flexShrink: 0 }}>
                {p.name === 'Swiggy' ? '🔴' : p.name === 'Zomato' ? '🍕' : p.name === 'Uber' ? '🚗' : '🟡'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.status === 'operational' ? '#60B246' : '#F59E0B' }}>{p.uptime}%</span>
                </div>
                <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.uptime}%`, background: p.status === 'operational' ? '#60B246' : '#F59E0B', borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fraud Alert Summary */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Fraud Alerts</div>
            <div style={{ background: '#FEF0F1', color: '#E23744', fontSize: 20, fontWeight: 800, padding: '4px 14px', borderRadius: 8 }}>
              {MOCK_FRAUD_ALERTS.length}
            </div>
          </div>
          {MOCK_FRAUD_ALERTS.slice(0, 3).map(alert => (
            <div key={alert.id} style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${T.border}`, alignItems: 'flex-start' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                background: alert.level === 'high' ? '#E23744' : alert.level === 'medium' ? '#F59E0B' : '#60B246',
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{alert.worker}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{alert.reason.slice(0, 52)}...</div>
              </div>
            </div>
          ))}
          <button onClick={() => onNavigate('fraud')} style={{ fontSize: 12, fontWeight: 600, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
            View all alerts →
          </button>
        </div>
      </div>

      {/* ── Vidarbha Zone Pricing (live) ── */}
      <div className="card" style={{ padding: 20, marginBottom: 24, border: `1px solid ${vidarbhaRisk === 'HIGH' ? '#FBBBBC' : T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>AI Pricing — Vidarbha Zone (Live)</div>
          <div style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 700,
            padding: '3px 9px', borderRadius: 4,
            background: vidarbhaRisk === 'HIGH' ? '#FEF0F1' : '#EDF7EA',
            color: vidarbhaRisk === 'HIGH' ? '#E23744' : '#60B246',
          }}>
            Risk: {vidarbhaRisk}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: T.primary }}>₹{vidarbhaPremium}</span>
          <span style={{ fontSize: 13, color: T.textMuted }}>/ week · Market avg ₹145 · You save ₹{145 - vidarbhaPremium}</span>
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>
          Premium auto-recalculates when drought index, zone risk, or season factor changes
        </div>
      </div>

      {/* ── Top Live Fraud Alerts (real-time) ── */}
      <div className="card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden', border: `1px solid ${liveFraudAlerts.length > 0 ? '#FBBBBC' : '#F0F0F0'}` }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Fraud Alerts</div>
            {liveFraudAlerts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#E23744', background: '#FEF0F1', padding: '2px 8px', borderRadius: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E23744', animation: 'pulse 1.5s infinite' }} />
                {liveFraudAlerts.length} live
              </div>
            )}
          </div>
          <button onClick={() => onNavigate('fraud')} style={{ fontSize: 12, fontWeight: 600, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            View all →
          </button>
        </div>
        <div style={{ padding: '8px 0' }}>
          {allFraudAlerts.slice(0, 5).map((alert, i) => {
            const isLive = !!alert.isLive;
            return (
              <div key={alert.id} style={{
                display: 'flex', gap: 12, padding: '10px 20px',
                borderBottom: i < Math.min(allFraudAlerts.length, 5) - 1 ? `1px solid ${T.border}` : 'none',
                background: isLive ? '#FFFAFA' : 'transparent',
                alignItems: 'flex-start',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: alert.level === 'high' ? '#E23744' : alert.level === 'medium' ? '#F59E0B' : '#60B246' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
                    {alert.worker}
                    {isLive && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#E23744', background: '#FEF0F1', padding: '1px 5px', borderRadius: 3 }}>LIVE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{alert.reason?.slice(0, 64)}...</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: alert.level === 'high' ? '#E23744' : '#F59E0B' }}>{alert.score}%</div>
              </div>
            );
          })}
          {allFraudAlerts.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>No fraud alerts</div>
          )}
        </div>
      </div>

      {/* AI Zone Risk Predictions */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>AI Zone Risk — Tomorrow</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Predicted disruption probability by zone</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ZONE_PREDICTIONS.map(z => (
            <div key={z.zone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: z.bg, borderRadius: 8, border: `1px solid ${z.color}22` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{z.zone}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{z.reason}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: z.color, padding: '4px 10px', background: 'white', borderRadius: 5, border: `1px solid ${z.color}33` }}>
                {z.risk}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Trend Chart */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Daily Payout Trend (Last 7 Days)</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Total disbursed automatically via UPI</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#60B246' }}>₹{(29.4 + totalAmountPaid / 100000).toFixed(1)}L</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Week Total (incl. live)</div>
          </div>
        </div>
        {(() => {
          const bars = [
            { day: 'Mon', val: 3.2 }, { day: 'Tue', val: 4.1 }, { day: 'Wed', val: 6.8 },
            { day: 'Thu', val: 2.9 }, { day: 'Fri', val: 3.7 }, { day: 'Sat', val: 4.5 },
            { day: 'Sun', val: 4.2 + totalAmountPaid / 500000 },
          ];
          const maxVal = Math.max(...bars.map(b => b.val));
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
              {bars.map((bar, i) => {
                const isToday = i === 6;
                const height = Math.round((bar.val / maxVal) * 88);
                return (
                  <div key={bar.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted }}>₹{bar.val.toFixed(1)}L</div>
                    <div style={{
                      width: '100%', height,
                      background: isToday ? 'linear-gradient(to top, #FF5200, #FF9A6C)' : 'linear-gradient(to top, #3B82F6, #93C5FD)',
                      borderRadius: '5px 5px 2px 2px', transition: 'height .5s ease',
                      border: isToday ? '1.5px solid #FF5200' : 'none',
                    }} />
                    <div style={{ fontSize: 9, fontWeight: isToday ? 700 : 500, color: isToday ? '#FF5200' : T.textMuted }}>{bar.day}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ML Model Cards */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>ML Models Status</div>
        <div className="four-col" style={{ marginBottom: 0 }}>
          {ML_MODELS.map(m => (
            <div key={m.name} style={{ background: T.bg, borderRadius: 10, padding: '14px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.primary, marginBottom: 4 }}>{m.accuracy}</div>
              <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, display: 'inline-block',
                background: m.status === 'active' ? '#EDF7EA' : '#FFFBEB',
                color: m.status === 'active' ? '#60B246' : '#F59E0B',
              }}>{m.status === 'active' ? '● Active' : '◌ Training'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
