/**
 * GigShield — Real-time Data Service
 * Generates live, fluctuating data that simulates real API feeds.
 * Each data point updates independently with realistic patterns.
 */

// ── Weather Engine ──
// Simulates IMD weather API with realistic diurnal patterns
class WeatherEngine {
  constructor() {
    this.baseTemp = 33 + Math.random() * 8;
    this.baseRainfall = Math.random() > 0.6 ? 20 + Math.random() * 50 : Math.random() * 15;
    this.baseHumidity = 55 + Math.random() * 30;
    this.baseWind = 8 + Math.random() * 20;
    this.condition = this.baseRainfall > 30 ? 'heavy_rain' : this.baseRainfall > 10 ? 'light_rain' : this.baseTemp > 40 ? 'extreme_heat' : 'clear';
    this.lastUpdate = Date.now();
  }

  tick() {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour <= 18;

    // Temperature: rises during day, drops at night
    const tempDrift = isDaytime ? 0.3 : -0.2;
    this.baseTemp = Math.max(22, Math.min(48, this.baseTemp + tempDrift + (Math.random() - 0.5) * 1.5));

    // Rainfall: more likely in afternoon/evening
    const rainChance = hour >= 14 && hour <= 20 ? 0.15 : 0.05;
    if (Math.random() < rainChance && this.baseRainfall < 20) this.baseRainfall += Math.random() * 30;
    this.baseRainfall = Math.max(0, this.baseRainfall + (Math.random() - 0.55) * 3);

    // Humidity correlates with rain
    this.baseHumidity = Math.max(30, Math.min(98, 50 + this.baseRainfall * 0.8 + (Math.random() - 0.5) * 5));

    // Wind
    this.baseWind = Math.max(0, Math.min(60, this.baseWind + (Math.random() - 0.5) * 4));

    // Condition
    if (this.baseRainfall > 50) this.condition = 'heavy_rain';
    else if (this.baseRainfall > 20) this.condition = 'moderate_rain';
    else if (this.baseRainfall > 5) this.condition = 'light_rain';
    else if (this.baseTemp > 42) this.condition = 'extreme_heat';
    else if (this.baseTemp > 38) this.condition = 'hot';
    else this.condition = 'clear';

    this.lastUpdate = Date.now();
  }

  getData() {
    return {
      temperature: +this.baseTemp.toFixed(1),
      rainfall: +this.baseRainfall.toFixed(1),
      humidity: +this.baseHumidity.toFixed(0),
      windSpeed: +this.baseWind.toFixed(1),
      condition: this.condition,
      feelsLike: +(this.baseTemp + (this.baseHumidity > 70 ? 3 : 0) + (this.baseWind > 20 ? -2 : 0)).toFixed(1),
      heatIndex: +(this.baseTemp * 1.1 + this.baseHumidity * 0.05).toFixed(1),
      timestamp: new Date().toLocaleTimeString('en-IN'),
      source: 'IMD Weather API'
    };
  }
}

// ── AQI Engine ──
class AQIEngine {
  constructor() {
    this.baseAQI = 80 + Math.random() * 200;
    this.pm25 = this.baseAQI * 0.4;
    this.pm10 = this.baseAQI * 0.6;
    this.no2 = 20 + Math.random() * 40;
    this.so2 = 10 + Math.random() * 20;
    this.co = 0.5 + Math.random() * 2;
  }

  tick() {
    const hour = new Date().getHours();
    // AQI worse during rush hours (8-10am, 5-8pm)
    const rushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
    const drift = rushHour ? 3 : -1;

    this.baseAQI = Math.max(30, Math.min(500, this.baseAQI + drift + (Math.random() - 0.5) * 15));
    this.pm25 = Math.max(5, this.baseAQI * (0.35 + Math.random() * 0.1));
    this.pm10 = Math.max(10, this.baseAQI * (0.55 + Math.random() * 0.1));
    this.no2 = Math.max(5, this.no2 + (Math.random() - 0.5) * 5);
    this.so2 = Math.max(2, this.so2 + (Math.random() - 0.5) * 3);
    this.co = Math.max(0.1, this.co + (Math.random() - 0.5) * 0.3);
  }

  getCategory() {
    if (this.baseAQI <= 50) return { label: 'Good', color: '#1DB954' };
    if (this.baseAQI <= 100) return { label: 'Satisfactory', color: '#8BC34A' };
    if (this.baseAQI <= 200) return { label: 'Moderate', color: '#F59E0B' };
    if (this.baseAQI <= 300) return { label: 'Poor', color: '#EF4444' };
    if (this.baseAQI <= 400) return { label: 'Very Poor', color: '#DC2626' };
    return { label: 'Severe', color: '#7F1D1D' };
  }

  getData() {
    const cat = this.getCategory();
    return {
      aqi: +this.baseAQI.toFixed(0),
      pm25: +this.pm25.toFixed(1),
      pm10: +this.pm10.toFixed(1),
      no2: +this.no2.toFixed(1),
      so2: +this.so2.toFixed(1),
      co: +this.co.toFixed(2),
      category: cat.label,
      categoryColor: cat.color,
      timestamp: new Date().toLocaleTimeString('en-IN'),
      source: 'CPCB AQI API'
    };
  }
}

// ── Traffic Engine ──
class TrafficEngine {
  constructor() {
    this.congestion = 3 + Math.random() * 4;
    this.avgSpeed = 25 + Math.random() * 15;
    this.incidents = Math.floor(Math.random() * 3);
  }

  tick() {
    const hour = new Date().getHours();
    const isRush = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
    const drift = isRush ? 0.4 : -0.2;

    this.congestion = Math.max(1, Math.min(10, this.congestion + drift + (Math.random() - 0.5) * 1.2));
    this.avgSpeed = Math.max(5, Math.min(50, 50 - this.congestion * 4 + (Math.random() - 0.5) * 5));
    if (Math.random() < 0.05) this.incidents = Math.min(5, this.incidents + 1);
    if (Math.random() < 0.08) this.incidents = Math.max(0, this.incidents - 1);
  }

  getData() {
    return {
      congestion: +this.congestion.toFixed(1),
      avgSpeed: +this.avgSpeed.toFixed(0),
      incidents: this.incidents,
      status: this.congestion > 7 ? 'Heavy' : this.congestion > 4 ? 'Moderate' : 'Light',
      statusColor: this.congestion > 7 ? '#EF4444' : this.congestion > 4 ? '#F59E0B' : '#1DB954',
      timestamp: new Date().toLocaleTimeString('en-IN'),
      source: 'HERE Traffic API'
    };
  }
}

// ── Platform Status Engine ──
class PlatformEngine {
  constructor() {
    this.platforms = {
      Swiggy: { uptime: 99.2 + Math.random() * 0.7, status: 'operational', downSince: null, orderVolume: 800 + Math.random() * 400 },
      Zomato: { uptime: 98.8 + Math.random() * 1.0, status: 'operational', downSince: null, orderVolume: 700 + Math.random() * 350 },
      Uber: { uptime: 99.5 + Math.random() * 0.4, status: 'operational', downSince: null, orderVolume: 500 + Math.random() * 300 },
      Ola: { uptime: 98.5 + Math.random() * 1.2, status: 'operational', downSince: null, orderVolume: 400 + Math.random() * 250 },
    };
  }

  tick() {
    Object.keys(this.platforms).forEach(name => {
      const p = this.platforms[name];
      // Small chance of outage
      if (p.status === 'operational' && Math.random() < 0.008) {
        p.status = 'degraded';
        p.downSince = new Date().toLocaleTimeString('en-IN');
      } else if (p.status === 'degraded' && Math.random() < 0.1) {
        p.status = 'outage';
      } else if (p.status === 'outage' && Math.random() < 0.15) {
        p.status = 'operational';
        p.downSince = null;
      } else if (p.status === 'degraded' && Math.random() < 0.2) {
        p.status = 'operational';
        p.downSince = null;
      }

      // Order volume fluctuates
      p.orderVolume = Math.max(0, p.orderVolume + (Math.random() - 0.5) * 50);
      if (p.status !== 'operational') p.orderVolume *= 0.3;
    });
  }

  getData() {
    return Object.entries(this.platforms).map(([name, p]) => ({
      name,
      status: p.status,
      statusColor: p.status === 'operational' ? '#1DB954' : p.status === 'degraded' ? '#F59E0B' : '#EF4444',
      uptime: +p.uptime.toFixed(1),
      orderVolume: Math.round(p.orderVolume),
      downSince: p.downSince,
    }));
  }

  simulateOutage(platform) {
    if (this.platforms[platform]) {
      this.platforms[platform].status = 'outage';
      this.platforms[platform].downSince = new Date().toLocaleTimeString('en-IN');
      this.platforms[platform].orderVolume *= 0.1;
    }
  }
}

// ── Zone Risk Engine ──
class ZoneRiskEngine {
  constructor(zones) {
    this.zones = {};
    zones.forEach(z => {
      this.zones[z.name] = {
        name: z.name,
        flood: z.flood,
        riskScore: z.flood ? 5 + Math.random() * 4 : 1 + Math.random() * 3,
        activeWorkers: Math.floor(10 + Math.random() * 30),
        activeClaims: Math.floor(Math.random() * 5),
        disruption: z.flood ? 'Flood Risk' : 'Normal',
      };
    });
  }

  tick() {
    Object.values(this.zones).forEach(z => {
      z.riskScore = Math.max(0, Math.min(10, z.riskScore + (Math.random() - 0.5) * 0.8));
      z.activeWorkers = Math.max(0, z.activeWorkers + Math.floor((Math.random() - 0.5) * 4));
      if (Math.random() < 0.03) z.activeClaims = Math.min(10, z.activeClaims + 1);
      if (Math.random() < 0.05) z.activeClaims = Math.max(0, z.activeClaims - 1);
      z.disruption = z.riskScore > 7 ? 'Active Alert' : z.riskScore > 5 ? 'Elevated' : 'Normal';
    });
  }

  getData() {
    return Object.values(this.zones).map(z => ({
      ...z,
      riskScore: +z.riskScore.toFixed(1),
      riskColor: z.riskScore > 7 ? '#EF4444' : z.riskScore > 5 ? '#F59E0B' : '#1DB954',
    }));
  }
}

// ── Master Controller ──
let instance = null;

class RealtimeDataService {
  constructor() {
    if (instance) return instance;
    this.weather = new WeatherEngine();
    this.aqi = new AQIEngine();
    this.traffic = new TrafficEngine();
    this.platforms = new PlatformEngine();
    this.zones = null; // initialized lazily
    this.listeners = new Set();
    this.triggerLog = [];
    this.claimsQueue = [];
    this.payoutLedger = [];
    this.workers = this._generateWorkers();
    this.intervalId = null;
    this.tickCount = 0;
    instance = this;
  }

  _generateWorkers() {
    const names = [
      'Ravi Kumar', 'Priya Sharma', 'Arjun Mehta', 'Divya Reddy', 'Karan Thakur',
      'Meena Verma', 'Sanjay Bhatt', 'Nisha Patel', 'Rohit Singh', 'Anita Gupta',
      'Suresh Yadav', 'Kavita Joshi', 'Amit Chauhan', 'Pooja Nair', 'Vikram Das',
      'Sunita Devi', 'Manoj Kumar', 'Rekha Iyer', 'Deepak Rao', 'Lakshmi Menon',
    ];
    const cities = ['Bengaluru', 'Mumbai', 'Chennai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata'];
    const platforms = ['Swiggy', 'Zomato', 'Uber', 'Ola'];
    const plans = ['starter', 'standard', 'pro'];

    return names.map((name, i) => ({
      id: `GW-${1000 + i}`,
      name,
      phone: `+91 ${Math.floor(70000 + Math.random() * 29999)} ${Math.floor(10000 + Math.random() * 89999)}`,
      city: cities[i % cities.length],
      zone: 'Zone ' + (i % 6 + 1),
      platform: platforms[i % platforms.length],
      plan: plans[i % plans.length],
      trustScore: Math.floor(55 + Math.random() * 40),
      avgIncome: Math.floor(600 + Math.random() * 600),
      status: Math.random() > 0.1 ? 'active' : 'suspended',
      totalClaims: Math.floor(Math.random() * 15),
      totalPaid: Math.floor(Math.random() * 5000),
      joinedDate: `${Math.floor(Math.random() * 28 + 1)} ${['Jan', 'Feb', 'Mar'][Math.floor(Math.random() * 3)]} 2026`,
      lastActive: `${Math.floor(Math.random() * 24)}h ago`,
    }));
  }

  initZones(zones) {
    if (!this.zones) {
      this.zones = new ZoneRiskEngine(zones);
    }
  }

  start(intervalMs = 2000) {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.tickCount++;
      this.weather.tick();
      this.aqi.tick();
      this.traffic.tick();
      this.platforms.tick();
      if (this.zones) this.zones.tick();
      this._checkTriggers();
      this._notifyListeners();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notifyListeners() {
    const data = this.getSnapshot();
    this.listeners.forEach(fn => fn(data));
  }

  _checkTriggers() {
    const w = this.weather.getData();
    const a = this.aqi.getData();
    const t = this.traffic.getData();
    const now = new Date().toLocaleTimeString('en-IN');

    if (w.rainfall > 50 && !this._recentTrigger('rainfall')) {
      this._fireTrigger({ type: 'rainfall', icon: '🌧️', title: 'Heavy Rainfall Alert', value: `${w.rainfall}mm/hr`, threshold: '50mm/hr', severity: 'high', time: now });
    }
    if (a.aqi > 300 && !this._recentTrigger('aqi')) {
      this._fireTrigger({ type: 'aqi', icon: '💨', title: 'AQI Emergency', value: `AQI ${a.aqi}`, threshold: 'AQI 300', severity: 'critical', time: now });
    }
    if (w.heatIndex > 46 && !this._recentTrigger('heat')) {
      this._fireTrigger({ type: 'heat', icon: '🌡️', title: 'Extreme Heat Alert', value: `${w.heatIndex}°C heat index`, threshold: '46°C', severity: 'high', time: now });
    }
    if (t.congestion > 8 && !this._recentTrigger('traffic')) {
      this._fireTrigger({ type: 'traffic', icon: '🚗', title: 'Zone Congestion Lock', value: `${t.congestion}/10`, threshold: '8/10', severity: 'medium', time: now });
    }
  }

  _recentTrigger(type) {
    return this.triggerLog.some(t => t.type === type && Date.now() - t.ts < 30000);
  }

  _fireTrigger(trigger) {
    const entry = { ...trigger, id: `TRG-${Date.now().toString(36).toUpperCase()}`, ts: Date.now() };
    this.triggerLog.unshift(entry);
    if (this.triggerLog.length > 100) this.triggerLog.pop();
  }

  // Force-fire a trigger for simulation
  simulateTrigger(type) {
    const now = new Date().toLocaleTimeString('en-IN');
    const triggers = {
      rainfall: () => { this.weather.baseRainfall = 60 + Math.random() * 30; this._fireTrigger({ type: 'rainfall', icon: '🌧️', title: 'Heavy Rainfall', value: `${this.weather.baseRainfall.toFixed(1)}mm/hr`, threshold: '50mm/hr', severity: 'high', time: now }); },
      aqi: () => { this.aqi.baseAQI = 350 + Math.random() * 100; this._fireTrigger({ type: 'aqi', icon: '💨', title: 'AQI Emergency', value: `AQI ${this.aqi.baseAQI.toFixed(0)}`, threshold: 'AQI 300', severity: 'critical', time: now }); },
      heat: () => { this.weather.baseTemp = 44 + Math.random() * 4; this._fireTrigger({ type: 'heat', icon: '🌡️', title: 'Extreme Heat', value: `${this.weather.baseTemp.toFixed(1)}°C`, threshold: '42°C', severity: 'high', time: now }); },
      platform: (name) => { this.platforms.simulateOutage(name || 'Swiggy'); this._fireTrigger({ type: 'platform', icon: '📵', title: `${name || 'Swiggy'} Outage`, value: 'Platform Down', threshold: '>30min', severity: 'critical', time: now }); },
      traffic: () => { this.traffic.congestion = 8.5 + Math.random() * 1.5; this._fireTrigger({ type: 'traffic', icon: '🚧', title: 'Zone Lockdown', value: `${this.traffic.congestion.toFixed(1)}/10`, threshold: '8/10', severity: 'high', time: now }); },
    };
    triggers[type]?.();
    this._notifyListeners();
  }

  // Generate a claim from a trigger
  generateClaim(trigger, worker) {
    const claim = {
      id: `CLM-${Date.now().toString(36).toUpperCase()}`,
      workerId: worker.id,
      workerName: worker.name,
      zone: worker.zone,
      city: worker.city,
      trigger: trigger.title,
      triggerType: trigger.type,
      amount: [200, 250, 300, 350, 400][Math.floor(Math.random() * 5)],
      status: 'pending',
      aiScore: Math.floor(80 + Math.random() * 18),
      steps: [
        { step: 'triggered', time: new Date().toLocaleTimeString('en-IN'), done: true },
        { step: 'ai_validated', time: null, done: false },
        { step: 'fraud_checked', time: null, done: false },
        { step: 'approved', time: null, done: false },
        { step: 'upi_sent', time: null, done: false },
        { step: 'confirmed', time: null, done: false },
      ],
      createdAt: Date.now(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    this.claimsQueue.unshift(claim);
    return claim;
  }

  // Progress a claim through steps
  progressClaim(claimId) {
    const claim = this.claimsQueue.find(c => c.id === claimId);
    if (!claim) return null;
    const nextStep = claim.steps.find(s => !s.done);
    if (nextStep) {
      nextStep.done = true;
      nextStep.time = new Date().toLocaleTimeString('en-IN');
      if (claim.steps.every(s => s.done)) {
        claim.status = 'paid';
        this.payoutLedger.unshift({
          id: `PAY-${Date.now().toString(36).toUpperCase()}`,
          claimId: claim.id,
          worker: claim.workerName,
          amount: claim.amount,
          trigger: claim.trigger,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-IN'),
          method: 'UPI Instant',
          status: 'success',
        });
      }
    }
    return claim;
  }

  approveClaim(claimId) {
    const claim = this.claimsQueue.find(c => c.id === claimId);
    if (claim) {
      claim.steps.forEach(s => { s.done = true; s.time = s.time || new Date().toLocaleTimeString('en-IN'); });
      claim.status = 'paid';
      this.payoutLedger.unshift({
        id: `PAY-${Date.now().toString(36).toUpperCase()}`,
        claimId: claim.id,
        worker: claim.workerName,
        amount: claim.amount,
        trigger: claim.trigger,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN'),
        method: 'UPI Instant',
        status: 'success',
      });
    }
    return claim;
  }

  rejectClaim(claimId) {
    const claim = this.claimsQueue.find(c => c.id === claimId);
    if (claim) claim.status = 'rejected';
    return claim;
  }

  getSnapshot() {
    return {
      weather: this.weather.getData(),
      aqi: this.aqi.getData(),
      traffic: this.traffic.getData(),
      platforms: this.platforms.getData(),
      zones: this.zones?.getData() || [],
      triggerLog: this.triggerLog.slice(0, 50),
      claimsQueue: this.claimsQueue,
      payoutLedger: this.payoutLedger,
      workers: this.workers,
      tickCount: this.tickCount,
    };
  }
}

// Singleton
export function getRealtimeService() {
  return new RealtimeDataService();
}

export default RealtimeDataService;
