import { useState } from 'react';
import { T } from '../data/constants';

export default function LandingPage({ onSelectRole }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="landing-page">
      <div className="landing-bg" />

      <div className="landing-content">
        <div className="landing-header fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div className="landing-logo-icon">
              <svg width="36" height="36" viewBox="0 0 72 72" fill="none">
                <path d="M36 4 L62 16 V36 C62 52 50 64 36 68 C22 64 10 52 10 36 V16 L36 4Z"
                  fill="url(#lg)" />
                <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF9F6B" />
                </linearGradient></defs>
                <path d="M26 36 L33 43 L46 28" stroke="white" strokeWidth="4"
                  strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
                Gig<span style={{ color: T.orange }}>Shield</span>
              </h1>
              <p style={{ fontSize: 12, color: T.textMuted, letterSpacing: 1 }}>AI INCOME PROTECTION</p>
            </div>
          </div>
          <h2 className="landing-headline">
            Protect your income.<br />
            <span style={{ color: T.orange }}>Automatically.</span>
          </h2>
          <p className="landing-subtext">
            Parametric insurance for gig workers. Zero paperwork. Payouts in 90 seconds.
          </p>
        </div>

        <div className="landing-cards">
          {/* Worker Card */}
          <div
            className={`landing-role-card worker-card fade-up ${hoveredCard === 'worker' ? 'hovered' : ''}`}
            style={{ animationDelay: '0.1s' }}
            onMouseEnter={() => setHoveredCard('worker')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onSelectRole('worker')}
          >
            <div className="role-card-glow worker-glow" />
            <div className="role-card-icon worker-icon">🛵</div>
            <h3 className="role-card-title">I'm a Gig Worker</h3>
            <p className="role-card-subtitle">Protect your daily income from disruptions — rain, heat, platform outages, and more</p>
            <div className="role-card-features">
              {['Auto-payouts via UPI', 'Zero-touch claims', 'Real-time risk alerts', 'From ₹50/week'].map((f, i) => (
                <div key={i} className="role-feature">
                  <span style={{ color: T.green, fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button className="btn-primary role-card-cta" style={{
              background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`,
              boxShadow: `0 4px 20px ${T.orange}55`
            }}>
              Get Protected →
            </button>
          </div>

          {/* Admin Card */}
          <div
            className={`landing-role-card admin-card fade-up ${hoveredCard === 'admin' ? 'hovered' : ''}`}
            style={{ animationDelay: '0.2s' }}
            onMouseEnter={() => setHoveredCard('admin')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onSelectRole('admin')}
          >
            <div className="role-card-glow admin-glow" />
            <div className="role-card-icon admin-icon">🛡️</div>
            <h3 className="role-card-title">I'm an Admin</h3>
            <p className="role-card-subtitle">Monitor and manage the GigShield platform — workers, claims, payouts, and fraud</p>
            <div className="role-card-features">
              {['Live trigger monitoring', 'Claims queue management', 'Fraud detection AI', 'Zone risk analytics'].map((f, i) => (
                <div key={i} className="role-feature">
                  <span style={{ color: T.blue, fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button className="btn-primary role-card-cta" style={{
              background: `linear-gradient(135deg, ${T.blue}, #5B9DFF)`,
              boxShadow: `0 4px 20px ${T.blue}55`
            }}>
              Admin Login →
            </button>
          </div>
        </div>

        <div className="landing-trust-bar fade-up" style={{ animationDelay: '0.3s' }}>
          {['🔒 256-bit Encrypted', '🏦 IRDAI Compliant', '⚡ 90s Payouts', '🤖 AI-Powered'].map((item, i) => (
            <span key={i} className="trust-item">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
