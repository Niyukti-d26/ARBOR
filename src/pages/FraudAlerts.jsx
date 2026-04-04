import { useState, useEffect } from 'react';
import { T } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function FraudAlerts({ onToast }) {
  const [data, setData] = useState(null);
  const svc = getRealtimeService();

  useEffect(() => {
    svc.start(); setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return unsub;
  }, []);

  if (!data) return null;

  const flaggedWorkers = data.workers.filter(w => w.trustScore < 50);
  const suspiciousClaims = data.claimsQueue.filter(c => c.aiScore < 85);

  const anomalies = [
    { worker: 'Suspect-01', reason: 'GPS location mismatch', type: 'gps_spoof', severity: 'high', score: 19, time: '14:22' },
    { worker: 'Suspect-02', reason: 'Duplicate claim submission', type: 'duplicate', severity: 'high', score: 24, time: '13:45' },
    { worker: 'Suspect-03', reason: 'Unusual claim pattern — 5 claims in 48h', type: 'velocity', severity: 'medium', score: 38, time: '12:10' },
    { worker: 'Suspect-04', reason: 'Trust score below threshold', type: 'trust', severity: 'low', score: 42, time: '11:30' },
    { worker: 'Suspect-05', reason: 'Multi-account suspected — same device ID', type: 'device', severity: 'high', score: 15, time: '10:55' },
    ...flaggedWorkers.slice(0, 3).map(w => ({
      worker: w.name, reason: `Trust score critically low (${w.trustScore})`, type: 'trust',
      severity: w.trustScore < 35 ? 'high' : 'medium', score: w.trustScore, time: w.lastActive
    })),
  ];

  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Fraud Alerts</h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 20 }}>AI-flagged anomalies and suspicious activities</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Flagged', value: anomalies.length.toString(), color: T.red, icon: '🚨' },
          { label: 'GPS Anomalies', value: anomalies.filter(a => a.type === 'gps_spoof').length.toString(), color: T.amber, icon: '📍' },
          { label: 'Duplicates', value: anomalies.filter(a => a.type === 'duplicate').length.toString(), color: '#7C3AED', icon: '📋' },
          { label: 'Low Trust', value: flaggedWorkers.length.toString(), color: T.orange, icon: '⭐' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Warning Banner */}
      <div style={{
        background: T.redLight, border: `1px solid ${T.red}25`, borderRadius: 12,
        padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
      }}>
        <span style={{ fontSize: 22 }}>🚨</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.red }}>
            {anomalies.filter(a => a.severity === 'high').length} high-severity alerts need review
          </p>
          <p style={{ fontSize: 12, color: T.textSec }}>GPS spoofing · Duplicate claims · Device fingerprint mismatch</p>
        </div>
      </div>

      {/* Anomaly List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {anomalies.map((a, i) => {
          const sc = a.severity === 'high' ? T.red : a.severity === 'medium' ? T.amber : T.blue;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              borderBottom: i < anomalies.length - 1 ? `1px solid ${T.border}` : 'none'
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, background: sc + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: sc, flexShrink: 0
              }}>{a.score}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{a.worker}</p>
                <p style={{ fontSize: 11, color: T.textMuted }}>{a.reason}</p>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                background: sc + '15', color: sc
              }}>{a.severity.toUpperCase()}</span>
              <span style={{ fontSize: 10, color: T.textMuted, fontFamily: 'monospace' }}>{a.time}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onToast?.(`🔍 Investigating ${a.worker}...`)} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: T.bg, color: T.textSec, border: `1px solid ${T.border}`, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans',sans-serif"
                }}>Review</button>
                <button onClick={() => onToast?.(`⛔ ${a.worker} suspended`)} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: T.redLight, color: T.red, border: `1px solid ${T.red}20`, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans',sans-serif"
                }}>Flag</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
