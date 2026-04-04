import { useState, useEffect, useRef } from 'react';
import { T, CLAIM_TIMELINE_STEPS } from '../data/constants';
import { PillTag } from '../components/shared';

function UPIAnimation({ amount, onComplete }) {
  const [phase, setPhase] = useState('init');
  useEffect(() => {
    const delays = [
      setTimeout(() => setPhase('sending'), 400),
      setTimeout(() => setPhase('processing'), 1500),
      setTimeout(() => setPhase('success'), 3000),
      setTimeout(() => onComplete && onComplete(), 5000),
    ];
    return () => delays.forEach(clearTimeout);
  }, []);

  return (
    <div className="upi-animation-container fade-up" style={{ textAlign: 'center', padding: '32px 24px' }}>
      {phase === 'init' && (
        <div className="fade-in">
          <div className="upi-logo-pulse" style={{ fontSize: 56, marginBottom: 16 }}>💸</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.textSec }}>Initiating UPI transfer...</p>
        </div>
      )}
      {phase === 'sending' && (
        <div className="fade-up">
          <div style={{ position: 'relative', height: 80, marginBottom: 20 }}>
            <div className="upi-money-flow">
              <div className="money-particle" style={{ animationDelay: '0s' }}>₹</div>
              <div className="money-particle" style={{ animationDelay: '0.2s' }}>₹</div>
              <div className="money-particle" style={{ animationDelay: '0.4s' }}>₹</div>
            </div>
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: T.orange }}>Sending ₹{amount}</p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>via UPI Instant Transfer</p>
          <div className="upi-progress-bar" style={{ marginTop: 16 }}>
            <div className="upi-progress-fill sending" />
          </div>
        </div>
      )}
      {phase === 'processing' && (
        <div className="fade-up">
          <div className="upi-spinner" style={{ marginBottom: 16 }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" fill="none" stroke={T.border} strokeWidth="4" />
              <circle cx="30" cy="30" r="24" fill="none" stroke={T.green} strokeWidth="4"
                strokeDasharray="80 70" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }} />
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: T.green }}>Processing payment...</p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Verifying with bank</p>
        </div>
      )}
      {phase === 'success' && (
        <div className="pop-in">
          <div className="upi-success-check" style={{ marginBottom: 16 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill={T.greenLight} stroke={T.green} strokeWidth="3" />
              <path d="M24 42 L34 52 L56 30" fill="none" stroke={T.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                className="check-draw" />
            </svg>
          </div>
          <div className="confetti-burst" />
          <p style={{ fontSize: 24, fontWeight: 800, color: T.green }}>₹{amount} Received!</p>
          <p style={{ fontSize: 13, color: T.textSec, marginTop: 6 }}>Money sent to your UPI account</p>
          <div style={{
            marginTop: 16, padding: '12px 18px', borderRadius: 10,
            background: T.greenLight, border: `1px solid ${T.green}20`,
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 16 }}>🏦</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>
              Transaction ID: GS-{Date.now().toString().slice(-8)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimTimeline({ currentStep, steps }) {
  return (
    <div className="claim-timeline-v2">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const isPending = i > currentStep;
        const color = isDone ? T.green : isActive ? T.orange : T.border;
        return (
          <div key={step.id} className={`timeline-step ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
            style={{ animationDelay: `${i * 150}ms` }}>
            <div className="timeline-connector" style={{
              background: isDone ? T.green : T.border,
              display: i === 0 ? 'none' : 'block'
            }} />
            <div className="timeline-node" style={{
              background: isDone ? T.greenLight : isActive ? T.orangeLight : T.bg,
              borderColor: color, color
            }}>
              {isDone ? '✓' : step.icon}
            </div>
            <div className="timeline-content">
              <p style={{
                fontWeight: isDone || isActive ? 700 : 500, fontSize: 13,
                color: isPending ? T.textMuted : T.text
              }}>{step.label}</p>
              <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{step.description}</p>
              {isDone && <span style={{ fontSize: 10, color: T.green, fontWeight: 600 }}>✓ Complete</span>}
              {isActive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div className="risk-pulse" style={{ background: T.orange, width: 6, height: 6 }} />
                  <span style={{ fontSize: 10, color: T.orange, fontWeight: 600 }}>In Progress</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Claims({ user, onToast }) {
  const [claimState, setClaimState] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [showUPI, setShowUPI] = useState(false);
  const [expandedClaim, setExpandedClaim] = useState(null);

  const startZeroTouchClaim = () => {
    setClaimState('processing');
    setCurrentStep(0);
    const intervals = [
      setTimeout(() => setCurrentStep(1), 800),
      setTimeout(() => setCurrentStep(2), 1800),
      setTimeout(() => setCurrentStep(3), 2800),
      setTimeout(() => setCurrentStep(4), 3800),
      setTimeout(() => { setCurrentStep(5); setShowUPI(true); }, 4800),
    ];
  };

  const handleUPIComplete = () => {
    setClaimState('completed');
    if (onToast) onToast('🎉 ₹300 payout confirmed! Check your UPI account.');
  };

  const resetClaim = () => {
    setClaimState('idle');
    setCurrentStep(0);
    setShowUPI(false);
  };

  const claimHistory = [
    { id: 'CLM-8291', date: '20 Mar 2026', trigger: 'Monsoon Lock', amount: 300, status: 'paid', steps: 6, duration: '47s', zone: 'Bellandur' },
    { id: 'CLM-8140', date: '18 Mar 2026', trigger: 'Heavy Rain', amount: 300, status: 'paid', steps: 6, duration: '52s', zone: 'Bellandur' },
    { id: 'CLM-7892', date: '15 Mar 2026', trigger: 'Heat Halt', amount: 250, status: 'paid', steps: 6, duration: '38s', zone: 'BTM Layout' },
    { id: 'CLM-7503', date: '10 Mar 2026', trigger: 'Platform Crash', amount: 200, status: 'paid', steps: 6, duration: '61s', zone: 'Koramangala' },
  ];

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Zero-Touch Claims
          </h2>
          <p style={{ fontSize: 13, color: T.textSec }}>
            Automated end-to-end: triggered → verified → paid in under 90 seconds
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PillTag color={T.green}>ZERO-TOUCH</PillTag>
          <PillTag color={T.blue}>AUTO-CLAIM</PillTag>
        </div>
      </div>

      <div className="main-side">
        {/* Left — Active Claim */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Zero Touch Badge */}
          <div className="card" style={{
            padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16,
            background: `linear-gradient(135deg, ${T.greenLight}, ${T.blueLight})`,
            border: `1px solid ${T.green}25`
          }}>
            <div style={{ fontSize: 32 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: T.green }}>ZERO-TOUCH CLAIM ENGINE</p>
              <p style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                No forms · No paperwork · No manual steps — completely automatic
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: T.green, color: 'white'
            }}>ENABLED</div>
          </div>

          {/* Claim Trigger Card */}
          {claimState === 'idle' && (
            <div className="card fade-up" style={{ padding: 24, border: `1px solid ${T.orange}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, fontSize: 26,
                  background: T.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>🌧️</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="risk-pulse" style={{ background: T.red }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: '.05em' }}>DISRUPTION DETECTED</span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>Heavy Rain — {user.zone}</p>
                  <p style={{ fontSize: 12, color: T.textSec }}>{user.city} · Rainfall 62mm/hr</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                {[
                  { label: 'Rainfall', value: '62mm/hr (>50mm threshold)', color: T.red },
                  { label: 'Income Drop', value: '68% (>30% threshold)', color: T.red },
                  { label: 'GPS Status', value: 'In-zone verified ✓', color: T.green },
                  { label: 'Trust Score', value: `${user.trustScore} — HIGH`, color: T.green },
                  { label: 'AI Confidence', value: '94% — Auto-approved', color: T.green },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                    background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13
                  }}>
                    <span style={{ color: T.textMuted }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                textAlign: 'center', padding: 22, background: T.bg, borderRadius: 14,
                border: `1px solid ${T.border}`, marginBottom: 18
              }}>
                <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: '.04em' }}>PAYOUT AMOUNT</p>
                <p style={{ fontSize: 48, fontWeight: 800, color: T.green, lineHeight: 1.1 }}>₹300</p>
                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>30% of daily income · within weekly cap</p>
              </div>

              <button className="btn-primary" onClick={startZeroTouchClaim} style={{
                background: `linear-gradient(135deg, ${T.green}, #00A844)`,
                boxShadow: `0 4px 14px rgba(29,185,84,.35)`, fontSize: 15
              }}>
                ⚡ AUTO-CLAIM — RECEIVE ₹300 VIA UPI
              </button>
            </div>
          )}

          {/* Active Claim Timeline */}
          {(claimState === 'processing' || claimState === 'completed') && (
            <div className="card fade-up" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Claim Progress</h3>
                {claimState === 'completed' && (
                  <button className="btn-ghost" onClick={resetClaim} style={{ padding: '6px 14px', fontSize: 12 }}>
                    ↻ New Claim
                  </button>
                )}
              </div>
              <ClaimTimeline currentStep={currentStep} steps={CLAIM_TIMELINE_STEPS} />
              {showUPI && (
                <UPIAnimation amount={300} onComplete={handleUPIComplete} />
              )}
            </div>
          )}
        </div>

        {/* Right — History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Claims Summary */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Claims Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Claimed', value: '₹3,400', color: T.green },
                { label: 'Claims Count', value: '12', color: T.blue },
                { label: 'Avg Time', value: '49s', color: T.orange },
                { label: 'Success Rate', value: '100%', color: T.green },
              ].map((s, i) => (
                <div key={i} style={{
                  background: T.bg, borderRadius: 10, padding: 14,
                  border: `1px solid ${T.border}`, textAlign: 'center'
                }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* UPI Setup */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>UPI Payment Setup</h3>
            <label className="label">UPI ID</label>
            <input className="input" defaultValue={user.upiId || "ravi.kumar@ybl"} placeholder="yourname@upi" />
            <div style={{
              marginTop: 12, padding: '12px 14px', background: T.greenLight, borderRadius: 10,
              border: `1px solid ${T.green}20`, fontSize: 12, color: T.green, fontWeight: 600
            }}>
              ✅ UPI verified · Payouts typically arrive in &lt;60 seconds
            </div>
          </div>

          {/* Claim History */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Claim History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {claimHistory.map((claim, i) => (
                <div key={i} style={{ borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <div onClick={() => setExpandedClaim(expandedClaim === i ? null : i)}
                    className="payout-item" style={{ cursor: 'pointer', margin: 0, borderRadius: expandedClaim === i ? '10px 10px 0 0' : 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, background: T.greenLight,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                    }}>✅</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{claim.trigger}</p>
                      <p style={{ fontSize: 11, color: T.textMuted }}>{claim.date} · {claim.zone} · {claim.duration}</p>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: T.green }}>+₹{claim.amount}</p>
                  </div>
                  {expandedClaim === i && (
                    <div className="fade-in" style={{ padding: '12px 16px', background: T.bg, borderTop: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {CLAIM_TIMELINE_STEPS.map((step, j) => (
                          <div key={j} style={{
                            display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                            borderRadius: 6, background: T.greenLight, border: `1px solid ${T.green}20`,
                            fontSize: 10, color: T.green, fontWeight: 600
                          }}>
                            <span>{step.icon}</span> {step.label} ✓
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: T.textMuted, marginTop: 8 }}>
                        Claim ID: {claim.id} · All {claim.steps} steps auto-completed
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
