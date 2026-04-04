import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1100);
    const t4 = setTimeout(onComplete, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #FF5200 0%, #FF7A2F 40%, #E64800 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Background decorative circles */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', top: -100, right: -100, animation: 'spin 30s linear infinite' }} />
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', bottom: -80, left: -80 }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: 60, left: 60 }} />

      {/* Main content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Animated Shield Icon */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
          transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          marginBottom: 20,
        }}>
          {/* Tree/shelter icon for ARBOR */}
          <svg width="80" height="88" viewBox="0 0 80 88" fill="none">
            <circle cx="40" cy="30" r="26" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.5"/>
            <path d="M40 14 L52 32 H44 L56 50 H46 L58 68 H22 L34 50 H24 L36 32 H28 Z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="36" y="68" width="8" height="12" rx="2" fill="white" opacity="0.8"/>
          </svg>
        </div>

        {/* Brand Name */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
        }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: 4, fontFamily: 'Inter, sans-serif' }}>
            ARBOR
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          marginTop: 8,
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, letterSpacing: 2, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
            shelter and stability
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'white', borderRadius: 2, animation: 'progressFill 2s ease forwards' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
