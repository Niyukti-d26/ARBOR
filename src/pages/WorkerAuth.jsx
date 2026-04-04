import { useState, useRef, useEffect } from 'react';
import { T, CITY_ZONES, CITIES } from '../data/constants';

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
            borderRadius: 12, border: `2px solid ${v ? T.orange : T.border}`,
            background: v ? T.orangeLight : 'white', color: T.text, outline: 'none',
            fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s',
            boxShadow: v ? `0 0 0 3px ${T.orange}15` : 'none'
          }} />
      ))}
    </div>
  );
}

export default function WorkerAuth({ onComplete }) {
  const [step, setStep] = useState('phone'); // phone → otp → profile
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '', platforms: [], city: '', zone: '', aadhaarLast4: '', activeHours: 'morning', avgIncome: ''
  });

  const allPlatforms = ['Swiggy', 'Zomato', 'Uber', 'Ola', 'Amazon', 'Flipkart', 'Zepto', 'Blinkit', 'Dunzo', 'Porter'];
  const zones = profile.city ? CITY_ZONES[profile.city] || [] : [];
  const selectedZone = zones.find(z => z.name === profile.zone);

  const sendOTP = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => { setOtpSent(true); setLoading(false); }, 1500);
  };

  const verifyOTP = (code) => {
    setLoading(true);
    setTimeout(() => { setOtpVerified(true); setLoading(false); setStep('profile'); }, 1200);
  };

  const togglePlatform = (p) => {
    setProfile(f => ({
      ...f, platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p]
    }));
  };

  const isProfileValid = profile.name && profile.platforms.length > 0 && profile.city && profile.zone && profile.avgIncome;

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      onComplete({
        ...profile,
        phone: `+91 ${phone}`,
        platform: profile.platforms[0],
        avgIncome: Number(profile.avgIncome),
        plan: 'standard',
        trustScore: 78,
        policyId: `GS-POL-2026-${Math.floor(10000 + Math.random() * 89999)}`,
        policyStart: new Date().toISOString().split('T')[0],
        policyEnd: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        autoRenew: true,
        upiId: `${profile.name.toLowerCase().replace(/\s/g, '.')}@ybl`,
        aadhaar: `XXXX XXXX ${profile.aadhaarLast4 || '0000'}`,
        weeklyCapUsed: 0, earningsProtected: 0, payoutDaysUsed: 0,
      });
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${T.orange} 0%, #FF8C5A 100%)`,
        padding: '40px 28px 32px', color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg width="36" height="36" viewBox="0 0 72 72" fill="none">
            <path d="M36 4 L62 16 V36 C62 52 50 64 36 68 C22 64 10 52 10 36 V16 L36 4Z" fill="rgba(255,255,255,.25)" />
            <path d="M26 36 L33 43 L46 28" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontSize: 20, fontWeight: 800 }}>GigShield</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
          {step === 'phone' ? 'Verify Your Phone' : 'Set Up Your Profile'}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
          {step === 'phone' ? 'Quick OTP verification to secure your account' : 'Tell us about yourself to get the best coverage'}
        </p>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {['Verify Phone', 'Setup Profile'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: (step === 'phone' ? 0 : 1) >= i ? 'white' : 'rgba(255,255,255,.3)',
                color: (step === 'phone' ? 0 : 1) >= i ? T.orange : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700
              }}>{(step === 'phone' ? 0 : 1) > i ? '✓' : i + 1}</div>
              <span style={{ fontSize: 12, opacity: (step === 'phone' ? 0 : 1) >= i ? 1 : 0.6, fontWeight: 600 }}>{s}</span>
              {i === 0 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,.4)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '24px 24px 40px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        {/* Step 1: Phone + OTP */}
        {step === 'phone' && (
          <div className="card fade-up" style={{ padding: '28px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Enter Your Phone Number</h2>
              <p style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>We'll send a 6-digit OTP for verification</p>
            </div>

            {!otpSent ? (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                  <div style={{
                    padding: '12px 14px', borderRadius: 12, background: T.bg,
                    border: `1.5px solid ${T.border}`, fontSize: 14, fontWeight: 600, color: T.textMuted
                  }}>+91</div>
                  <input className="input" type="tel" placeholder="98765 43210" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ flex: 1, fontSize: 18, letterSpacing: 1 }} />
                </div>
                <button className="btn-primary" onClick={sendOTP} disabled={loading || phone.length < 10}>
                  {loading ? '⏳ Sending...' : 'Send OTP →'}
                </button>
              </div>
            ) : !otpVerified ? (
              <div className="fade-up">
                <div style={{
                  padding: '10px 16px', borderRadius: 10, background: T.greenLight,
                  border: `1px solid ${T.green}20`, fontSize: 13, color: T.green,
                  fontWeight: 600, textAlign: 'center', marginBottom: 20
                }}>
                  ✓ OTP sent to +91 {phone}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 14 }}>Enter 6-digit code</p>
                <OTPInput length={6} onComplete={verifyOTP} />
                {loading && (
                  <p style={{ fontSize: 12, color: T.orange, fontWeight: 600, textAlign: 'center', marginTop: 12 }}>
                    ⏳ Verifying...
                  </p>
                )}
                <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: 16 }}>
                  Didn't receive? <span style={{ color: T.orange, cursor: 'pointer', fontWeight: 600 }} onClick={() => { setOtpSent(false); }}>Resend OTP</span>
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Step 2: Profile Setup */}
        {step === 'profile' && (
          <div className="card fade-up" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: T.greenLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>✅</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: T.green }}>Phone Verified</p>
                <p style={{ fontSize: 12, color: T.textMuted }}>+91 {phone}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Ravi Kumar" value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>

              <div>
                <label className="label">Delivery Platforms (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {allPlatforms.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)} style={{
                      padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      background: profile.platforms.includes(p) ? T.orange : T.bg,
                      color: profile.platforms.includes(p) ? 'white' : T.text,
                      border: `2px solid ${profile.platforms.includes(p) ? T.orange : T.border}`,
                      fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .15s'
                    }}>
                      {profile.platforms.includes(p) ? '✓ ' : ''}{p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">City</label>
                <select className="input" value={profile.city}
                  onChange={e => setProfile({ ...profile, city: e.target.value, zone: '' })}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {profile.city && (
                <div className="fade-in">
                  <label className="label">Operating Zone</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: '.04em' }}>🌊 FLOOD-PRONE ZONES</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {zones.filter(z => z.flood).map(z => (
                        <div key={z.name} onClick={() => setProfile({ ...profile, zone: z.name })}
                          style={{
                            padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                            background: profile.zone === z.name ? T.red + '15' : T.bg,
                            border: `2px solid ${profile.zone === z.name ? T.red : T.border}`,
                            fontSize: 12, fontWeight: profile.zone === z.name ? 700 : 500,
                            color: profile.zone === z.name ? T.red : T.text, transition: 'all .15s'
                          }}>🌊 {z.name}</div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: '.04em', marginTop: 6 }}>✅ NORMAL ZONES</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {zones.filter(z => !z.flood).map(z => (
                        <div key={z.name} onClick={() => setProfile({ ...profile, zone: z.name })}
                          style={{
                            padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                            background: profile.zone === z.name ? T.green + '15' : T.bg,
                            border: `2px solid ${profile.zone === z.name ? T.green : T.border}`,
                            fontSize: 12, fontWeight: profile.zone === z.name ? 700 : 500,
                            color: profile.zone === z.name ? T.green : T.text, transition: 'all .15s'
                          }}>📍 {z.name}</div>
                      ))}
                    </div>
                  </div>
                  {selectedZone && (
                    <div className="fade-in" style={{
                      marginTop: 10, background: selectedZone.flood ? '#FFF3E0' : T.greenLight,
                      border: `1px solid ${selectedZone.flood ? '#FFD580' : T.green + '40'}`,
                      borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center',
                      fontSize: 12, color: selectedZone.flood ? '#7A4800' : '#145A28'
                    }}>
                      <span style={{ fontSize: 16 }}>{selectedZone.flood ? '🌊' : '✅'}</span>
                      {selectedZone.flood
                        ? `${profile.zone} is flood-prone — full rain & flood coverage active`
                        : `${profile.zone} is a normal zone — heat, outage & traffic coverage active`}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label">Aadhaar Last 4 Digits</label>
                  <input className="input" placeholder="1234" maxLength={4} value={profile.aadhaarLast4}
                    onChange={e => setProfile({ ...profile, aadhaarLast4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    style={{ letterSpacing: 4, textAlign: 'center' }} />
                </div>
                <div>
                  <label className="label">Active Hours</label>
                  <select className="input" value={profile.activeHours}
                    onChange={e => setProfile({ ...profile, activeHours: e.target.value })}>
                    <option value="morning">🌅 Morning (6am–12pm)</option>
                    <option value="afternoon">☀️ Afternoon (12–6pm)</option>
                    <option value="night">🌙 Night (6pm–12am)</option>
                    <option value="all">🔄 All Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Avg Daily Income (₹)</label>
                <input className="input" type="number" placeholder="e.g. 950" value={profile.avgIncome}
                  onChange={e => setProfile({ ...profile, avgIncome: e.target.value })} />
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={!isProfileValid || loading}>
                {loading ? '⏳ Setting up your shield...' : 'Activate GigShield 🛡'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
