import { useState } from 'react';
import { T, PLANS, getCurrentSeason } from '../data/constants';
import { eventBus, EVENTS } from '../utils/eventBus';
import { readState, writeState, addPayout, addFraudEvent, addNotification } from '../utils/cropInsuranceState';

const TRIGGERS = {
  monsoon: [
    { id: 'rain', icon: '🌧️', label: 'Heavy Rainfall', desc: 'Rainfall exceeds 20mm', available: true },
    { id: 'aqi', icon: '😷', label: 'AQI Emergency', desc: 'Air quality index > 200', available: true },
    { id: 'outage', icon: '📱', label: 'Platform Outage', desc: 'App down for 30+ minutes', available: true },
    { id: 'lockdown', icon: '🚧', label: 'Zone Lockdown', desc: 'Zone restricted by authorities', available: true },
    { id: 'heat', icon: '🌡️', label: 'Extreme Heat', desc: 'Cannot occur during monsoon season', available: false, reason: 'Heavy rain prevents extreme heat conditions during monsoon (Jun–Sep).' },
  ],
  summer: [
    { id: 'heat', icon: '🌡️', label: 'Extreme Heat', desc: 'Temperature exceeds 40°C', available: true },
    { id: 'aqi', icon: '😷', label: 'AQI Emergency', desc: 'Air quality index > 200', available: true },
    { id: 'outage', icon: '📱', label: 'Platform Outage', desc: 'App down for 30+ minutes', available: true },
    { id: 'lockdown', icon: '🚧', label: 'Zone Lockdown', desc: 'Zone restricted by authorities', available: true },
    { id: 'rain', icon: '🌧️', label: 'Heavy Rainfall', desc: 'Not typical in summer months', available: false, reason: 'Heavy rainfall is not a risk during summer (Mar–May). Use Heat triggers instead.' },
  ],
  other: [
    { id: 'aqi', icon: '😷', label: 'AQI Emergency', desc: 'Air quality index > 200', available: true },
    { id: 'outage', icon: '📱', label: 'Platform Outage', desc: 'App down for 30+ minutes', available: true },
    { id: 'lockdown', icon: '🚧', label: 'Zone Lockdown', desc: 'Zone restricted by authorities', available: true },
    { id: 'rain', icon: '🌧️', label: 'Heavy Rainfall', desc: 'Rainfall exceeds 20mm', available: true },
    { id: 'heat', icon: '🌡️', label: 'Extreme Heat', desc: 'Temperature exceeds 40°C', available: true },
  ],
};

const FRAUD_SCENARIOS = [
  {
    id: 'gps_spoofing',
    icon: '🕵️',
    label: 'GPS Spoofing',
    desc: 'Worker location doesn\'t match claimed zone',
    fraudLabel: 'GPS Spoofing',
    reason: 'Worker location (Andheri, Mumbai) does not match claimed zone (Bellandur, Bengaluru). Distance: 1,392 km.',
    fraudScore: 0.92,
  },
  {
    id: 'duplicate',
    icon: '📱',
    label: 'Duplicate Claim',
    desc: 'Same trigger claimed twice in 1 hour',
    fraudLabel: 'Duplicate Claim',
    reason: 'Same trigger (Heavy Rainfall) claimed twice within 47 minutes. Previous claim: CLM-2481.',
    fraudScore: 0.88,
  },
  {
    id: 'coordinated',
    icon: '👥',
    label: 'Coordinated Fraud',
    desc: '10+ workers claim same trigger same minute',
    fraudLabel: 'Coordinated Ring',
    reason: '14 workers in Zone A filed identical claims within 90 seconds. Statistical anomaly: p < 0.001.',
    fraudScore: 0.95,
  },
];

const FRAUD_STEPS = [
  'Claim received',
  'AI fraud analysis running...',
  'Cross-referencing claim patterns...',
  '🚨 Fraud detected — ',
  'Payment blocked automatically',
  'Admin notified',
];

const SEASON_INFO = {
  monsoon: { label: 'Monsoon Season', desc: 'Jun – Sep', icon: '🌧️', color: '#3B82F6', bg: '#EFF6FF' },
  summer: { label: 'Summer Season', desc: 'Mar – May', icon: '☀️', color: '#F59E0B', bg: '#FFFBEB' },
  other: { label: 'Winter / Post-monsoon', desc: 'Oct – Feb', icon: '🌤️', color: '#60B246', bg: '#EDF7EA' },
};

const STEPS = ['Detected', 'Verified', 'Paid'];

export default function SimulationPanel({ user, onToast }) {
  const season = getCurrentSeason();
  const triggers = TRIGGERS[season];
  const seasonInfo = SEASON_INFO[season];
  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];

  const [selected, setSelected] = useState(null);
  const [simulationStep, setSimulationStep] = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [running, setRunning] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  // Fraud demo state
  const [fraudRunning, setFraudRunning] = useState(false);
  const [fraudStep, setFraudStep] = useState(-1);
  const [activeFraud, setActiveFraud] = useState(null);

  const handleSimulate = async () => {
    if (!selected || running) return;
    const trigger = triggers.find(t => t.id === selected);
    setRunning(true);
    setSimulationStep(0);

    // Emit to Claims page via event bus (existing behaviour)
    eventBus.emit(EVENTS.TRIGGER_FIRED, {
      type: trigger.id,
      icon: trigger.icon,
      label: trigger.label,
      zone: user?.zone || 'Zone A',
    });

    // ── Step 1: write Detected to shared state immediately ──
    const existingState = readState();
    const newClaim = {
      id: Date.now(),
      event: trigger.label,
      status: 'Detected',
      amount: plan.dailyPayout,
      farmer: user?.name || 'Ramesh Patil',
      zone: user?.zone || 'Vidarbha',
      timestamp: new Date().toISOString(),
    };
    writeState({
      lastEvent: trigger.label,
      droughtIndex: trigger.id === 'rain' ? 89 : existingState.droughtIndex,
      claims: [newClaim, ...existingState.claims],
    });
    setSimulationStep(0);

    // ── Step 2: AI Verifying after 2s ──
    await new Promise(r => setTimeout(r, 2000));
    setSimulationStep(1);
    const s2 = readState();
    writeState({
      claims: s2.claims.map(c => c.id === newClaim.id ? { ...c, status: 'AI Verifying' } : c),
    });

    // ── Step 3: Approved after 4s ──
    await new Promise(r => setTimeout(r, 2000));
    setSimulationStep(2);
    const s3 = readState();
    writeState({
      claims: s3.claims.map(c => c.id === newClaim.id ? { ...c, status: 'Approved' } : c),
    });

    // ── Step 4: Paid after 6s ──
    await new Promise(r => setTimeout(r, 2000));
    const s4 = readState();
    writeState({
      claims: s4.claims.map(c => c.id === newClaim.id ? { ...c, status: 'Paid' } : c),
      totalClaimsPaid: (s4.totalClaimsPaid || 0) + 1,
      totalAmountPaid: (s4.totalAmountPaid || 0) + newClaim.amount,
    });

    // ── Push to PayoutLedger + Notifications ──
    addPayout({
      worker: newClaim.farmer,
      amount: newClaim.amount,
      trigger: newClaim.event,
      zone: newClaim.zone,
    });
    addNotification({
      type: 'auto-paid',
      title: `₹${newClaim.amount} paid to ${newClaim.farmer}`,
      detail: `${newClaim.event} trigger in ${newClaim.zone} · Auto-approved by AI · fraudScore: 0.08`,
      worker: newClaim.farmer,
      amount: newClaim.amount,
    });
    // Also emit legacy event bus event for backwards compat
    eventBus.emit(EVENTS.CLAIM_AUTO_APPROVED, {
      worker: newClaim.farmer,
      amount: newClaim.amount,
      trigger: newClaim.event,
      zone: newClaim.zone,
      fraudScore: 0.08,
    });

    setShowConfetti(true);
    onToast(`⚡ ₹${newClaim.amount} auto-paid — ${trigger.label} approved!`);
    setRunning(false);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleReset = () => {
    setSelected(null);
    setSimulationStep(-1);
    setShowConfetti(false);
    setRunning(false);
  };

  const handleFraudSimulate = async (scenario) => {
    if (fraudRunning) return;
    setActiveFraud(scenario);
    setFraudRunning(true);
    setFraudStep(0);

    // Steps 0-2: detection phases
    for (let i = 0; i <= 2; i++) {
      setFraudStep(i);
      await new Promise(r => setTimeout(r, 900));
    }

    // Step 3: fraud found
    setFraudStep(3);
    await new Promise(r => setTimeout(r, 1000));

    // Steps 4-5: block + notify
    setFraudStep(4);
    await new Promise(r => setTimeout(r, 800));
    setFraudStep(5);

    // ── Write fraud to shared state → FraudAlerts + AdminDashboard ──
    addFraudEvent({
      worker: user?.name || 'Unknown Worker',
      reason: scenario.reason,
      fraudScore: scenario.fraudScore,
      fraudLabel: scenario.fraudLabel,
      zone: user?.zone || 'Bellandur',
    });
    addNotification({
      type: 'fraud',
      title: `Claim REJECTED — ${user?.name || 'Worker'}`,
      detail: `${scenario.reason} · ${scenario.fraudLabel} detected · Payment blocked`,
      worker: user?.name,
      fraudScore: scenario.fraudScore,
    });

    // Legacy event bus (keeps notifications page in sync too)
    eventBus.emit(EVENTS.FRAUD_DETECTED, {
      worker: user?.name,
      reason: scenario.reason,
      fraudScore: scenario.fraudScore,
      fraudLabel: scenario.fraudLabel,
    });
    eventBus.emit(EVENTS.CLAIM_AUTO_REJECTED, {
      worker: user?.name,
      reason: scenario.reason,
      fraudScore: scenario.fraudScore,
    });

    onToast(`🚨 ${scenario.fraudLabel} detected — Admin FraudAlerts updated instantly!`);
    setFraudRunning(false);
  };

  const handleFraudReset = () => {
    setFraudRunning(false);
    setFraudStep(-1);
    setActiveFraud(null);
  };

  return (
    <div className="page-section fade-up">
      {/* Season Banner */}
      <div style={{ background: seasonInfo.bg, border: `1px solid ${seasonInfo.color}22`, borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>{seasonInfo.icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{seasonInfo.label}</div>
          <div style={{ fontSize: 12, color: T.textSec }}>{seasonInfo.desc} · Some triggers are disabled based on current season</div>
        </div>
      </div>

      {/* ── Normal Trigger Section ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 4 }}>Fire Disruption Trigger</div>
        <div style={{ fontSize: 13, color: T.textSec }}>Select a trigger — Claims page updates instantly via Socket.io</div>
      </div>

      {simulationStep === -1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {triggers.map(trigger => (
            <div key={trigger.id} style={{ position: 'relative' }}>
              <div
                onClick={() => trigger.available && setSelected(trigger.id)}
                onMouseEnter={() => !trigger.available && setTooltip(trigger.id)}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  background: T.white, border: `1.5px solid`,
                  borderColor: selected === trigger.id ? T.primary : T.border,
                  borderRadius: 10, padding: '14px 16px', cursor: trigger.available ? 'pointer' : 'not-allowed',
                  opacity: trigger.available ? 1 : 0.5, transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                <span style={{ fontSize: 24 }}>{trigger.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: trigger.available ? T.text : T.textMuted }}>
                    {trigger.label}
                    {!trigger.available && <span style={{ fontSize: 11, marginLeft: 6, color: T.textMuted }}>⊘ Disabled</span>}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{trigger.desc}</div>
                </div>
                {selected === trigger.id && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11 }}>✓</div>
                )}
              </div>
              {tooltip === trigger.id && !trigger.available && (
                <div style={{
                  position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                  background: T.text, color: 'white', fontSize: 11, fontWeight: 500,
                  padding: '8px 12px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>{trigger.reason}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {simulationStep >= 0 && (
        <div className="fade-up" style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: T.textSec, marginBottom: 4 }}>Simulating trigger for</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>
            {triggers.find(t => t.id === selected)?.icon} {triggers.find(t => t.id === selected)?.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            {STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all .4s',
                    border: `2px solid ${i < simulationStep ? T.success : i === simulationStep ? T.primary : T.border}`,
                    background: i < simulationStep ? T.success : i === simulationStep ? T.primary : '#FAFAFA',
                    color: i <= simulationStep ? 'white' : T.textMuted,
                    animation: i === simulationStep && running ? 'stepPulse 1.5s infinite' : 'none',
                  }}>
                    {i < simulationStep ? '✓' : i === 0 ? '📡' : i === 1 ? '🔍' : '💸'}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: i <= simulationStep ? T.text : T.textMuted }}>{step}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < simulationStep ? T.success : T.border, transition: 'background .6s', margin: '0 4px', marginBottom: 18 }} />
                )}
              </div>
            ))}
          </div>
          {simulationStep === 2 && !running && (
            <div className="fade-up" style={{ textAlign: 'center', paddingTop: 16, borderTop: `1px solid ${T.border}`, position: 'relative' }}>
              {showConfetti && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div className="confetti-piece" /><div className="confetti-piece" />
                  <div className="confetti-piece" /><div className="confetti-piece" />
                  <div className="confetti-piece" /><div className="confetti-piece" />
                </div>
              )}
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>Trigger Fired Successfully</div>
              <div style={{ fontSize: 13, color: T.textSec, marginBottom: 4 }}>Claims page will show disruption banner</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Worker can now claim ₹{plan.dailyPayout}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {simulationStep === -1 ? (
          <button className="btn-primary" onClick={handleSimulate} disabled={!selected || running}>
            {running ? 'Firing trigger...' : selected ? `⚡ Fire ${triggers.find(t => t.id === selected)?.label} Trigger` : 'Select a trigger above'}
          </button>
        ) : (
          <button className="btn-outline" onClick={handleReset} style={{ flex: 1 }}>
            ← Try another trigger
          </button>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: T.border, marginBottom: 24 }} />

      {/* ── Fraud Detection Demo ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 4 }}>🔍 Simulate Fraud</div>
        <div style={{ fontSize: 13, color: T.textSec }}>Watch AI detect and block fraudulent claims in real time</div>
      </div>

      {/* Fraud scenario buttons */}
      {fraudStep === -1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {FRAUD_SCENARIOS.map(scenario => (
            <div key={scenario.id}
              onClick={() => !fraudRunning && handleFraudSimulate(scenario)}
              style={{
                background: '#FFF5F0', border: '1.5px solid #FFD5C2', borderRadius: 10,
                padding: '14px 16px', cursor: fraudRunning ? 'not-allowed' : 'pointer',
                opacity: fraudRunning ? 0.6 : 1, transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{ fontSize: 28 }}>{scenario.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{scenario.label}</div>
                <div style={{ fontSize: 12, color: T.textSec }}>{scenario.desc}</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                background: '#FEF0F1', color: '#E23744', border: '1px solid #FBBBBC',
              }}>Fraud Demo</div>
            </div>
          ))}
        </div>
      )}

      {/* Fraud AI reaction panel */}
      {fraudStep >= 0 && (
        <div className="fade-up" style={{
          background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>{activeFraud?.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Simulating: {activeFraud?.label}</div>
              <div style={{ fontSize: 12, color: T.textSec }}>Real-time AI reaction</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FRAUD_STEPS.map((step, i) => {
              const label = i === 3 ? `🚨 Fraud detected — ${activeFraud?.fraudLabel}` : step;
              const isDone = i < fraudStep;
              const isActive = i === fraudStep;
              const isFuture = i > fraudStep;
              const isBlocked = i === 4;
              const isNotify = i === 5;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  background: isDone
                    ? (isBlocked ? '#FEF0F1' : isNotify ? '#EFF6FF' : i === 3 ? '#FEF0F1' : '#EDF7EA')
                    : isActive ? '#FFFBEB' : T.bg,
                  border: `1px solid ${isDone ? (isBlocked ? '#FBBBBC' : isNotify ? '#BFDBFE' : i === 3 ? '#FBBBBC' : '#B7DFB0') : isActive ? '#FCD34D' : T.border}`,
                  opacity: isFuture ? 0.35 : 1,
                  transition: 'all .4s',
                }}>
                  <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isDone ? (
                      <span style={{ fontSize: 13, color: isBlocked || i === 3 ? '#E23744' : isNotify ? '#3B82F6' : T.success }}>
                        {isBlocked ? '🛑' : isNotify ? '📣' : i === 3 ? '🚨' : '✓'}
                      </span>
                    ) : isActive ? (
                      <div style={{ width: 12, height: 12, border: '2px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.border }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: isDone ? 600 : 500,
                    color: isDone ? (isBlocked || i === 3 ? '#E23744' : isNotify ? '#1D4ED8' : T.text) : isActive ? '#92400E' : T.textMuted,
                  }}>{label}</span>
                </div>
              );
            })}
          </div>

          {fraudStep >= 5 && !fraudRunning && (
            <div className="fade-up" style={{ marginTop: 16, padding: '12px 14px', background: '#FEF0F1', borderRadius: 8, border: '1px solid #FBBBBC', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E23744', marginBottom: 4 }}>
                🚨 Fraud Score: {Math.round(activeFraud?.fraudScore * 100)}% — Payment blocked
              </div>
              <div style={{ fontSize: 12, color: '#991B1B', marginBottom: 10 }}>{activeFraud?.reason}</div>
              <div style={{ fontSize: 11, color: '#E23744', marginBottom: 12 }}>Admin notification sent via Socket.io ✓</div>
              <button onClick={handleFraudReset} style={{
                padding: '7px 16px', borderRadius: 7, border: `1px solid ${T.border}`,
                background: 'none', color: T.textSec, fontSize: 12, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}>Try another fraud scenario</button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: 8, padding: '12px 14px', background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, color: T.textSec, lineHeight: 1.5 }}>
        💡 In real deployment, claims are detected automatically from satellite weather data and platform APIs — workers never need to file claims manually.
      </div>
    </div>
  );
}
