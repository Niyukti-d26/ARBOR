import { useState, useEffect, useRef } from 'react';
import { T, PLANS, MOCK_PAYMENTS } from '../data/constants';
import { CloudRain, Zap, Shield, Activity, Money, CheckCircle, AlertTriangle } from '../components/Icons';
import { openRazorpay } from '../utils/razorpay';
import { readState, writeState, addPayment, EVENT_NAME } from '../utils/cropInsuranceState';

// Full plan feature comparison matrix
const PLAN_FEATURES = [
  { label: 'Weekly Premium', key: 'price', format: v => `₹${v}` },
  { label: 'Daily Payout', key: 'dailyPayout', format: v => `₹${v}` },
  { label: 'Weekly Cap', key: 'cap', format: v => `₹${v}` },
  { label: 'Rain Coverage', starter: true, standard: true, pro: true },
  { label: 'Heat Coverage', starter: false, standard: true, pro: true },
  { label: 'AQI Coverage', starter: false, standard: true, pro: true },
  { label: 'Outage Coverage', starter: false, standard: false, pro: true },
  { label: 'Lockdown Cover', starter: false, standard: false, pro: true },
  { label: 'Trust Boost', starter: false, standard: false, pro: true },
  { label: 'Auto-renewal', starter: false, standard: true, pro: true },
  { label: 'Priority Payout', starter: false, standard: false, pro: true },
];

const COVERAGE = [
  { icon: <CloudRain size={16} />, label: 'Heavy Rainfall (>20mm)' },
  { icon: <Zap size={16} />, label: 'Extreme Heat (>40°C)' },
  { icon: <Shield size={16} />, label: 'AQI Emergency (>200)' },
  { icon: <Activity size={16} />, label: 'Platform Outage (>30 min)' },
  { icon: <Activity size={16} />, label: 'Zone Lockdown' },
];

// ── Zone risk database (ML model weights) ──
const ZONE_ML_DATA = {
  // High-risk flood zones
  Bellandur:   { flood: 1.9, heat: 1.0, traffic: 1.6, incidents: 7, riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 22, trafficAdj: 8,  safeDiscount: 0 },
  Varthur:     { flood: 1.8, heat: 1.0, traffic: 1.5, incidents: 6, riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 20, trafficAdj: 7,  safeDiscount: 0 },
  Velachery:   { flood: 1.7, heat: 1.3, traffic: 1.4, incidents: 8, riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 19, trafficAdj: 6,  safeDiscount: 0 },
  Tambaram:    { flood: 1.6, heat: 1.4, traffic: 1.3, incidents: 5, riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 17, trafficAdj: 5,  safeDiscount: 0 },
  Kurla:       { flood: 1.8, heat: 1.1, traffic: 1.7, incidents: 9, riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 21, trafficAdj: 9,  safeDiscount: 0 },
  Dharavi:     { flood: 1.9, heat: 1.1, traffic: 1.8, incidents: 10,riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 23, trafficAdj: 10, safeDiscount: 0 },
  Tiljala:     { flood: 1.7, heat: 1.2, traffic: 1.5, incidents: 6, riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 18, trafficAdj: 7,  safeDiscount: 0 },
  Malkajgiri:  { flood: 1.5, heat: 1.3, traffic: 1.4, incidents: 5, riskLabel: 'HIGH',   riskColor: '#E23744', floodAdj: 15, trafficAdj: 6,  safeDiscount: 0 },
  'Yamuna Khadar': { flood: 1.6, heat: 1.5, traffic: 1.7, incidents: 7, riskLabel: 'HIGH', riskColor: '#E23744', floodAdj: 18, trafficAdj: 9, safeDiscount: 0 },
  Hadapsar:    { flood: 1.4, heat: 1.2, traffic: 1.5, incidents: 4, riskLabel: 'MEDIUM', riskColor: '#F59E0B', floodAdj: 12, trafficAdj: 5,  safeDiscount: 0 },
  Nagole:      { flood: 1.5, heat: 1.3, traffic: 1.3, incidents: 4, riskLabel: 'MEDIUM', riskColor: '#F59E0B', floodAdj: 13, trafficAdj: 4,  safeDiscount: 0 },
  // Safe zones — ML model rewards these with discounts
  Indiranagar: { flood: 1.0, heat: 1.0, traffic: 1.2, incidents: 1, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 2,  safeDiscount: 5 },
  Whitefield:  { flood: 1.0, heat: 1.0, traffic: 1.3, incidents: 1, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 3,  safeDiscount: 4 },
  Jayanagar:   { flood: 1.0, heat: 1.0, traffic: 1.1, incidents: 0, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 1,  safeDiscount: 5 },
  Bandra:      { flood: 1.0, heat: 1.0, traffic: 1.4, incidents: 1, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 4,  safeDiscount: 3 },
  'Anna Nagar':{ flood: 1.0, heat: 1.2, traffic: 1.2, incidents: 1, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 2,  safeDiscount: 4 },
  'Salt Lake':  { flood: 1.0, heat: 1.0, traffic: 1.1, incidents: 0, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 1,  safeDiscount: 5 },
  'Banjara Hills': { flood: 1.0, heat: 1.1, traffic: 1.2, incidents: 1, riskLabel: 'LOW', riskColor: '#60B246', floodAdj: 0, trafficAdj: 2,  safeDiscount: 5 },
  Dwarka:      { flood: 1.0, heat: 1.4, traffic: 1.3, incidents: 1, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 3,  safeDiscount: 2 },
  Kothrud:     { flood: 1.0, heat: 1.0, traffic: 1.2, incidents: 0, riskLabel: 'LOW',    riskColor: '#60B246', floodAdj: 0,  trafficAdj: 2,  safeDiscount: 5 },
};

// City-level weather risk (live weather context)
const CITY_WEATHER = {
  Bengaluru: { tempAnomaly: '+1.8°C', aqiImpact: '+₹3',  weatherRisk: 'Moderate', lossRatio: '42%' },
  Mumbai:    { tempAnomaly: '+2.1°C', aqiImpact: '+₹5',  weatherRisk: 'High',     lossRatio: '58%' },
  Chennai:   { tempAnomaly: '+3.2°C', aqiImpact: '+₹4',  weatherRisk: 'High',     lossRatio: '61%' },
  Delhi:     { tempAnomaly: '+4.1°C', aqiImpact: '+₹12', weatherRisk: 'Critical', lossRatio: '78%' },
  Hyderabad: { tempAnomaly: '+2.8°C', aqiImpact: '+₹6',  weatherRisk: 'High',     lossRatio: '54%' },
  Pune:      { tempAnomaly: '+1.5°C', aqiImpact: '+₹3',  weatherRisk: 'Moderate', lossRatio: '39%' },
  Kolkata:   { tempAnomaly: '+2.4°C', aqiImpact: '+₹7',  weatherRisk: 'High',     lossRatio: '62%' },
};

function CheckCell({ val }) {
  return (
    <td style={{ textAlign: 'center', padding: '8px 6px' }}>
      {val === true ? (
        <span style={{ color: T.success, fontSize: 16, fontWeight: 700 }}>✓</span>
      ) : val === false ? (
        <span style={{ color: T.textMuted, fontSize: 16 }}>✗</span>
      ) : (
        <span style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>{val}</span>
      )}
    </td>
  );
}

export default function MyPolicy({ user, onPlanChange, onToast }) {
  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];
  const [autoRenew, setAutoRenew] = useState(user?.autoRenew ?? true);
  const [payState, setPayState] = useState('idle');
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState(null);

  // Shared state (from cropInsuranceState)
  const [droughtIndex, setDroughtIndex] = useState(readState().droughtIndex ?? 72);
  const [premiumHighlight, setPremiumHighlight] = useState(false);
  const [currentPremium, setCurrentPremium] = useState(readState().currentPremium ?? 100);
  const [livePayments, setLivePayments] = useState(readState().payments || []);

  const policyEnd = new Date(user?.policyEnd || '2026-06-01');
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((policyEnd - today) / (1000 * 60 * 60 * 24)));

  // ── Listen for shared state updates ──
  useEffect(() => {
    const handler = () => {
      const state = readState();
      setDroughtIndex(state.droughtIndex ?? 72);
      setCurrentPremium(state.currentPremium ?? 100);
      setLivePayments(state.payments || []);

      // Animate premium recalculation
      setPremiumHighlight(true);
      setTimeout(() => setPremiumHighlight(false), 1000);
    };
    handler(); // run once on mount
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const handleSwitchPlan = (targetPlan) => {
    const diff = targetPlan.price - plan.price;
    setSwitchingPlan(targetPlan);
    if (diff <= 0) {
      onPlanChange(targetPlan.id);
      setShowPlanSelector(false);
      setSwitchingPlan(null);
      onToast(`Downgraded to ${targetPlan.name} plan`);
      return;
    }
    openRazorpay({
      amount: diff,
      name: `Upgrade to ${targetPlan.name}`,
      desc: `ARBOR plan upgrade: ${plan.name} → ${targetPlan.name}`,
      prefill: { name: user?.name, phone: user?.phone?.replace(/\D/g, '') },
      onSuccess: (resp) => {
        onPlanChange(targetPlan.id);
        setShowPlanSelector(false);
        setSwitchingPlan(null);
        onToast(`Upgraded to ${targetPlan.name}! Ref: ${resp.paymentId}`);
      },
      onFailure: (msg) => {
        setSwitchingPlan(null);
        onToast(`${msg}`);
      },
    });
  };

  const handlePremiumPay = () => {
    if (payState !== 'idle') return;
    openRazorpay({
      amount: plan.price,
      name: `${plan.name} Plan Premium`,
      desc: `ARBOR weekly premium — ${plan.name} plan`,
      prefill: { name: user?.name, phone: user?.phone?.replace(/\D/g, '') },
      onSuccess: (resp) => {
        setPayState('done');
        // ── Record payment in shared state → real-time Last 5 Payments ──
        addPayment({
          amount: plan.price,
          method: 'Razorpay · UPI',
          paymentId: resp.paymentId,
        });
        onToast(`Premium paid! Ref: ${resp.paymentId}`);
      },
      onFailure: (msg) => {
        onToast(`${msg}`);
      },
    });
  };

  const getFeatureVal = (feature, planId) => {
    if (feature.key) {
      const p = PLANS.find(pl => pl.id === planId);
      return feature.format(p[feature.key]);
    }
    return feature[planId];
  };

  // Drought impact derived from droughtIndex
  const droughtImpact = Math.round((droughtIndex / 100) * 25);

  // ── Dynamic ML Pricing Engine based on user's city + zone ──
  const zone   = user?.zone  || 'Bellandur';
  const city   = user?.city  || 'Bengaluru';
  const zoneML = ZONE_ML_DATA[zone] || { flood: 1.2, heat: 1.1, traffic: 1.3, incidents: 3, riskLabel: 'MEDIUM', riskColor: '#F59E0B', floodAdj: 10, trafficAdj: 5, safeDiscount: 0 };
  const cityW  = CITY_WEATHER[city]  || CITY_WEATHER['Bengaluru'];

  const BASE_PREMIUM   = plan.price;
  const floodAdj       = zoneML.floodAdj;
  const trafficAdj     = zoneML.trafficAdj;
  const incidentAdj    = zoneML.incidents > 5 ? 8 : zoneML.incidents > 2 ? 5 : 2;
  const safeDiscount   = -zoneML.safeDiscount;        // negative = savings for safe zones
  const dynamicPremium = Math.max(BASE_PREMIUM - zoneML.safeDiscount + floodAdj + trafficAdj + incidentAdj - (user?.trustScore >= 80 ? 5 : 0), 45);
  const marketAvg      = Math.round(dynamicPremium * 1.45);

  const ML_BREAKDOWN = [
    { icon: <Activity size={18} color={T.text} />, label: 'Base Premium',                                  value: `₹${BASE_PREMIUM}`,   color: T.text    || '#1A1A1A' },
    { icon: <Activity size={18} color={zoneML.riskColor} />,
      label: `Zone Risk — ${zone} (${zoneML.riskLabel})`,                  value: floodAdj > 0 ? `+₹${floodAdj}` : '₹0 (Safe)',
      color: zoneML.riskColor },
    { icon: <Activity size={18} color="#7C3AED" />, label: `Traffic Density — ${city}`,                     value: `+₹${trafficAdj}`,    color: '#7C3AED' },
    { icon: <Activity size={18} color="#F59E0B" />, label: `Incident History (${zoneML.incidents} this mo)`, value: `+₹${incidentAdj}`,   color: '#F59E0B' },
    ...(safeDiscount < 0 ? [{ icon: <Zap size={18} color="#60B246" />, label: `Safe Zone ML Discount`,  value: `−₹${Math.abs(safeDiscount)}`, color: '#60B246' }] : []),
    ...(user?.trustScore >= 80 ? [{ icon: <Shield size={18} color="#60B246" />, label: 'Trust Score Reward (80+)', value: '−₹5', color: '#60B246' }] : []),
  ];

  return (
    <div className="page-section fade-up">
      {/* Policy Header */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Active Policy</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{plan.name} Plan</div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>₹{plan.price}/week · up to ₹{plan.cap} coverage</div>
          </div>
          <div style={{ background: '#EDF7EA', color: T.success, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6 }}>✓ Active</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Start Date</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{user?.policyStart || '01 Mar 2026'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>End Date</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{user?.policyEnd || '01 Jun 2026'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Days Left</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: daysLeft < 10 ? T.danger : T.primary }}>{daysLeft}</div>
          </div>
        </div>
        <div style={{ background: T.bg, borderRadius: 8, padding: '10px 12px', marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: T.textSec }}>📍 {user?.zone || 'Bellandur'}, {user?.city || 'Bengaluru'}</span>
          <span style={{ color: T.textMuted }}>{user?.policyId || 'GS-POL-2026-24719'}</span>
        </div>
      </div>

      {/* ── ML Pricing Breakdown Card ── */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}><Activity size={18} color={T.text} /></div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>ML Pricing Breakdown</div>
          <div style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: 4,
          }}>AI COMPUTED</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {ML_BREAKDOWN.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: T.bg, borderRadius: 8,
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: T.textSec }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</span>
            </div>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: T.border, margin: '4px 0' }} />

          {/* Final Premium */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 10,
            background: premiumHighlight
              ? 'linear-gradient(135deg, #FFF8E1, #FFFDE7)'
              : 'linear-gradient(135deg, #FFF5F0, #FFE8D6)',
            border: `2px solid ${premiumHighlight ? '#F59E0B' : T.primary}`,
            transition: 'all .3s ease',
            boxShadow: premiumHighlight ? '0 0 0 4px rgba(245,158,11,0.15)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><Money size={20} color={T.text} /></div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>ML-Computed Premium</span>
            </div>
            <span style={{
              fontSize: 22, fontWeight: 900,
              color: premiumHighlight ? '#B45309' : T.primary,
              transition: 'color .3s',
            }}>
              ₹{dynamicPremium}<span style={{ fontSize: 12, fontWeight: 500, color: T.textMuted }}>/week</span>
            </span>
          </div>

          {/* Safe zone savings callout */}
          {zoneML.safeDiscount > 0 && (
            <div style={{ background: '#EDF7EA', border: '1px solid #B7DFB0', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}><Zap size={16} color="#145A28" /></span>
              <span style={{ fontSize: 12, color: '#145A28', fontWeight: 600 }}>
                You save ₹{zoneML.safeDiscount}/week because {zone} has historically low waterlogging risk — ML model rewards safe zones.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Pricing Engine Live Panel ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A, #1E3A5F)',
        borderRadius: 12, padding: 20, marginBottom: 16, color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>AI PRICING ENGINE — LIVE</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{city} · {zone}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Zone', value: zone, result: `Risk: ${zoneML.riskLabel}`, resultColor: zoneML.riskColor },
            { label: 'City', value: city, result: `Weather: ${cityW.weatherRisk}`, resultColor: cityW.weatherRisk === 'Critical' ? '#E23744' : cityW.weatherRisk === 'High' ? '#F59E0B' : '#60B246' },
            { label: 'Temp Anomaly', value: cityW.tempAnomaly, result: `AQI Impact: ${cityW.aqiImpact}`, resultColor: '#F59E0B' },
            { label: 'Historical Loss Ratio', value: cityW.lossRatio, result: zoneML.incidents > 5 ? 'Elevated' : zoneML.incidents > 2 ? 'Moderate' : 'Low', resultColor: zoneML.incidents > 5 ? '#E23744' : '#60B246' },
          ].map((row, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{row.value}</div>
              <div style={{ fontSize: 11, color: row.resultColor || '#60B246', fontWeight: 600 }}>{row.result}</div>
            </div>
          ))}
        </div>

        {/* Savings comparison */}
        <div style={{
          background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Your Premium vs Market Average</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#60B246' }}>₹{dynamicPremium}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>vs</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>₹{marketAvg}</span>
            </div>
          </div>
          <div style={{
            background: '#60B246', color: 'white', borderRadius: 8,
            padding: '8px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>You Save</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>₹{marketAvg - dynamicPremium}</div>
          </div>
        </div>
      </div>

      {/* Change Plan Button */}
      <button onClick={() => setShowPlanSelector(s => !s)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        background: T.white, border: `1.5px solid ${T.primary}`, borderRadius: 10, padding: '14px 18px',
        cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: 16, transition: 'all .15s',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>Change Plan</span>
        <span style={{ color: T.primary }}>{showPlanSelector ? '▲' : '▼'}</span>
      </button>

      {/* ── Plan Comparison Table ── */}
      {showPlanSelector && (
        <div className="fade-up" style={{ marginBottom: 16, background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Compare Plans</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Current plan highlighted · Switching upgrades via Razorpay</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: 12, fontWeight: 600, color: T.textMuted, borderBottom: `1px solid ${T.border}`, width: '40%' }}>Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{
                      textAlign: 'center', padding: '12px 8px',
                      borderBottom: `1px solid ${T.border}`, width: '20%',
                      background: p.id === user?.plan ? '#FFF5F0' : 'transparent',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: p.id === user?.plan ? T.primary : T.text }}>{p.name}</div>
                      {p.id === user?.plan && (
                        <div style={{ fontSize: 10, color: T.primary, fontWeight: 600, marginTop: 2 }}>Current</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((feature, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < PLAN_FEATURES.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <td style={{ padding: '9px 18px', fontSize: 12, color: T.textSec, fontWeight: 500 }}>{feature.label}</td>
                    {PLANS.map(p => (
                      <td key={p.id} style={{
                        textAlign: 'center', padding: '9px 6px',
                        background: p.id === user?.plan ? '#FFF5F0' : 'transparent',
                      }}>
                        {feature.key ? (
                          <span style={{ fontSize: 13, fontWeight: 700, color: p.id === user?.plan ? T.primary : T.text }}>
                            {feature.format(p[feature.key])}
                          </span>
                        ) : (
                          <span style={{ fontSize: 16 }}>
                            {getFeatureVal(feature, p.id) ? (
                              <span style={{ color: T.success, display: 'flex', justifyContent: 'center' }}><CheckCircle size={16} color={T.success} /></span>
                            ) : (
                              <span style={{ color: T.textMuted, display: 'flex', justifyContent: 'center' }}>—</span>
                            )}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '14px 18px' }} />
                  {PLANS.map(p => (
                    <td key={p.id} style={{
                      padding: '14px 8px', textAlign: 'center',
                      background: p.id === user?.plan ? '#FFF5F0' : 'transparent',
                    }}>
                      {p.id === user?.plan ? (
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, padding: '7px', background: '#FFE8D6', borderRadius: 6 }}>
                          ✓ Active Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSwitchPlan(p)}
                          disabled={switchingPlan !== null}
                          style={{
                            width: '100%', padding: '8px 6px', borderRadius: 7, border: 'none',
                            background: T.primary, color: 'white', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            opacity: switchingPlan ? 0.6 : 1,
                          }}>
                          {p.price > plan.price ? `Upgrade ₹${p.price - plan.price}` : 'Switch'}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pay Premium ── */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Pay Premium</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Amount Due</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.text }}>₹{plan.price}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Due on {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}><Money size={32} color={T.primary} /></div>
        </div>
        {payState === 'idle' && (
          <button onClick={handlePremiumPay} style={{
            width: '100%', padding: '13px', borderRadius: 8,
            background: 'linear-gradient(135deg, #FF5200, #E64800)',
            color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ display: 'flex', alignItems: 'center' }}><Zap size={14} color="white" /></span>
            Pay ₹{plan.price} via Razorpay
          </button>
        )}
        {payState === 'done' && (
          <div className="fade-up" style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><CheckCircle size={40} color={T.success} /></div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.success, marginTop: 8 }}>Payment Successful!</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>₹{plan.price} paid via Razorpay</div>
            <button onClick={() => setPayState('idle')} style={{ marginTop: 10, padding: '6px 14px', borderRadius: 6, border: `1px solid ${T.border}`, background: 'none', color: T.textSec, fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Pay again</button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Auto-renewal</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Premium debited automatically each week</div>
          </div>
          <div className={`toggle ${autoRenew ? 'on' : ''}`} onClick={() => { setAutoRenew(s => !s); onToast(autoRenew ? 'Auto-renewal disabled' : 'Auto-renewal enabled'); }} />
        </div>
      </div>

      {/* Coverage Checklist */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>What's Covered</div>
        {COVERAGE.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < COVERAGE.length - 1 ? 10 : 0, borderBottom: i < COVERAGE.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#EDF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: T.success, fontWeight: 700, flexShrink: 0 }}>✓</div>
            <span style={{ fontSize: 12 }}>{c.icon}</span>
            <span style={{ fontSize: 13, color: T.text }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Payment History — live from shared state, falls back to MOCK_PAYMENTS */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 0', marginBottom: 20 }}>
        <div style={{ padding: '0 18px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Last 5 Payments</div>
          {livePayments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#60B246', background: '#EDF7EA', padding: '2px 8px', borderRadius: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#60B246', animation: 'pulse 2s infinite' }} />
              Live
            </div>
          )}
        </div>
        {(livePayments.length > 0 ? livePayments : MOCK_PAYMENTS).map((pay, i) => {
          const isLive = !!pay.timestamp;
          const displayList = livePayments.length > 0 ? livePayments : MOCK_PAYMENTS;
          return (
            <div key={pay.id} style={{
              display: 'flex', alignItems: 'center', padding: '12px 18px',
              borderBottom: i < displayList.length - 1 ? `1px solid ${T.border}` : 'none',
              background: isLive && i === 0 ? '#FAFFFA' : T.white,
              transition: 'background .4s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>{pay.status === 'success' ? <CheckCircle size={14} color={T.success} /> : <AlertTriangle size={14} color={T.danger} />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
                  {pay.method}
                  {isLive && i === 0 && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#60B246', background: '#EDF7EA', padding: '1px 6px', borderRadius: 3 }}>NEW</span>}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{pay.date}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: pay.status === 'success' ? T.text : T.danger }}>₹{pay.amount}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
