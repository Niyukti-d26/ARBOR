import { T, PLANS, PAYOUTS } from '../data/constants';
import { SectionHeader, ProgressBar, PillTag } from '../components/shared';

const typeColors = { rain: T.blue, heat: T.red, crash: "#7C3AED", zone: T.amber };

export default function Dashboard({ user }) {
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[1];
  const weekPct = Math.round((user.weeklyCapUsed / plan.cap) * 100);

  return (
    <div className="page-section">
      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { label: "EARNINGS PROTECTED", value: `₹${user.earningsProtected.toLocaleString()}`, color: T.green, icon: "🛡️", sub: "This month" },
          { label: "CLAIMS PAID", value: "7", color: T.orange, icon: "⚡", sub: "4 auto · 3 manual" },
          { label: "ACTIVE DISRUPTIONS", value: "2", color: T.red, icon: "🌧️", sub: "Monsoon + Heat" },
          { label: "TRUST SCORE", value: `${user.trustScore}/100`, color: T.amber, icon: "📈", sub: "+4 this week" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -8, right: -8, fontSize: 40, opacity: .08 }}>{s.icon}</div>
            <p style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, letterSpacing: ".04em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: T.textSec, marginTop: 6 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      <div className="fade-up" style={{
        background: `linear-gradient(135deg, ${T.redLight}, ${T.orangeLight})`,
        border: `1px solid ${T.red}30`, borderRadius: 14, padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 14, marginBottom: 24
      }}>
        <span style={{ fontSize: 28 }}>🌧️</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: T.orange }}>
            MONSOON LOCK TRIGGERED — T.Nagar, Anna Nagar
          </p>
          <p style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>
            Rainfall 82mm/hr · AQI 156 · Income drop 68%. Eligible for ₹300 payout.
          </p>
        </div>
        <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", fontSize: 12, flexShrink: 0 }}>
          CLAIM NOW →
        </button>
      </div>

      {/* Main content */}
      <div className="main-side">
        {/* Income Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Income vs Protection Timeline</h3>
              <p style={{ fontSize: 11, color: T.textMuted }}>Last 14 days</p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 6,
              background: T.redLight, border: `1px solid ${T.red}20`,
              fontSize: 10, fontWeight: 700, color: T.red
            }}>
              <div className="pulse-dot" style={{ background: T.red, width: 5, height: 5 }} />
              LIVE
            </div>
          </div>
          <div className="chart-container">
            <svg viewBox="0 0 600 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ig" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: `${T.orange}66` }} />
                  <stop offset="100%" style={{ stopColor: `${T.orange}00` }} />
                </linearGradient>
                <linearGradient id="pg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: `${T.green}44` }} />
                  <stop offset="100%" style={{ stopColor: `${T.green}00` }} />
                </linearGradient>
              </defs>
              <path d="M0,30 L43,25 L86,35 L129,20 L172,60 L215,70 L258,65 L301,40 L344,35 L387,80 L430,85 L473,75 L516,50 L560,45 L600,40 L600,120 L0,120Z" fill="url(#ig)" />
              <path d="M0,30 L43,25 L86,35 L129,20 L172,60 L215,70 L258,65 L301,40 L344,35 L387,80 L430,85 L473,75 L516,50 L560,45 L600,40" fill="none" stroke={T.orange} strokeWidth="2.5" />
              <path d="M0,80 L43,78 L86,80 L129,79 L172,95 L215,100 L258,98 L301,85 L344,82 L387,105 L430,108 L473,103 L516,90 L560,87 L600,85 L600,120 L0,120Z" fill="url(#pg)" />
              <path d="M0,80 L43,78 L86,80 L129,79 L172,95 L215,100 L258,98 L301,85 L344,82 L387,105 L430,108 L473,103 L516,90 L560,87 L600,85" fill="none" stroke={T.green} strokeWidth="2" strokeDasharray="5,3" />
              <rect x="168" y="0" width="90" height="120" fill={`${T.red}08`} />
              <rect x="383" y="0" width="95" height="120" fill={`${T.red}08`} />
              <line x1="168" y1="0" x2="168" y2="120" stroke={`${T.red}40`} strokeWidth="1" strokeDasharray="3,3" />
              <line x1="383" y1="0" x2="383" y2="120" stroke={`${T.red}40`} strokeWidth="1" strokeDasharray="3,3" />
              <text x="178" y="14" fill={`${T.red}99`} fontSize="8" fontFamily="monospace">MONSOON</text>
              <text x="393" y="14" fill={`${T.red}99`} fontSize="8" fontFamily="monospace">HEAT</text>
            </svg>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
            <PillTag color={T.orange}>━ Income</PillTag>
            <PillTag color={T.green}>╌ Shield</PillTag>
            <PillTag color={T.red}>▪ Disruption</PillTag>
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Payouts</h3>
            <PillTag color={T.green}>₹{user.earningsProtected.toLocaleString()} total</PillTag>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PAYOUTS.map((p, i) => (
              <div key={i} className="payout-item">
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: (typeColors[p.type] || T.blue) + "15",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0
                }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{p.event}</p>
                  <p style={{ fontSize: 11, color: T.textMuted }}>{p.date}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, color: T.green }}>+₹{p.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="two-col">
        {/* Weekly usage */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Weekly Payout Usage</h3>
            <PillTag color={T.amber}>{plan.name} Plan</PillTag>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
            <span style={{ color: T.textMuted }}>₹{user.weeklyCapUsed} used of ₹{plan.cap} cap</span>
            <span style={{ color: T.orange, fontWeight: 700 }}>{weekPct}%</span>
          </div>
          <ProgressBar value={user.weeklyCapUsed} max={plan.cap} />
          <div style={{ height: 80, marginTop: 16 }}>
            <div className="chart-bars">
              {[60, 80, 45, 70, 90, 35, 20].map((h, i) => (
                <div key={i} className="bar" style={{
                  height: `${h}%`,
                  background: `${T.orange}${Math.round(h * 0.6 + 20).toString(16)}`,
                  borderRadius: "6px 6px 0 0"
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 6 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* Community Shield */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Community Shield</h3>
            <PillTag color={T.blue}>{user.zone} Zone</PillTag>
          </div>
          <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
            47 workers in your zone validating disruptions together
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { value: "47", label: "ZONE MEMBERS", color: T.orange },
              { value: "94%", label: "VALIDATION", color: T.green },
              { value: "3", label: "ALERTS", color: T.red },
            ].map((s, i) => (
              <div key={i} style={{
                background: T.bg, borderRadius: 10, padding: 12,
                textAlign: "center", border: `1px solid ${T.border}`
              }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: 12, color: T.textSec, padding: "12px 14px",
            background: T.greenLight, borderRadius: 10, border: `1px solid ${T.green}20`
          }}>
            42 workers confirm rain disruption right now. Validation: <span style={{ color: T.green, fontWeight: 700 }}>HIGH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
