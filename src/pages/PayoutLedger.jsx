import { useState, useEffect } from 'react';
import { T } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function PayoutLedger() {
  const [data, setData] = useState(null);
  const svc = getRealtimeService();

  useEffect(() => {
    svc.start(); setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return unsub;
  }, []);

  if (!data) return null;

  const total = data.payoutLedger.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Payout Ledger</h2>
          <p style={{ fontSize: 13, color: T.textSec }}>Complete history of all disbursements</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            padding: '8px 16px', borderRadius: 10, background: T.greenLight,
            border: `1px solid ${T.green}20`, textAlign: 'center'
          }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.green }}>₹{total.toLocaleString()}</p>
            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>TOTAL DISBURSED</p>
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: 10, background: T.blueLight,
            border: `1px solid ${T.blue}20`, textAlign: 'center'
          }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.blue }}>{data.payoutLedger.length}</p>
            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>TRANSACTIONS</p>
          </div>
        </div>
      </div>

      {data.payoutLedger.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>💸</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.textMuted }}>No payouts yet</p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Approve claims to see payouts here</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 1fr 100px 80px 90px 100px',
            padding: '10px 18px', borderBottom: `1px solid ${T.border}`,
            fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: '.05em'
          }}>
            <span>ID</span><span>WORKER</span><span>TRIGGER</span><span>AMOUNT</span><span>METHOD</span><span>TIME</span><span>STATUS</span>
          </div>
          {data.payoutLedger.map((p, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 1fr 100px 80px 90px 100px',
              padding: '12px 18px', borderBottom: `1px solid ${T.border}`,
              fontSize: 12, alignItems: 'center'
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: T.textMuted }}>{p.id.slice(0, 10)}</span>
              <span style={{ fontWeight: 600 }}>{p.worker}</span>
              <span style={{ color: T.textSec }}>{p.trigger}</span>
              <span style={{ fontWeight: 700, color: T.green }}>₹{p.amount}</span>
              <span style={{ fontSize: 11 }}>{p.method}</span>
              <span style={{ fontSize: 10, color: T.textMuted }}>{p.time}</span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                background: T.greenLight, color: T.green, textAlign: 'center'
              }}>SUCCESS</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
