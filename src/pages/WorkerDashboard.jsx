import { useState, useEffect } from 'react';
import { T, PLANS, getMockWeather, getMockIncome } from '../data/constants';
import { CloudRain, Zap, MapPin, Shield, CheckCircle, Money, Calendar, RefreshCw, Activity, Droplet, Thermometer, Phone, AlertTriangle } from '../components/Icons';

const AI_TIPS = [
  { icon: <CloudRain size={18} />, text: 'High rainfall expected tomorrow in your zone — consider an early shift today.', color: '#3B82F6', bg: '#EFF6FF' },
  { icon: <Zap size={18} />, text: 'Peak earning window today: 7PM–10PM. Platform demand is 38% higher.', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: <MapPin size={18} />, text: 'Zone risk rising — delivery density in your zone is high. Try adjacent zone for better earnings.', color: '#60B246', bg: '#EDF7EA' },
];

// Mini bar chart data — weekly earnings
const WEEK_BARS = [
  { day: 'Mon', normal: 680, disrupted: false },
  { day: 'Tue', normal: 720, disrupted: false },
  { day: 'Wed', normal: 190, disrupted: true },  // disruption
  { day: 'Thu', normal: 650, disrupted: false },
  { day: 'Fri', normal: 710, disrupted: false },
  { day: 'Sat', normal: 830, disrupted: false },
  { day: 'Sun', normal: 160, disrupted: true },  // disruption
];

const MAX_VAL = Math.max(...WEEK_BARS.map(b => b.normal));

// Coverage ring gauge component
function CoverageRing({ percent, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="ring-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,82,0,0.1)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={T.primary} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', fontSize: 18, fontWeight: 900, color: T.primary }}>{percent}%</div>
    </div>
  );
}

// Weekly coverage strip
function WeeklyCoverageStrip() {
  const today = new Date().getDay();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {days.map((day, i) => {
        const isToday = i === today;
        const isPast = i < today;
        const isCovered = true;
        return (
          <div key={day} style={{
            flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8,
            background: isToday ? 'linear-gradient(135deg, #FF5200, #FF9A6C)' : isPast ? '#EDF7EA' : 'rgba(255,255,255,0.5)',
            border: `1.5px solid ${isToday ? T.primary : isPast ? '#B7DFB0' : 'rgba(240,240,240,0.6)'}`,
            backdropFilter: 'blur(4px)',
            transition: 'all .3s',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? 'white' : isPast ? T.success : T.textMuted, marginBottom: 2 }}>{day}</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>{isToday ? <Shield size={12} color="white" /> : isPast && isCovered ? <CheckCircle size={12} color={T.success} /> : <div style={{width: 12, height: 12}} />}</div>
          </div>
        );
      })}
    </div>
  );
}

function MiniBarChart({ plan }) {
  return (
    <div className="glass-card" style={{ padding: 18, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>This Week's Earnings</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Red bars = disrupted days (you're covered)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.success }}>₹{WEEK_BARS.reduce((s, b) => s + b.normal, 0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 500 }}>Total (incl. payouts)</div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
        {WEEK_BARS.map((bar, i) => {
          const height = Math.round((bar.normal / MAX_VAL) * 72);
          const isToday = i === new Date().getDay() - 1;
          return (
            <div key={bar.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 9, color: bar.disrupted ? T.danger : T.textMuted, fontWeight: 600 }}>
                ₹{bar.normal}
              </div>
              <div style={{
                width: '100%', height: height,
                background: bar.disrupted
                  ? `linear-gradient(to top, ${T.danger}, #FF8A94)`
                  : isToday
                    ? `linear-gradient(to top, ${T.primary}, #FF9A6C)`
                    : `linear-gradient(to top, ${T.success}, #8DD56F)`,
                borderRadius: '4px 4px 2px 2px',
                transition: 'height .5s ease',
                position: 'relative',
              }}>
                {bar.disrupted && (
                  <div style={{
                    position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10, whiteSpace: 'nowrap',
                  }}><Shield size={10} color={T.danger} /></div>
                )}
              </div>
              <div style={{ fontSize: 9, fontWeight: isToday ? 700 : 500, color: isToday ? T.primary : T.textMuted }}>
                {bar.day}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: T.success }} />
          <span style={{ fontSize: 10, color: T.textMuted }}>Normal day</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: T.danger }} />
          <span style={{ fontSize: 10, color: T.textMuted }}>Disrupted (ARBOR paid ₹{plan.dailyPayout})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: T.primary }} />
          <span style={{ fontSize: 10, color: T.textMuted }}>Today</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkerDashboard({ user, onNavigate, onToast }) {
  const [weather, setWeather] = useState(null);
  const [income, setIncome] = useState(null);
  const [activeClaim, setActiveClaim] = useState(null);

  const plan = PLANS.find(p => p.id === user?.plan) || PLANS[1];

  // Computed values
  const earningsProtected = plan.dailyPayout * 2; // 2 disrupted days this week
  const weeklyPremium = plan.price;
  const coverageUsed = Math.round((earningsProtected / plan.cap) * 100);
  const daysRemaining = Math.max(0, Math.ceil((new Date(user?.policyEnd || '2026-06-01') - new Date()) / 86400000));

  useEffect(() => {
    const w = getMockWeather(user?.city || 'Mumbai');
    setWeather(w);
    setIncome(getMockIncome());
    const rand = Math.random();
    if (rand > 0.6) {
      setActiveClaim({ trigger: 'Heavy Rainfall', status: 'Verified', amount: plan.dailyPayout });
    }
  }, []);

  // Refresh weather every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(getMockWeather(user?.city || 'Mumbai'));
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.city]);

  const aqiLevel = weather
    ? (weather.aqi < 100 ? { label: 'Good', color: T.success } : weather.aqi < 200 ? { label: 'Moderate', color: T.amber } : { label: 'Hazardous', color: T.danger })
    : null;

  return (
    <div className="page-section fade-up">
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          Hi, {user?.name?.split(' ')[0] || 'Ravi'}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
          {user?.city} · {user?.zone} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
        <div style={{ display: 'inline-block', marginTop: 8, background: '#FFF5F0', color: T.primary, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: `1px solid #FFD5C2` }}>
          {plan.name} Plan · ₹{plan.cap} coverage
        </div>
      </div>

      {/* ── NEW: Earnings Protected Hero Card (Glassmorphism) ── */}
      <div className="glass-hero" style={{ padding: 24, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative shimmer */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(255,82,0,0.08) 0%, transparent 70%)',
          borderRadius: '50%', transform: 'translate(30%, -30%)',
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <CoverageRing percent={coverageUsed} size={90} strokeWidth={7} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              Earnings Protected
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: -1, animation: 'countUp .6s ease both' }}>
              ₹{earningsProtected.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>
              this week · {coverageUsed}% of ₹{plan.cap} cap used
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {[
            { label: 'Weekly Premium', value: `₹${weeklyPremium}`, icon: <Money size={14} />, color: T.primary },
            { label: 'Days Remaining', value: daysRemaining, icon: <Calendar size={14} />, color: '#3B82F6' },
            { label: 'Auto Renew', value: user?.autoRenew ? 'ON' : 'OFF', icon: <RefreshCw size={14} />, color: user?.autoRenew ? '#60B246' : T.textMuted },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.3)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEW: Active Weekly Coverage Strip ── */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Active Weekly Coverage</div>
      <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <WeeklyCoverageStrip />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: T.success }}>Active & Monitoring</span>
          </div>
          <span style={{ fontSize: 11, color: T.textMuted }}>Policy: {user?.policyId || 'GS-POL-2026-24719'}</span>
        </div>
      </div>

      {/* Active Claim Bar */}
      {activeClaim && (
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(255,245,240,0.8), rgba(255,238,228,0.8))', border: `1px solid #FFD5C2`, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <RefreshCw size={12} /> CLAIM IN PROGRESS
            </div>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{activeClaim.trigger} · ₹{activeClaim.amount} payout</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 5, background: '#FFF5F0', color: T.primary, border: `1px solid #FFD5C2` }}>
              {activeClaim.status}
            </div>
          </div>
        </div>
      )}

      {/* Weather Status Cards (2x2) */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Real-Time Status</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {/* Weather */}
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Thermometer size={16} />
            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Weather</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 2, letterSpacing: -1 }}>
            {weather ? `${weather.temperature}°C` : '--'}
          </div>
          <div style={{ fontSize: 12, color: T.textSec }}>{weather?.condition || 'Loading...'}</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display:'flex', alignItems:'center', gap: 2 }}><Droplet size={10} color={T.primary} /> {weather?.rainfall || 0}mm</span>
            <span>· Wind {weather?.windSpeed || 0} km/h</span>
          </div>
        </div>

        {/* AQI */}
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Activity size={16} />
            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Air Quality</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: aqiLevel?.color || T.text, marginBottom: 2, letterSpacing: -1 }}>
            {weather?.aqi || '--'}
          </div>
          <div style={{ fontSize: 12, color: T.textSec }}>{aqiLevel?.label || '...'}</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Humidity {weather?.humidity || '--'}%</div>
        </div>

        {/* Platform Status */}
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Phone size={16} />
            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Platform</span>
          </div>
          {weather && Object.entries(weather.platformStatus).slice(0, 2).map(([name, info]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: T.textSec }}>{name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: info.status === 'operational' ? T.success : T.amber }}>
                {info.status === 'operational' ? 'OK' : 'WARN'} {info.uptime}%
              </span>
            </div>
          ))}
          {!weather && <div style={{ fontSize: 13, color: T.textMuted }}>Loading...</div>}
        </div>

        {/* Heat Index */}
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Thermometer size={16} />
            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Heat Index</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: weather?.heatIndex > 40 ? T.danger : weather?.heatIndex > 35 ? T.amber : T.success, marginBottom: 2, letterSpacing: -1 }}>
            {weather ? `${weather.heatIndex}°` : '--'}
          </div>
          <div style={{ fontSize: 12, color: T.textSec }}>
            {weather?.heatIndex > 40 ? 'Extreme — stay hydrated' : weather?.heatIndex > 35 ? 'High — take breaks' : 'Comfortable'}
          </div>
        </div>
      </div>

      {/* Weekly Earnings Chart */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Earnings This Week</div>
      <MiniBarChart plan={plan} />

      {/* AI Predictions */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>AI Predictions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {AI_TIPS.map((tip, i) => (
          <div key={i} className="glass-card" style={{ background: `${tip.bg}cc`, border: `1px solid ${tip.color}22`, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{tip.text}</div>
          </div>
        ))}
      </div>

      {/* Coverage Summary CTA */}
      <div className="glass-card" style={{
        background: `linear-gradient(135deg, ${T.primary}14, ${T.primary}06)`,
        border: `1.5px solid ${T.primary}33`, borderRadius: 14, padding: '18px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: T.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}><Shield size={22} color="white" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>You're fully protected</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>₹{plan.cap} coverage · 5 triggers active · Auto payout on</div>
        </div>
        <button onClick={() => onNavigate('myPolicy')} style={{
          background: T.primary, color: 'white', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', flexShrink: 0,
        }}>View Policy</button>
      </div>
    </div>
  );
}
