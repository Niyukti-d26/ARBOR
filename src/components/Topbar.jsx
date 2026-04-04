import { T } from '../data/constants';

export default function Topbar({ title, user }) {
  return (
    <div className="topbar">
      <h1 className="page-title">{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="status-pill">
          <div className="pulse-dot" />
          All Systems Live
        </div>
        <button className="notif-btn" title="Notifications">
          🔔
          <span style={{
            position: 'absolute', top: -2, right: -2, width: 16, height: 16,
            borderRadius: '50%', background: T.red, color: 'white',
            fontSize: 9, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>3</span>
        </button>
      </div>
    </div>
  );
}
