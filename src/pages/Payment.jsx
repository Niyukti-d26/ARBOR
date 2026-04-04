import { useState } from 'react';
import { T, PLANS, PAYMENT_HISTORY } from '../data/constants';
import { PillTag, Spinner } from '../components/shared';

export default function Payment({ user, onToast }) {
  const [payState, setPayState] = useState('idle');
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[1];

  const initiatePayment = () => {
    setPayState('processing');
    // Simulate Razorpay checkout
    setTimeout(() => setPayState('rzp_open'), 800);
    setTimeout(() => setPayState('rzp_auth'), 2500);
    setTimeout(() => {
      setPayState('success');
      if (onToast) onToast('✅ Payment of ₹' + plan.price + ' successful!');
    }, 4500);
  };

  const statusColors = { success: T.green, failed: T.red, pending: T.amber };

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Payments & Billing
          </h2>
          <p style={{ fontSize: 13, color: T.textSec }}>Manage premium payments, auto-pay, and transaction history</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PillTag color={T.green}>RAZORPAY SECURE</PillTag>
          <PillTag color={T.blue}>PCI-DSS</PillTag>
        </div>
      </div>

      <div className="main-side">
        {/* Left — Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Current Due */}
          <div className="card fade-up" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              background: `linear-gradient(135deg, ${plan.color}, ${plan.color}CC)`,
              padding: '24px 28px', color: 'white', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: '.06em', marginBottom: 4 }}>PREMIUM DUE</p>
                  <p style={{ fontSize: 36, fontWeight: 800 }}>₹{plan.price}</p>
                  <p style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{plan.name} Plan · Weekly payment</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 42 }}>💳</div>
                  <p style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>Next: 27 Mar</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 28px' }}>
              {payState === 'idle' && (
                <button className="btn-primary" onClick={initiatePayment} style={{
                  background: `linear-gradient(135deg, #528FF0, #2962FF)`,
                  boxShadow: '0 4px 14px rgba(41,98,255,.35)', fontSize: 15
                }}>
                  💳 Pay ₹{plan.price} via Razorpay
                </button>
              )}
              {payState === 'processing' && (
                <div className="fade-up" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: 16, background: T.blueLight, borderRadius: 12
                }}>
                  <Spinner color={T.blue} size={16} />
                  <span style={{ color: T.blue, fontWeight: 600, fontSize: 14 }}>Initializing Razorpay...</span>
                </div>
              )}
              {payState === 'rzp_open' && (
                <div className="fade-up" style={{
                  padding: 20, borderRadius: 14, border: `2px solid ${T.blue}`,
                  background: T.blueLight
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, background: '#528FF0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, color: 'white', fontWeight: 800
                    }}>R</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>Razorpay Checkout</p>
                      <p style={{ fontSize: 12, color: T.textMuted }}>Secure payment gateway</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Merchant', value: 'GigShield Insurance' },
                      { label: 'Amount', value: `₹${plan.price}.00` },
                      { label: 'Plan', value: plan.name + ' Weekly' },
                      { label: 'Method', value: 'UPI / Card / NetBanking' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                        background: 'white', borderRadius: 8, fontSize: 12
                      }}>
                        <span style={{ color: T.textMuted }}>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px', borderRadius: 10, background: T.amberLight, border: `1px solid ${T.amber}30`
                  }}>
                    <Spinner color={T.amber} size={14} />
                    <span style={{ fontSize: 12, color: T.amber, fontWeight: 600 }}>Waiting for UPI authorization...</span>
                  </div>
                </div>
              )}
              {payState === 'rzp_auth' && (
                <div className="fade-up" style={{
                  padding: 20, borderRadius: 14, border: `2px solid ${T.green}`,
                  background: T.greenLight, textAlign: 'center'
                }}>
                  <Spinner color={T.green} size={20} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.green, marginTop: 12 }}>Processing payment...</p>
                  <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Verifying with your bank</p>
                </div>
              )}
              {payState === 'success' && (
                <div className="pop-in" style={{
                  padding: 24, borderRadius: 14, border: `2px solid ${T.green}`,
                  background: T.greenLight, textAlign: 'center'
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="27" fill="white" stroke={T.green} strokeWidth="3" />
                      <path d="M18 32 L26 40 L42 24" fill="none" stroke={T.green} strokeWidth="3.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: T.green }}>Payment Successful!</p>
                  <p style={{ fontSize: 13, color: T.textSec, marginTop: 6 }}>₹{plan.price} paid for {plan.name} Plan</p>
                  <div style={{
                    marginTop: 14, padding: '10px 16px', borderRadius: 10,
                    background: 'white', display: 'inline-flex', alignItems: 'center', gap: 8,
                    border: `1px solid ${T.border}`
                  }}>
                    <span style={{ fontSize: 14 }}>🏦</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
                      Txn ID: RZP-{Date.now().toString().slice(-8)}
                    </span>
                  </div>
                  <button className="btn-ghost" onClick={() => setPayState('idle')}
                    style={{ marginTop: 14, width: '100%' }}>Done</button>
                </div>
              )}
            </div>
          </div>

          {/* Auto-Pay Setup */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>UPI AutoPay</h3>
                <p style={{ fontSize: 12, color: T.textMuted }}>Automatic weekly premium collection</p>
              </div>
              <div onClick={() => setAutoPayEnabled(!autoPayEnabled)}
                style={{
                  width: 50, height: 28, borderRadius: 14, padding: 3, cursor: 'pointer',
                  background: autoPayEnabled ? T.green : T.border, transition: 'background .3s'
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,.15)',
                  transform: autoPayEnabled ? 'translateX(22px)' : 'translateX(0)',
                  transition: 'transform .3s'
                }} />
              </div>
            </div>
            {autoPayEnabled ? (
              <div style={{
                padding: '14px 16px', borderRadius: 12, background: T.greenLight,
                border: `1px solid ${T.green}20`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>AutoPay Active</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  {[
                    { label: 'UPI ID', value: user.upiId || 'ravi.kumar@ybl' },
                    { label: 'Amount', value: `₹${plan.price}/week` },
                    { label: 'Next Debit', value: '27 Mar 2026' },
                    { label: 'Mandate', value: 'GS-MND-' + (user.policyId || '').slice(-5) },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: T.textMuted }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: T.text }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '14px 16px', borderRadius: 12, background: T.amberLight,
                border: `1px solid ${T.amber}20`, fontSize: 12, color: T.amber
              }}>
                ⚠️ AutoPay is disabled. You'll need to pay manually each week to keep your coverage active.
              </div>
            )}
          </div>
        </div>

        {/* Right — History & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Payment Stats */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Payment Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Paid', value: '₹540', color: T.green },
                { label: 'Payments', value: '7', color: T.blue },
                { label: 'Success Rate', value: '85.7%', color: T.green },
                { label: 'Streak', value: '4 wks', color: T.orange },
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

          {/* Transaction History */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Transaction History</h3>
              <PillTag color={T.orange}>{PAYMENT_HISTORY.length} records</PillTag>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PAYMENT_HISTORY.map((pay, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: (statusColors[pay.status] || T.textMuted) + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0
                  }}>{pay.status === 'success' ? '✅' : '❌'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>₹{pay.amount} · {pay.plan}</p>
                    <p style={{ fontSize: 11, color: T.textMuted }}>{pay.date} · {pay.method}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <PillTag color={statusColors[pay.status] || T.textMuted}>
                      {pay.status.toUpperCase()}
                    </PillTag>
                    <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{pay.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Payment Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔒', label: 'SSL/TLS Encryption', desc: 'All data encrypted in transit' },
                { icon: '🏦', label: 'Razorpay Secure', desc: 'PCI-DSS Level 1 certified gateway' },
                { icon: '🛡️', label: 'RBI Compliant', desc: 'Full regulatory compliance' },
                { icon: '📱', label: 'UPI Tokenization', desc: 'Card/UPI data never stored' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: T.textMuted }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
