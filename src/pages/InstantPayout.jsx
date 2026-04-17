import { useState } from 'react';
import { T, PLANS } from '../data/constants';
import { openRazorpay } from '../utils/razorpay';
import { addPayout, addNotification } from '../utils/cropInsuranceState';
import { eventBus, EVENTS } from '../utils/eventBus';
import { Money, Zap, Phone, Activity, CheckCircle, Shield } from '../components/Icons';

const GATEWAYS = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: <Money size={22} />,
    color: '#2563EB',
    bg: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    desc: 'Test Mode — rzp_test_***',
    tag: 'Recommended',
    tagColor: '#3B82F6',
  },
  {
    id: 'stripe',
    name: 'Stripe Sandbox',
    icon: <Zap size={22} />,
    color: '#6366F1',
    bg: 'linear-gradient(135deg, #7C3AED, #6366F1)',
    desc: 'Mock card: 4242 4242 4242 4242',
    tag: 'Sandbox',
    tagColor: '#7C3AED',
  },
  {
    id: 'upi',
    name: 'UPI Instant',
    icon: <Phone size={22} />,
    color: '#059669',
    bg: 'linear-gradient(135deg, #10B981, #059669)',
    desc: 'Simulated UPI payout',
    tag: 'Fastest',
    tagColor: '#059669',
  },
];

const PAYOUT_STEPS = [
  { key: 'init', icon: <Activity size={20} />, label: 'Claim Verified' },
  { key: 'gateway', icon: <Activity size={20} />, label: 'Gateway Connected' },
  { key: 'processing', icon: <Activity size={20} />, label: 'Processing' },
  { key: 'paid', icon: <CheckCircle size={20} />, label: 'Paid!' },
];

function StripeModal({ amount, onSuccess, onCancel }) {
  const [card, setCard] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    onSuccess({ paymentId: `pi_${Date.now().toString(36)}`, gateway: 'stripe' });
  };

  return (
    <div className="payout-modal-overlay" onClick={onCancel}>
      <div className="payout-modal" onClick={e => e.stopPropagation()} style={{ padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Zap size={28} color="#6366F1" /></div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Stripe Sandbox</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Test payment — no real charges</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSec, display: 'block', marginBottom: 6 }}>Card Number</label>
          <input className="input" value={card} onChange={e => setCard(e.target.value)} style={{ fontFamily: 'monospace', letterSpacing: 2 }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textSec, display: 'block', marginBottom: 6 }}>Expiry</label>
            <input className="input" value={expiry} onChange={e => setExpiry(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textSec, display: 'block', marginBottom: 6 }}>CVV</label>
            <input className="input" type="password" value={cvv} onChange={e => setCvv(e.target.value)} />
          </div>
        </div>

        <div style={{ background: '#F0F4FF', borderRadius: 10, padding: 14, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 600, marginBottom: 4 }}>PAYOUT AMOUNT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#6366F1' }}>₹{amount}</div>
        </div>

        <button onClick={handlePay} disabled={processing} style={{
          width: '100%', padding: 14, borderRadius: 10, border: 'none',
          background: processing ? '#A5B4FC' : 'linear-gradient(135deg, #7C3AED, #6366F1)',
          color: 'white', fontSize: 15, fontWeight: 700, cursor: processing ? 'wait' : 'pointer',
          fontFamily: 'Inter, sans-serif', transition: 'all .2s',
        }}>
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
              Processing...
            </span>
          ) : `Pay ₹${amount} via Stripe`}
        </button>
        <button onClick={onCancel} style={{
          width: '100%', padding: 10, marginTop: 8, borderRadius: 8, border: `1px solid ${T.border}`,
          background: 'none', color: T.textSec, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}>Cancel</button>
      </div>
    </div>
  );
}

function UpiModal({ amount, upiId, onSuccess, onCancel }) {
  const [step, setStep] = useState(0);

  const handlePay = async () => {
    setStep(1);
    await new Promise(r => setTimeout(r, 1500));
    setStep(2);
    await new Promise(r => setTimeout(r, 1200));
    setStep(3);
    await new Promise(r => setTimeout(r, 800));
    onSuccess({ paymentId: `upi_${Date.now().toString(36)}`, gateway: 'upi' });
  };

  return (
    <div className="payout-modal-overlay" onClick={onCancel}>
      <div className="payout-modal" onClick={e => e.stopPropagation()} style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Phone size={36} color="#059669" /></div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 4 }}>UPI Instant Payout</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 24 }}>Sending to {upiId}</div>

        {/* QR Code Simulation */}
        <div style={{
          width: 160, height: 160, margin: '0 auto 20px',
          background: 'white', borderRadius: 12, border: `2px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {step === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, width: 120, height: 120 }}>
              {Array.from({ length: 64 }, (_, i) => (
                <div key={i} style={{
                  background: Math.random() > 0.4 ? '#1A1A1A' : 'white',
                  borderRadius: 1,
                }} />
              ))}
            </div>
          )}
          {step >= 1 && step < 3 && (
            <div style={{ width: 48, height: 48, border: '3px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
          )}
          {step >= 3 && (
            <div style={{ animation: 'bounceIn .4s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><CheckCircle size={56} color="#059669" /></div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div style={{ background: '#ECFDF5', borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginBottom: 4 }}>PAYOUT AMOUNT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#059669' }}>₹{amount}</div>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, textAlign: 'left' }}>
          {['Connecting to UPI...', 'Verifying account...', 'Transferring funds...', 'Payment successful!'].map((text, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderRadius: 8, opacity: i <= step ? 1 : 0.3, transition: 'all .4s',
              background: i < step ? '#ECFDF5' : i === step ? '#FFFBEB' : T.bg,
              border: `1px solid ${i < step ? '#A7F3D0' : i === step ? '#FCD34D' : T.border}`,
            }}>
              <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i < step ? <span style={{ fontSize: 12, color: '#059669' }}>✓</span> :
                  i === step ? <div style={{ width: 10, height: 10, border: '2px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /> :
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.border }} />}
              </div>
              <span style={{ fontSize: 12, fontWeight: i <= step ? 600 : 400, color: i <= step ? T.text : T.textMuted }}>{text}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <button onClick={handlePay} style={{
              width: '100%', padding: 14, borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>Send ₹{amount} via UPI</button>
            <button onClick={onCancel} style={{
              width: '100%', padding: 10, marginTop: 8, borderRadius: 8, border: `1px solid ${T.border}`,
              background: 'none', color: T.textSec, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function InstantPayout({ user, onToast, onClose }) {
  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];
  const amount = plan.dailyPayout;
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [payoutStep, setPayoutStep] = useState(-1);
  const [showStripe, setShowStripe] = useState(false);
  const [showUpi, setShowUpi] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleGatewaySelect = (gw) => {
    setSelectedGateway(gw.id);
  };

  const handleInitiatePayout = async () => {
    if (!selectedGateway) return;
    setPayoutStep(0);
    await new Promise(r => setTimeout(r, 800));
    setPayoutStep(1);
    await new Promise(r => setTimeout(r, 600));

    if (selectedGateway === 'razorpay') {
      openRazorpay({
        amount,
        name: 'ARBOR Payout',
        desc: `Disruption payout — ${plan.name} Plan`,
        prefill: { name: user?.name, phone: user?.phone },
        onSuccess: (result) => handlePayoutSuccess({ ...result, gateway: 'razorpay' }),
        onFailure: (err) => { setPayoutStep(-1); onToast('Payment cancelled'); },
      });
    } else if (selectedGateway === 'stripe') {
      setShowStripe(true);
    } else if (selectedGateway === 'upi') {
      setShowUpi(true);
    }
  };

  const handlePayoutSuccess = async (result) => {
    setShowStripe(false);
    setShowUpi(false);
    setPayoutStep(2);
    await new Promise(r => setTimeout(r, 1000));
    setPayoutStep(3);
    setPaymentResult(result);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Push to shared state
    addPayout({ worker: user?.name, amount, trigger: 'Instant Payout', zone: user?.zone });
    addNotification({
      type: 'auto-paid',
      title: `₹${amount} paid to ${user?.name}`,
      detail: `Instant payout via ${result.gateway?.toUpperCase()} · Ref: ${result.paymentId}`,
      worker: user?.name,
      amount,
    });
    eventBus.emit(EVENTS.PAYOUT_COMPLETED, { worker: user?.name, amount });
    onToast(`₹${amount} paid via ${result.gateway?.toUpperCase()}!`);
  };

  const handleReset = () => {
    setSelectedGateway(null);
    setPayoutStep(-1);
    setPaymentResult(null);
    setShowConfetti(false);
  };

  return (
    <div className="page-section fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>Instant Payout</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Simulated payment gateway integration — Razorpay / Stripe / UPI</div>
      </div>

      {/* Amount Card */}
      <div className="glass-hero" style={{ padding: 24, marginBottom: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {showConfetti && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="confetti-piece" />)}
          </div>
        )}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Payout Amount</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: T.text, letterSpacing: -2, animation: 'countUp .6s ease both' }}>₹{amount}</div>
        <div style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>{plan.name} Plan · {user?.name} · {user?.zone}</div>
        <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EDF7EA', borderRadius: 20, padding: '5px 14px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#60B246' }}>Claim Approved — Ready to Pay</span>
        </div>
      </div>

      {/* Gateway Selection */}
      {payoutStep < 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select Payment Gateway</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {GATEWAYS.map(gw => (
              <div
                key={gw.id}
                className={`gateway-card ${selectedGateway === gw.id ? 'selected' : ''}`}
                onClick={() => handleGatewaySelect(gw)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: gw.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>{gw.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{gw.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${gw.tagColor}15`, color: gw.tagColor }}>{gw.tag}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{gw.desc}</div>
                  </div>
                  {selectedGateway === gw.id && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, animation: 'bounceIn .3s ease' }}>✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={handleInitiatePayout}
            disabled={!selectedGateway}
            style={{ fontSize: 16, padding: 16 }}
          >
            {selectedGateway ? `Pay ₹${amount} via ${GATEWAYS.find(g => g.id === selectedGateway)?.name}` : 'Select a gateway above'}
          </button>
        </>
      )}

      {/* Payout Pipeline */}
      {payoutStep >= 0 && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 20 }}>Payout Pipeline</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {PAYOUT_STEPS.map((step, i) => (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    border: `2px solid ${i < payoutStep ? '#60B246' : i === payoutStep ? T.primary : T.border}`,
                    background: i < payoutStep ? '#60B246' : i === payoutStep ? T.primary : 'rgba(255,255,255,0.5)',
                    color: i <= payoutStep ? 'white' : T.textMuted,
                    transition: 'all .4s',
                    animation: i === payoutStep ? 'stepPulse 1.5s infinite' : i === 3 && payoutStep === 3 ? 'paidFlash 1s ease' : 'none',
                    backdropFilter: 'blur(4px)',
                  }}>
                    {i < payoutStep ? '✓' : step.icon}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: i <= payoutStep ? 700 : 500, color: i <= payoutStep ? T.text : T.textMuted, textAlign: 'center' }}>
                    {step.label}
                  </div>
                </div>
                {i < PAYOUT_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < payoutStep ? '#60B246' : T.border, transition: 'background .5s', margin: '0 6px', marginBottom: 22 }} />
                )}
              </div>
            ))}
          </div>

          {/* Success */}
          {payoutStep === 3 && paymentResult && (
            <div className="fade-up" style={{ textAlign: 'center', paddingTop: 20, marginTop: 20, borderTop: `1px solid ${T.border}`, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Zap size={48} color="#60B246" /></div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#60B246', marginBottom: 4 }}>₹{amount} Paid!</div>
              <div style={{ fontSize: 13, color: T.textSec, marginBottom: 8 }}>
                via {paymentResult.gateway?.toUpperCase()} · {user?.upiId || 'ravi@ybl'}
              </div>
              <div style={{ display: 'inline-block', padding: '8px 16px', background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>Transaction ID</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>{paymentResult.paymentId}</div>
              </div>
              <div>
                <button onClick={handleReset} className="btn-outline" style={{ marginTop: 8 }}>New Payout</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stripe Modal */}
      {showStripe && (
        <StripeModal
          amount={amount}
          onSuccess={handlePayoutSuccess}
          onCancel={() => { setShowStripe(false); setPayoutStep(-1); }}
        />
      )}

      {/* UPI Modal */}
      {showUpi && (
        <UpiModal
          amount={amount}
          upiId={user?.upiId || 'ravi.kumar@ybl'}
          onSuccess={handlePayoutSuccess}
          onCancel={() => { setShowUpi(false); setPayoutStep(-1); }}
        />
      )}

      {/* Info */}
      <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, fontSize: 12, color: T.textSec, lineHeight: 1.6 }} className="glass-card">
        <strong>Demo Mode:</strong> Razorpay uses test key <code style={{ fontSize: 11, background: T.bg, padding: '2px 6px', borderRadius: 4 }}>rzp_test_***</code>. 
        Stripe uses sandbox card <code style={{ fontSize: 11, background: T.bg, padding: '2px 6px', borderRadius: 4 }}>4242 4242 4242 4242</code>. 
        UPI is fully simulated. No real money is transferred.
      </div>
    </div>
  );
}
