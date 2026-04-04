// ── In-Memory Database ──
// Simulates MongoDB without requiring a real database

import bcrypt from 'bcryptjs';

// ── Helper ──
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

// ── Generate 90-day gig history ──
const generateGigHistory = (workerId, city, zone) => {
  const gigs = [];
  const now = new Date();
  for (let d = 89; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dayOfWeek = date.getDay();

    // Assign day type with correct probabilities
    const r = Math.random();
    let dayType = 'normal';
    if (r < 0.20) dayType = 'rainy';
    else if (r < 0.35) dayType = 'heat'; // 15% (no same day as rain ensured)
    else if (r < 0.40) dayType = 'outage'; // 5%
    // else normal

    let orders, earningsNet;
    if (dayType === 'rainy') { orders = rand(0, 4); earningsNet = rand(50, 200); }
    else if (dayType === 'heat') { orders = rand(3, 8); earningsNet = rand(150, 350); }
    else if (dayType === 'outage') { orders = rand(0, 2); earningsNet = rand(0, 80); }
    else {
      orders = rand(8, 17);
      earningsNet = rand(400, 900);
      // Weekend bump
      if (dayOfWeek === 6 || dayOfWeek === 0) earningsNet = rand(500, 1100);
    }

    gigs.push({
      id: `GIG-${workerId}-${d}`,
      workerId, city, zone,
      date: date.toISOString().split('T')[0],
      dayType, orders, earningsNet,
      peakHours: ['8-9AM', '12-1PM', '7-10PM'].filter(() => Math.random() > 0.5),
      dayOfWeek,
    });
  }
  return gigs;
};

// ── Workers ──
const WORKER_NAMES = [
  'Ravi Kumar', 'Priya Sharma', 'Arjun Mehta', 'Divya Reddy', 'Karan Thakur',
  'Meena Verma', 'Sanjay Bhatt', 'Nisha Patel', 'Rohit Singh', 'Anita Gupta',
];
const CITIES_LIST = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];
const PLATFORMS = [['Swiggy', 'Zomato'], ['Uber', 'Ola'], ['Swiggy'], ['Zomato', 'Blinkit'], ['Zepto', 'Swiggy']];
const ZONES_BY_CITY = {
  Mumbai: ['Kurla', 'Andheri West', 'Bandra', 'Dharavi', 'Borivali'],
  Delhi: ['Yamuna Khadar', 'Lajpat Nagar', 'Dwarka', 'Rohini', 'Saket'],
  Bengaluru: ['Bellandur', 'Koramangala', 'Indiranagar', 'Electronic City', 'HSR Layout'],
  Chennai: ['Velachery', 'Anna Nagar', 'T.Nagar', 'Porur', 'Mylapore'],
  Hyderabad: ['Malkajgiri', 'Banjara Hills', 'Gachibowli', 'Kukatpally', 'Madhapur'],
  Pune: ['Hadapsar', 'Koregaon Park', 'Kothrud', 'Viman Nagar', 'Baner'],
  Kolkata: ['Tiljala', 'Salt Lake', 'Park Street', 'Jadavpur', 'New Town'],
};
const PLANS = ['starter', 'standard', 'pro'];

export const workers = WORKER_NAMES.map((name, i) => {
  const city = CITIES_LIST[i % CITIES_LIST.length];
  const zone = ZONES_BY_CITY[city][i % 5];
  return {
    id: `GW-${1000 + i}`,
    name,
    phone: `9${rand(700000000, 999999999)}`,
    aadhaarLast4: String(rand(1000, 9999)),
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    password: bcrypt.hashSync('worker123', 8),
    city, zone,
    platforms: PLATFORMS[i % PLATFORMS.length],
    plan: PLANS[i % 3],
    activeHours: ['morning', 'afternoon', 'night', 'all'][i % 4],
    trustScore: rand(45, 95),
    policyStart: '2026-01-01',
    policyEnd: '2026-07-01',
    policyId: `GS-POL-2026-${10000 + i}`,
    autoRenew: Math.random() > 0.3,
    upiId: `${name.split(' ')[0].toLowerCase()}@ybl`,
    status: 'active',
    createdAt: new Date(Date.now() - rand(30, 180) * 24 * 60 * 60 * 1000).toISOString(),
  };
});

// Phone-indexed for fast OTP lookup
export const workerByPhone = {};
workers.forEach(w => { workerByPhone[w.phone] = w; });

// ── Gig History ──
export const gigs = [];
workers.forEach(w => {
  gigs.push(...generateGigHistory(w.id, w.city, w.zone));
});

// ── Admins ──
export const admins = [
  {
    id: 'ADMIN-001',
    name: 'Arun Mehta',
    email: 'admin@gigshield.com',
    password: bcrypt.hashSync('admin123', 8),
    role: 'super_admin',
  },
  {
    id: 'ADMIN-002',
    name: 'Divya Reddy',
    email: 'ops@gigshield.com',
    password: bcrypt.hashSync('ops123', 8),
    role: 'ops_admin',
  },
];

// ── Policies ──
export const policies = workers.map((w, i) => ({
  id: `POL-${1000 + i}`,
  workerId: w.id,
  plan: w.plan,
  startDate: w.policyStart,
  endDate: w.policyEnd,
  status: 'active',
  weeklyPremium: { starter: 50, standard: 80, pro: 120 }[w.plan],
  coverageCap: { starter: 1000, standard: 1500, pro: 2500 }[w.plan],
  dailyPayout: { starter: 200, standard: 300, pro: 400 }[w.plan],
}));

// ── Claims ──
export const claims = [
  { id: 'CLM-A01', workerId: 'GW-1000', worker: 'Ravi Kumar', zone: 'Bellandur', city: 'Bengaluru', trigger: 'Heavy Rainfall', amount: 300, status: 'pending', date: '2026-03-20', fraudScore: 0.05 },
  { id: 'CLM-A02', workerId: 'GW-1001', worker: 'Priya Sharma', zone: 'Velachery', city: 'Chennai', trigger: 'Extreme Heat', amount: 250, status: 'pending', date: '2026-03-20', fraudScore: 0.08 },
  { id: 'CLM-A03', workerId: 'GW-1002', worker: 'Arjun Mehta', zone: 'Malkajgiri', city: 'Hyderabad', trigger: 'Platform Outage', amount: 400, status: 'pending', date: '2026-03-19', fraudScore: 0.03 },
  { id: 'CLM-A04', workerId: 'GW-1003', worker: 'Divya Reddy', zone: 'Kurla', city: 'Mumbai', trigger: 'Zone Lockdown', amount: 300, status: 'approved', date: '2026-03-19', fraudScore: 0.02 },
  { id: 'CLM-A05', workerId: 'GW-1004', worker: 'Karan Thakur', zone: 'Yamuna Khadar', city: 'Delhi', trigger: 'Heavy Rainfall', amount: 200, status: 'flagged', date: '2026-03-18', fraudScore: 0.92 },
  { id: 'CLM-A06', workerId: 'GW-1005', worker: 'Meena Verma', zone: 'Hadapsar', city: 'Pune', trigger: 'AQI Emergency', amount: 300, status: 'paid', date: '2026-03-18', fraudScore: 0.04 },
  { id: 'CLM-A07', workerId: 'GW-1006', worker: 'Sanjay Bhatt', zone: 'Tiljala', city: 'Kolkata', trigger: 'Heavy Rainfall', amount: 400, status: 'paid', date: '2026-03-17', fraudScore: 0.06 },
];

// ── Payments ──
export const payments = [
  { id: 'PAY-001', workerId: 'GW-1000', amount: 80, method: 'UPI Autopay', status: 'success', date: '2026-03-20' },
  { id: 'PAY-002', workerId: 'GW-1000', amount: 80, method: 'UPI Autopay', status: 'success', date: '2026-03-13' },
  { id: 'PAY-003', workerId: 'GW-1000', amount: 80, method: 'UPI Manual', status: 'success', date: '2026-03-06' },
  { id: 'PAY-004', workerId: 'GW-1000', amount: 50, method: 'Razorpay', status: 'success', date: '2026-02-27' },
  { id: 'PAY-005', workerId: 'GW-1000', amount: 50, method: 'UPI Autopay', status: 'failed', date: '2026-02-20' },
];

// ── Triggers ──
export const triggers = [
  { id: 'TRG-001', name: 'Heavy Rainfall', city: 'Mumbai', zones: ['Kurla', 'Sion', 'Dharavi'], threshold: { rainfall: 20 }, active: true, firedAt: new Date().toISOString() },
  { id: 'TRG-002', name: 'AQI Emergency', city: 'Delhi', zones: ['Yamuna Khadar', 'Burari'], threshold: { aqi: 200 }, active: true, firedAt: new Date().toISOString() },
  { id: 'TRG-003', name: 'Platform Outage', city: 'Hyderabad', zones: ['All'], threshold: { outageMinutes: 30 }, active: false },
];

// ── OTP Store ──
export const otpStore = {};
export const adminOtpStore = {};
