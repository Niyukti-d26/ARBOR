import { useState, useEffect, useRef } from 'react';
import { T, CITY_ZONES, CITIES, PLANS } from '../data/constants';
import { Spinner } from '../components/shared';

function OTPInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newVals = [...values];
    newVals[i] = val.slice(-1);
    setValues(newVals);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (newVals.every(v => v !== '')) onComplete?.(newVals.join(''));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {values.map((v, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={v}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="otp-input"
          style={{
            width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
            borderRadius: 12, border: `2px solid ${v ? T.orange : T.border}`,
            background: v ? T.orangeLight : 'white', color: T.text, outline: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all .2s', boxShadow: v ? `0 0 0 3px ${T.orange}15` : 'none'
          }}
        />
      ))}
    </div>
  );
}

function ZonePicker({ city, zones, selected, onSelect }) {
  if (!zones.length) return null;
  const floodZones = zones.filter(z => z.flood);
  const normalZones = zones.filter(z => !z.flood);

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 8, letterSpacing: '.04em' }}>🌊 FLOOD-PRONE ZONES</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
        {floodZones.map(z => (
          <div key={z.name} onClick={() => onSelect(z.name)}
            style={{
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
              background: selected === z.name ? T.red + '15' : T.bg,
              border: `2px solid ${selected === z.name ? T.red : T.border}`,
              fontSize: 12, fontWeight: selected === z.name ? 700 : 500,
              color: selected === z.name ? T.red : T.text,
              transition: 'all .15s'
            }}>
            <span style={{ fontSize: 14 }}>🌊</span>
            <p style={{ marginTop: 2 }}>{z.name}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 8, letterSpacing: '.04em' }}>✅ NORMAL ZONES</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {normalZones.map(z => (
          <div key={z.name} onClick={() => onSelect(z.name)}
            style={{
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
              background: selected === z.name ? T.green + '15' : T.bg,
              border: `2px solid ${selected === z.name ? T.green : T.border}`,
              fontSize: 12, fontWeight: selected === z.name ? 700 : 500,
              color: selected === z.name ? T.green : T.text,
              transition: 'all .15s'
            }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <p style={{ marginTop: 2 }}>{z.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', phone: '', aadhaar: '', platforms: [], city: '', zone: '', avgIncome: ''
  });
  const [plan, setPlan] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const allPlatforms = ['Swiggy', 'Zomato', 'Uber', 'Ola', 'Amazon', 'Flipkart', 'Zepto', 'Blinkit', 'Dunzo', 'Porter'];
  const zones = form.city ? CITY_ZONES[form.city] || [] : [];
  const isStep0Valid = form.name && form.platforms.length > 0 && form.city && form.zone && form.avgIncome;
  const isStep1Valid = otpVerified;
  const selectedZoneObj = zones.find(z => z.name === form.zone);

  const togglePlatform = (p) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p]
    }));
  };

  const sendOTP = () => {
    if (!form.phone || form.phone.length < 10) return;
    setOtpLoading(true);
    setTimeout(() => { setOtpSent(true); setOtpLoading(false); }, 1500);
  };

  const handleOTPComplete = (code) => {
    setOtpLoading(true);
    setTimeout(() => {
      setOtpVerified(true);
      setOtpLoading(false);
    }, 1200);
  };

  const verifyAadhaar = () => {
    if (!form.aadhaar || form.aadhaar.length < 12) return;
    setOtpLoading(true);
    setTimeout(() => { setAadhaarVerified(true); setOtpLoading(false); }, 1000);
  };

  const next = () => {
    if (step < 2) { setStep(step + 1); return; }
    setLoading(true);
    setTimeout(() => onComplete({
      ...form, plan, platform: form.platforms[0] || 'Swiggy',
      avgIncome: Number(form.avgIncome)
    }), 1200);
  };

  const stepLabels = ['Your Details', 'Verify Identity', 'Choose Plan'];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${T.orange} 0%, #FF8C5A 100%)`,
        padding: '48px 28px 36px', color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>🛡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>GigShield</div>
            <div style={{ fontSize: 12, opacity: .85 }}>Income Protection for Gig Workers</div>
          </div>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Your income,<br />automatically protected
        </h1>
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 22 }}>Parametric payouts in 90 seconds. No paperwork.</p>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 8 }}>
          {stepLabels.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: i <= step ? 'white' : 'rgba(255,255,255,.3)',
                color: i <= step ? T.orange : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, transition: 'all .3s'
              }}>{i < step ? '✓' : i + 1}</div>
              <span style={{ fontSize: 12, opacity: i <= step ? 1 : .6, fontWeight: 600 }}>{s}</span>
              {i < stepLabels.length - 1 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,.4)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '24px 24px 40px', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="fade-up card" style={{ padding: '28px 24px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Tell us about yourself</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Ravi Kumar" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="label">Delivery Platforms (select all)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {allPlatforms.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: form.platforms.includes(p) ? T.orange : T.bg,
                        color: form.platforms.includes(p) ? 'white' : T.text,
                        border: `2px solid ${form.platforms.includes(p) ? T.orange : T.border}`,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all .15s'
                      }}>
                      {form.platforms.includes(p) ? '✓ ' : ''}{p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">City</label>
                <select className="input" value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value, zone: '' })}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {form.city && (
                <div className="fade-in">
                  <label className="label">Select Your Zone</label>
                  <ZonePicker city={form.city} zones={zones} selected={form.zone}
                    onSelect={zone => setForm({ ...form, zone })} />
                </div>
              )}

              {form.zone && (
                <div className="fade-in" style={{
                  background: selectedZoneObj?.flood ? '#FFF3E0' : T.greenLight,
                  border: `1px solid ${selectedZoneObj?.flood ? '#FFD580' : T.green + '40'}`,
                  borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center'
                }}>
                  <span style={{ fontSize: 16 }}>{selectedZoneObj?.flood ? '🌊' : '✅'}</span>
                  <span style={{ fontSize: 12, color: selectedZoneObj?.flood ? '#7A4800' : '#145A28', fontWeight: 500 }}>
                    {selectedZoneObj?.flood
                      ? `${form.zone} is flood-prone — full parametric rain & flood coverage active`
                      : `${form.zone} is a normal zone — heat, platform outage & traffic coverage active`}
                  </span>
                </div>
              )}

              <div>
                <label className="label">Avg Daily Income (₹)</label>
                <input className="input" type="number" placeholder="e.g. 950" value={form.avgIncome}
                  onChange={e => setForm({ ...form, avgIncome: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 28 }}>
              <button className="btn-primary" onClick={next} disabled={!isStep0Valid}>
                Continue to Identity Verification →
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — OTP Verification */}
        {step === 1 && (
          <div className="fade-up card" style={{ padding: '28px 24px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Verify Your Identity</h2>
            <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>Quick phone + Aadhaar verification for secure coverage</p>

            {/* Phone OTP */}
            <div style={{
              padding: 20, borderRadius: 14, border: `1px solid ${otpVerified ? T.green + '40' : T.border}`,
              background: otpVerified ? T.greenLight : 'white', marginBottom: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>📱</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>Phone Verification</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>We'll send a 6-digit OTP</p>
                </div>
                {otpVerified && <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>✓ VERIFIED</span>}
              </div>

              {!otpVerified && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div style={{
                      padding: '12px 14px', borderRadius: 10, background: T.bg,
                      border: `1px solid ${T.border}`, fontSize: 14, fontWeight: 600, color: T.textMuted
                    }}>+91</div>
                    <input className="input" type="tel" placeholder="98765 43210" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ flex: 1 }} disabled={otpSent} />
                    {!otpSent && (
                      <button className="btn-primary" onClick={sendOTP} disabled={otpLoading || !form.phone}
                        style={{ width: 'auto', padding: '12px 20px', fontSize: 13 }}>
                        {otpLoading ? <Spinner size={14} /> : 'Send OTP'}
                      </button>
                    )}
                  </div>

                  {otpSent && (
                    <div className="fade-up">
                      <p style={{ fontSize: 12, color: T.green, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
                        ✓ OTP sent to +91 {form.phone}
                      </p>
                      <OTPInput length={6} onComplete={handleOTPComplete} />
                      {otpLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                          <Spinner color={T.orange} size={14} />
                          <span style={{ fontSize: 12, color: T.orange, fontWeight: 600 }}>Verifying...</span>
                        </div>
                      )}
                      <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: 12 }}>
                        Didn't receive? <span style={{ color: T.orange, cursor: 'pointer', fontWeight: 600 }}>Resend OTP</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Aadhaar */}
            <div style={{
              padding: 20, borderRadius: 14, border: `1px solid ${aadhaarVerified ? T.green + '40' : T.border}`,
              background: aadhaarVerified ? T.greenLight : 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>🔐</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>Aadhaar Verification (Optional)</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>For enhanced trust score & faster claims</p>
                </div>
                {aadhaarVerified && <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>✓ VERIFIED</span>}
              </div>

              {!aadhaarVerified && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder="XXXX XXXX 1234" value={form.aadhaar}
                    onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    style={{ flex: 1, letterSpacing: '2px' }} />
                  <button className="btn-ghost" onClick={verifyAadhaar} disabled={otpLoading || form.aadhaar.length < 12}
                    style={{ whiteSpace: 'nowrap' }}>
                    Verify
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(0)} style={{ width: 'auto', padding: '13px 20px' }}>
                ← Back
              </button>
              <button className="btn-primary" onClick={next} disabled={!isStep1Valid} style={{ flex: 1 }}>
                Continue to Plan Selection →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Plan Selection */}
        {step === 2 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Choose your plan</h2>
            <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>
              Weekly premium · cancel anytime · payout within 90 sec
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {PLANS.map(p => (
                <div key={p.id}
                  className={`plan-card${plan === p.id ? ' selected' : ''}`}
                  onClick={() => setPlan(p.id)}
                  style={{
                    borderColor: plan === p.id ? p.color : T.border,
                    boxShadow: plan === p.id ? `0 0 0 4px ${p.color}18` : 'none'
                  }}>
                  {p.tag && (
                    <div style={{
                      position: 'absolute', top: -1, right: 16, background: p.color, color: 'white',
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: '0 0 8px 8px'
                    }}>{p.tag}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: '50%', border: `3px solid ${p.color}`,
                          background: plan === p.id ? p.color : 'white'
                        }} />
                        <span style={{ fontSize: 17, fontWeight: 700 }}>{p.name}</span>
                      </div>
                      <p style={{ fontSize: 12, color: T.textSec, paddingLeft: 20, lineHeight: 1.6 }}>
                        ₹{p.dailyPayout}/day · {p.days} days/week<br />
                        Weekly cap: <strong>₹{p.cap.toLocaleString()}</strong>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: p.color }}>₹{p.price}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>/week</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ width: 'auto', padding: '13px 20px' }}>
                ← Back
              </button>
              <button className="btn-primary" onClick={next} disabled={loading} style={{ flex: 1 }}>
                {loading ? <><Spinner /> Activating your shield...</> : 'Activate GigShield 🛡'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
