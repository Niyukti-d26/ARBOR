import { useState, useEffect, useRef } from 'react';
import { T, MOCK_FRAUD_ALERTS, MOCK_WORKERS, ML_MODELS, CITY_ZONES, CITIES, getMockWeather } from '../data/constants';
import { AlertTriangle, Activity, Bot, User, Money, Zap, CloudRain, Thermometer, Phone, Lock } from '../components/Icons';
import { readState, EVENT_NAME } from '../utils/cropInsuranceState';
import { eventBus, EVENTS } from '../utils/eventBus';

const PLATFORM_HEALTH = [
  { name: 'Swiggy', uptime: 99.4, status: 'operational' },
  { name: 'Zomato', uptime: 99.1, status: 'operational' },
  { name: 'Uber', uptime: 99.6, status: 'operational' },
  { name: 'Ola', uptime: 97.3, status: 'degraded' },
];

// ── Compute per-zone risk dynamically based on city weather ──
function computeZonePredictions(cityWeatherMap) {
  const predictions = [];
  CITIES.forEach(city => {
    const weather = cityWeatherMap[city] || getMockWeather(city);
    const zones = CITY_ZONES[city] || [];
    const topFloodZone = zones.find(z => z.flood) || zones[0];
    if (!topFloodZone) return;

    let risk = 'Low', reason = 'Clear conditions forecast', color = '#60B246', bg = '#EDF7EA';
    if (weather.rainfall > 20 || weather.aqi > 200) {
      risk = 'High';
      reason = weather.rainfall > 20 ? `Rain forecast >${Math.round(weather.rainfall)}mm` : `AQI expected >${Math.round(weather.aqi)}`;
      color = '#E23744'; bg = '#FEF0F1';
    } else if (weather.temperature > 38 || weather.aqi > 150 || weather.rainfall > 10) {
      risk = 'Medium';
      reason = weather.temperature > 38 ? `Heat stress: ${weather.temperature}°C` : weather.aqi > 150 ? `AQI elevated: ${weather.aqi}` : 'Moderate rain expected';
      color = '#F59E0B'; bg = '#FFFBEB';
    }
    predictions.push({ zone: `${topFloodZone.name}, ${city}`, city, risk, reason, color, bg });
  });
  return predictions;
}

// ── Per-zone AI pricing engine ──
function computeZonePricing(city, zone, weather) {
  // Base premium
  let basePremium = 100;
  let riskLevel = 'MEDIUM';
  const zoneData = (CITY_ZONES[city] || []).find(z => z.name === zone);
  const isFloodProne = zoneData?.flood || false;

  // Weather risk factors
  let weatherMultiplier = 1.0;
  if (weather) {
    if (weather.rainfall > 30) weatherMultiplier += 0.4;
    else if (weather.rainfall > 15) weatherMultiplier += 0.2;
    if (weather.temperature > 42) weatherMultiplier += 0.3;
    else if (weather.temperature > 38) weatherMultiplier += 0.15;
    if (weather.aqi > 250) weatherMultiplier += 0.3;
    else if (weather.aqi > 150) weatherMultiplier += 0.15;
  }

  // Flood-prone zones get higher premiums
  if (isFloodProne) weatherMultiplier += 0.15;

  // Season factor
  const month = new Date().getMonth();
  if (month >= 5 && month <= 8) weatherMultiplier += 0.2; // monsoon
  if (month >= 2 && month <= 4) weatherMultiplier += 0.1; // summer

  const adjustedPremium = Math.round(basePremium * weatherMultiplier);

  if (weatherMultiplier > 1.4) riskLevel = 'HIGH';
  else if (weatherMultiplier > 1.15) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  return { premium: adjustedPremium, riskLevel, isFloodProne, weatherMultiplier: Math.round(weatherMultiplier * 100) / 100 };
}

// ── Predictive Analytics Data (dynamic per-city) ──
function computePredictions(cityWeatherMap) {
  const triggers = {
    'Heavy Rainfall': { total: 0, icon: <CloudRain size={20} />, color: '#3B82F6' },
    'Extreme Heat': { total: 0, icon: <Thermometer size={20} />, color: '#F59E0B' },
    'Platform Outage': { total: 0, icon: <Phone size={20} />, color: '#7C3AED' },
    'AQI Emergency': { total: 0, icon: <AlertTriangle size={20} />, color: '#EF4444' },
    'Zone Lockdown': { total: 0, icon: <Lock size={20} />, color: '#6B7280' },
  };
  CITIES.forEach(city => {
    const w = cityWeatherMap[city] || getMockWeather(city);
    if (w.rainfall > 15) triggers['Heavy Rainfall'].total += Math.round(15 + w.rainfall * 2);
    else triggers['Heavy Rainfall'].total += Math.round(5 + Math.random() * 10);
    if (w.temperature > 36) triggers['Extreme Heat'].total += Math.round(10 + (w.temperature - 36) * 5);
    else triggers['Extreme Heat'].total += Math.round(2 + Math.random() * 5);
    triggers['Platform Outage'].total += Math.round(3 + Math.random() * 6);
    if (w.aqi > 150) triggers['AQI Emergency'].total += Math.round(8 + (w.aqi - 150) * 0.3);
    else triggers['AQI Emergency'].total += Math.round(1 + Math.random() * 4);
    triggers['Zone Lockdown'].total += Math.round(1 + Math.random() * 3);
  });
  return Object.entries(triggers).map(([name, data]) => ({
    trigger: name, predicted: data.total, icon: data.icon, color: data.color,
    confidence: Math.round(65 + Math.random() * 25),
  }));
}

// Status badge config for claims
const STATUS_BADGE = {
  'Detected':     { color: '#E23744', bg: '#FEF0F1', label: 'Detected' },
  'AI Verifying': { color: '#F59E0B', bg: '#FFFBEB', label: 'AI Verifying' },
  'Approved':     { color: '#3B82F6', bg: '#EFF6FF', label: 'Approved' },
  'Paid':         { color: '#60B246', bg: '#EDF7EA', label: 'Paid' },
  'pending':      { color: '#E23744', bg: '#FEF0F1', label: 'Pending' },
  'approved':     { color: '#60B246', bg: '#EDF7EA', label: 'Approved' },
  'rejected':     { color: '#6B7280', bg: '#F3F4F6', label: 'Rejected' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_BADGE[status] || STATUS_BADGE['pending'];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5,
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  );
}

// Event alert banner (now zone-aware)
function EventAlertBanner({ event, zone, city, onDismiss }) {
  if (!event) return null;
  return (
    <div className="fade-up" style={{
      background: 'linear-gradient(135deg, rgba(255,248,197,0.85), rgba(255,243,205,0.85))',
      backdropFilter: 'blur(8px)',
      border: '1.5px solid #F59E0B', borderRadius: 10,
      padding: '12px 18px', marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 24, display: 'flex', alignItems: 'center' }}><AlertTriangle size={24} color="#92400E" /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
          Event Alert — {event} detected in {zone || 'active zone'}{city ? `, ${city}` : ''}
        </div>
        <div style={{ fontSize: 12, color: '#78350F' }}>
          Claim triggered — processing via AI pipeline
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
        color: '#92400E', fontFamily: 'Inter, sans-serif', padding: '0 4px',
      }}>✕</button>
    </div>
  );
}

// ── Loss Ratio Gauge ──
function LossRatioGauge({ premiums, payouts }) {
  const ratio = premiums > 0 ? Math.round((payouts / premiums) * 100) : 0;
  const isHealthy = ratio < 60;
  const isWarning = ratio >= 60 && ratio < 80;
  const color = isHealthy ? '#60B246' : isWarning ? '#F59E0B' : '#E23744';
  const barWidth = Math.min(100, ratio);

  return (
    <div className="glass-card" style={{ padding: 22, marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Activity size={20} color={T.text} />
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Loss Ratio</div>
        <div style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5,
          background: `${color}15`, color: color,
        }}>
          {isHealthy ? 'Healthy' : isWarning ? 'Watch' : 'High'}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: color }}>{ratio}%</span>
        <span style={{ fontSize: 13, color: T.textMuted }}>payouts / premiums</span>
      </div>

      <div style={{ height: 12, background: T.border, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%', width: `${barWidth}%`, borderRadius: 6,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          transition: 'width 1.5s cubic-bezier(.22,1,.36,1)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shineAcross 2s ease infinite',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Premiums Collected</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#60B246' }}>₹{(premiums / 100000).toFixed(1)}L</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Total Payouts</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#E23744' }}>₹{(payouts / 100000).toFixed(1)}L</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Surplus</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: premiums > payouts ? '#60B246' : '#E23744' }}>
            ₹{(Math.abs(premiums - payouts) / 100000).toFixed(1)}L
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Predictive Claims Chart ──
function PredictiveChart({ predictions }) {
  const maxPredicted = Math.max(...predictions.map(p => p.predicted), 1);
  return (
    <div className="glass-card" style={{ padding: 22, marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={20} color={T.primary} />
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Next Week's Predicted Claims</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.primary, background: '#FFF5F0', padding: '3px 8px', borderRadius: 4 }}>AI Forecast</div>
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 18 }}>ML model prediction by trigger type (all zones)</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {predictions.map(pred => (
          <div key={pred.trigger} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28 }}>{pred.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{pred.trigger}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: pred.color }}>{pred.predicted} claims</span>
              </div>
              <div style={{ height: 8, background: T.border, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%', width: `${(pred.predicted / maxPredicted) * 100}%`,
                  background: `linear-gradient(90deg, ${pred.color}, ${pred.color}88)`,
                  borderRadius: 4, transition: 'width 1.2s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 9, color: T.textMuted }}>Expected payout: ₹{(pred.predicted * 300).toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: pred.confidence > 80 ? '#60B246' : '#F59E0B' }}>
                  {pred.confidence}% confidence
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.12)', fontSize: 11, color: '#1D4ED8', lineHeight: 1.5 }}>
        Total predicted claims: <strong>{predictions.reduce((s, p) => s + p.predicted, 0)}</strong> · 
        Est. payout: <strong>₹{(predictions.reduce((s, p) => s + p.predicted * 300, 0) / 100000).toFixed(1)}L</strong> · 
        Reserve recommended: <strong>₹{(predictions.reduce((s, p) => s + p.predicted * 300, 0) * 1.2 / 100000).toFixed(1)}L</strong>
      </div>
    </div>
  );
}

// ── Zone-Aware AI Pricing Card ──
function ZonePricingCard({ selectedCity, selectedZone, onCityChange, onZoneChange }) {
  const weather = getMockWeather(selectedCity);
  const pricing = computeZonePricing(selectedCity, selectedZone, weather);
  const zones = CITY_ZONES[selectedCity] || [];
  const marketAvg = 145;

  return (
    <div className="glass-card" style={{
      padding: 20, marginBottom: 24,
      border: `1px solid ${pricing.riskLevel === 'HIGH' ? '#FBBBBC' : pricing.riskLevel === 'MEDIUM' ? '#FCD34D44' : T.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Activity size={18} color={T.text} />
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>AI Dynamic Pricing</div>
        <div style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 700,
          padding: '3px 9px', borderRadius: 4,
          background: pricing.riskLevel === 'HIGH' ? '#FEF0F1' : pricing.riskLevel === 'MEDIUM' ? '#FFFBEB' : '#EDF7EA',
          color: pricing.riskLevel === 'HIGH' ? '#E23744' : pricing.riskLevel === 'MEDIUM' ? '#F59E0B' : '#60B246',
        }}>
          Risk: {pricing.riskLevel}
        </div>
      </div>

      {/* Zone selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select className="input" value={selectedCity} onChange={e => onCityChange(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={selectedZone} onChange={e => onZoneChange(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}>
          {zones.map(z => <option key={z.name} value={z.name}>{z.name}{z.flood ? ' (Risk)' : ''}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: T.primary }}>₹{pricing.premium}</span>
        <span style={{ fontSize: 13, color: T.textMuted }}>/ week · Market avg ₹{marketAvg} · {pricing.premium < marketAvg ? `You save ₹${marketAvg - pricing.premium}` : `+₹${pricing.premium - marketAvg} risk premium`}</span>
      </div>

      {/* Pricing breakdown */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Base', value: '₹100', color: T.textSec },
          { label: 'Weather', value: `×${pricing.weatherMultiplier}`, color: pricing.weatherMultiplier > 1.3 ? '#E23744' : '#F59E0B' },
          { label: 'Flood Zone', value: pricing.isFloodProne ? 'Yes' : 'No', color: pricing.isFloodProne ? '#E23744' : '#60B246' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, padding: '8px 10px', background: 'rgba(250,250,250,0.6)',
            borderRadius: 8, textAlign: 'center', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(240,240,240,0.5)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: T.textMuted }}>
        Premium auto-recalculates when weather, zone risk, or season factor changes · {selectedZone}, {selectedCity}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onNavigate, onToast }) {
  // ── Shared state: from cropInsuranceState ──
  const [totalClaimsPaid, setTotalClaimsPaid] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [liveClaims, setLiveClaims]           = useState([]);
  const [liveFraudAlerts, setLiveFraudAlerts] = useState([]);
  const [alertEvent, setAlertEvent]           = useState(null);
  const [alertZone, setAlertZone]             = useState(null);
  const [alertCity, setAlertCity]             = useState(null);
  const alertTimerRef = useRef(null);
  const lastEventRef  = useRef(null);

  // ── Zone-aware pricing state ──
  const [pricingCity, setPricingCity] = useState('Bengaluru');
  const [pricingZone, setPricingZone] = useState('Bellandur');

  // ── Weather data for all cities (refreshes every 30s) ──
  const [cityWeatherMap, setCityWeatherMap] = useState({});

  // Mock financial data
  const premiumsCollected = 4120000 + totalAmountPaid * 0.3;
  const totalPayouts = 2940000 + totalAmountPaid;

  // Refresh weather for all cities
  useEffect(() => {
    const refresh = () => {
      const map = {};
      CITIES.forEach(c => { map[c] = getMockWeather(c); });
      setCityWeatherMap(map);
    };
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Listen for cropStateUpdated ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      setTotalClaimsPaid(state.totalClaimsPaid ?? 0);
      setTotalAmountPaid(state.totalAmountPaid ?? 0);
      setLiveClaims(Array.isArray(state.claims) ? state.claims : []);
      setLiveFraudAlerts(Array.isArray(state.fraudEvents) ? state.fraudEvents : []);

      // Show banner when lastEvent changes — extract zone/city from latest claim
      if (state.lastEvent && state.lastEvent !== lastEventRef.current) {
        lastEventRef.current = state.lastEvent;
        const latestClaim = (state.claims || [])[0];
        setAlertEvent(state.lastEvent);
        setAlertZone(latestClaim?.zone || null);
        // Determine city from zone
        let foundCity = null;
        if (latestClaim?.zone) {
          for (const city of CITIES) {
            if ((CITY_ZONES[city] || []).some(z => z.name === latestClaim.zone)) {
              foundCity = city;
              break;
            }
          }
        }
        setAlertCity(foundCity);
        clearTimeout(alertTimerRef.current);
        alertTimerRef.current = setTimeout(() => setAlertEvent(null), 8000);
      }
    };
    handler();
    window.addEventListener(EVENT_NAME, handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      clearTimeout(alertTimerRef.current);
    };
  }, []);

  // Handle city change in pricing card
  const handlePricingCityChange = (city) => {
    setPricingCity(city);
    const zones = CITY_ZONES[city] || [];
    setPricingZone(zones[0]?.name || '');
  };

  const allFraudAlerts = [...liveFraudAlerts, ...MOCK_FRAUD_ALERTS];
  const zonePredictions = computeZonePredictions(cityWeatherMap);
  const claimPredictions = computePredictions(cityWeatherMap);

  // Dynamic stats
  const STATS = [
    { label: 'Active Workers',      value: '52,841',           icon: <User size={22} />, color: T?.primary || '#FF5200', change: '+124 today' },
    { label: 'Premiums Collected',  value: '₹41.2L',           icon: <Money size={22} />, color: '#60B246',            change: '+₹3.8L today' },
    { label: 'Claims Paid (Live)',  value: totalClaimsPaid,    icon: <Zap size={22} />, color: '#F59E0B',            change: `₹${totalAmountPaid.toLocaleString('en-IN')} disbursed` },
    { label: 'Fraud Blocked',       value: allFraudAlerts.length, icon: <AlertTriangle size={22} />, color: '#E23744',         change: `${liveFraudAlerts.length} live alerts` },
  ];

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>

      {/* ── Event Alert Banner (zone-aware) ── */}
      <EventAlertBanner event={alertEvent} zone={alertZone} city={alertCity} onDismiss={() => setAlertEvent(null)} />

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {STATS.map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', color: stat.color }}>{stat.icon}</div>
            </div>
            <div className="stat-number" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label" style={{ marginTop: 4, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#60B246', fontWeight: 600 }}>↑ {stat.change}</div>
          </div>
        ))}
      </div>

      {/* ── Loss Ratio + Predictive Analytics (side by side) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <LossRatioGauge premiums={premiumsCollected} payouts={totalPayouts} />
        <PredictiveChart predictions={claimPredictions} />
      </div>

      {/* ── Zone-Aware AI Pricing (with city/zone selector) ── */}
      <ZonePricingCard
        selectedCity={pricingCity}
        selectedZone={pricingZone}
        onCityChange={handlePricingCityChange}
        onZoneChange={setPricingZone}
      />

      {/* ── Live Claims from Simulator (cropInsuranceState) ── */}
      {liveClaims.length > 0 && (
        <div className="glass-card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Live Claims — Real-time</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
              color: '#60B246', background: '#EDF7EA', padding: '3px 10px', borderRadius: 5,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
              Live
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Zone</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {liveClaims.map(claim => (
                <tr key={claim.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{claim.farmer}</td>
                  <td style={{ fontSize: 12, color: T.textSec }}>{claim.zone}</td>
                  <td style={{ fontSize: 13 }}>{claim.event}</td>
                  <td style={{ fontSize: 14, fontWeight: 700 }}>₹{claim.amount}</td>
                  <td style={{ fontSize: 11, color: T.textMuted }}>
                    {new Date(claim.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td><StatusBadge status={claim.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Platform Health */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Platform Health</div>
          {PLATFORM_HEALTH.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10, flexShrink: 0, fontWeight: 800, color: p.status === 'operational' ? '#60B246' : '#F59E0B' }}>
                {p.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.status === 'operational' ? '#60B246' : '#F59E0B' }}>{p.uptime}%</span>
                </div>
                <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.uptime}%`, background: p.status === 'operational' ? '#60B246' : '#F59E0B', borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fraud Alert Summary */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Fraud Alerts</div>
            <div style={{ background: '#FEF0F1', color: '#E23744', fontSize: 20, fontWeight: 800, padding: '4px 14px', borderRadius: 8 }}>
              {allFraudAlerts.length}
            </div>
          </div>
          {allFraudAlerts.slice(0, 3).map((alert, i) => (
            <div key={alert.id || i} style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${T.border}`, alignItems: 'flex-start' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                background: alert.level === 'high' ? '#E23744' : alert.level === 'medium' ? '#F59E0B' : '#60B246',
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{alert.worker}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{(alert.reason || '').slice(0, 52)}...</div>
              </div>
            </div>
          ))}
          <button onClick={() => onNavigate('fraud')} style={{ fontSize: 12, fontWeight: 600, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
            View all alerts →
          </button>
        </div>
      </div>

      {/* AI Zone Risk Predictions (dynamic from weather data) */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>AI Zone Risk — Tomorrow</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Predicted disruption probability by zone (based on live weather)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {zonePredictions.map(z => (
            <div key={z.zone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: `${z.bg}cc`, borderRadius: 8, border: `1px solid ${z.color}22`, backdropFilter: 'blur(4px)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{z.zone}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{z.reason}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: z.color, padding: '4px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: 5, border: `1px solid ${z.color}33`, backdropFilter: 'blur(4px)' }}>
                {z.risk}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Trend Chart */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Daily Payout Trend (Last 7 Days)</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Total disbursed automatically via UPI</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#60B246' }}>₹{(29.4 + totalAmountPaid / 100000).toFixed(1)}L</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Week Total (incl. live)</div>
          </div>
        </div>
        {(() => {
          const bars = [
            { day: 'Mon', val: 3.2 }, { day: 'Tue', val: 4.1 }, { day: 'Wed', val: 6.8 },
            { day: 'Thu', val: 2.9 }, { day: 'Fri', val: 3.7 }, { day: 'Sat', val: 4.5 },
            { day: 'Sun', val: 4.2 + totalAmountPaid / 500000 },
          ];
          const maxVal = Math.max(...bars.map(b => b.val));
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
              {bars.map((bar, i) => {
                const isToday = i === 6;
                const height = Math.round((bar.val / maxVal) * 88);
                return (
                  <div key={bar.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted }}>₹{bar.val.toFixed(1)}L</div>
                    <div style={{
                      width: '100%', height,
                      background: isToday ? 'linear-gradient(to top, #FF5200, #FF9A6C)' : 'linear-gradient(to top, #3B82F6, #93C5FD)',
                      borderRadius: '5px 5px 2px 2px', transition: 'height .5s ease',
                      border: isToday ? '1.5px solid #FF5200' : 'none',
                    }} />
                    <div style={{ fontSize: 9, fontWeight: isToday ? 700 : 500, color: isToday ? '#FF5200' : T.textMuted }}>{bar.day}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ML Model Cards */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>ML Models Status</div>
        <div className="four-col" style={{ marginBottom: 0 }}>
          {ML_MODELS.map(m => (
            <div key={m.name} style={{ background: 'rgba(250,250,250,0.6)', backdropFilter: 'blur(4px)', borderRadius: 10, padding: '14px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.primary, marginBottom: 4 }}>{m.accuracy}</div>
              <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, display: 'inline-block',
                background: m.status === 'active' ? '#EDF7EA' : '#FFFBEB',
                color: m.status === 'active' ? '#60B246' : '#F59E0B',
              }}>{m.status === 'active' ? '● Active' : '◌ Training'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
