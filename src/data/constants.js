// ── Design Tokens (Swiggy-inspired) ──
export const T = {
  primary: '#FF5200',
  primaryHover: '#E64800',
  bg: '#FAFAFA',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textSec: '#686B78',
  textMuted: '#93959F',
  border: '#F0F0F0',
  borderDark: '#E0E0E0',
  success: '#60B246',
  successLight: '#EDF7EA',
  danger: '#E23744',
  dangerLight: '#FEF0F1',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  purple: '#7C3AED',
  shadow: '0 2px 8px rgba(0,0,0,0.08)',
};

// ── City Zones ──
export const CITY_ZONES = {
  Bengaluru: [
    { name: 'Bellandur', flood: true }, { name: 'Varthur', flood: true },
    { name: 'Mahadevapura', flood: true }, { name: 'HSR Layout', flood: true },
    { name: 'Koramangala', flood: true }, { name: 'Electronic City', flood: true },
    { name: 'Indiranagar', flood: false }, { name: 'Whitefield', flood: false },
    { name: 'Jayanagar', flood: false }, { name: 'Marathahalli', flood: false },
    { name: 'Rajajinagar', flood: false }, { name: 'BTM Layout', flood: false },
  ],
  Mumbai: [
    { name: 'Kurla', flood: true }, { name: 'Sion', flood: true },
    { name: 'Dharavi', flood: true }, { name: 'Wadala', flood: true },
    { name: 'Chembur', flood: true }, { name: 'Govandi', flood: true },
    { name: 'Bandra', flood: false }, { name: 'Andheri West', flood: false },
    { name: 'Borivali', flood: false }, { name: 'Dadar', flood: false },
    { name: 'Malad', flood: false }, { name: 'Thane', flood: false },
  ],
  Chennai: [
    { name: 'Velachery', flood: true }, { name: 'Tambaram', flood: true },
    { name: 'Pallikaranai', flood: true }, { name: 'Perungudi', flood: true },
    { name: 'Adyar', flood: true }, { name: 'Thiruvanmiyur', flood: true },
    { name: 'Anna Nagar', flood: false }, { name: 'T.Nagar', flood: false },
    { name: 'Mylapore', flood: false }, { name: 'Porur', flood: false },
    { name: 'Nungambakkam', flood: false }, { name: 'Chromepet', flood: false },
  ],
  Delhi: [
    { name: 'Yamuna Khadar', flood: true }, { name: 'Burari', flood: true },
    { name: 'Mustafabad', flood: true }, { name: 'Gokulpuri', flood: true },
    { name: 'Usmanpur', flood: true }, { name: 'Bhalaswa', flood: true },
    { name: 'Lajpat Nagar', flood: false }, { name: 'Dwarka', flood: false },
    { name: 'Rohini', flood: false }, { name: 'Saket', flood: false },
    { name: 'Karol Bagh', flood: false }, { name: 'Janakpuri', flood: false },
  ],
  Hyderabad: [
    { name: 'Malkajgiri', flood: true }, { name: 'Saroornagar', flood: true },
    { name: 'Nagole', flood: true }, { name: 'LB Nagar', flood: true },
    { name: 'Uppal', flood: true }, { name: 'Moosarambagh', flood: true },
    { name: 'Banjara Hills', flood: false }, { name: 'Jubilee Hills', flood: false },
    { name: 'Madhapur', flood: false }, { name: 'Gachibowli', flood: false },
    { name: 'Kukatpally', flood: false }, { name: 'Secunderabad', flood: false },
  ],
  Pune: [
    { name: 'Hadapsar', flood: true }, { name: 'Kondhwa', flood: true },
    { name: 'Wanowrie', flood: true }, { name: 'Bibwewadi', flood: true },
    { name: 'Katraj', flood: true }, { name: 'Ambegaon', flood: true },
    { name: 'Koregaon Park', flood: false }, { name: 'Viman Nagar', flood: false },
    { name: 'Kothrud', flood: false }, { name: 'Baner', flood: false },
    { name: 'Aundh', flood: false }, { name: 'Wakad', flood: false },
  ],
  Kolkata: [
    { name: 'Tiljala', flood: true }, { name: 'Topsia', flood: true },
    { name: 'Tangra', flood: true }, { name: 'Kasba', flood: true },
    { name: 'Behala', flood: true }, { name: 'Garden Reach', flood: true },
    { name: 'Salt Lake', flood: false }, { name: 'New Town', flood: false },
    { name: 'Park Street', flood: false }, { name: 'Ballygunge', flood: false },
    { name: 'Jadavpur', flood: false }, { name: 'Dum Dum', flood: false },
  ],
};
export const CITIES = Object.keys(CITY_ZONES);

// ── Plans ──
export const PLANS = [
  { id: 'starter', name: 'Starter', price: 50, cap: 600, dailyPayout: 200, days: 2, weeklyCap: 600, color: '#3B82F6' },
  { id: 'standard', name: 'Standard', price: 100, cap: 1200, dailyPayout: 300, days: 3, weeklyCap: 1200, color: '#FF5200', tag: 'Popular' },
  { id: 'pro', name: 'Pro', price: 200, cap: 2000, dailyPayout: 400, days: 4, weeklyCap: 2000, color: '#60B246', tag: 'Best Value' },
];

// ── Default Worker ──
export const DEFAULT_USER = {
  name: 'Ravi Kumar', phone: '+91 98765 43210', aadhaarLast4: '4321',
  platforms: ['Swiggy', 'Zomato'], city: 'Bengaluru', zone: 'Bellandur',
  plan: 'standard', trustScore: 82,
  policyId: 'GS-POL-2026-24719', policyStart: '2026-03-01', policyEnd: '2026-06-01',
  autoRenew: true, upiId: 'ravi.kumar@ybl',
  activeHours: 'all',
};

// ── Mock Weather (per city) ──
export const getMockWeather = (city) => {
  const base = {
    Bengaluru: { temp: 29, rain: 12, humidity: 68, wind: 14, aqi: 85 },
    Mumbai: { temp: 32, rain: 45, humidity: 82, wind: 18, aqi: 120 },
    Chennai: { temp: 35, rain: 8, humidity: 75, wind: 10, aqi: 95 },
    Delhi: { temp: 38, rain: 2, humidity: 45, wind: 12, aqi: 280 },
    Hyderabad: { temp: 34, rain: 5, humidity: 55, wind: 11, aqi: 110 },
    Pune: { temp: 31, rain: 15, humidity: 62, wind: 13, aqi: 78 },
    Kolkata: { temp: 33, rain: 20, humidity: 80, wind: 16, aqi: 150 },
  };
  const b = base[city] || base.Bengaluru;
  return {
    temperature: +(b.temp + (Math.random() - 0.5) * 4).toFixed(1),
    rainfall: +(b.rain + (Math.random() - 0.5) * 10).toFixed(1),
    humidity: Math.floor(b.humidity + (Math.random() - 0.5) * 10),
    windSpeed: +(b.wind + (Math.random() - 0.5) * 6).toFixed(1),
    aqi: Math.floor(b.aqi + (Math.random() - 0.5) * 40),
    condition: b.rain > 20 ? 'Rainy' : b.temp > 40 ? 'Extreme Heat' : b.temp > 35 ? 'Hot' : 'Clear',
    heatIndex: +(b.temp * 1.1 + b.humidity * 0.04).toFixed(1),
    platformStatus: {
      Swiggy: { status: 'operational', uptime: 99.4 },
      Zomato: { status: 'operational', uptime: 99.1 },
      Uber: { status: 'operational', uptime: 99.6 },
      Ola: { status: Math.random() > 0.9 ? 'degraded' : 'operational', uptime: 98.8 },
    },
  };
};

// ── Get Current Season ──
export const getCurrentSeason = () => {
  const m = new Date().getMonth(); // 0-indexed
  if (m >= 2 && m <= 4) return 'summer'; // Mar-May
  if (m >= 5 && m <= 8) return 'monsoon'; // Jun-Sep
  return 'other'; // Oct-Feb
};

// ── Mock Income Data ──
export const getMockIncome = () => ({
  baseline: 650,
  disruptedAvg: 180,
  dropPercent: 72,
  weeklyEarnings: 4550,
  monthlyEarnings: 19500,
  riskMultiplier: 1.4,
  normalDays: 22,
  disruptedDays: 8,
});

// ── Mock Claims ──
export const MOCK_CLAIMS = [
  { id: 'CLM-001', date: '20 Mar 2026', amount: 300, trigger: 'Heavy Rainfall', status: 'paid', zone: 'Bellandur' },
  { id: 'CLM-002', date: '15 Mar 2026', amount: 250, trigger: 'Platform Outage', status: 'paid', zone: 'Bellandur' },
  { id: 'CLM-003', date: '10 Mar 2026', amount: 300, trigger: 'Heavy Rainfall', status: 'paid', zone: 'Bellandur' },
];

// ── Mock Payments ──
export const MOCK_PAYMENTS = [
  { id: 'PAY-9281', date: '20 Mar 2026', amount: 80, method: 'UPI Autopay', status: 'success' },
  { id: 'PAY-8744', date: '13 Mar 2026', amount: 80, method: 'UPI Autopay', status: 'success' },
  { id: 'PAY-8201', date: '06 Mar 2026', amount: 80, method: 'UPI Autopay', status: 'success' },
  { id: 'PAY-7658', date: '27 Feb 2026', amount: 50, method: 'UPI Manual', status: 'success' },
  { id: 'PAY-6542', date: '20 Feb 2026', amount: 50, method: 'Razorpay', status: 'failed' },
];

// ── Admin Data ──
export const MOCK_WORKERS = Array.from({ length: 20 }, (_, i) => {
  const names = ['Ravi Kumar', 'Priya Sharma', 'Arjun Mehta', 'Divya Reddy', 'Karan Thakur',
    'Meena Verma', 'Sanjay Bhatt', 'Nisha Patel', 'Rohit Singh', 'Anita Gupta',
    'Suresh Yadav', 'Kavita Joshi', 'Amit Chauhan', 'Pooja Nair', 'Vikram Das',
    'Sunita Devi', 'Manoj Kumar', 'Rekha Iyer', 'Deepak Rao', 'Lakshmi Menon'];
  const cities = ['Bengaluru', 'Mumbai', 'Chennai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata'];
  const platforms = ['Swiggy', 'Zomato', 'Uber', 'Ola'];
  const plans = ['starter', 'standard', 'pro'];
  return {
    id: `GW-${1000 + i}`, name: names[i], phone: `+91 ${Math.floor(70000 + Math.random() * 29999)} ${Math.floor(10000 + Math.random() * 89999)}`,
    city: cities[i % 7], zone: CITY_ZONES[cities[i % 7]][i % 12]?.name || 'Zone 1',
    platform: platforms[i % 4], plan: plans[i % 3],
    trustScore: Math.floor(40 + Math.random() * 55), status: Math.random() > 0.1 ? 'active' : 'suspended',
    totalClaims: Math.floor(Math.random() * 15), totalPaid: Math.floor(Math.random() * 5000),
    avgIncome: Math.floor(500 + Math.random() * 500),
  };
});

export const MOCK_ADMIN_CLAIMS = [
  { id: 'CLM-A01', worker: 'Ravi Kumar', zone: 'Bellandur', city: 'Bengaluru', trigger: 'Heavy Rainfall', amount: 300, status: 'pending', date: '20 Mar' },
  { id: 'CLM-A02', worker: 'Priya Sharma', zone: 'Velachery', city: 'Chennai', trigger: 'Extreme Heat', amount: 250, status: 'pending', date: '20 Mar' },
  { id: 'CLM-A03', worker: 'Arjun Mehta', zone: 'Malkajgiri', city: 'Hyderabad', trigger: 'Platform Outage', amount: 400, status: 'pending', date: '19 Mar' },
  { id: 'CLM-A04', worker: 'Divya Reddy', zone: 'Kurla', city: 'Mumbai', trigger: 'Zone Lockdown', amount: 300, status: 'approved', date: '19 Mar' },
  { id: 'CLM-A05', worker: 'Karan Thakur', zone: 'Yamuna Khadar', city: 'Delhi', trigger: 'Heavy Rainfall', amount: 200, status: 'flagged', date: '18 Mar' },
  { id: 'CLM-A06', worker: 'Meena Verma', zone: 'Hadapsar', city: 'Pune', trigger: 'AQI Emergency', amount: 300, status: 'paid', date: '18 Mar' },
  { id: 'CLM-A07', worker: 'Sanjay Bhatt', zone: 'Tiljala', city: 'Kolkata', trigger: 'Heavy Rainfall', amount: 400, status: 'paid', date: '17 Mar' },
];

export const MOCK_PAYOUTS = [
  { id: 'PO-001', worker: 'Divya Reddy', amount: 300, trigger: 'Zone Lockdown', date: '19 Mar 2026', method: 'UPI' },
  { id: 'PO-002', worker: 'Meena Verma', amount: 300, trigger: 'AQI Emergency', date: '18 Mar 2026', method: 'UPI' },
  { id: 'PO-003', worker: 'Sanjay Bhatt', amount: 400, trigger: 'Heavy Rainfall', date: '17 Mar 2026', method: 'UPI' },
  { id: 'PO-004', worker: 'Ravi Kumar', amount: 300, trigger: 'Heavy Rainfall', date: '16 Mar 2026', method: 'UPI' },
  { id: 'PO-005', worker: 'Nisha Patel', amount: 250, trigger: 'Platform Outage', date: '15 Mar 2026', method: 'UPI' },
];

export const MOCK_FRAUD_ALERTS = [
  { id: 'FR-001', worker: 'Karan Thakur', reason: 'GPS location mismatch — claimed from outside zone', score: 92, level: 'high', date: '18 Mar' },
  { id: 'FR-002', worker: 'Fake ID #8821', reason: 'Duplicate claim from same device fingerprint', score: 87, level: 'high', date: '17 Mar' },
  { id: 'FR-003', worker: 'Ajay Patil', reason: 'Unusual claim frequency — 5 claims in 2 days', score: 64, level: 'medium', date: '16 Mar' },
  { id: 'FR-004', worker: 'Sunita Devi', reason: 'Trust score dropped below 40 threshold', score: 38, level: 'low', date: '15 Mar' },
];

export const ML_MODELS = [
  { icon: '🧠', name: 'Income Predictor', accuracy: '94.2%', status: 'active' },
  { icon: '🔍', name: 'Fraud Detector', accuracy: '97.8%', status: 'active' },
  { icon: '🌦️', name: 'Weather Engine', accuracy: '91.5%', status: 'active' },
  { icon: '📊', name: 'Trust Scorer', accuracy: '89.3%', status: 'training' },
];
