import { useState, useEffect, useCallback } from 'react';
import { T, PLANS, DEFAULT_USER } from './data/constants';

// Auth & Landing
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import WorkerAuth from './pages/WorkerAuth';
import AdminAuth from './pages/AdminAuth';

// Worker Pages (4 + profile sheet)
import WorkerDashboard from './pages/WorkerDashboard';
import MyPolicy from './pages/MyPolicy';
import Claims from './pages/Claims';
import SimulationPanel from './pages/SimulationPanel';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import LiveMonitor from './pages/LiveMonitor';
import Notifications from './pages/Notifications';
import WorkerManagement from './pages/WorkerManagement';
import PayoutLedger from './pages/PayoutLedger';
import FraudAlerts from './pages/FraudAlerts';
import ZoneRiskMap from './pages/ZoneRiskMap';

// ── Admin Sidebar Nav ──
const ADMIN_NAV = [
  { section: 'Overview', items: [
    { id: 'adminDash', icon: '📊', label: 'Dashboard' },
    { id: 'liveMonitor', icon: '🌦️', label: 'Live Monitor' },
  ]},
  { section: 'AI Operations', items: [
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'workers', icon: '👥', label: 'Workers' },
    { id: 'payoutLedger', icon: '💸', label: 'Payout Ledger' },
  ]},
  { section: 'Risk & Intelligence', items: [
    { id: 'fraud', icon: '🚨', label: 'Fraud Alerts' },
    { id: 'zoneRisk', icon: '🗺️', label: 'Zone Risk & Triggers' },
  ]},
];

// ── Worker Bottom Nav (4 tabs + profile) ──
const WORKER_TABS = [
  { id: 'workerDash', icon: '🏠', label: 'Home' },
  { id: 'myPolicy', icon: '📑', label: 'My Policy' },
  { id: 'claims', icon: '📋', label: 'Claims' },
  { id: 'simulation', icon: '⚡', label: 'Simulator' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

// ── Worker Profile Bottom Sheet ──
function WorkerProfileSheet({ user, onLogout, onClose }) {
  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 200, backdropFilter: 'blur(2px)',
      }} />
      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#fff', borderRadius: '18px 18px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        padding: '8px 0 20px',
        animation: 'slideUp .25s ease',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0E0', margin: '8px auto 20px' }} />

        {/* Avatar + Name */}
        <div style={{ textAlign: 'center', paddingBottom: 20, borderBottom: `1px solid ${T.border}`, margin: '0 20px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `linear-gradient(135deg, ${T.primary}, #E64800)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 26, color: 'white', margin: '0 auto 12px',
          }}>{(user?.name || 'R')[0]}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{user?.name || 'Ravi Kumar'}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{user?.phone}</div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF5F0', borderRadius: 20, padding: '5px 14px', border: '1px solid #FFD5C2' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>✦ {plan.name} Plan</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>· ₹{plan.dailyPayout}/day</span>
          </div>
        </div>

        {/* Info rows */}
        <div style={{ padding: '14px 24px' }}>
          {[
            { icon: '📍', label: 'Zone', value: `${user?.zone || 'Bellandur'}, ${user?.city || 'Bengaluru'}` },
            { icon: '📱', label: 'Platforms', value: (user?.platforms || ['Swiggy']).join(', ') },
            { icon: '🛡️', label: 'Policy ID', value: user?.policyId || 'GS-POL-2026-24719' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{row.icon}</span>
              <div>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{row.label}</div>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{row.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div style={{ padding: '0 20px' }}>
          <button onClick={onLogout} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #E23744, #C0222E)',
            color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', letterSpacing: 0.3,
          }}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}

function AdminSidebar({ activePage, onNavigate, admin, onLogout, notifCount }) {
  return (
    <aside style={{
      width: 250, minHeight: '100vh', background: '#fff',
      borderRight: `1px solid ${T.border}`, display: 'flex',
      flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path d="M9 1L1 4V10C1 14.8 4.6 19.2 9 20C13.4 19.2 17 14.8 17 10V4L9 1Z" fill="white" opacity="0.2" />
              <path d="M9 1L1 4V10C1 14.8 4.6 19.2 9 20C13.4 19.2 17 14.8 17 10V4L9 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 10L8 13L13 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: 1 }}>
              ARBOR
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 500, letterSpacing: 0.5 }}>
              Admin Console
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
        {ADMIN_NAV.map(section => (
          <div key={section.section}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1,
              color: T.textMuted, padding: '14px 12px 6px',
              textTransform: 'uppercase',
            }}>{section.section}</div>
            {section.items.map(item => (
              <div key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  marginBottom: 2, transition: 'all .15s',
                  background: activePage === item.id ? '#FFF5F0' : 'transparent',
                  color: activePage === item.id ? T.primary : T.textSec,
                  fontWeight: activePage === item.id ? 600 : 500,
                  fontSize: 13,
                }}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: 'center', position: 'relative' }}>
                  {item.icon}
                  {/* Notification badge */}
                  {item.id === 'notifications' && notifCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -8,
                      background: '#E23744', color: 'white',
                      fontSize: 9, fontWeight: 800, borderRadius: 10,
                      padding: '1px 5px', minWidth: 16, textAlign: 'center',
                    }}>{notifCount}</span>
                  )}
                </span>
                {item.label}
                {item.id === 'notifications' && notifCount > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#E23744', color: 'white',
                    fontSize: 10, fontWeight: 700, borderRadius: 10,
                    padding: '1px 7px',
                  }}>{notifCount}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: `1px solid ${T.border}` }}>
        <div style={{ background: T.bg, borderRadius: 10, padding: 12, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: T.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0,
            }}>{(admin?.name || 'A')[0]}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{admin?.name || 'Admin'}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Platform Admin</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: '100%', padding: '8px', borderRadius: 6,
            border: `1px solid ${T.border}`, background: 'transparent',
            color: T.textSec, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>Logout</button>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({ title }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(8px)', borderBottom: `1px solid ${T.border}`,
      padding: '0 28px', height: 56, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', zIndex: 50,
    }}>
      <h1 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: T.textMuted, fontFamily: 'monospace' }}>
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#EDF7EA', borderRadius: 6, padding: '4px 10px',
          fontSize: 12, fontWeight: 600, color: '#60B246',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
          All Systems Live
        </div>
        <div style={{
          background: '#FFF5F0', borderRadius: 6, padding: '4px 10px',
          fontSize: 12, fontWeight: 600, color: T.primary, border: '1px solid #FFD5C2',
        }}>
          52,841 Workers
        </div>
      </div>
    </div>
  );
}

function WorkerBottomNav({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', background: '#fff', borderTop: `1px solid ${T.border}`,
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
    }}>
      {WORKER_TABS.map(tab => (
        <button key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 2, padding: '10px 0',
            border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500,
            color: active === tab.id ? T.primary : T.textMuted,
            position: 'relative', transition: 'color .15s',
          }}>
          {active === tab.id && (
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 24, height: 3, background: T.primary, borderRadius: '0 0 3px 3px',
            }} />
          )}
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function WorkerTopbar({ user }) {
  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];
  return (
    <div style={{
      background: '#fff', borderBottom: `1px solid ${T.border}`,
      padding: '12px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: T.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
            <path d="M9 1L1 4V10C1 14.8 4.6 19.2 9 20C13.4 19.2 17 14.8 17 10V4L9 1Z" fill="white" opacity="0.2" />
            <path d="M9 1L1 4V10C1 14.8 4.6 19.2 9 20C13.4 19.2 17 14.8 17 10V4L9 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M5 10L8 13L13 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.text, letterSpacing: 2 }}>
              ARBOR
            </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: '#EDF7EA', borderRadius: 6, padding: '4px 8px',
          fontSize: 11, fontWeight: 700, color: '#60B246',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
          Protected
        </div>
        <div style={{
          background: '#FFF5F0', color: T.primary, fontSize: 11,
          fontWeight: 700, padding: '4px 10px', borderRadius: 6,
          border: `1px solid #FFD5C2`,
        }}>{plan.name}</div>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: T.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: 'white',
        }}>{(user?.name || 'R')[0]}</div>
      </div>
    </div>
  );
}

const PAGE_TITLES = {
  adminDash: 'Dashboard', liveMonitor: 'Live Monitor',
  notifications: 'AI Notifications', workers: 'Workers',
  payoutLedger: 'Payout Ledger', fraud: 'Fraud Alerts',
  zoneRisk: 'Zone Risk & Trigger Engine',
};

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [activePage, setActivePage] = useState('workerDash');
  const [user, setUser] = useState(DEFAULT_USER);
  const [admin, setAdmin] = useState(null);
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [notifCount, setNotifCount] = useState(3); // Initial unread in Notifications

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleWorkerComplete = useCallback((data) => {
    const newUser = { ...DEFAULT_USER, ...data };
    setUser(newUser);
    // Register this worker in shared state so admin Workers page sees them
    try {
      const raw = localStorage.getItem('cropInsuranceState');
      const state = raw ? JSON.parse(raw) : {};
      const registeredWorkers = state.registeredWorkers || [];
      const existing = registeredWorkers.findIndex(w => w.phone === newUser.phone);
      const workerEntry = {
        id: `ARB-${Date.now()}`,
        name: newUser.name,
        phone: newUser.phone,
        city: newUser.city,
        zone: newUser.zone,
        platforms: newUser.platforms,
        plan: newUser.plan,
        trustScore: 75,
        status: 'active',
        totalClaims: 0,
        totalPaid: 0,
        joinedAt: new Date().toISOString(),
      };
      if (existing >= 0) registeredWorkers[existing] = workerEntry;
      else registeredWorkers.unshift(workerEntry);
      localStorage.setItem('cropInsuranceState', JSON.stringify({ ...state, registeredWorkers }));
      window.dispatchEvent(new CustomEvent('cropStateUpdated'));
    } catch (e) { console.warn('Worker registration error', e); }
    setActivePage('workerDash');
    setScreen('workerApp');
  }, []);

  const handleAdminComplete = useCallback((data) => {
    setAdmin(data);
    setActivePage('adminDash');
    setScreen('adminApp');
  }, []);

  const handleLogout = useCallback(() => {
    setScreen('landing');
    setShowProfile(false);
    showToast('👋 Logged out successfully');
  }, [showToast]);

  const handlePlanChange = useCallback((planId) => {
    setUser(u => ({ ...u, plan: planId }));
    showToast(`✅ Plan switched to ${PLANS.find(p => p.id === planId)?.name}!`);
  }, [showToast]);

  const handleTabChange = useCallback((tabId) => {
    if (tabId === 'profile') {
      setShowProfile(true);
    } else {
      setActivePage(tabId);
      setShowProfile(false);
    }
  }, []);

  // Full-screen screens
  if (screen === 'splash') return <SplashScreen onComplete={() => setScreen('landing')} />;
  if (screen === 'landing') return <LandingPage onSelectRole={(r) => setScreen(r === 'admin' ? 'adminAuth' : 'workerAuth')} />;
  if (screen === 'workerAuth') return <WorkerAuth onComplete={handleWorkerComplete} />;
  if (screen === 'adminAuth') return <AdminAuth onComplete={handleAdminComplete} />;

  // ── Worker App Shell ──
  if (screen === 'workerApp') {
    const renderWorkerPage = () => {
      switch (activePage) {
        case 'workerDash': return <WorkerDashboard user={user} onNavigate={setActivePage} onToast={showToast} />;
        case 'myPolicy': return <MyPolicy user={user} onPlanChange={handlePlanChange} onToast={showToast} />;
        case 'claims': return <Claims user={user} onToast={showToast} />;
        case 'simulation': return <SimulationPanel user={user} onToast={showToast} />;
        default: return <WorkerDashboard user={user} onNavigate={setActivePage} onToast={showToast} />;
      }
    };
    return (
      <div style={{ background: T.bg, minHeight: '100vh', paddingBottom: 70 }}>
        <WorkerTopbar user={user} />
        {renderWorkerPage()}
        <WorkerBottomNav active={activePage} onChange={handleTabChange} />
        {/* Worker Profile Sheet */}
        {showProfile && (
          <WorkerProfileSheet
            user={user}
            onLogout={handleLogout}
            onClose={() => setShowProfile(false)}
          />
        )}
        {toast && (
          <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            <div style={{
              background: T.text, color: '#fff', fontSize: 13, fontWeight: 500,
              padding: '10px 20px', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap', animation: 'fadeUp .3s ease',
            }}>{toast}</div>
          </div>
        )}
      </div>
    );
  }

  // ── Admin App Shell ──
  const renderAdminPage = () => {
    switch (activePage) {
      case 'adminDash': return <AdminDashboard onNavigate={setActivePage} onToast={showToast} />;
      case 'liveMonitor': return <LiveMonitor onToast={showToast} />;
      case 'notifications': return <Notifications onToast={showToast} onUnreadChange={setNotifCount} />;
      case 'workers': return <WorkerManagement onToast={showToast} />;
      case 'payoutLedger': return <PayoutLedger />;
      case 'fraud': return <FraudAlerts onToast={showToast} />;
      case 'zoneRisk': return <ZoneRiskMap />;
      default: return <AdminDashboard onNavigate={setActivePage} onToast={showToast} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} admin={admin} onLogout={handleLogout} notifCount={notifCount} />
      <div style={{ marginLeft: 250, flex: 1, minHeight: '100vh' }}>
        <AdminTopbar title={PAGE_TITLES[activePage] || 'Dashboard'} />
        {renderAdminPage()}
      </div>
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          <div style={{
            background: T.text, color: '#fff', fontSize: 13, fontWeight: 500,
            padding: '10px 20px', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap', animation: 'fadeUp .3s ease',
          }}>{toast}</div>
        </div>
      )}
    </div>
  );
}
