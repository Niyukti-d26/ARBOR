// ── ARBOR Event Bus (Socket.io simulation) ──
// In production this would use real Socket.io connected to backend
// For demo, uses a simple pub/sub event bus

const listeners = {};

export const eventBus = {
  emit(event, data) {
    console.log(`[ARBOR Socket] emit: ${event}`, data);
    if (listeners[event]) {
      listeners[event].forEach(fn => fn(data));
    }
  },
  on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  },
  off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(l => l !== fn);
  },
};

// ── Socket Event Names ──
export const EVENTS = {
  TRIGGER_FIRED: 'trigger:fired',
  CLAIM_AUTO_APPROVED: 'claim:auto-approved',
  CLAIM_AUTO_REJECTED: 'claim:auto-rejected',
  CLAIM_NEEDS_INPUT: 'claim:needs-admin-input',
  FRAUD_DETECTED: 'fraud:detected',
  PAYOUT_COMPLETED: 'payout:completed',
  ADMIN_DECISION_MADE: 'admin:decision-made',
};
