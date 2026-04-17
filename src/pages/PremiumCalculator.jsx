import { useState, useEffect, useRef } from 'react';
import { T, PLANS, ZONE_RISK_FACTORS, PREMIUM_FACTORS } from '../data/constants';
import { CloudRain, Activity, Zap, CheckCircle, MapPin } from '../components/Icons';
import { PillTag, ProgressBar } from '../components/shared';

function AnimatedNumber({ value, suffix = '', prefix = '₹', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(id); }
      else setDisplay(Math.round(start));
    }, 16);
    return () => clearInterval(id);
  }, [value, duration]);
  return <span>{prefix}{display}{suffix}</span>;
}

function RiskGauge({ value, max = 10, color }) {
  const pct = Math.min(100, (value / max) * 100);
  const angle = -90 + (pct / 100) * 180;
  return (
    <div style={{ position: 'relative', width: 140, height: 80, margin: '0 auto' }}>
      <svg viewBox="0 0 140 80" style={{ width: '100%', height: '100%' }}>
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke={T.border} strokeWidth="10" strokeLinecap="round" />
        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${pct * 1.88} 188`} style={{ transition: 'stroke-dasharray 1.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color }}>{value.toFixed(1)}</div>
        <div style={{ fontSize: 10, color: T.textMuted }}>Risk Score</div>
      </div>
    </div>
  );
}

function WaterfallBar({ label, icon, value, total, color, description, delay = 0 }) {
  const pct = Math.abs(value) / total * 100;
  const isNeg = value < 0;
  return (
    <div className="fade-up" style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      background: T.bg, borderRadius: 12, border: `1px solid ${T.border}`,
      animationDelay: `${delay}ms`
    }}>
      <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: isNeg ? T.green : color }}>
            {isNeg ? '−' : '+'}₹{Math.abs(value).toFixed(0)}
          </span>
        </div>
        <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${Math.min(100, pct)}%`,
            background: isNeg ? T.green : color,
            transition: 'width 1s cubic-bezier(.4,0,.2,1)'
          }} />
        </div>
        <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{description}</p>
      </div>
    </div>
  );
}

export default function PremiumCalculator({ user }) {
  const [selectedZone, setSelectedZone] = useState(user.zone || 'Bellandur');
  const [selectedPlan, setSelectedPlan] = useState(user.plan || 'standard');
  const [weatherMultiplier, setWeatherMultiplier] = useState(1.3);

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];
  const zoneData = ZONE_RISK_FACTORS[selectedZone] || { flood: 1.0, heat: 1.0, traffic: 1.0, baseRisk: 'Low', incidents: 0, color: T.green };

  // Calculate dynamic premium
  const basePrem = plan.price;
  const floodAdj = Math.round(basePrem * (zoneData.flood - 1) * 0.4);
  const weatherAdj = Math.round(basePrem * (weatherMultiplier - 1) * 0.3);
  const trafficAdj = Math.round(basePrem * (zoneData.traffic - 1) * 0.2);
  const claimAdj = Math.round(basePrem * (zoneData.incidents > 3 ? 0.15 : 0.05));
  const trustDiscount = user.trustScore >= 80 ? -Math.round(basePrem * 0.1) : user.trustScore >= 60 ? -Math.round(basePrem * 0.05) : 0;
  const totalPremium = basePrem + floodAdj + weatherAdj + trafficAdj + claimAdj + trustDiscount;
  const riskScore = ((zoneData.flood + zoneData.heat + zoneData.traffic) / 3 * 3.3).toFixed(1);

  const reasons = [];
  if (zoneData.incidents > 3) reasons.push(`Your zone had ${zoneData.incidents} flood incidents last month — premium adjusted +₹${claimAdj}`);
  if (weatherMultiplier > 1.2) reasons.push(`Active monsoon season increases weather risk surcharge by ₹${weatherAdj}`);
  if (zoneData.flood > 1.5) reasons.push(`${selectedZone} is a high flood-risk zone — flood surcharge applied`);
  if (trustDiscount < 0) reasons.push(`Your trust score of ${user.trustScore} earns you a ₹${Math.abs(trustDiscount)} loyalty discount`);
  if (zoneData.traffic > 1.4) reasons.push(`High traffic congestion in your zone affects earning potential`);

  const allZones = Object.keys(ZONE_RISK_FACTORS);

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Dynamic Premium Calculator
          </h2>
          <p style={{ fontSize: 13, color: T.textSec }}>
            AI-driven pricing based on zone risk, weather, and your profile
          </p>
        </div>
        <PillTag color={T.blue}>ML-POWERED</PillTag>
      </div>

      <div className="main-side">
        {/* Left — Calculator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Inputs */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Configure Your Premium</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="label">Select Zone</label>
                <select className="input" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                  {allZones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Select Plan</label>
                <select className="input" value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}>
                  {PLANS.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/wk</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="label">Weather Risk Multiplier (Monsoon Season)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="range" min="1" max="2" step="0.1" value={weatherMultiplier}
                  onChange={e => setWeatherMultiplier(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: T.orange }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: weatherMultiplier > 1.5 ? T.red : T.amber, minWidth: 40 }}>
                  {weatherMultiplier.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Waterfall */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Pricing Breakdown</h3>
              <PillTag color={T.orange}>TRANSPARENT</PillTag>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <WaterfallBar label="Base Premium" icon={<Activity size={22} color={T.blue} />} value={basePrem} total={totalPremium + 20}
                color={T.blue} description={`Standard ${plan.name} plan rate`} delay={0} />
              <WaterfallBar label="Zone Flood Risk" icon={<CloudRain size={22} color={T.red} />} value={floodAdj} total={totalPremium + 20}
                color={T.red} description={`${selectedZone} — ${zoneData.baseRisk} risk zone`} delay={60} />
              <WaterfallBar label="Weather Surcharge" icon={<CloudRain size={22} color={T.amber} />} value={weatherAdj} total={totalPremium + 20}
                color={T.amber} description={`Current monsoon season: ${weatherMultiplier.toFixed(1)}x multiplier`} delay={120} />
              <WaterfallBar label="Traffic Density" icon={<MapPin size={22} color={T.purple} />} value={trafficAdj} total={totalPremium + 20}
                color={T.purple} description={`Zone congestion factor: ${zoneData.traffic}x`} delay={180} />
              <WaterfallBar label="Claim History" icon={<Activity size={22} color={T.orange} />} value={claimAdj} total={totalPremium + 20}
                color={T.orange} description={`${zoneData.incidents} incidents in zone this month`} delay={240} />
              {trustDiscount < 0 && (
                <WaterfallBar label="Trust Discount" icon={<Zap size={22} color={T.green} />} value={trustDiscount} total={totalPremium + 20}
                  color={T.green} description={`Trust score: ${user.trustScore}/100 — loyalty reward`} delay={300} />
              )}
            </div>
            <div style={{
              marginTop: 18, padding: '18px 20px', borderRadius: 14,
              background: `linear-gradient(135deg, ${T.orange}, #FF8C5A)`, color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>Your Dynamic Premium</p>
                <p style={{ fontSize: 32, fontWeight: 800 }}>
                  <AnimatedNumber value={totalPremium} />
                  <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.85 }}>/week</span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, opacity: 0.8 }}>vs base ₹{basePrem}/wk</p>
                <p style={{ fontSize: 16, fontWeight: 700 }}>
                  {totalPremium > basePrem ? '+' : ''}₹{totalPremium - basePrem} adjustment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Risk + Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk Gauge */}
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, textAlign: 'left' }}>Zone Risk Score</h3>
            <RiskGauge value={parseFloat(riskScore)} max={10} color={zoneData.color} />
            <div style={{
              marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: zoneData.color + '15', color: zoneData.color, border: `1px solid ${zoneData.color}25`
            }}>
              {zoneData.baseRisk.toUpperCase()} RISK ZONE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
              {[
                { label: 'Flood', value: zoneData.flood, color: zoneData.flood > 1.5 ? T.red : T.amber },
                { label: 'Heat', value: zoneData.heat, color: zoneData.heat > 1.2 ? T.red : T.green },
                { label: 'Traffic', value: zoneData.traffic, color: zoneData.traffic > 1.4 ? T.red : T.amber },
              ].map((f, i) => (
                <div key={i} style={{ background: T.bg, borderRadius: 10, padding: 12, border: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: f.color }}>{f.value}x</p>
                  <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Price Changed */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><Zap size={20} color={T.text} /></div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Why Your Price Changed</h3>
            </div>
            {reasons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reasons.map((r, i) => (
                  <div key={i} className="fade-up" style={{
                    padding: '12px 14px', borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                    background: i === 0 ? T.orangeLight : T.bg,
                    border: `1px solid ${i === 0 ? T.orange + '30' : T.border}`,
                    color: T.text, animationDelay: `${i * 100}ms`
                  }}>
                    <span style={{ color: T.orange, fontWeight: 700, marginRight: 6 }}>→</span>
                    {r}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: T.textMuted }}>No significant price adjustments right now.</p>
            )}
          </div>

          {/* Zone Incidents */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Zone Incident History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { date: '18 Mar', event: 'Heavy rainfall - 62mm/hr', type: 'flood', severity: 'high' },
                { date: '14 Mar', event: 'Waterlogging in main road', type: 'flood', severity: 'high' },
                { date: '10 Mar', event: 'Traffic jam - 3hr block', type: 'traffic', severity: 'med' },
                { date: '05 Mar', event: 'Heat wave - 44°C', type: 'heat', severity: 'med' },
                { date: '01 Mar', event: 'Platform outage - Swiggy', type: 'outage', severity: 'low' },
              ].map((inc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: inc.severity === 'high' ? T.red : inc.severity === 'med' ? T.amber : T.green
                  }} />
                  <span style={{ color: T.textMuted, fontWeight: 600, minWidth: 50 }}>{inc.date}</span>
                  <span style={{ flex: 1 }}>{inc.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
