import { useState, useEffect } from 'react';
import { T, MOCK_PAYOUTS } from '../data/constants';
import { CloudRain, Shield, Activity, Zap } from '../components/Icons';
import { readState, EVENT_NAME } from '../utils/cropInsuranceState';

const SEED_PAYOUTS = [
  ...MOCK_PAYOUTS,
  { id: 'PO-006', worker: 'Priya Sharma',  amount: 250, trigger: 'Platform Outage', date: '14 Mar 2026', method: 'UPI' },
  { id: 'PO-007', worker: 'Arjun Mehta',   amount: 400, trigger: 'AQI Emergency',   date: '13 Mar 2026', method: 'UPI' },
  { id: 'PO-008', worker: 'Karan Thakur',  amount: 200, trigger: 'Heavy Rainfall',  date: '12 Mar 2026', method: 'UPI' },
  { id: 'PO-009', worker: 'Meena Verma',   amount: 300, trigger: 'Zone Lockdown',   date: '11 Mar 2026', method: 'UPI' },
  { id: 'PO-010', worker: 'Sanjay Bhatt',  amount: 400, trigger: 'Heavy Rainfall',  date: '10 Mar 2026', method: 'UPI' },
];

const TRIGGER_ICONS = {
  'Heavy Rainfall': <CloudRain size={16} />,
  'AQI Emergency':  <Shield size={16} />,
  'Platform Outage':<Activity size={16} />,
  'Zone Lockdown':  <Activity size={16} />,
  'Extreme Heat':   <Zap size={16} />,
};

export default function PayoutLedger() {
  const [livePPayout, setLivePayouts]  = useState([]);
  const [newPayoutId, setNewPayoutId]  = useState(null);

  // ── Listen for cropStateUpdated ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      const lp = (state.payouts || []).map(p => ({ ...p, isLive: true }));
      if (lp.length > 0) {
        setLivePayouts(prev => {
          const existingIds = new Set(prev.map(x => x.id));
          const freshOnes   = lp.filter(x => !existingIds.has(x.id));
          if (freshOnes.length > 0) {
            setNewPayoutId(freshOnes[0].id);
            setTimeout(() => setNewPayoutId(null), 3000);
          }
          return [...freshOnes, ...prev];
        });
      }
    };
    handler();
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const allPayouts = [...livePPayout, ...SEED_PAYOUTS];
  const total  = allPayouts.reduce((s, p) => s + p.amount, 0);
  const live3  = livePPayout.slice(0, 3).reduce((s, p) => s + p.amount, 0);
  const liveTotal = livePPayout.reduce((s, p) => s + p.amount, 0);

  // Group by trigger
  const byTrigger = allPayouts.reduce((acc, p) => {
    acc[p.trigger] = (acc[p.trigger] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>

      {/* Live banner */}
      {livePPayout.length > 0 && (
        <div style={{
          background: '#EDF7EA', border: '1.5px solid #B7DFB0', borderRadius: 10,
          padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60B246', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#60B246' }}>
            {livePPayout.length} live payout{livePPayout.length > 1 ? 's' : ''} — ₹{liveTotal.toLocaleString('en-IN')} disbursed in real-time
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.success }}>₹{total.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Paid Out</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.primary }}>₹{liveTotal > 0 ? liveTotal.toLocaleString('en-IN') : live3.toLocaleString('en-IN')}</div>
          <div className="stat-label">{liveTotal > 0 ? 'Live Payouts' : 'Last 3 Payouts'}</div>
          {livePPayout.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#60B246', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 10, color: '#60B246', fontWeight: 600 }}>Live</span>
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-number">{allPayouts.length}</div>
          <div className="stat-label">Total Payouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.success }}>₹{Math.round(total / allPayouts.length)}</div>
          <div className="stat-label">Avg Payout</div>
        </div>
      </div>

      {/* By trigger breakdown */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Payouts by Trigger Type</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(byTrigger).map(([trigger, count]) => (
            <div key={trigger} style={{ background: T.bg, borderRadius: 8, padding: '10px 16px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>{TRIGGER_ICONS[trigger] || <Zap size={16} />}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{count}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{trigger}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Payout Ledger</div>
          {livePPayout.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#60B246', background: '#EDF7EA', padding: '3px 10px', borderRadius: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#60B246', animation: 'pulse 1.5s infinite' }} />
              {livePPayout.length} live
            </div>
          )}
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Payout ID</th>
              <th>Worker</th>
              <th>Trigger</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allPayouts.map(p => (
              <tr key={p.id} style={{
                background: p.id === newPayoutId ? '#F0FFF4' : 'transparent',
                transition: 'background .5s',
              }}>
                <td style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace' }}>
                  {p.id}
                  {p.isLive && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#60B246', background: '#EDF7EA', padding: '1px 5px', borderRadius: 3 }}>LIVE</span>}
                </td>
                <td style={{ fontSize: 13, fontWeight: 600 }}>{p.worker}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{TRIGGER_ICONS[p.trigger] || <Zap size={16} />} {p.trigger || '—'}</span>
                </td>
                <td style={{ fontSize: 14, fontWeight: 800, color: T.success }}>₹{p.amount}</td>
                <td><span className="badge badge-blue">UPI</span></td>
                <td style={{ fontSize: 12, color: T.textMuted }}>{p.date}</td>
                <td><span className="badge badge-success">Completed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
