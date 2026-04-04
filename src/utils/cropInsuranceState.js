// ── ARBOR Shared State Utility ──
// All components read/write through this module.
// Backed by localStorage key: 'cropInsuranceState'
// Every write dispatches a custom window event: cropStateUpdated

const STORAGE_KEY = 'cropInsuranceState';
const EVENT_NAME  = 'cropStateUpdated';

/** Default shape */
const DEFAULT_STATE = {
  claims: [],
  payouts: [],        // live payouts → PayoutLedger
  fraudEvents: [],    // live fraud alerts → FraudAlerts + AdminDashboard
  notifications: [],  // live notifications → admin Notifications tab
  payments: [],       // worker premium payments → MyPolicy Last 5 Payments
  lastEvent: null,
  currentPremium: 100,
  droughtIndex: 72,
  zoneRisk: 'HIGH',
  totalClaimsPaid: 0,
  totalAmountPaid: 0,
};

/** Read the whole state object (merges with defaults) */
export function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/**
 * Merge partial updates into state, then persist & dispatch event.
 * @param {Partial<typeof DEFAULT_STATE>} updates
 */
export function writeState(updates) {
  const current = readState();
  const next = { ...current, ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('[cropInsuranceState] write error', e);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
  return next;
}

/** Reset to defaults */
export function resetState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_STATE }));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/**
 * Add a payout to the shared ledger.
 * Called by SimulationPanel/Claims when a claim is paid.
 */
export function addPayout({ worker, amount, trigger, zone, method = 'UPI' }) {
  const state = readState();
  const newPayout = {
    id: `PO-LIVE-${Date.now()}`,
    worker,
    amount,
    trigger,
    zone,
    method,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: new Date().toISOString(),
  };
  writeState({ payouts: [newPayout, ...(state.payouts || [])] });
  return newPayout;
}

/**
 * Add a fraud event to shared state.
 * Called by SimulationPanel / Claims when fraud is detected.
 */
export function addFraudEvent({ worker, reason, fraudScore, fraudLabel, zone }) {
  const state = readState();
  const newFraud = {
    id: `FR-LIVE-${Date.now()}`,
    worker,
    reason,
    score: Math.round((fraudScore || 0.9) * 100),
    fraudLabel,
    zone: zone || 'Unknown',
    level: (fraudScore || 0.9) > 0.8 ? 'high' : (fraudScore || 0.9) > 0.5 ? 'medium' : 'low',
    date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    isLive: true,
  };
  writeState({ fraudEvents: [newFraud, ...(state.fraudEvents || [])] });
  return newFraud;
}

/**
 * Add a notification to shared state.
 * Called by SimulationPanel/Claims for every AI decision.
 */
export function addNotification({ type, title, detail, worker, fraudScore, amount }) {
  const state = readState();
  const newNotif = {
    id: `N-LIVE-${Date.now()}`,
    type, // 'auto-paid' | 'fraud'
    title,
    detail,
    worker,
    fraudScore,
    amount,
    time: 'just now',
    read: false,
    timestamp: new Date().toISOString(),
  };
  writeState({ notifications: [newNotif, ...(state.notifications || [])] });
  return newNotif;
}

/**
 * Add a premium payment (Razorpay) to shared state → MyPolicy Last 5 Payments.
 */
export function addPayment({ amount, method, paymentId }) {
  const state = readState();
  const newPayment = {
    id: paymentId || `PAY-${Date.now()}`,
    amount,
    method: method || 'Razorpay · UPI',
    status: 'success',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: new Date().toISOString(),
  };
  const existing = state.payments || [];
  writeState({ payments: [newPayment, ...existing].slice(0, 5) }); // keep latest 5
  return newPayment;
}

export { EVENT_NAME, STORAGE_KEY };
