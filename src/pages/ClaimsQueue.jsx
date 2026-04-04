import { useState, useEffect } from 'react';
import { T } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function ClaimsQueue({ onToast }) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const svc = getRealtimeService();

  useEffect(() => {
    svc.start();
    setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return unsub;
  }, []);

  if (!data) return null;

  const filtered = filter === 'all' ? data.claimsQueue
    : data.claimsQueue.filter(c => c.status === filter);

  const approve = (id) => { svc.approveClaim(id); setData(svc.getSnapshot()); onToast?.(`✅ Claim ${id} approved & paid`); };
  const reject = (id) => { svc.rejectClaim(id); setData(svc.getSnapshot()); onToast?.(`❌ Claim ${id} rejected`); };

  const counts = {
    all: data.claimsQueue.length,
    pending: data.claimsQueue.filter(c => c.status === 'pending').length,
    paid: data.claimsQueue.filter(c => c.status === 'paid').length,
    rejected: data.claimsQueue.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Claims Queue</h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 20 }}>Review, approve, or reject worker claims</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'all', label: `All (${counts.all})`, color: T.text },
          { id: 'pending', label: `Pending (${counts.pending})`, color: T.amber },
          { id: 'paid', label: `Approved (${counts.paid})`, color: T.green },
          { id: 'rejected', label: `Rejected (${counts.rejected})`, color: T.red },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: filter === f.id ? f.color + '15' : T.bg,
            color: filter === f.id ? f.color : T.textSec,
            border: `1px solid ${filter === f.id ? f.color + '30' : T.border}`,
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif"
          }}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.textMuted }}>No claims in this category</p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Fire triggers from the simulation panel to generate claims</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.map((c, i) => {
            const sc = c.status === 'paid' ? T.green : c.status === 'rejected' ? T.red : T.amber;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: sc + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: sc, flexShrink: 0
                }}>{c.aiScore}%</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{c.workerName}</p>
                  <p style={{ fontSize: 11, color: T.textMuted }}>{c.trigger} · {c.zone} · {c.date}</p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, minWidth: 60, textAlign: 'right' }}>₹{c.amount}</p>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: sc + '15', color: sc, minWidth: 70, textAlign: 'center'
                }}>{c.status.toUpperCase()}</span>
                {c.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => approve(c.id)} style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: T.green, color: 'white', border: 'none', cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans',sans-serif"
                    }}>✓ Approve</button>
                    <button onClick={() => reject(c.id)} style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: T.redLight, color: T.red, border: `1px solid ${T.red}20`, cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans',sans-serif"
                    }}>✕ Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
