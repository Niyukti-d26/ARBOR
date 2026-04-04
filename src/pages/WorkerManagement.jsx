import { useState, useEffect } from 'react';
import { T } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function WorkerManagement({ onToast }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const svc = getRealtimeService();

  useEffect(() => {
    svc.start(); setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return unsub;
  }, []);

  if (!data) return null;

  const filtered = data.workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.id.toLowerCase().includes(search.toLowerCase()) ||
    w.city.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSuspend = (worker) => {
    worker.status = worker.status === 'active' ? 'suspended' : 'active';
    setData({ ...svc.getSnapshot() });
    onToast?.(`${worker.status === 'active' ? '✅ Activated' : '⛔ Suspended'} ${worker.name}`);
  };

  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Worker Management</h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 20 }}>Search, view, and manage worker accounts</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input className="input" placeholder="🔍 Search by name, ID, or city..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: T.blueLight, color: T.blue }}>
            {data.workers.length} total
          </span>
          <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: T.greenLight, color: T.green }}>
            {data.workers.filter(w => w.status === 'active').length} active
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Worker List */}
        <div className="card" style={{ flex: 1, overflow: 'hidden' }}>
          {filtered.map((w, i) => (
            <div key={i} onClick={() => setSelectedWorker(w)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
                background: selectedWorker?.id === w.id ? T.orangeLight : 'transparent',
                transition: 'background .15s'
              }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0
              }}>{w.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</p>
                <p style={{ fontSize: 11, color: T.textMuted }}>{w.id} · {w.city} · {w.platform}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: w.trustScore > 70 ? T.green : T.amber }}>
                  ⭐ {w.trustScore}
                </p>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: w.status === 'active' ? T.greenLight : T.redLight,
                  color: w.status === 'active' ? T.green : T.red
                }}>{w.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Worker Detail */}
        {selectedWorker && (
          <div className="card fade-up" style={{ width: 340, padding: 20, alignSelf: 'flex-start' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 10px',
                background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: 'white'
              }}>{selectedWorker.name[0]}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{selectedWorker.name}</h3>
              <p style={{ fontSize: 12, color: T.textMuted }}>{selectedWorker.id} · Joined {selectedWorker.joinedDate}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Phone', value: selectedWorker.phone },
                { label: 'City', value: selectedWorker.city },
                { label: 'Zone', value: selectedWorker.zone },
                { label: 'Platform', value: selectedWorker.platform },
                { label: 'Plan', value: selectedWorker.plan },
                { label: 'Trust Score', value: `${selectedWorker.trustScore}/100` },
                { label: 'Avg Income', value: `₹${selectedWorker.avgIncome}/day` },
                { label: 'Claims', value: selectedWorker.totalClaims.toString() },
                { label: 'Total Paid', value: `₹${selectedWorker.totalPaid}` },
                { label: 'Last Active', value: selectedWorker.lastActive },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
                  fontSize: 12, borderRadius: 6, background: T.bg
                }}>
                  <span style={{ color: T.textMuted }}>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => toggleSuspend(selectedWorker)}
              className="btn-primary" style={{
                marginTop: 16,
                background: selectedWorker.status === 'active'
                  ? `linear-gradient(135deg, ${T.red}, #FF6B6B)`
                  : `linear-gradient(135deg, ${T.green}, #4ADE80)`,
                boxShadow: 'none'
              }}>
              {selectedWorker.status === 'active' ? '⛔ Suspend Worker' : '✅ Activate Worker'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
