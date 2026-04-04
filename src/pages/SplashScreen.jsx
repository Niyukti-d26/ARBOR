import { useState, useEffect } from 'react';
import { T } from '../data/constants';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 800);
    const t2 = setTimeout(() => setPhase('fade'), 2400);
    const t3 = setTimeout(() => onComplete(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${phase === 'fade' ? 'splash-fade-out' : ''}`}>
      <div className="splash-bg" />
      <div className="splash-content">
        <div className={`splash-logo-wrap ${phase !== 'logo' ? 'splash-logo-shrink' : ''}`}>
          <div className="splash-shield">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <defs>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF6B35" />
                  <stop offset="100%" stopColor="#FF9F6B" />
                </linearGradient>
              </defs>
              <path d="M36 4 L62 16 V36 C62 52 50 64 36 68 C22 64 10 52 10 36 V16 L36 4Z"
                fill="url(#shieldGrad)" className="splash-shield-path" />
              <path d="M26 36 L33 43 L46 28" stroke="white" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round" fill="none"
                className="splash-check" />
            </svg>
          </div>
          <h1 className="splash-title">
            Gig<span style={{ color: T.orange }}>Shield</span>
          </h1>
        </div>
        <p className={`splash-tagline ${phase === 'tagline' || phase === 'fade' ? 'splash-tagline-show' : ''}`}>
          Income Protection for Every Ride
        </p>
        <div className={`splash-loader ${phase === 'tagline' || phase === 'fade' ? 'splash-loader-show' : ''}`}>
          <div className="splash-loader-bar" />
        </div>
      </div>
      <p className="splash-footer">Powered by AI · Secured by Blockchain · Regulated by IRDAI</p>
    </div>
  );
}
