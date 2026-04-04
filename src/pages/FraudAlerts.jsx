import { useState, useEffect } from 'react';
import { T, MOCK_FRAUD_ALERTS } from '../data/constants';
import { readState, EVENT_NAME } from '../utils/cropInsuranceState';
import { eventBus, EVENTS } from '../utils/eventBus';

const SEED_ALERTS = [
  ...MOCK_FRAUD_ALERTS,
  { id: 'FR-005', worker: 'Manoj Kumar', reason: 'Claimed during a zone with no weather event recorded', score: 78, level: 'high', date: '14 Mar', fraudLabel: 'Ghost Claim' },
  { id: 'FR-006', worker: 'Vikram Das', reason: 'Three workers from same device hash within 5 minutes', score: 91, level: 'high', date: '13 Mar', fraudLabel: 'Device Sharing' },
  { id: 'FR-007', worker: 'Rekha Iyer', reason: 'Claim submitted from outside registered zone by 8km', score: 55, level: 'medium', date: '12 Mar', fraudLabel: 'Zone Mismatch' },
];

const LEVEL_CONFIG = {
  high:   { bg: '#FEF0F1', color: '#E23744', label: 'High Risk' },
  medium: { bg: '#FFFBEB', color: '#F59E0B', label: 'Medium Risk' },
  low:    { bg: '#EDF7EA', color: '#60B246', label: 'Low Risk' },
};

export default function FraudAlerts({ onToast }) {
  const [alerts, setAlerts] = useState(SEED_ALERTS);
  const [filter, setFilter] = useState('all');
  const [newAlertId, setNewAlertId] = useState(null); // for flash animation

  // ── Listen for cropStateUpdated — pull live fraudEvents ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      const liveEvents = (state.fraudEvents || []).map(e => ({
        id: e.id,
        worker: e.worker,
        reason: e.reason,
        score: e.score,
        level: e.level,
        date: e.date,
        fraudLabel: e.fraudLabel || 'Fraud',
        isLive: true,
      }));
      if (liveEvents.length > 0) {
        setAlerts(prev => {
          // Merge: put live events first, deduplicate by id
          const existingIds = new Set(prev.map(a => a.id));
          const newLive = liveEvents.filter(e => !existingIds.has(e.id));
          if (newLive.length > 0) {
            setNewAlertId(newLive[0].id);
            setTimeout(() => setNewAlertId(null), 3000);
          }
          return [...newLive, ...prev];
        });
      }
    };
    handler();
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  // ── Also listen to legacy eventBus FRAUD_DETECTED ──
  useEffect(() => {
    const handleFraud = (data) => {
      const id = `FR-EB-${Date.now()}`;
      const score = Math.round((data.fraudScore || 0.9) * 100);
      const level = score > 80 ? 'high' : score > 55 ? 'medium' : 'low';
      const newAlert = {
        id,
        worker: data.worker || 'Unknown',
        reason: data.reason || 'Fraud detected by AI',
        score,
        level,
        date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        fraudLabel: data.fraudLabel || 'Fraud',
        isLive: true,
      };
      setAlerts(prev => {
        const alreadyExists = prev.some(a => a.worker === newAlert.worker && a.reason === newAlert.reason);
        if (alreadyExists) return prev;
        setNewAlertId(id);
        setTimeout(() => setNewAlertId(null), 3000);
        return [newAlert, ...prev];
      });
    };
    eventBus.on(EVENTS.FRAUD_DETECTED, handleFraud);
    eventBus.on(EVENTS.CLAIM_AUTO_REJECTED, handleFraud);
    return () => {
      eventBus.off(EVENTS.FRAUD_DETECTED, handleFraud);
      eventBus.off(EVENTS.CLAIM_AUTO_REJECTED, handleFraud);
    };
  }, []);

  const handleDismiss = (id) => {
    setAlerts(as => as.filter(a => a.id !== id));
    onToast('🗑 Alert dismissed');
  };
  const handleEscalate = (id) => {
    onToast('🚨 Alert escalated to fraud team');
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.level === filter);
  const highCount = alerts.filter(a => a.level === 'high').length;
  const medCount  = alerts.filter(a => a.level === 'medium').length;
  const liveCount = alerts.filter(a => a.isLive).length;

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>

      {/* Live banner if any live alerts */}
      {liveCount > 0 && (
        <div style={{
          background: '#FEF0F1', border: '1.5px solid #FBBBBC', borderRadius: 10,
          padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E23744', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#E23744' }}>
            {liveCount} live fraud event{liveCount > 1 ? 's' : ''} detected in real-time
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.danger }}>{alerts.length}</div>
          <div className="stat-label">Total Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.danger }}>{highCount}</div>
          <div className="stat-label">High Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.amber }}>{medCount}</div>
          <div className="stat-label">Medium Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: T.primary }}>{liveCount}</div>
          <div className="stat-label">Live Detected</div>
          {liveCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E23744', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 10, color: '#E23744', fontWeight: 600 }}>Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'high', 'medium', 'low'].map(level => (
          <button key={level} onClick={() => setFilter(level)} style={{
            padding: '8px 16px', borderRadius: 7, border: '1.5px solid',
            borderColor: filter === level ? T.primary : T.border,
            background: filter === level ? '#FFF5F0' : T.white,
            color: filter === level ? T.primary : T.textSec,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            {level === 'all' ? `All (${alerts.length})` : `${level.charAt(0).toUpperCase() + level.slice(1)} Risk`}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(alert => {
          const cfg = LEVEL_CONFIG[alert.level] || LEVEL_CONFIG['high'];
          const isNew = alert.id === newAlertId;
          return (
            <div key={alert.id} className="card" style={{
              padding: 18,
              border: isNew ? '2px solid #E23744' : '1px solid #F0F0F0',
              boxShadow: isNew ? '0 0 0 4px rgba(226,55,68,0.1)' : 'none',
              transition: 'all .4s',
              animation: isNew ? 'fadeUp .4s ease' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    🚨
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                      {alert.worker}
                      {alert.isLive && (
                        <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#E23744', background: '#FEF0F1', padding: '2px 6px', borderRadius: 4 }}>LIVE</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{alert.id} · {alert.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {alert.fraudLabel && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: cfg.bg, color: cfg.color }}>
                      {alert.fraudLabel}
                    </span>
                  )}
                  <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                </div>
              </div>

              <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, marginBottom: 14, padding: '10px 12px', background: T.bg, borderRadius: 8 }}>
                {alert.reason}
              </div>

              {/* Fraud score bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Fraud Probability</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color }}>{alert.score}%</span>
                </div>
                <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${alert.score}%`, background: cfg.color, borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEscalate(alert.id)} style={{
                  flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${T.danger}`,
                  background: 'none', color: T.danger, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>Escalate</button>
                <button onClick={() => handleDismiss(alert.id)} style={{
                  flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${T.border}`,
                  background: 'none', color: T.textSec, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>Dismiss</button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: T.textMuted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No alerts in this category</div>
          </div>
        )}
      </div>
    </div>
  );
}
