import { T } from '../data/constants';

const TABS = [
  { id: 'dashboard', icon: '📊', label: 'Home' },
  { id: 'claims',    icon: '⚡', label: 'Claims' },
  { id: 'premium',   icon: '💰', label: 'Premium' },
  { id: 'policy',    icon: '📑', label: 'Policy' },
  { id: 'payment',   icon: '💳', label: 'Pay' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {TABS.map(tab => (
          <button key={tab.id}
            className={`bottom-nav-tab ${active === tab.id ? 'active' : ''}`}
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
