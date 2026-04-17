import { useState } from 'react';
import { T, MOCK_ADMIN_CLAIMS } from '../data/constants';

const STATUS_COLORS = {
  pending: { bg: '#FFFBEB', color: '#F59E0B', label: 'Pending' },
  approved: { bg: '#EDF7EA', color: '#60B246', label: 'Approved' },
  rejected: { bg: '#FEF0F1', color: '#E23744', label: 'Rejected' },
  flagged: { bg: '#FEF0F1', color: '#E23744', label: 'Flagged' },
  paid: { bg: '#EFF6FF', color: '#3B82F6', label: 'Paid' },
};

export default function ClaimsQueue({ onToast }) {
  const [claims, setClaims] = useState([
    ...MOCK_ADMIN_CLAIMS,
    { id: 'CLM-A08', worker: 'Rohit Singh', zone: 'Varthur', city: 'Bengaluru', trigger: 'AQI Emergency', amount: 400, status: 'pending', date: '21 Mar' },
    { id: 'CLM-A09', worker: 'Anita Gupta', zone: 'Govandi', city: 'Mumbai', trigger: 'Heavy Rainfall', amount: 300, status: 'pending', date: '21 Mar' },
    { id: 'CLM-A10', worker: 'Suresh Yadav', zone: 'Saroornagar', city: 'Hyderabad', trigger: 'Zone Lockdown', amount: 400, status: 'approved', date: '20 Mar' },
  ]);
  const [filter, setFilter] = useState('all');

  const handleApprove = (id) => {
    setClaims(cs => cs.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    onToast('Claim approved — payout initiated');
  };
  const handleReject = (id) => {
    setClaims(cs => cs.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    onToast('Claim rejected');
  };

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const counts = {
    all: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    flagged: claims.filter(c => c.status === 'flagged').length,
  };

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '8px 16px', borderRadius: 7, border: '1.5px solid',
            borderColor: filter === key ? T.primary : T.border,
            background: filter === key ? '#FFF5F0' : T.white,
            color: filter === key ? T.primary : T.textSec,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
          </button>
        ))}
      </div>

      {/* Summary counts */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.amber }}>{counts.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.success }}>{counts.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.danger }}>{counts.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#3B82F6' }}>{claims.filter(c => c.status === 'paid').length}</div>
          <div className="stat-label">Paid</div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Worker</th>
              <th>Trigger</th>
              <th>Amount</th>
              <th>Zone</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(claim => {
              const s = STATUS_COLORS[claim.status] || STATUS_COLORS.pending;
              return (
                <tr key={claim.id}>
                  <td style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace' }}>{claim.id}</td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{claim.worker}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{claim.city}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{claim.trigger}</td>
                  <td style={{ fontSize: 14, fontWeight: 700 }}>₹{claim.amount}</td>
                  <td style={{ fontSize: 12, color: T.textSec }}>{claim.zone}</td>
                  <td style={{ fontSize: 12, color: T.textMuted }}>{claim.date}</td>
                  <td>
                    <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td>
                    {claim.status === 'pending' || claim.status === 'flagged' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-success" onClick={() => handleApprove(claim.id)}>✓</button>
                        <button className="btn-danger" onClick={() => handleReject(claim.id)}>✗</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: T.textMuted }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
