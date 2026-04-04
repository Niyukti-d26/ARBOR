import { useState, useRef } from 'react';
import { T } from '../data/constants';

function OTPInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);
  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const nv = [...values]; nv[i] = val.slice(-1); setValues(nv);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (nv.every(v => v !== '')) onComplete?.(nv.join(''));
  };
  const handleKey = (i, e) => { if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus(); };
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {values.map((v, i) => (
        <input key={i} ref={el => refs.current[i] = el} type="text" inputMode="numeric"
          maxLength={1} value={v} onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
            borderRadius: 12, border: `2px solid ${v ? T.blue : T.border}`,
            background: v ? T.blueLight : 'white', color: T.text, outline: 'none',
            fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s',
            boxShadow: v ? `0 0 0 3px ${T.blue}15` : 'none'
          }} />
      ))}
    </div>
  );
}

export default function AdminAuth({ onComplete }) {
  const [step, setStep] = useState('login'); // login → 2fa
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setTimeout(() => {
      // Accept any non-empty credentials
      setLoading(false);
      setStep('2fa');
    }, 1500);
  };

  const handleVerify2FA = (code) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete({
        name: 'Admin User',
        email,
        role: 'admin',
      });
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #1E293B 0%, #334155 100%)`,
        padding: '40px 28px 32px', color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg width="36" height="36" viewBox="0 0 72 72" fill="none">
            <path d="M36 4 L62 16 V36 C62 52 50 64 36 68 C22 64 10 52 10 36 V16 L36 4Z" fill="rgba(255,255,255,.15)" />
            <path d="M26 36 L33 43 L46 28" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontSize: 20, fontWeight: 800 }}>GigShield <span style={{ opacity: 0.6 }}>Admin</span></span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
          {step === 'login' ? 'Admin Login' : 'Two-Factor Authentication'}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
          {step === 'login' ? 'Enter your credentials to access the admin panel' : 'Verify your identity with 2FA code'}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {['Credentials', '2FA Verification'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: (step === 'login' ? 0 : 1) >= i ? 'white' : 'rgba(255,255,255,.3)',
                color: (step === 'login' ? 0 : 1) >= i ? '#1E293B' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700
              }}>{(step === 'login' ? 0 : 1) > i ? '✓' : i + 1}</div>
              <span style={{ fontSize: 12, opacity: (step === 'login' ? 0 : 1) >= i ? 1 : 0.6, fontWeight: 600 }}>{s}</span>
              {i === 0 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,.4)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '24px 24px 40px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {step === 'login' && (
          <div className="card fade-up" style={{ padding: '28px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Secure Admin Access</h2>
              <p style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>Protected by 256-bit encryption</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="admin@gigshield.in" value={email}
                  onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              {error && <p style={{ fontSize: 12, color: T.red, fontWeight: 600 }}>{error}</p>}
              <button className="btn-primary" onClick={handleLogin} disabled={loading || !email || !password}
                style={{ background: `linear-gradient(135deg, #1E293B, #475569)`, boxShadow: '0 4px 14px rgba(30,41,59,.4)' }}>
                {loading ? '⏳ Authenticating...' : 'Login →'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: 16 }}>
              Use any email and password to proceed (demo mode)
            </p>
          </div>
        )}

        {step === '2fa' && (
          <div className="card fade-up" style={{ padding: '28px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Enter 2FA Code</h2>
              <p style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>
                We sent a verification code to <strong>{email}</strong>
              </p>
            </div>
            <div style={{
              padding: '10px 16px', borderRadius: 10, background: T.greenLight,
              border: `1px solid ${T.green}20`, fontSize: 13, color: T.green,
              fontWeight: 600, textAlign: 'center', marginBottom: 20
            }}>
              ✓ Login credentials verified
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 14 }}>Enter 6-digit code</p>
            <OTPInput length={6} onComplete={handleVerify2FA} />
            {loading && (
              <p style={{ fontSize: 12, color: T.blue, fontWeight: 600, textAlign: 'center', marginTop: 12 }}>
                ⏳ Verifying 2FA...
              </p>
            )}
            <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: 16 }}>
              Enter any 6 digits to proceed (demo mode)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
