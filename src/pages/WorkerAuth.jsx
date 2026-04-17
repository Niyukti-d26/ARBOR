import { useState, useRef } from 'react';
import { T, CITY_ZONES, CITIES } from '../data/constants';
import { Shield } from '../components/Icons';

const PLATFORMS = ['Swiggy', 'Zomato', 'Uber', 'Ola', 'Zepto', 'Blinkit', 'Others'];
const ACTIVE_HOURS = [
  { id: 'morning', label: 'Morning', desc: '6AM – 12PM' },
  { id: 'afternoon', label: 'Afternoon', desc: '12PM – 6PM' },
  { id: 'night', label: 'Night', desc: '6PM – 12AM' },
  { id: 'all', label: 'All Day', desc: 'Full Availability' },
];

// Mock worker DB
const MOCK_WORKERS = {
  '9876543210': { aadhaarLast4: '4321', name: 'Ravi Kumar' },
  '9000000001': { aadhaarLast4: '1111', name: 'Priya Sharma' },
};

export default function WorkerAuth({ onComplete }) {
  const [step, setStep] = useState(1); // 1=verify, 2=otp, 3=profile
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sentOtp, setSentOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '', platforms: [], city: 'Mumbai', zone: '', activeHours: 'all',
  });
  const otpRefs = useRef([]);

  const handleSendOtp = async () => {
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { setError('Enter a valid 10-digit phone number'); return; }
    if (aadhaar.length !== 4) { setError('Enter last 4 digits of Aadhaar'); return; }

    const worker = MOCK_WORKERS[digits];
    if (!worker || worker.aadhaarLast4 !== aadhaar) {
      setError('Phone and Aadhaar details do not match. Please try again.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const generatedOtp = '123456'; // Mock OTP for demo
    setSentOtp(generatedOtp);
    console.log('[ARBOR OTP]', generatedOtp);
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

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (entered !== sentOtp) { setError('Incorrect OTP. Try again.'); setLoading(false); return; }
    setLoading(false);
    // Pre-fill name from mock
    const digits = phone.replace(/\D/g, '');
    const workerName = MOCK_WORKERS[digits]?.name || '';
    setProfile(p => ({ ...p, name: workerName }));
    setStep(3);
  };

  const handleProfileSubmit = () => {
    if (!profile.name.trim()) { setError('Enter your name'); return; }
    if (profile.platforms.length === 0) { setError('Select at least one platform'); return; }
    if (!profile.zone) { setError('Select your zone'); return; }
    const digits = phone.replace(/\D/g, '');
    onComplete({
      name: profile.name,
      phone: `+91 ${digits}`,
      platforms: profile.platforms,
      city: profile.city,
      zone: profile.zone,
      activeHours: profile.activeHours,
    });
  };

  const togglePlatform = (p) => {
    setProfile(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const handleQuickDemo = () => {
    onComplete({
      name: 'Ravi Kumar',
      phone: '+91 9876543210',
      platforms: ['Swiggy', 'Zomato'],
      city: 'Bengaluru',
      zone: 'Bellandur',
      activeHours: 'all',
    });
  };

  const zones = CITY_ZONES[profile.city] || [];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Quick Demo Banner */}
      <div style={{
        width: '100%', maxWidth: 420, marginBottom: 16,
        background: 'linear-gradient(135deg, #1A1A1A, #2D1A0A)',
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>Hackathon Demo Mode</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Skip the OTP flow instantly</div>
        </div>
        <button onClick={handleQuickDemo} style={{
          background: T.primary, color: 'white', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}>Quick Login →</button>
      </div>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Shield size={40} color={T.text} /></div>
        <div style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: 4 }}>ARBOR</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>shelter and stability</div>
      </div>

      <div style={{ width: '100%', maxWidth: 420, background: T.white, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: T.border }}>
          <div style={{ height: '100%', background: T.primary, width: step === 1 ? '33%' : step === 2 ? '66%' : '100%', transition: 'width .4s ease' }} />
        </div>

        <div style={{ padding: 28 }}>
          {/* Step 1 — Verification */}
          {step === 1 && (
            <div className="fade-up">
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Verify your identity</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>We'll check your details before sending an OTP</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: T.textSec, fontSize: 14 }}>+91</span>
                  <input className="input" style={{ paddingLeft: 44 }} type="tel" placeholder="9876543210" maxLength={10}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Last 4 digits of Aadhaar</label>
                <input className="input" type="tel" placeholder="XXXX" maxLength={4}
                  value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </div>
              {error && <div style={{ color: T.danger, fontSize: 12, fontWeight: 500, marginBottom: 14, padding: '8px 12px', background: T.dangerLight, borderRadius: 6 }}>{error}</div>}
              <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>
                {loading ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> : ''}
                {loading ? 'Verifying...' : 'Send OTP'}
              </button>
              <div style={{ marginTop: 16, padding: '12px', background: '#FFF5F0', borderRadius: 8, fontSize: 11, color: T.textSec, lineHeight: 1.5 }}>
                <strong>Demo:</strong> Use phone <strong>9876543210</strong> and Aadhaar <strong>4321</strong><br/>
                Or: <strong>9000000001</strong> / <strong>1111</strong>
              </div>
            </div>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <div className="fade-up">
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Enter OTP</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>A 6-digit OTP has been sent to your mobile</div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                {otp.map((digit, i) => (
                  <input key={i} className="otp-input" type="tel" maxLength={1} value={digit}
                    ref={el => otpRefs.current[i] = el}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 16, padding: '8px 12px', background: '#FFF5F0', borderRadius: 8, border: '1px dashed #FF5200' }}>
                <span style={{ fontSize: 12, color: T.textSec }}>Demo OTP: </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.primary, letterSpacing: 2 }}>123456</span>
              </div>
              {error && <div style={{ color: T.danger, fontSize: 12, fontWeight: 500, marginBottom: 14, padding: '8px 12px', background: T.dangerLight, borderRadius: 6 }}>{error}</div>}
              <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                style={{ display: 'block', width: '100%', marginTop: 12, padding: '10px', background: 'none', border: 'none', color: T.textSec, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                ← Change number
              </button>
            </div>
          )}

          {/* Step 3 — Profile */}
          {step === 3 && (
            <div className="fade-up">
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Your profile</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>Help us personalise your coverage</div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label">Your name</label>
                <input className="input" type="text" placeholder="Full name"
                  value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label">Work platforms</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PLATFORMS.map(p => (
                    <div key={p} onClick={() => togglePlatform(p)} style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all .15s', border: '1.5px solid',
                      borderColor: profile.platforms.includes(p) ? T.primary : T.border,
                      background: profile.platforms.includes(p) ? '#FFF5F0' : T.white,
                      color: profile.platforms.includes(p) ? T.primary : T.textSec,
                    }}>{p}</div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label">City</label>
                <select className="input" value={profile.city}
                  onChange={e => setProfile(p => ({ ...p, city: e.target.value, zone: '' }))}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label">Your zone</label>
                <select className="input" value={profile.zone}
                  onChange={e => setProfile(p => ({ ...p, zone: e.target.value }))}>
                  <option value="">Select zone</option>
                  {zones.map(z => <option key={z.name} value={z.name}>{z.name}{z.flood ? ' (Risk)' : ''}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="label">Active hours</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ACTIVE_HOURS.map(h => (
                    <div key={h.id} onClick={() => setProfile(p => ({ ...p, activeHours: h.id }))} style={{
                      padding: '10px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                      border: '1.5px solid', borderColor: profile.activeHours === h.id ? T.primary : T.border,
                      background: profile.activeHours === h.id ? '#FFF5F0' : T.white,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: profile.activeHours === h.id ? T.primary : T.text }}>{h.label}</div>
                      <div style={{ fontSize: 10, color: T.textMuted }}>{h.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div style={{ color: T.danger, fontSize: 12, fontWeight: 500, marginBottom: 14, padding: '8px 12px', background: T.dangerLight, borderRadius: 6 }}>{error}</div>}
              <button className="btn-primary" onClick={handleProfileSubmit}>
                Start protecting my income →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
