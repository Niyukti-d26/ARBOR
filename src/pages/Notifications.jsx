import { useState, useEffect } from 'react';
import { T } from '../data/constants';
import { eventBus, EVENTS } from '../utils/eventBus';
import { readState, EVENT_NAME } from '../utils/cropInsuranceState';

// Static seed notifications (only auto-paid and fraud — NO needs-input)
const SEED_NOTIFICATIONS = [
  {
    id: 'N-001',
    type: 'auto-paid',
    title: '₹300 paid to Ravi Kumar',
    detail: 'Heavy Rainfall trigger in Bellandur · Auto-approved by AI · fraudScore: 0.08',
    time: '2 mins ago',
    read: false,
    worker: 'Ravi Kumar',
  },
  {
    id: 'N-002',
    type: 'fraud',
    title: 'Claim REJECTED — Arjun Singh',
    detail: 'GPS Spoofing · Worker location (Andheri) ≠ claimed zone (Bellandur) · 1,392km mismatch',
    time: '5 mins ago',
    read: false,
    worker: 'Arjun Singh',
    fraudScore: 0.92,
  },
  {
    id: 'N-003',
    type: 'auto-paid',
    title: '₹400 paid to Meena Verma',
    detail: 'AQI Emergency trigger in Hadapsar · Auto-approved · fraudScore: 0.11',
    time: '18 mins ago',
    read: true,
    worker: 'Meena Verma',
  },
  {
    id: 'N-004',
    type: 'fraud',
    title: 'Claim REJECTED — Duplicate ID #8821',
    detail: 'Duplicate claim from same device fingerprint · Previous claim filed 23 mins ago · Payment blocked',
    time: '31 mins ago',
    read: true,
    worker: 'Duplicate ID #8821',
    fraudScore: 0.88,
  },
];

const TYPE_CONFIG = {
  'auto-paid': {
    icon: '✅',
    label: 'AUTO-PAID',
    labelColor: '#60B246',
    labelBg: '#EDF7EA',
    border: '#B7DFB0',
    bg: '#FAFFFA',
  },
  'fraud': {
    icon: '🚨',
    label: 'FRAUD BLOCKED',
    labelColor: '#E23744',
    labelBg: '#FEF0F1',
    border: '#FBBBBC',
    bg: '#FFFAFA',
  },
};

function NotificationCard({ notif, onRead }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG['auto-paid'];
  return (
    <div
      onClick={() => !notif.read && onRead(notif.id)}
      style={{
        background: notif.read ? T.white : cfg.bg,
        border: `1.5px solid ${notif.read ? T.border : cfg.border}`,
        borderRadius: 12, padding: '16px 18px', marginBottom: 10,
        transition: 'all .2s', position: 'relative',
        cursor: notif.read ? 'default' : 'pointer',
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          width: 8, height: 8, borderRadius: '50%',
          background: cfg.labelColor, animation: 'pulse 2s infinite',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: cfg.labelBg, flexShrink: 0,
        }}>{cfg.icon}</div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
              color: cfg.labelColor, background: cfg.labelBg,
              padding: '2px 8px', borderRadius: 4,
            }}>{cfg.label}</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>{notif.time}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{notif.title}</div>
          <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5 }}>{notif.detail}</div>

          {/* Fraud score bar */}
          {notif.fraudScore && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: T.textMuted }}>Fraud Score:</span>
              <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${notif.fraudScore * 100}%`,
                  background: notif.fraudScore > 0.7 ? '#E23744' : '#F59E0B',
                  borderRadius: 3, transition: 'width .6s ease',
                }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#E23744' }}>{Math.round(notif.fraudScore * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Notifications({ onToast, onUnreadChange }) {
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  // ── Listen to shared state (cropStateUpdated) — primary source ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      const liveNotifs = (state.notifications || []).map(n => ({
        ...n,
        read: n.read || false,
      }));
      if (liveNotifs.length > 0) {
        setNotifications([...liveNotifs, ...SEED_NOTIFICATIONS]);
      }
    };
    handler();
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  // ── Also listen to legacy eventBus events ──
  useEffect(() => {
    const handleAutoApproved = (data) => {
      const newNotif = {
        id: `N-EB-${Date.now()}`,
        type: 'auto-paid',
        title: `₹${data.amount} paid to ${data.worker}`,
        detail: `${data.trigger} trigger in ${data.zone} · Auto-approved by AI · fraudScore: ${data.fraudScore?.toFixed(2) || '0.09'}`,
        time: 'just now', read: false, worker: data.worker,
      };
      setNotifications(prev => {
        // Deduplicate: don't add if same worker+amount already in top 3
        const alreadyExists = prev.slice(0, 3).some(n => n.type === 'auto-paid' && n.worker === data.worker && n.title.includes(data.amount));
        return alreadyExists ? prev : [newNotif, ...prev];
      });
    };

    const handleFraud = (data) => {
      const newNotif = {
        id: `N-EB-${Date.now()}`,
        type: 'fraud',
        title: `Claim REJECTED — ${data.worker}`,
        detail: `${data.reason || 'Fraud detected'} · Payment blocked`,
        time: 'just now', read: false, worker: data.worker,
        fraudScore: data.fraudScore,
      };
      setNotifications(prev => {
        const alreadyExists = prev.slice(0, 3).some(n => n.type === 'fraud' && n.worker === data.worker);
        return alreadyExists ? prev : [newNotif, ...prev];
      });
    };

    eventBus.on(EVENTS.CLAIM_AUTO_APPROVED, handleAutoApproved);
    eventBus.on(EVENTS.FRAUD_DETECTED, handleFraud);
    eventBus.on(EVENTS.CLAIM_AUTO_REJECTED, handleFraud);

    return () => {
      eventBus.off(EVENTS.CLAIM_AUTO_APPROVED, handleAutoApproved);
      eventBus.off(EVENTS.FRAUD_DETECTED, handleFraud);
      eventBus.off(EVENTS.CLAIM_AUTO_REJECTED, handleFraud);
    };
  }, []);

  // Report unread count up
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    onUnreadChange?.(unread);
  }, [notifications, onUnreadChange]);

  const handleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'auto-paid', label: '✅ Auto-Paid' },
    { id: 'fraud', label: '🚨 Fraud Blocked' },
  ];

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.textMuted }}>
          Real-time AI claim decisions · 100% automated
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{
              background: 'none', border: `1px solid ${T.border}`, borderRadius: 7,
              padding: '6px 14px', fontSize: 12, fontWeight: 600, color: T.textSec,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>Mark all read</button>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#EDF7EA', borderRadius: 6, padding: '4px 10px',
            fontSize: 12, fontWeight: 700, color: '#60B246',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
            Live
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Auto-Approved', value: notifications.filter(n => n.type === 'auto-paid').length, color: '#60B246', bg: '#EDF7EA' },
          { label: 'Fraud Blocked', value: notifications.filter(n => n.type === 'fraud').length, color: '#E23744', bg: '#FEF0F1' },
          { label: 'Unread', value: unreadCount, color: T.primary, bg: '#FFF5F0' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${filter === f.id ? T.primary : T.border}`,
            background: filter === f.id ? '#FFF5F0' : T.white,
            color: filter === f.id ? T.primary : T.textSec,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s',
          }}>{f.label}</button>
        ))}
      </div>

      {/* AI Automation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF5F0, #FFFBEB)',
        border: '1px solid #FFD5C2', borderRadius: 10,
        padding: '12px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ fontSize: 24 }}>🤖</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>AI Handles 100% of Claims Automatically</div>
          <div style={{ fontSize: 12, color: T.textSec }}>
            No human input needed. Every claim is approved or rejected by the ML fraud model instantly.
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: T.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No notifications yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Trigger a simulation to see live updates here</div>
        </div>
      ) : (
        filtered.map(notif => (
          <NotificationCard key={notif.id} notif={notif} onRead={handleRead} />
        ))
      )}
    </div>
  );
}
