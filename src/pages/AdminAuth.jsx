import { useState, useRef } from 'react';
import { T } from '../data/constants';
import { Shield } from '../components/Icons';

const MOCK_ADMINS = {
  'admin@arbor.com': { password: 'admin123', name: 'Arun Mehta' },
  'ops@arbor.com':   { password: 'ops123',   name: 'Divya Reddy' },
};

export default function AdminAuth({ onComplete }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sentOtp, setSentOtp] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const otpRefs = useRef([]);

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) { setError('Enter your email'); return; }
    if (!password.trim()) { setError('Enter your password'); return; }
    const admin = MOCK_ADMINS[email.toLowerCase()];
    if (!admin || admin.password !== password) {
      setError('Incorrect email or password'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const generatedOtp = '654321'; // Mock 2FA OTP for demo
    setSentOtp(generatedOtp);
    setAdminData({ name: admin.name, email });
    console.log('[ARBOR Admin 2FA OTP]', generatedOtp);
    setLoading(false);
    setStep(2);
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify2FA = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (entered !== sentOtp) { setError('Invalid 2FA code. Check console.'); setLoading(false); return; }
    setLoading(false);
    onComplete(adminData);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Quick Demo Banner */}
      <div style={{
        width: '100%', maxWidth: 400, marginBottom: 16,
        background: 'linear-gradient(135deg, #1A1A1A, #0A1A2D)',
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>Hackathon Demo Mode</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Instant admin access — skip 2FA</div>
        </div>
        <button onClick={() => onComplete({ name: 'Arun Mehta', email: 'admin@arbor.com' })} style={{
          background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}>Admin Access →</button>
      </div>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Shield size={40} color={T.text} /></div>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.text }}>
          ARBOR
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Admin Console</div>
      </div>

      <div style={{ width: '100%', maxWidth: 400, background: T.white, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ height: 3, background: T.border }}>
          <div style={{ height: '100%', background: T.primary, width: step === 1 ? '50%' : '100%', transition: 'width .4s ease' }} />
        </div>
        <div style={{ padding: 28 }}>
          {step === 1 && (
            <div className="fade-up">
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Admin Login</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>Enter your credentials to continue</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="label">Email address</label>
                <input className="input" type="email" placeholder="admin@arbor.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowPass(s => !s)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: T.textSec,
                  }}>{showPass ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              {error && <div style={{ color: T.danger, fontSize: 12, fontWeight: 500, marginBottom: 14, padding: '8px 12px', background: T.dangerLight, borderRadius: 6 }}>{error}</div>}
              <button className="btn-primary" onClick={handleLogin} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <div style={{ marginTop: 14, padding: 12, background: '#FFF5F0', borderRadius: 8, fontSize: 11, color: T.textSec, lineHeight: 1.6 }}>
                <strong>Demo:</strong> <strong>admin@arbor.com</strong> / <strong>admin123</strong>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up">
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Two-Factor Auth</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>Enter your 6-digit 2FA verification code</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Shield size={32} color={T.text} /></div>
                <div style={{ fontSize: 13, color: T.textSec }}>Code sent to <strong>{email}</strong></div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                {otp.map((digit, i) => (
                  <input key={i} className="otp-input" type="tel" maxLength={1} value={digit}
                    ref={el => otpRefs.current[i] = el}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => e.key === 'Backspace' && !otp[i] && i > 0 && otpRefs.current[i-1]?.focus()} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 16, padding: '8px 12px', background: '#EFF6FF', borderRadius: 8, border: '1px dashed #3B82F6' }}>
                <span style={{ fontSize: 12, color: T.textSec }}>Demo 2FA OTP: </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#3B82F6', letterSpacing: 2 }}>654321</span>
              </div>
              {error && <div style={{ color: T.danger, fontSize: 12, fontWeight: 500, marginBottom: 14, padding: '8px 12px', background: T.dangerLight, borderRadius: 6 }}>{error}</div>}
              <button className="btn-primary" onClick={handleVerify2FA} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Enter Console'}
              </button>
              <button onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                style={{ display: 'block', width: '100%', marginTop: 12, padding: '10px', background: 'none', border: 'none', color: T.textSec, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ← Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
