import { useState, useEffect } from 'react';
import { T, MOCK_CLAIMS, PLANS } from '../data/constants';
import { fraudDetector } from '../utils/fraudDetector';
import { eventBus, EVENTS } from '../utils/eventBus';
import { readState, EVENT_NAME, addPayout, addFraudEvent, addNotification } from '../utils/cropInsuranceState';

// ── 4-Stage progress stepper config ──
const CLAIM_STAGES = [
  { key: 'Detected',     icon: '🔍', label: 'Detected',          color: '#E23744', bg: '#FEF0F1', border: '#FBBBBC' },
  { key: 'AI Verifying', icon: '🤖', label: 'AI Verifying',      color: '#F59E0B', bg: '#FFFBEB', border: '#FCD34D' },
  { key: 'Approved',     icon: '✅', label: 'Approved',           color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  { key: 'Paid',         icon: '💸', label: `Paid to UPI`,        color: '#60B246', bg: '#EDF7EA', border: '#B7DFB0' },
];

const STAGE_INDEX = { Detected: 0, 'AI Verifying': 1, Approved: 2, Paid: 3 };

function LiveStepper({ claim }) {
  const currentIdx = STAGE_INDEX[claim.status] ?? 0;
  const isPaid = claim.status === 'Paid';

  return (
    <div style={{
      background: T.white, border: `1.5px solid ${isPaid ? '#B7DFB0' : T.border}`,
      borderRadius: 12, padding: 16, marginBottom: 12,
      transition: 'border-color .4s',
      boxShadow: isPaid ? '0 0 0 3px rgba(96,178,70,0.1)' : 'none',
    }}>
      {/* Claim meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{claim.event}</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
            {claim.farmer} · {claim.zone} · {new Date(claim.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: isPaid ? '#60B246' : T.primary }}>₹{claim.amount}</div>
          {isPaid && <div style={{ fontSize: 10, color: '#60B246', fontWeight: 700, animation: 'pulse 2s infinite' }}>PAID ✓</div>}
        </div>
      </div>

      {/* 4-stage stepper */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {CLAIM_STAGES.map((stage, i) => {
          const isDone    = i < currentIdx;
          const isActive  = i === currentIdx;
          const isFuture  = i > currentIdx;
          return (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                {/* Circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isActive && stage.key === 'AI Verifying' ? 14 : 18,
                  border: `2px solid ${isDone ? stage.color : isActive ? stage.color : T.border}`,
                  background: isDone ? stage.color : isActive ? stage.bg : '#FAFAFA',
                  color: isDone ? 'white' : isActive ? stage.color : T.textMuted,
                  transition: 'all .4s ease',
                  animation: isActive ? (stage.key === 'Paid' ? 'paidFlash 1s ease' : 'stepPulse 1.5s infinite') : 'none',
                }}>
                  {isDone ? (
                    '✓'
                  ) : isActive && stage.key === 'AI Verifying' ? (
                    <div style={{ width: 16, height: 16, border: `2.5px solid ${stage.color}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  ) : (
                    stage.icon
                  )}
                </div>
                {/* Label */}
                <div style={{
                  fontSize: 9, fontWeight: isActive || isDone ? 700 : 500,
                  color: isDone ? stage.color : isActive ? stage.color : T.textMuted,
                  textAlign: 'center', whiteSpace: 'nowrap',
                  transition: 'color .4s',
                }}>
                  {i === 3 ? `₹${claim.amount} Paid 💸` : stage.label}
                </div>
              </div>
              {/* Connector line */}
              {i < CLAIM_STAGES.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: isDone ? CLAIM_STAGES[i].color : T.border,
                  transition: 'background .5s ease',
                  margin: '0 4px', marginBottom: 18,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const AI_PROCESS_STEPS = [
  'Claim received',
  'AI fraud analysis running...',
  'Cross-referencing GPS location...',
  'Checking claim history...',
  'Computing fraud score...',
];

function AIProcessingSteps({ steps, currentStep }) {
  return (
    <div style={{ marginTop: 12, padding: '12px 14px', background: '#F8F9FF', borderRadius: 8, border: '1px solid #E0E7FF' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', marginBottom: 8, letterSpacing: 0.5 }}>
        🤖 AI FRAUD ANALYSIS
      </div>
      {steps.map((step, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5,
          opacity: i <= currentStep ? 1 : 0.3, transition: 'opacity .4s',
        }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {i < currentStep ? (
              <span style={{ fontSize: 10, color: T.success }}>✓</span>
            ) : i === currentStep ? (
              <div style={{ width: 10, height: 10, border: `2px solid #6366F1`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
            ) : (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.border }} />
            )}
          </div>
          <span style={{ fontSize: 12, color: i <= currentStep ? T.text : T.textMuted }}>{step}</span>
        </div>
      ))}
    </div>
  );
}

export default function Claims({ user, onToast }) {
  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];

  // ── Shared state claims (from cropInsuranceState) ──
  const [liveClaims, setLiveClaims] = useState([]);

  // ── Event-bus trigger state (existing flow) ──
  const [activeTrigger, setActiveTrigger] = useState(null);
  const [claimState, setClaimState] = useState('idle');
  const [pipelineStep, setPipelineStep] = useState(0);
  const [aiStep, setAiStep]   = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fraudDetails, setFraudDetails] = useState(null);

  // ── Listen for cropStateUpdated (shared state) ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      setLiveClaims(Array.isArray(state.claims) ? state.claims : []);
    };
    handler(); // run once on mount
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  // ── Listen for trigger:fired (eventBus, existing flow) ──
  useEffect(() => {
    const handleTrigger = (data) => {
      setActiveTrigger(data);
      setClaimState('idle');
      setPipelineStep(0);
    };
    const handleAdminDecision = (data) => {
      if (data.decision === 'approved') {
        setClaimState('paid');
        setPipelineStep(2);
        setShowConfetti(true);
        onToast(`💸 ₹${plan.dailyPayout} approved by admin — payout sent!`);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setClaimState('fraud-blocked');
        onToast('✗ Claim rejected by admin.');
      }
    };
    eventBus.on(EVENTS.TRIGGER_FIRED, handleTrigger);
    eventBus.on(EVENTS.ADMIN_DECISION_MADE, handleAdminDecision);
    return () => {
      eventBus.off(EVENTS.TRIGGER_FIRED, handleTrigger);
      eventBus.off(EVENTS.ADMIN_DECISION_MADE, handleAdminDecision);
    };
  }, [plan.dailyPayout]);

  const handleClaim = async () => {
    if (claimState !== 'idle') return;
    setClaimState('ai-processing');
    setAiStep(0);
    setPipelineStep(0);

    for (let i = 0; i <= AI_PROCESS_STEPS.length - 1; i++) {
      setAiStep(i);
      await new Promise(r => setTimeout(r, 700));
    }

    const result = fraudDetector({ type: activeTrigger?.type, workerId: user?.phone, zone: user?.zone });

    // ── AI decides 100%: fraud score > 0.7 = blocked, everything else = paid ──
    if (result.fraudScore > 0.7) {
      setClaimState('fraud-blocked');
      setFraudDetails(result);
      onToast('🚨 Claim blocked — fraud detected by AI');

      // Push to shared state → FraudAlerts + Admin
      addFraudEvent({
        worker: user?.name,
        reason: result.reason,
        fraudScore: result.fraudScore,
        fraudLabel: result.fraudLabel,
        zone: user?.zone,
      });
      addNotification({
        type: 'fraud',
        title: `Claim REJECTED — ${user?.name}`,
        detail: `${result.reason} · Payment blocked automatically`,
        worker: user?.name,
        fraudScore: result.fraudScore,
      });
      eventBus.emit(EVENTS.CLAIM_AUTO_REJECTED, {
        worker: user?.name,
        reason: result.reason,
        fraudScore: result.fraudScore,
        fraudLabel: result.fraudLabel,
      });
      eventBus.emit(EVENTS.FRAUD_DETECTED, {
        worker: user?.name,
        reason: result.reason,
        fraudScore: result.fraudScore,
        fraudLabel: result.fraudLabel,
      });
    } else {
      // Auto-approve (covers both clean claims AND edge cases — AI decides)
      setClaimState('approved');
      setPipelineStep(1);
      await new Promise(r => setTimeout(r, 1000));
      setPipelineStep(2);
      setClaimState('paid');
      setShowConfetti(true);
      onToast(`💸 ₹${plan.dailyPayout} auto-approved by AI — sent to UPI!`);
      setTimeout(() => setShowConfetti(false), 3000);

      // Push to shared state → PayoutLedger + Notifications + Admin
      addPayout({
        worker: user?.name,
        amount: plan.dailyPayout,
        trigger: activeTrigger?.label,
        zone: user?.zone,
      });
      addNotification({
        type: 'auto-paid',
        title: `₹${plan.dailyPayout} paid to ${user?.name}`,
        detail: `${activeTrigger?.label} trigger in ${user?.zone} · Auto-approved by AI · fraudScore: ${result.fraudScore?.toFixed(2)}`,
        worker: user?.name,
        amount: plan.dailyPayout,
      });
      eventBus.emit(EVENTS.CLAIM_AUTO_APPROVED, {
        worker: user?.name,
        amount: plan.dailyPayout,
        trigger: activeTrigger?.label,
        zone: user?.zone,
        fraudScore: result.fraudScore,
      });
      eventBus.emit(EVENTS.PAYOUT_COMPLETED, { worker: user?.name, amount: plan.dailyPayout });
    }
  };

  const handleReset = () => {
    setActiveTrigger(null);
    setClaimState('idle');
    setPipelineStep(0);
    setAiStep(-1);
    setFraudDetails(null);
  };

  const ClaimPipeline = ({ currentStep }) => {
    const STEPS = ['Detected', 'Verified', 'Paid'];
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 18,
                border: `2px solid ${i < currentStep ? T.success : i === currentStep ? T.primary : T.border}`,
                background: i < currentStep ? T.success : i === currentStep ? T.primary : '#FAFAFA',
                color: i <= currentStep ? 'white' : T.textMuted,
                animation: i === currentStep ? 'stepPulse 1.5s infinite' : 'none',
                transition: 'all .4s',
              }}>
                {i < currentStep ? '✓' : i === 0 ? '📡' : i === 1 ? '🔍' : '💸'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: i <= currentStep ? T.text : T.textMuted, textAlign: 'center' }}>{step}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentStep ? T.success : T.border, transition: 'background .4s', margin: '0 4px', marginBottom: 20 }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-section fade-up">

      {/* ── Live Claims from shared state (most recent first) ── */}
      {liveClaims.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Live Claims — Real-time
          </div>
          {liveClaims.map(claim => (
            <LiveStepper key={claim.id} claim={claim} />
          ))}
        </div>
      )}

      {/* --- Active Trigger Banner (event bus flow) --- */}
      {activeTrigger && claimState === 'idle' && (
        <div className="fade-up" style={{
          background: 'linear-gradient(135deg, #FFF3CD, #FFF8E7)',
          border: '1.5px solid #F59E0B', borderRadius: 12,
          padding: '14px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>{activeTrigger.icon || '⚡'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Disruption Detected</div>
            <div style={{ fontSize: 12, color: '#78350F' }}>{activeTrigger.label} in your zone · {user?.zone}</div>
          </div>
          <button onClick={handleClaim} style={{
            background: T.primary, color: 'white', border: 'none', borderRadius: 8,
            padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            Claim ₹{plan.dailyPayout}
          </button>
        </div>
      )}

      {/* --- AI Processing --- */}
      {claimState === 'ai-processing' && (
        <div className="fade-up" style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>Processing Claim</div>
          <div style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>{activeTrigger?.label}</div>
          <ClaimPipeline currentStep={pipelineStep} />
          <AIProcessingSteps steps={AI_PROCESS_STEPS} currentStep={aiStep} />
        </div>
      )}

      {/* --- Paid --- */}
      {(claimState === 'approved' || claimState === 'paid') && (
        <div className="fade-up" style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>Active Claim</div>
          <div style={{ fontSize: 12, color: T.textSec, marginBottom: 4 }}>Trigger: {activeTrigger?.label}</div>
          <ClaimPipeline currentStep={pipelineStep} />
          {claimState === 'paid' && (
            <div className="fade-up" style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, textAlign: 'center', position: 'relative' }}>
              {showConfetti && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {[...Array(6)].map((_, i) => <div key={i} className="confetti-piece" />)}
                </div>
              )}
              <div style={{ fontSize: 40, marginBottom: 6 }}>🎉</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: T.success }}>₹{plan.dailyPayout}</div>
              <div style={{ fontSize: 13, color: T.textSec, marginBottom: 4 }}>Auto-approved by AI · sent to UPI</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Razorpay Ref: PAY_{Date.now().toString().slice(-8)}</div>
              <button onClick={handleReset} style={{ marginTop: 12, padding: '7px 16px', borderRadius: 7, border: `1px solid ${T.border}`, background: 'none', color: T.textSec, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Clear</button>
            </div>
          )}
        </div>
      )}

      {/* --- Fraud Blocked --- */}
      {claimState === 'fraud-blocked' && (
        <div className="fade-up" style={{ background: '#FEF0F1', border: '1.5px solid #FBBBBC', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🚨</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#E23744', marginBottom: 4 }}>Claim Blocked</div>
            <div style={{ fontSize: 13, color: '#991B1B', marginBottom: 8 }}>
              {fraudDetails?.reason || 'Our AI detected suspicious activity. Payment blocked for your protection.'}
            </div>
            <div style={{ fontSize: 11, color: '#E23744', padding: '6px 12px', background: '#FFF0F0', borderRadius: 6, display: 'inline-block' }}>
              Fraud Score: {Math.round((fraudDetails?.fraudScore || 0.9) * 100)}% · Admin notified
            </div>
            <button onClick={handleReset} style={{ display: 'block', margin: '14px auto 0', padding: '7px 16px', borderRadius: 7, border: `1px solid ${T.border}`, background: 'none', color: T.textSec, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Dismiss</button>
          </div>
        </div>
      )}

      {/* --- Edge Case --- */}
      {claimState === 'edge-case' && (
        <div className="fade-up" style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>Under Review</div>
            <div style={{ fontSize: 13, color: '#78350F' }}>
              AI confidence was low. An admin has been notified and will review shortly.
            </div>
            <div style={{ fontSize: 11, color: '#B45309', marginTop: 8, padding: '6px 12px', background: '#FEF3C7', borderRadius: 6, display: 'inline-block' }}>
              Usually resolved within 2 minutes
            </div>
          </div>
        </div>
      )}

      {/* --- No active trigger --- */}
      {!activeTrigger && claimState === 'idle' && liveClaims.length === 0 && (
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🛡️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>
            No active disruption detected in your zone
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, maxWidth: 260, margin: '0 auto' }}>
            Your coverage is active and monitoring. You'll be notified the moment a disruption is detected.
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: '#EDF7EA', border: '1px solid #B7DFB0', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>AI monitoring active · {user?.zone}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: T.textMuted }}>
            💡 Go to <strong>Simulator</strong> tab to test a disruption trigger
          </div>
        </div>
      )}

      {/* Coverage at a Glance */}
      <div style={{ background: '#FFF5F0', border: `1px solid #FFD5C2`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.primary }}>₹{plan.cap}</div>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Max Coverage</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.primary }}>₹{plan.dailyPayout}</div>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Per day payout</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.primary }}>{plan.days}</div>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Max days/event</div>
        </div>
      </div>

      {/* Recent Claims — ONLY this worker's claims */}
      <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        My Claims
        {liveClaims.filter(c => c.farmer === user?.name).length > 0 && (
          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#60B246', background: '#EDF7EA', padding: '2px 7px', borderRadius: 4 }}>
            ● {liveClaims.filter(c => c.farmer === user?.name).length} live
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Live simulated claims — only this worker */}
        {liveClaims.filter(c => c.farmer === user?.name).map((claim) => {
          const isPaid    = claim.status === 'Paid';
          const isBlocked = claim.status === 'Fraud Blocked';
          const statusColors = {
            'Detected':     { bg: '#FEF0F1', color: '#E23744' },
            'AI Verifying': { bg: '#FFFBEB', color: '#F59E0B' },
            'Approved':     { bg: '#EFF6FF', color: '#3B82F6' },
            'Paid':         { bg: '#EDF7EA', color: '#60B246' },
          };
          const sc = statusColors[claim.status] || statusColors['Detected'];
          return (
            <div key={claim.id} style={{
              background: T.white, border: `1.5px solid ${isPaid ? '#B7DFB0' : '#F0F0F0'}`,
              borderRadius: 12, padding: 16,
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: isPaid ? '0 0 0 3px rgba(96,178,70,0.08)' : 'none',
              transition: 'all .3s',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {isPaid ? '✅' : isBlocked ? '❌' : '🔍'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                  {claim.event}
                  <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, color: '#60B246', background: '#EDF7EA', padding: '1px 6px', borderRadius: 3 }}>LIVE</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{claim.zone}</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: sc.color }}>₹{claim.amount}</div>
                <div style={{ fontSize: 10, color: sc.color, fontWeight: 700, textAlign: 'right', marginTop: 2 }}>{claim.status}</div>
              </div>
            </div>
          );
        })}
        {/* Seed / historical claims — only for this worker's zone */}
        {MOCK_CLAIMS.filter(c => c.zone === user?.zone || !user?.zone).map((claim) => (
          <div key={claim.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: claim.status === 'paid' ? '#EDF7EA' : '#FEF0F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {claim.status === 'paid' ? '✅' : '❌'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{claim.trigger}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{claim.date} · {claim.zone}</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: claim.status === 'paid' ? T.success : T.danger }}>₹{claim.amount}</div>
              <div style={{ fontSize: 10, color: claim.status === 'paid' ? T.success : T.danger, fontWeight: 600, textAlign: 'right' }}>
                {claim.status === 'paid' ? 'Paid' : 'Rejected'}
              </div>
            </div>
          </div>
        ))}
        {/* Empty state — no claims yet */}
        {liveClaims.filter(c => c.farmer === user?.name).length === 0 &&
          MOCK_CLAIMS.filter(c => c.zone === user?.zone || !user?.zone).length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: T.textMuted, background: T.white, borderRadius: 12, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No claims yet</div>
            <div style={{ fontSize: 12 }}>Trigger a simulation to see your claims here</div>
          </div>
        )}
      </div>

    </div>
  );
}
