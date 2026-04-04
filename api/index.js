import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ── In-Memory Database (from mockData.js) ──
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateGigHistory = (workerId, city, zone) => {
  const gigs = [];
  const now = new Date();
  for (let d = 89; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dayOfWeek = date.getDay();
    const r = Math.random();
    let dayType = 'normal';
    if (r < 0.20) dayType = 'rainy';
    else if (r < 0.35) dayType = 'heat';
    else if (r < 0.40) dayType = 'outage';
    let orders, earningsNet;
    if (dayType === 'rainy') { orders = rand(0, 4); earningsNet = rand(50, 200); }
    else if (dayType === 'heat') { orders = rand(3, 8); earningsNet = rand(150, 350); }
    else if (dayType === 'outage') { orders = rand(0, 2); earningsNet = rand(0, 80); }
    else {
      orders = rand(8, 17);
      earningsNet = rand(400, 900);
      if (dayOfWeek === 6 || dayOfWeek === 0) earningsNet = rand(500, 1100);
    }
    gigs.push({
      id: `GIG-${workerId}-${d}`, workerId, city, zone,
      date: date.toISOString().split('T')[0],
      dayType, orders, earningsNet,
      peakHours: ['8-9AM', '12-1PM', '7-10PM'].filter(() => Math.random() > 0.5),
      dayOfWeek,
    });
  }
  return gigs;
};

const WORKER_NAMES = ['Ravi Kumar', 'Priya Sharma', 'Arjun Mehta', 'Divya Reddy', 'Karan Thakur', 'Meena Verma', 'Sanjay Bhatt', 'Nisha Patel', 'Rohit Singh', 'Anita Gupta'];
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

const workers = WORKER_NAMES.map((name, i) => {
  const city = CITIES_LIST[i % CITIES_LIST.length];
  const zone = ZONES_BY_CITY[city][i % 5];
  return {
    id: `GW-${1000 + i}`, name,
    phone: `9${rand(700000000, 999999999)}`,
    aadhaarLast4: String(rand(1000, 9999)),
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    password: bcrypt.hashSync('worker123', 8),
    city, zone,
    platforms: PLATFORMS[i % PLATFORMS.length],
    plan: PLANS[i % 3],
    activeHours: ['morning', 'afternoon', 'night', 'all'][i % 4],
    trustScore: rand(45, 95),
    policyStart: '2026-01-01', policyEnd: '2026-07-01',
    policyId: `GS-POL-2026-${10000 + i}`,
    autoRenew: Math.random() > 0.3,
    upiId: `${name.split(' ')[0].toLowerCase()}@ybl`,
    status: 'active',
    createdAt: new Date(Date.now() - rand(30, 180) * 24 * 60 * 60 * 1000).toISOString(),
  };
});

const gigs = [];
workers.forEach(w => { gigs.push(...generateGigHistory(w.id, w.city, w.zone)); });

const admins = [
  { id: 'ADMIN-001', name: 'Arun Mehta', email: 'admin@gigshield.com', password: bcrypt.hashSync('admin123', 8), role: 'super_admin' },
  { id: 'ADMIN-002', name: 'Divya Reddy', email: 'ops@gigshield.com', password: bcrypt.hashSync('ops123', 8), role: 'ops_admin' },
];

const policies = workers.map((w, i) => ({
  id: `POL-${1000 + i}`, workerId: w.id, plan: w.plan,
  startDate: w.policyStart, endDate: w.policyEnd, status: 'active',
  weeklyPremium: { starter: 50, standard: 80, pro: 120 }[w.plan],
  coverageCap: { starter: 1000, standard: 1500, pro: 2500 }[w.plan],
  dailyPayout: { starter: 200, standard: 300, pro: 400 }[w.plan],
}));

const claims = [
  { id: 'CLM-A01', workerId: 'GW-1000', worker: 'Ravi Kumar', zone: 'Bellandur', city: 'Bengaluru', trigger: 'Heavy Rainfall', amount: 300, status: 'pending', date: '2026-03-20', fraudScore: 0.05 },
  { id: 'CLM-A02', workerId: 'GW-1001', worker: 'Priya Sharma', zone: 'Velachery', city: 'Chennai', trigger: 'Extreme Heat', amount: 250, status: 'pending', date: '2026-03-20', fraudScore: 0.08 },
  { id: 'CLM-A03', workerId: 'GW-1002', worker: 'Arjun Mehta', zone: 'Malkajgiri', city: 'Hyderabad', trigger: 'Platform Outage', amount: 400, status: 'pending', date: '2026-03-19', fraudScore: 0.03 },
  { id: 'CLM-A04', workerId: 'GW-1003', worker: 'Divya Reddy', zone: 'Kurla', city: 'Mumbai', trigger: 'Zone Lockdown', amount: 300, status: 'approved', date: '2026-03-19', fraudScore: 0.02 },
  { id: 'CLM-A05', workerId: 'GW-1004', worker: 'Karan Thakur', zone: 'Yamuna Khadar', city: 'Delhi', trigger: 'Heavy Rainfall', amount: 200, status: 'flagged', date: '2026-03-18', fraudScore: 0.92 },
  { id: 'CLM-A06', workerId: 'GW-1005', worker: 'Meena Verma', zone: 'Hadapsar', city: 'Pune', trigger: 'AQI Emergency', amount: 300, status: 'paid', date: '2026-03-18', fraudScore: 0.04 },
  { id: 'CLM-A07', workerId: 'GW-1006', worker: 'Sanjay Bhatt', zone: 'Tiljala', city: 'Kolkata', trigger: 'Heavy Rainfall', amount: 400, status: 'paid', date: '2026-03-17', fraudScore: 0.06 },
];

const payments = [
  { id: 'PAY-001', workerId: 'GW-1000', amount: 80, method: 'UPI Autopay', status: 'success', date: '2026-03-20' },
  { id: 'PAY-002', workerId: 'GW-1000', amount: 80, method: 'UPI Autopay', status: 'success', date: '2026-03-13' },
  { id: 'PAY-003', workerId: 'GW-1000', amount: 80, method: 'UPI Manual', status: 'success', date: '2026-03-06' },
  { id: 'PAY-004', workerId: 'GW-1000', amount: 50, method: 'Razorpay', status: 'success', date: '2026-02-27' },
  { id: 'PAY-005', workerId: 'GW-1000', amount: 50, method: 'UPI Autopay', status: 'failed', date: '2026-02-20' },
];

const triggers = [
  { id: 'TRG-001', name: 'Heavy Rainfall', city: 'Mumbai', zones: ['Kurla', 'Sion', 'Dharavi'], threshold: { rainfall: 20 }, active: true, firedAt: new Date().toISOString() },
  { id: 'TRG-002', name: 'AQI Emergency', city: 'Delhi', zones: ['Yamuna Khadar', 'Burari'], threshold: { aqi: 200 }, active: true, firedAt: new Date().toISOString() },
  { id: 'TRG-003', name: 'Platform Outage', city: 'Hyderabad', zones: ['All'], threshold: { outageMinutes: 30 }, active: false },
];

const otpStore = {};
const adminOtpStore = {};
const ADMIN_PASSWORDS = { 'admin@gigshield.com': 'admin123', 'ops@gigshield.com': 'ops123' };

// ── Express App ──
const app = express();
app.use(cors());
app.use(express.json());

// ── Health ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', server: 'GigShield API', version: '1.0.0' }));

// ── Auth Routes ──
app.post('/api/auth/worker/send-otp', (req, res) => {
  const { phone, aadhaarLast4 } = req.body;
  if (!phone || !aadhaarLast4) return res.status(400).json({ error: 'Phone and Aadhaar required' });
  const worker = workers.find(w => w.phone === phone);
  if (!worker || worker.aadhaarLast4 !== aadhaarLast4) return res.status(401).json({ error: 'Phone and Aadhaar do not match our records' });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  console.log(`[GigShield OTP] Phone: ${phone}  OTP: ${otp}`);
  res.json({ success: true, message: 'OTP sent — check server console' });
});

app.post('/api/auth/worker/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const stored = otpStore[phone];
  if (!stored || stored.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
  if (Date.now() > stored.expiresAt) return res.status(401).json({ error: 'OTP expired' });
  const worker = workers.find(w => w.phone === phone);
  delete otpStore[phone];
  const token = jwt.sign({ workerId: worker.id, phone }, process.env.JWT_SECRET || 'gigshield_secret', { expiresIn: '7d' });
  res.json({ token, worker: { id: worker.id, name: worker.name, phone: worker.phone, plan: worker.plan, city: worker.city, zone: worker.zone } });
});

app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  const key = email?.toLowerCase();
  const admin = admins.find(a => a.email === key);
  if (!admin || ADMIN_PASSWORDS[key] !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  adminOtpStore[key] = { otp, expiresAt: Date.now() + 5 * 60 * 1000, adminId: admin.id };
  console.log(`[GigShield Admin 2FA] Email: ${email}  OTP: ${otp}`);
  res.json({ success: true, message: '2FA OTP sent — check server console' });
});

app.post('/api/auth/admin/verify-2fa', (req, res) => {
  const { email, otp } = req.body;
  const key = email?.toLowerCase();
  const stored = adminOtpStore[key];
  if (!stored || stored.otp !== otp) return res.status(401).json({ error: 'Invalid 2FA code' });
  if (Date.now() > stored.expiresAt) return res.status(401).json({ error: '2FA code expired' });
  const admin = admins.find(a => a.email === key);
  delete adminOtpStore[key];
  const token = jwt.sign({ adminId: admin.id, email: key, role: admin.role }, process.env.JWT_ADMIN_SECRET || 'gigshield_admin_secret', { expiresIn: '12h' });
  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
});

// ── Worker Routes ──
app.get('/api/worker/profile', (req, res) => res.json(workers[0]));
app.put('/api/worker/profile', (req, res) => { Object.assign(workers[0], req.body); res.json(workers[0]); });

app.get('/api/worker/income/daily-avg', (req, res) => {
  const workerId = workers[0].id;
  const workerGigs = gigs.filter(g => g.workerId === workerId);
  const last30 = workerGigs.slice(-30);
  const normal = last30.filter(g => g.dayType === 'normal');
  const disrupted = last30.filter(g => g.dayType !== 'normal');
  const avg = arr => arr.length ? Math.round(arr.reduce((s, g) => s + g.earningsNet, 0) / arr.length) : 0;
  const baseline = avg(normal) || 650;
  const disruptedAvg = avg(disrupted) || 180;
  const dropPercent = Math.round((baseline - disruptedAvg) / baseline * 100);
  const riskMultiplier = dropPercent > 60 ? 1.4 : dropPercent > 40 ? 1.2 : 1.0;
  res.json({ baseline, disruptedAvg, dropPercent, weeklyEarnings: baseline * 7, monthlyEarnings: baseline * 30, riskMultiplier, normalDays: normal.length, disruptedDays: disrupted.length });
});

app.get('/api/worker/income/history', (req, res) => {
  const workerId = workers[0].id;
  res.json(gigs.filter(g => g.workerId === workerId).slice(-30));
});

// ── Claims Routes ──
app.get('/api/claims', (req, res) => {
  const workerId = workers[0].id;
  res.json(claims.filter(c => c.workerId === workerId));
});

app.post('/api/claims/initiate', (req, res) => {
  const { trigger, zone } = req.body;
  const newClaim = {
    id: `CLM-${Date.now()}`, workerId: workers[0].id, worker: workers[0].name,
    zone: zone || workers[0].zone, city: workers[0].city, trigger,
    amount: { starter: 200, standard: 300, pro: 400 }[workers[0].plan] || 300,
    status: 'pending', date: new Date().toISOString().split('T')[0], fraudScore: Math.random() * 0.15,
  };
  claims.unshift(newClaim);
  // Note: setTimeout won't persist across serverless invocations but works for demo
  res.json(newClaim);
});

app.get('/api/claims/:id/status', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  res.json({ id: claim.id, status: claim.status, amount: claim.amount });
});

// ── Policy Routes ──
app.get('/api/policy/active', (req, res) => {
  const policy = policies.find(p => p.workerId === workers[0].id);
  res.json(policy);
});

app.post('/api/policy/upgrade', (req, res) => {
  const { plan } = req.body;
  const policy = policies.find(p => p.workerId === workers[0].id);
  if (policy) {
    policy.plan = plan;
    policy.weeklyPremium = { starter: 50, standard: 80, pro: 120 }[plan];
    policy.coverageCap = { starter: 1000, standard: 1500, pro: 2500 }[plan];
    policy.dailyPayout = { starter: 200, standard: 300, pro: 400 }[plan];
    workers[0].plan = plan;
  }
  res.json({ success: true, policy });
});

app.get('/api/policy/history', (req, res) => res.json(policies.filter(p => p.workerId === workers[0].id)));
app.get('/api/policy/payments/history', (req, res) => res.json(payments.filter(p => p.workerId === workers[0].id)));

app.post('/api/policy/payments/premium', (req, res) => {
  const newPayment = {
    id: `PAY-${Date.now()}`, workerId: workers[0].id,
    amount: { starter: 50, standard: 80, pro: 120 }[workers[0].plan] || 80,
    method: 'UPI', status: 'success', date: new Date().toISOString().split('T')[0],
  };
  payments.unshift(newPayment);
  res.json(newPayment);
});

// ── Payments Routes ──
app.post('/api/payments/premium', (req, res) => {
  const newPayment = {
    id: `PAY-${Date.now()}`, workerId: workers[0].id,
    amount: { starter: 50, standard: 80, pro: 120 }[workers[0].plan] || 80,
    method: req.body.method || 'UPI', status: 'success', date: new Date().toISOString().split('T')[0],
  };
  payments.unshift(newPayment);
  res.json(newPayment);
});

app.get('/api/payments/history', (req, res) => res.json(payments.filter(p => p.workerId === workers[0].id)));

// ── Trigger Routes ──
app.post('/api/triggers/simulate', (req, res) => {
  const { triggerType, city, zone } = req.body;
  const month = new Date().getMonth();
  const isMonsoon = month >= 5 && month <= 8;
  const isSummer = month >= 2 && month <= 4;
  if (isMonsoon && triggerType === 'Extreme Heat') return res.status(400).json({ error: 'Heat trigger disabled during monsoon season' });
  if (isSummer && triggerType === 'Heavy Rainfall') return res.status(400).json({ error: 'Rain trigger disabled during summer season' });
  const claim = {
    id: `CLM-SIM-${Date.now()}`, workerId: workers[0].id, worker: workers[0].name,
    trigger: triggerType, zone: zone || workers[0].zone, city: city || workers[0].city,
    amount: { starter: 200, standard: 300, pro: 400 }[workers[0].plan] || 300,
    status: 'detected', fraudScore: 0.02, date: new Date().toISOString().split('T')[0], isSimulation: true,
  };
  claims.unshift(claim);
  res.json({ success: true, claim });
});

app.get('/api/triggers/log', (req, res) => res.json(triggers));

// ── Admin Routes ──
app.get('/api/admin/stats', (req, res) => {
  res.json({
    activeWorkers: workers.filter(w => w.status === 'active').length,
    premiumsCollected: payments.reduce((s, p) => s + (p.status === 'success' ? p.amount : 0), 0),
    payoutsToday: claims.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0),
    pendingClaims: claims.filter(c => c.status === 'pending').length,
  });
});

app.get('/api/admin/workers', (req, res) => res.json(workers));

app.get('/api/admin/claims/queue', (req, res) => res.json(claims));

app.put('/api/admin/claims/:id/approve', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  claim.status = 'approved';
  res.json({ success: true, claim });
});

app.put('/api/admin/claims/:id/reject', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  claim.status = 'rejected';
  res.json({ success: true, claim });
});

app.get('/api/admin/payouts', (req, res) => res.json(claims.filter(c => c.status === 'paid')));

app.get('/api/admin/fraud-alerts', (req, res) => {
  const flagged = claims.filter(c => c.fraudScore > 0.5);
  res.json(flagged.map(c => ({ ...c, fraudProbability: c.fraudScore, level: c.fraudScore > 0.8 ? 'high' : 'medium' })));
});

// ── ML Routes ──
function predictIncome({ zone, weather, platform, hour, dayOfWeek, season }) {
  let base = 650;
  if (weather === 'rainy') base *= 0.28;
  else if (weather === 'heat') base *= 0.52;
  else if (weather === 'outage') base *= 0.15;
  const peakHours = [8, 9, 12, 13, 19, 20, 21];
  if (peakHours.includes(hour)) base *= 1.35;
  if (dayOfWeek === 0 || dayOfWeek === 6) base *= 1.2;
  if (season === 'monsoon') base *= 0.85;
  else if (season === 'summer') base *= 0.9;
  return Math.round(base);
}

app.post('/api/ml/predict-income', (req, res) => {
  const { zone, weather, platform, hour, dayOfWeek, season } = req.body;
  const predicted = predictIncome({ zone, weather: weather || 'clear', platform, hour: hour || 12, dayOfWeek: dayOfWeek || 1, season: season || 'other' });
  res.json({
    predictedEarnings: predicted, confidence: 0.87 + Math.random() * 0.1,
    factors: { weather: weather || 'clear', hour: hour || 12, dayType: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday' },
  });
});

app.post('/api/ml/check-fraud', (req, res) => {
  const { gpsMatch = true, claimCount = 1, hasGigActivity = true, claimsPerMinute = 1 } = req.body;
  let score = 0;
  if (!gpsMatch) score += 0.5;
  if (claimsPerMinute >= 3) score += 0.35;
  if (!hasGigActivity) score += 0.25;
  if (claimCount > 10) score += 0.15;
  score = Math.min(1, score);
  res.json({
    fraudProbability: score, isFlagged: score > 0.6,
    level: score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low',
    reasons: [!gpsMatch && 'GPS location does not match registered zone', claimsPerMinute >= 3 && '3+ workers claiming same trigger same minute', !hasGigActivity && 'No gig activity recorded on this day'].filter(Boolean),
  });
});

app.get('/api/ml/trust-score/:workerId', (req, res) => {
  const worker = workers.find(w => w.id === req.params.workerId);
  const score = worker ? worker.trustScore : 50;
  res.json({
    workerId: req.params.workerId, trustScore: score,
    level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
    breakdown: { legitimateClaims: Math.floor(score / 5), onTimePayments: Math.floor(score / 2), monthsActive: Math.floor(score / 10) },
  });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
