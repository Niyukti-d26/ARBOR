import { useState } from 'react';
import { T } from '../data/constants';

const FEATURES = [
  { icon: '🌧️', title: 'Automatic Claim Detection', desc: 'Claims triggered instantly by satellite weather data, AQI sensors, and platform APIs — no forms needed.', color: '#3B82F6' },
  { icon: '💸', title: 'UPI Payouts in Minutes', desc: 'Your payout lands in your UPI account within minutes of a verified weather or platform disruption.', color: '#60B246' },
  { icon: '🤖', title: 'AI-Powered Premiums', desc: 'ML models calculate fair premiums from your gig history, zone risk, and seasonal patterns.', color: '#F59E0B' },
];

const STEPS = [
  { n: '01', title: 'Sign up in 2 min', desc: 'Verify with your phone and Aadhaar. No paper, no branch visit.', icon: '📱' },
  { n: '02', title: 'Pick a plan', desc: 'Starter ₹50/wk, Standard ₹80/wk, or Pro ₹120/wk. Weekly premiums, cancel anytime.', icon: '📑' },
  { n: '03', title: 'Get paid automatically', desc: 'When disruptions hit your zone, we detect, verify, and pay — before you even file a claim.', icon: '💸' },
];

export default function LandingPage({ onSelectRole }) {
  const [workerHover, setWorkerHover] = useState(false);
  const [adminHover, setAdminHover] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* ── Header ── */}
      <div style={{
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${T.border}`, padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="31" viewBox="0 0 28 31" fill="none">
            <path d="M14 1L1 6V16C1 22.6 6.8 29 14 31C21.2 29 27 22.6 27 16V6L14 1Z" fill={T.primary} />
            <path d="M8 16L12.5 20.5L20 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: 3 }}>
            ARBOR
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>Income Protection Platform · India</span>
          <button onClick={() => onSelectRole('admin')} style={{
            background: 'none', border: `1px solid ${T.border}`, borderRadius: 7,
            padding: '7px 16px', fontSize: 12, fontWeight: 600, color: T.textSec,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s',
          }}
            onMouseEnter={e => { e.target.style.background = T.bg; }}
            onMouseLeave={e => { e.target.style.background = 'none'; }}>
            Admin Login
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '80px 32px 72px', textAlign: 'center',
      }}>
        {/* Background gradient blob */}
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,82,0,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FFF5F0', color: T.primary, fontSize: 12, fontWeight: 700,
            padding: '6px 16px', borderRadius: 100, marginBottom: 28,
            border: `1px solid #FFD5C2`,
            animation: 'fadeUp .5s ease both',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.primary, animation: 'pulse 2s infinite' }} />
            Live · Protecting 52,841 Gig Workers Across India
          </div>

          <h1 style={{
            fontSize: 56, fontWeight: 900, color: T.text,
            lineHeight: 1.08, marginBottom: 20, letterSpacing: -2,
            animation: 'fadeUp .5s .1s ease both', opacity: 0,
          }}>
            Your income protected.<br />
            <span style={{
              background: `linear-gradient(135deg, ${T.primary}, #FF8C42)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Automatically.</span>
          </h1>

          <p style={{
            fontSize: 18, color: T.textSec, lineHeight: 1.7, marginBottom: 40,
            maxWidth: 540, margin: '0 auto 40px',
            animation: 'fadeUp .5s .2s ease both', opacity: 0,
          }}>
            When rain, heat waves, or platform outages cut your daily earnings — ARBOR detects it and pays you back. No claims. No paperwork. Zero effort.
          </p>

          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeUp .5s .3s ease both', opacity: 0,
          }}>
            <button
              onClick={() => onSelectRole('worker')}
              onMouseEnter={() => setWorkerHover(true)}
              onMouseLeave={() => setWorkerHover(false)}
              style={{
                background: workerHover
                  ? `linear-gradient(135deg, ${T.primaryHover}, #E85500)`
                  : `linear-gradient(135deg, ${T.primary}, #FF7A2F)`,
                color: 'white', border: 'none', borderRadius: 12,
                padding: '16px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all .2s',
                boxShadow: workerHover ? '0 8px 28px rgba(255,82,0,0.4)' : '0 4px 16px rgba(255,82,0,0.25)',
                transform: workerHover ? 'translateY(-2px)' : 'none',
              }}>
              I'm a Gig Worker →
            </button>
            <button
              onClick={() => onSelectRole('admin')}
              onMouseEnter={() => setAdminHover(true)}
              onMouseLeave={() => setAdminHover(false)}
              style={{
                background: adminHover ? T.bg : T.white,
                color: T.text, border: `1.5px solid ${adminHover ? T.borderDark : T.border}`,
                borderRadius: 12, padding: '16px 36px', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s',
                transform: adminHover ? 'translateY(-1px)' : 'none',
              }}>
              Admin Console
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primary} 0%, #E64800 100%)`,
        padding: '28px 32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
          {[
            { label: 'Active Workers', val: '52,841', icon: '👥' },
            { label: 'Paid Out Today', val: '₹4.2L', icon: '💸' },
            { label: 'Avg Claim Time', val: '< 3 min', icon: '⚡' },
            { label: 'Satisfaction', val: '98.4%', icon: '⭐' },
          ].map((s, i) => (
            <div key={s.label} style={{
              textAlign: 'center', flex: '1 1 160px',
              padding: '12px 24px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none',
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 2, letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding: '64px 32px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: '#FFF5F0', color: T.primary, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 14, border: `1px solid #FFD5C2`, letterSpacing: 1 }}>
            HOW IT WORKS
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: T.text, marginBottom: 10, letterSpacing: -1 }}>Simple as 1-2-3</div>
          <div style={{ fontSize: 15, color: T.textMuted, maxWidth: 420, margin: '0 auto' }}>Start protecting your income in minutes. No agents, no paperwork.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: 28, position: 'relative', overflow: 'hidden',
              transition: 'all .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{
                position: 'absolute', top: 16, right: 16,
                fontSize: 13, fontWeight: 800, color: T.border,
                letterSpacing: -0.5,
              }}>{step.n}</div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{step.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ background: T.white, padding: '64px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: T.bg, color: T.textSec, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 14, border: `1px solid ${T.border}`, letterSpacing: 1 }}>
              FEATURES
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: -1 }}>Built for India's gig workers</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: T.bg, borderRadius: 16, padding: 28,
                border: `1px solid ${T.border}`, transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}44`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  background: `${f.color}14`, marginBottom: 18,
                }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, #1A1A1A 0%, #2D1A0A 100%)`,
        padding: '60px 32px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: -1 }}>
            Ready to protect your income?
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
            Join 52,000+ gig workers across India who earn smarter and worry less.
          </div>
          <button onClick={() => onSelectRole('worker')} style={{
            background: `linear-gradient(135deg, ${T.primary}, #FF7A2F)`,
            color: 'white', border: 'none', borderRadius: 12,
            padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: '0 6px 24px rgba(255,82,0,0.35)',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 32px rgba(255,82,0,0.45)'; }}
            onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 6px 24px rgba(255,82,0,0.35)'; }}>
            Get Started Free →
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: T.white, borderTop: `1px solid ${T.border}`, padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          © 2026 ARBOR · shelter and stability · Built for India's Gig Economy
        </span>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          Powered by AI · Secured by design
        </span>
      </div>
    </div>
  );
}
