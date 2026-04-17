import { T } from '../data/constants';
import { Dashboard, Zap, Money, FileText } from './Icons';

const TABS = [
  { id: 'dashboard', icon: <Dashboard size={20} />, label: 'Home' },
  { id: 'claims',    icon: <Zap size={20} />, label: 'Claims' },
  { id: 'premium',   icon: <Money size={20} />, label: 'Premium' },
  { id: 'policy',    icon: <FileText size={20} />, label: 'Policy' },
  { id: 'payment',   icon: <FileText size={20} />, label: 'Pay' },
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
