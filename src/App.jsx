import { useState, useEffect, useCallback } from 'react';
import { T, PLANS, DEFAULT_USER } from './data/constants';

// Auth Pages
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import WorkerAuth from './pages/WorkerAuth';
import AdminAuth from './pages/AdminAuth';

// Worker Pages
import WorkerDashboard from './pages/WorkerDashboard';
import MyPolicy from './pages/MyPolicy';
import PremiumPayment from './pages/PremiumPayment';
import PremiumCalculator from './pages/PremiumCalculator';
import Claims from './pages/Claims';
import SimulationPanel from './pages/SimulationPanel';
import TriggerEngine from './pages/TriggerEngine';
import LiveMonitor from './pages/LiveMonitor';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ClaimsQueue from './pages/ClaimsQueue';
import WorkerManagement from './pages/WorkerManagement';
import PayoutLedger from './pages/PayoutLedger';
import ZoneRiskMap from './pages/ZoneRiskMap';
import FraudAlerts from './pages/FraudAlerts';
import MLModels from './pages/MLModels';

const WORKER_NAV = [
  { section: 'Overview', items: [
    { id: 'workerDash', icon: '📊', label: 'Dashboard' },
    { id: 'simulation', icon: '⚡', label: 'Simulator', badge: 'DEMO' },
    { id: 'liveMonitor', icon: '🌦️', label: 'Live Monitor', badge: 'LIVE' },
  ]},
  { section: 'My Coverage', items: [
    { id: 'myPolicy', icon: '📑', label: 'My Policy' },
    { id: 'payment', icon: '💳', label: 'Pay Premium' },
    { id: 'premium', icon: '💰', label: 'Premium Calc' },
    { id: 'claims', icon: '📋', label: 'Claims' },
  ]},
  { section: 'Intelligence', items: [
    { id: 'triggers', icon: '🔗', label: 'Trigger Engine' },
  ]},
];

const ADMIN_NAV = [
  { section: 'Overview', items: [
    { id: 'adminDash', icon: '📊', label: 'Dashboard' },
    { id: 'liveMonitor', icon: '🌦️', label: 'Live Monitor', badge: 'LIVE' },
  ]},
  { section: 'Operations', items: [
    { id: 'claimsQueue', icon: '📋', label: 'Claims Queue' },
    { id: 'workers', icon: '👥', label: 'Workers' },
    { id: 'payoutLedger', icon: '💸', label: 'Payout Ledger' },
  ]},
  { section: 'Risk', items: [
    { id: 'zoneRisk', icon: '🗺️', label: 'Zone Risk Map' },
    { id: 'fraud', icon: '🚨', label: 'Fraud Alerts' },
    { id: 'mlModels', icon: '🤖', label: 'ML Models' },
    { id: 'triggers', icon: '🔗', label: 'Trigger Engine' },
  ]},
];

const PAGE_TITLES = {
  workerDash: 'Dashboard', simulation: 'Simulation Panel', liveMonitor: 'Live Monitor',
  myPolicy: 'My Policy', payment: 'Pay Premium', premium: 'Premium Calculator',
  claims: 'Claims', triggers: 'Trigger Engine',
  adminDash: 'Admin Dashboard', claimsQueue: 'Claims Queue', workers: 'Worker Management',
  payoutLedger: 'Payout Ledger', zoneRisk: 'Zone Risk Map', fraud: 'Fraud Alerts', mlModels: 'ML Models',
};

function Sidebar({ role, activePage, onNavigate, user, onLogout }) {
  const nav = role === 'admin' ? ADMIN_NAV : WORKER_NAV;
  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: role === 'admin' ? 'linear-gradient(135deg,#1E293B,#475569)' : `linear-gradient(135deg,${T.orange},#FF8C5A)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white'
          }}>🛡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Gig<span style={{ color: role === 'admin' ? '#475569' : T.orange }}>Shield</span>
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: .5 }}>
              {role === 'admin' ? 'Admin Console' : 'Income Protection'}
            </div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <div key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="nav-badge" style={{
                    background: item.badge === 'LIVE' ? T.green : item.badge === 'DEMO' ? T.orange : T.blue
                  }}>{item.badge}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ background: T.bg, borderRadius: 12, padding: 14, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: role === 'admin' ? 'linear-gradient(135deg,#1E293B,#475569)' : `linear-gradient(135deg,${T.orange},#FF8C5A)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 15, color: 'white', flexShrink: 0
            }}>{(user?.name || 'U')[0]}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>
                {role === 'admin' ? 'Platform Admin' : `${plan.name} Plan`}
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: '100%', padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`,
            background: 'transparent', color: T.textSec, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif"
          }}>🚪 Logout</button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title }) {
  return (
    <div className="topbar">
      <h1 className="page-title">{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="status-pill">
          <div className="pulse-dot" />
          All Systems Live
        </div>
      </div>
    </div>
  );
}

function BottomNav({ role, active, onChange }) {
  const tabs = role === 'admin'
    ? [{ id: 'adminDash', icon: '📊', label: 'Home' }, { id: 'claimsQueue', icon: '📋', label: 'Claims' }, { id: 'workers', icon: '👥', label: 'Workers' }, { id: 'fraud', icon: '🚨', label: 'Fraud' }]
    : [{ id: 'workerDash', icon: '📊', label: 'Home' }, { id: 'simulation', icon: '⚡', label: 'Simulate' }, { id: 'myPolicy', icon: '📑', label: 'Policy' }, { id: 'payment', icon: '💳', label: 'Pay' }, { id: 'claims', icon: '📋', label: 'Claims' }];
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {tabs.map(tab => (
          <button key={tab.id} className={`bottom-nav-tab ${active === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
            {active === tab.id && <div className="tab-indicator" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('splash'); // splash | landing | workerAuth | adminAuth | workerApp | adminApp
  const [activePage, setActivePage] = useState('workerDash');
  const [user, setUser] = useState(DEFAULT_USER);
  const [admin, setAdmin] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSplashDone = useCallback(() => setScreen('landing'), []);

  const handleSelectRole = useCallback((role) => {
    setScreen(role === 'admin' ? 'adminAuth' : 'workerAuth');
  }, []);

  const handleWorkerComplete = useCallback((data) => {
    setUser(u => ({ ...u, ...data }));
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
    showToast('👋 Logged out successfully');
  }, [showToast]);

  const handlePlanChange = useCallback((planId) => {
    setUser(u => ({ ...u, plan: planId }));
    showToast(`✅ Plan switched to ${PLANS.find(p => p.id === planId)?.name}!`);
  }, [showToast]);

  // ── Full-screen pages ──
  if (screen === 'splash') return <SplashScreen onComplete={handleSplashDone} />;
  if (screen === 'landing') return <LandingPage onSelectRole={handleSelectRole} />;
  if (screen === 'workerAuth') return <WorkerAuth onComplete={handleWorkerComplete} />;
  if (screen === 'adminAuth') return <AdminAuth onComplete={handleAdminComplete} />;

  // ── App shells ──
  const role = screen === 'adminApp' ? 'admin' : 'worker';

  const renderPage = () => {
    switch (activePage) {
      // Worker pages
      case 'workerDash': return <WorkerDashboard user={user} onNavigate={setActivePage} />;
      case 'simulation': return <SimulationPanel user={user} onToast={showToast} />;
      case 'liveMonitor': return <LiveMonitor onToast={showToast} />;
      case 'myPolicy': return <MyPolicy user={user} onPlanChange={handlePlanChange} onToast={showToast} />;
      case 'payment': return <PremiumPayment user={user} onToast={showToast} />;
      case 'premium': return <PremiumCalculator user={user} />;
      case 'claims': return <Claims user={user} onToast={showToast} />;
      case 'triggers': return <TriggerEngine onToast={showToast} />;
      // Admin pages
      case 'adminDash': return <AdminDashboard onNavigate={setActivePage} onToast={showToast} />;
      case 'claimsQueue': return <ClaimsQueue onToast={showToast} />;
      case 'workers': return <WorkerManagement onToast={showToast} />;
      case 'payoutLedger': return <PayoutLedger />;
      case 'zoneRisk': return <ZoneRiskMap />;
      case 'fraud': return <FraudAlerts onToast={showToast} />;
      case 'mlModels': return <MLModels />;
      default: return role === 'admin' ? <AdminDashboard onNavigate={setActivePage} onToast={showToast} /> : <WorkerDashboard user={user} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar role={role} activePage={activePage} onNavigate={setActivePage}
        user={role === 'admin' ? admin : user} onLogout={handleLogout} />
      <div className="main-content" style={{ marginLeft: 260 }}>
        <Topbar title={PAGE_TITLES[activePage] || 'Dashboard'} />
        {renderPage()}
      </div>
      <BottomNav role={role} active={activePage} onChange={setActivePage} />
      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
