import { useState, useEffect } from 'react';
import { T, MOCK_WORKERS } from '../data/constants';
import { readState, EVENT_NAME } from '../utils/cropInsuranceState';

export default function WorkerManagement({ onToast }) {
  const [liveWorkers, setLiveWorkers] = useState([]);
  const [search, setSearch]           = useState('');
  const [filterCity, setFilterCity]   = useState('all');

  // ── Pull registered workers from shared state in real-time ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      setLiveWorkers(state.registeredWorkers || []);
    };
    handler();
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  // Merge: live-registered first, then mock seed (no duplicates by name)
  const allWorkers = [
    ...liveWorkers,
    ...MOCK_WORKERS.filter(mw => !liveWorkers.some(lw => lw.name === mw.name)),
  ];

  const cities = ['all', ...new Set(allWorkers.map(w => w.city).filter(Boolean))];

  const filtered = allWorkers.filter(w =>
    (filterCity === 'all' || w.city === filterCity) &&
    (w.name?.toLowerCase().includes(search.toLowerCase()) || w.id?.includes(search))
  );

  const [localStatus, setLocalStatus] = useState({});
  const handleSuspend = (id) => {
    setLocalStatus(s => ({ ...s, [id]: s[id] === 'suspended' ? 'active' : 'suspended' }));
    const w = allWorkers.find(w => w.id === id);
    const cur = localStatus[id] || w?.status || 'active';
    onToast(cur === 'active' ? '⏸ Worker suspended' : '✅ Worker reactivated');
  };

  const trustColor = (score) => score >= 70 ? T.success : score >= 40 ? T.amber : T.danger;
  const planColor = { starter: '#3B82F6', standard: T.primary, pro: '#60B246' };

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>

      {/* Live banner */}
      {liveWorkers.length > 0 && (
        <div style={{
          background: '#EDF7EA', border: '1.5px solid #B7DFB0', borderRadius: 10,
          padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60B246', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#60B246' }}>
            {liveWorkers.length} newly registered worker{liveWorkers.length > 1 ? 's' : ''} — live from ARBOR onboarding
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number">{allWorkers.filter(w => (localStatus[w.id] || w.status) === 'active').length}</div>
          <div className="stat-label">Active Workers</div>
          {liveWorkers.length > 0 && (
            <div style={{ fontSize: 10, color: '#60B246', fontWeight: 600, marginTop: 4 }}>+{liveWorkers.length} new today</div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.danger }}>{allWorkers.filter(w => (localStatus[w.id] || w.status) === 'suspended').length}</div>
          <div className="stat-label">Suspended</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.primary }}>{allWorkers.filter(w => w.plan === 'pro').length}</div>
          <div className="stat-label">Pro Plan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.amber }}>
            {Math.round(allWorkers.reduce((a, w) => a + (w.trustScore || 70), 0) / (allWorkers.length || 1))}
          </div>
          <div className="stat-label">Avg Trust Score</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input className="input" placeholder="Search by name or ID..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="input" value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ maxWidth: 160 }}>
          {cities.map(c => <option key={c} value={c}>{c === 'all' ? 'All Cities' : c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Platform</th>
              <th>Zone</th>
              <th>Plan</th>
              <th>Trust Score</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const effectiveStatus = localStatus[w.id] || w.status || 'active';
              const isLive = liveWorkers.some(lw => lw.id === w.id);
              return (
                <tr key={w.id} style={{ background: isLive ? '#FAFFFA' : 'transparent' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: isLive ? '#60B246' : T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {(w.name || '?')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {w.name}
                          {isLive && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#60B246', background: '#EDF7EA', padding: '1px 5px', borderRadius: 3 }}>NEW</span>}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{w.id || '—'} · {w.city}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: T.textSec }}>
                    {Array.isArray(w.platforms) ? w.platforms.join(', ') : (w.platform || '—')}
                  </td>
                  <td style={{ fontSize: 12, color: T.textSec }}>{w.zone}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#FFF5F0', color: planColor[w.plan] || T.primary }}>
                      {(w.plan || 'standard').charAt(0).toUpperCase() + (w.plan || 'standard').slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: 'hidden', maxWidth: 60 }}>
                        <div style={{ height: '100%', width: `${w.trustScore || 75}%`, background: trustColor(w.trustScore || 75), borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: trustColor(w.trustScore || 75) }}>{w.trustScore || 75}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: effectiveStatus === 'active' ? '#EDF7EA' : '#FEF0F1',
                      color: effectiveStatus === 'active' ? T.success : T.danger,
                    }}>
                      {effectiveStatus === 'active' ? '● Active' : '● Suspended'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleSuspend(w.id)} style={{
                      padding: '5px 12px', borderRadius: 5, border: `1px solid ${T.border}`,
                      background: 'none', color: T.textSec, fontSize: 11, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    }}>
                      {effectiveStatus === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
            No workers found
          </div>
        )}
      </div>
    </div>
  );
}
