import { useState, useEffect } from 'react';
import { T, MOCK_FRAUD_ALERTS } from '../data/constants';
import { readState, EVENT_NAME } from '../utils/cropInsuranceState';
import { eventBus, EVENTS } from '../utils/eventBus';
import { detectGpsSpoofing, detectFakeWeather, detectVelocityAnomaly, computeAdvancedFraudScore } from '../utils/fraudDetector';
import { MapPin, CloudRain, Zap, Bot, ShieldAlert, CheckCircle, AlertTriangle } from '../components/Icons';

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

// ── Advanced Detection Demo Panel ──
function AdvancedDetectionPanel() {
  const [activeDemo, setActiveDemo] = useState(null);
  const [demoResult, setDemoResult] = useState(null);
  const [running, setRunning] = useState(false);

  const demos = [
    {
      id: 'gps',
      icon: <MapPin size={24} color="#E23744" />,
      label: 'GPS Spoofing Detection',
      desc: 'Detect location mismatch between claimed and actual GPS',
      color: '#E23744',
    },
    {
      id: 'weather',
      icon: <CloudRain size={24} color="#F59E0B" />,
      label: 'Fake Weather Claim',
      desc: 'Cross-reference with historical IMD data',
      color: '#F59E0B',
    },
    {
      id: 'velocity',
      icon: <Zap size={24} color="#7C3AED" />,
      label: 'Velocity Anomaly',
      desc: 'Detect impossibly fast claim filing patterns',
      color: '#7C3AED',
    },
  ];

  const runDemo = async (demo) => {
    setActiveDemo(demo.id);
    setRunning(true);
    setDemoResult(null);

    await new Promise(r => setTimeout(r, 1500));

    let result;
    if (demo.id === 'gps') {
      const gpsResult = detectGpsSpoofing('Bellandur', 19.0760, 72.8777); // Mumbai coords for Bengaluru zone
      const composite = computeAdvancedFraudScore({ gpsResult, weatherResult: null, velocityResult: null, basicResult: null });
      result = { ...composite, primary: gpsResult, type: 'GPS Spoofing' };
    } else if (demo.id === 'weather') {
      const weatherResult = detectFakeWeather('Mumbai', 'Heavy Rainfall', new Date(2026, 2, 15)); // March - dry season
      const composite = computeAdvancedFraudScore({ gpsResult: null, weatherResult, velocityResult: null, basicResult: null });
      result = { ...composite, primary: weatherResult, type: 'Fake Weather' };
    } else if (demo.id === 'velocity') {
      const now = Date.now();
      const velocityResult = detectVelocityAnomaly([now, now - 120000, now - 180000]); // 3 claims in 3 minutes
      const composite = computeAdvancedFraudScore({ gpsResult: null, weatherResult: null, velocityResult, basicResult: null });
      result = { ...composite, primary: velocityResult, type: 'Velocity Anomaly' };
    }

    setDemoResult(result);
    setRunning(false);
  };

  return (
    <div className="glass-card" style={{ padding: 22, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Bot size={22} color={T.text} />
        <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Advanced Fraud Detection</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#7C3AED', background: '#F0EBFF', padding: '3px 8px', borderRadius: 4 }}>AI Engine v2</div>
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 18 }}>
        GPS spoofing, fake weather claims, velocity anomalies — powered by historical data
      </div>

      {/* Demo buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {demos.map(demo => (
          <div key={demo.id} onClick={() => !running && runDemo(demo)} style={{
            flex: 1, padding: '14px 12px', borderRadius: 12, cursor: running ? 'wait' : 'pointer',
            background: activeDemo === demo.id ? `${demo.color}10` : 'rgba(250,250,250,0.6)',
            border: `1.5px solid ${activeDemo === demo.id ? demo.color : T.border}`,
            transition: 'all .2s', textAlign: 'center',
            backdropFilter: 'blur(4px)',
            opacity: running && activeDemo !== demo.id ? 0.5 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{demo.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>{demo.label}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>{demo.desc}</div>
          </div>
        ))}
      </div>

      {/* Running indicator */}
      {running && (
        <div className="fade-up" style={{ padding: '16px', background: '#F8F9FF', borderRadius: 10, border: '1px solid #E0E7FF', textAlign: 'center' }}>
          <div style={{ width: 24, height: 24, border: '3px solid #6366F1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite', margin: '0 auto 10px' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6366F1' }}>AI analyzing claim patterns...</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Cross-referencing GPS, weather, and historical data</div>
        </div>
      )}

      {/* Result */}
      {demoResult && !running && (
        <div className="fade-up" style={{
          padding: 20, borderRadius: 12,
          background: demoResult.compositeScore > 50 ? 'rgba(254,240,241,0.8)' : 'rgba(237,247,234,0.8)',
          border: `1.5px solid ${demoResult.compositeScore > 50 ? '#FBBBBC' : '#B7DFB0'}`,
          backdropFilter: 'blur(4px)',
        }}>
          {/* Score header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: demoResult.compositeScore > 50 ? 'linear-gradient(135deg, #E23744, #C0222E)' : 'linear-gradient(135deg, #60B246, #4A8C38)',
              color: 'white', fontSize: 20, fontWeight: 900,
              boxShadow: `0 4px 16px ${demoResult.compositeScore > 50 ? 'rgba(226,55,68,0.3)' : 'rgba(96,178,70,0.3)'}`,
            }}>
              {demoResult.compositeScore}%
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: demoResult.compositeScore > 50 ? '#E23744' : '#60B246', display: 'flex', alignItems: 'center', gap: 6 }}>
                {demoResult.recommendation === 'BLOCK' ? <><ShieldAlert size={18} /> FRAUD DETECTED</> : demoResult.recommendation === 'REVIEW' ? <><AlertTriangle size={18} /> NEEDS REVIEW</> : <><CheckCircle size={18} /> CLEAN</>}
              </div>
              <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                Composite Score: {demoResult.compositeScore}% · {demoResult.totalSignals} signal{demoResult.totalSignals !== 1 ? 's' : ''} detected
              </div>
              <div style={{
                display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                background: demoResult.recommendation === 'BLOCK' ? '#E23744' : demoResult.recommendation === 'REVIEW' ? '#F59E0B' : '#60B246',
                color: 'white',
              }}>
                Recommendation: {demoResult.recommendation}
              </div>
            </div>
          </div>

          {/* Signals */}
          {demoResult.signals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {demoResult.signals.map((signal, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.6)', borderRadius: 8, border: `1px solid rgba(0,0,0,0.04)`,
                  backdropFilter: 'blur(4px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, flexShrink: 0 }}>{signal.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{signal.type}</div>
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{signal.detail}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: signal.severity === 'high' ? '#E23744' : '#F59E0B' }}>
                    {signal.confidence}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Primary result detail */}
          {demoResult.primary && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.5)', borderRadius: 8, fontSize: 11, color: T.textSec, lineHeight: 1.6, backdropFilter: 'blur(4px)', display: 'flex', gap: 6 }}>
              {demoResult.type === 'GPS Spoofing' && demoResult.primary.isSpoofed && (
                <><MapPin size={14} color={T.textSec} style={{ flexShrink: 0, marginTop: 2 }} /> <div>Claimed zone: <strong>{demoResult.primary.claimedZone}</strong> ({demoResult.primary.claimedCity}) · Actual GPS: {demoResult.primary.actualLat.toFixed(4)}, {demoResult.primary.actualLng.toFixed(4)} · Distance: <strong>{demoResult.primary.distance}km</strong></div></>
              )}
              {demoResult.type === 'Fake Weather' && demoResult.primary.isFake && (
                <>{demoResult.primary.reason}</>
              )}
              {demoResult.type === 'Velocity Anomaly' && demoResult.primary.isAnomaly && (
                <>{demoResult.primary.reason}</>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

      {/* ── NEW: Advanced Detection Panel ── */}
      <AdvancedDetectionPanel />

      {/* Live banner if any live alerts */}
      {liveCount > 0 && (
        <div className="glass-card" style={{
          background: 'rgba(254,240,241,0.8)', border: '1.5px solid #FBBBBC',
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
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="stat-number" style={{ color: T.danger }}>{alerts.length}</div>
          <div className="stat-label">Total Alerts</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="stat-number" style={{ color: T.danger }}>{highCount}</div>
          <div className="stat-label">High Risk</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="stat-number" style={{ color: T.amber }}>{medCount}</div>
          <div className="stat-label">Medium Risk</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
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
            background: filter === level ? 'rgba(255,245,240,0.8)' : 'rgba(255,255,255,0.5)',
            color: filter === level ? T.primary : T.textSec,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            backdropFilter: 'blur(4px)',
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
            <div key={alert.id} className="glass-card" style={{
              padding: 18,
              border: isNew ? '2px solid #E23744' : '1px solid rgba(255,255,255,0.4)',
              boxShadow: isNew ? '0 0 0 4px rgba(226,55,68,0.1)' : undefined,
              transition: 'all .4s',
              animation: isNew ? 'fadeUp .4s ease' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cfg.bg}cc`, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldAlert size={18} color={cfg.color} />
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
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${cfg.bg}cc`, color: cfg.color }}>
                      {alert.fraudLabel}
                    </span>
                  )}
                  <span className="badge" style={{ background: `${cfg.bg}cc`, color: cfg.color }}>{cfg.label}</span>
                </div>
              </div>

              <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, marginBottom: 14, padding: '10px 12px', background: 'rgba(250,250,250,0.5)', borderRadius: 8, backdropFilter: 'blur(4px)' }}>
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><CheckCircle size={32} color={T.textMuted} /></div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No alerts in this category</div>
          </div>
        )}
      </div>
    </div>
  );
}
