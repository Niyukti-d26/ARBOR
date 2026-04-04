import { useState } from 'react';
import { T, PLANS, PAYMENT_HISTORY } from '../data/constants';

export default function PremiumPayment({ user, onToast }) {
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[1];
  const [autoRenew, setAutoRenew] = useState(user.autoRenew ?? true);
  const [payPhase, setPayPhase] = useState(null); // null → processing → success

  const handlePay = () => {
    setPayPhase('processing');
    setTimeout(() => {
      setPayPhase('success');
      onToast?.(`✅ ₹${plan.price} paid successfully via UPI`);
      setTimeout(() => setPayPhase(null), 4000);
    }, 2500);
  };

  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Premium Payment</h2>

      <div className="main-side">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Payment Card */}
          <div className="card" style={{
            padding: 0, overflow: 'hidden',
            background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`
          }}>
            <div style={{ padding: '24px 28px', color: 'white' }}>
              <p style={{ fontSize: 11, opacity: 0.8, fontWeight: 700, letterSpacing: 1 }}>AMOUNT DUE</p>
              <p style={{ fontSize: 42, fontWeight: 800, margin: '8px 0' }}>₹{plan.price}</p>
              <p style={{ fontSize: 13, opacity: 0.8 }}>{plan.name} Plan · Weekly Premium</p>
              <p style={{ fontSize: 11, opacity: 0.6, marginTop: 8 }}>
                Next due: {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {payPhase === 'processing' ? (
            <div className="card pop-in" style={{ padding: 30, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏦</div>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Processing Payment...</p>
              <div className="upi-progress-bar" style={{ maxWidth: 280, margin: '0 auto' }}>
                <div className="upi-progress-fill sending" />
              </div>
              <p style={{ fontSize: 12, color: T.textMuted, marginTop: 10 }}>Connecting to UPI gateway</p>
            </div>
          ) : payPhase === 'success' ? (
            <div className="card pop-in" style={{ padding: 30, textAlign: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 60 60" style={{ marginBottom: 12 }}>
                <circle cx="30" cy="30" r="27" fill={T.greenLight} stroke={T.green} strokeWidth="3" />
                <path d="M18 32 L26 40 L42 24" fill="none" stroke={T.green} strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 20, fontWeight: 800, color: T.green }}>Payment Successful!</p>
              <p style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>₹{plan.price} · UPI Instant · Txn ID: RZP{Date.now().toString().slice(-8)}</p>
            </div>
          ) : (
            <button className="btn-primary" onClick={handlePay} style={{ padding: '16px 24px', fontSize: 16 }}>
              Pay ₹{plan.price} via UPI →
            </button>
          )}

          {/* Auto-Renew */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Auto-Renewal</h3>
                <p style={{ fontSize: 12, color: T.textSec }}>UPI AutoPay mandate · Weekly debit</p>
              </div>
              <div onClick={() => { setAutoRenew(!autoRenew); onToast?.(`Auto-renew ${!autoRenew ? 'enabled' : 'disabled'}`); }}
                style={{
                  width: 48, height: 26, borderRadius: 13, cursor: 'pointer', padding: 2,
                  background: autoRenew ? T.green : T.border, transition: 'all .3s'
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,.15)',
                  transform: `translateX(${autoRenew ? 22 : 0}px)`, transition: 'transform .3s'
                }} />
              </div>
            </div>
            {autoRenew && (
              <div style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 10,
                background: T.greenLight, border: `1px solid ${T.green}20`,
                fontSize: 11, color: T.green, fontWeight: 600
              }}>
                ✅ Auto-pay active · ₹{plan.price}/week from {user.upiId || 'user@ybl'}
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="card" style={{ padding: 20, alignSelf: 'flex-start' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📋 Payment History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PAYMENT_HISTORY.slice(0, 8).map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: p.status === 'success' ? T.green : T.red, flexShrink: 0
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>₹{p.amount}</p>
                  <p style={{ fontSize: 10, color: T.textMuted }}>{p.date}</p>
                </div>
                <span style={{ fontSize: 10, color: p.status === 'success' ? T.green : T.red, fontWeight: 600 }}>
                  {p.method}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
