import { T, PLANS } from '../data/constants';
import { TrustBadge } from './shared';

const NAV_ITEMS = [
  { section: "Overview", items: [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "realtime",  icon: "🌦️", label: "Live Monitor", badge: "LIVE" },
    { id: "claims",    icon: "⚡", label: "Claims" },
  ]},
  { section: "Protection", items: [
    { id: "premium",  icon: "💰", label: "Premium Calc", badge: "NEW" },
    { id: "policy",   icon: "📑", label: "My Policy", badge: "NEW" },
    { id: "plans",    icon: "🎯", label: "Plans" },
    { id: "triggers", icon: "🔗", label: "Triggers" },
  ]},
  { section: "Intelligence", items: [
    { id: "ml",    icon: "🤖", label: "ML Models" },
    { id: "fraud", icon: "🔍", label: "Fraud Detection" },
  ]},
  { section: "Settings", items: [
    { id: "payment",    icon: "💳", label: "Payments", badge: "NEW" },
    { id: "admin",      icon: "⚙️", label: "Admin Panel" },
    { id: "onboarding", icon: "👤", label: "Profile" },
  ]},
];

export default function Sidebar({ activePage, onNavigate, user }) {
  const plan = PLANS.find(p => p.id === user.plan) || PLANS[1];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "white"
          }}>🛡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>
              Gig<span style={{ color: T.orange }}>Shield</span>
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: .5 }}>
              AI Income Protection v3.0
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="nav-badge" style={{
                    background: item.badge === 'NEW' ? T.blue : T.red
                  }}>{item.badge}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{
          background: T.bg, borderRadius: 12, padding: 14,
          border: `1px solid ${T.border}`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 15, color: "white", flexShrink: 0
            }}>{user.name?.[0] || "U"}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{user.name}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>
                {user.policyId || 'GS-#24719'} · {plan.name} Plan
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.textMuted }}>
            <span>Trust</span>
            <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                background: `linear-gradient(90deg, ${T.orange}, ${T.amber})`,
                borderRadius: 2, width: `${user.trustScore}%`,
                transition: "width 1s ease"
              }} />
            </div>
            <span style={{ color: T.amber, fontWeight: 700 }}>{user.trustScore}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
