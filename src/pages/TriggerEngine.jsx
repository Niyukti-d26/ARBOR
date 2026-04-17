import { useState, useEffect, useRef } from 'react';
import { T, TRIGGERS } from '../data/constants';
import { PillTag } from '../components/shared';
import { CheckCircle, AlertTriangle, RefreshCw, Activity, Zap } from '../components/Icons';

// Mock API functions
function mockIMDApi(override) {
  return { value: override ?? (30 + Math.random() * 40), unit: 'mm/hr', source: 'IMD Weather API', timestamp: new Date().toLocaleTimeString() };
}
function mockCPCBApi(override) {
  return { value: override ?? (100 + Math.random() * 250), unit: 'AQI', source: 'CPCB AQI API', timestamp: new Date().toLocaleTimeString() };
}
function mockHEREApi(override) {
  return { value: override ?? (3 + Math.random() * 5), unit: '/10', source: 'HERE Traffic API', timestamp: new Date().toLocaleTimeString() };
}
function mockPlatformApi(override) {
  return { value: override ?? 0, unit: 'min', source: 'Platform Status API', timestamp: new Date().toLocaleTimeString() };
}
function mockHeatApi(override) {
  return { value: override ?? (32 + Math.random() * 12), unit: '°C', source: 'Heat Index API', timestamp: new Date().toLocaleTimeString() };
}

const mockApis = { rainfall: mockIMDApi, aqi: mockCPCBApi, traffic: mockHEREApi, platform: mockPlatformApi, heat: mockHeatApi };

function TriggerMeter({ value, threshold, max, color, unit, label }) {
  const pct = Math.min(100, (value / max) * 100);
  const threshPct = (threshold / max) * 100;
  const breached = value >= threshold;

  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: T.textMuted }}>{label}</span>
        <span style={{ fontWeight: 700, color: breached ? T.red : T.green }}>
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <div style={{ height: 10, background: T.border, borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%', borderRadius: 5, width: `${pct}%`,
          background: breached ? `linear-gradient(90deg, ${T.amber}, ${T.red})` : `linear-gradient(90deg, ${T.green}, ${T.blue})`,
          transition: 'width .5s ease, background .5s ease'
        }} />
        <div style={{
          position: 'absolute', top: -3, left: `${threshPct}%`, transform: 'translateX(-50%)',
          width: 2, height: 16, background: T.red, borderRadius: 1
        }} />
      </div>
      <div style={{ position: 'relative', height: 14 }}>
        <span style={{
          position: 'absolute', left: `${threshPct}%`, transform: 'translateX(-50%)',
          fontSize: 9, color: T.red, fontWeight: 700, whiteSpace: 'nowrap', top: 2
        }}>
          Threshold: {threshold}{unit}
        </span>
      </div>
    </div>
  );
}

function EventLog({ events }) {
  return (
    <div style={{ maxHeight: 200, overflowY: 'auto', scrollbarWidth: 'thin' }}>
      {events.map((e, i) => (
        <div key={i} className="fade-in" style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          borderBottom: `1px solid ${T.border}`, fontSize: 12
        }}>
          <span style={{ fontSize: 14 }}>{e.icon}</span>
          <span style={{ color: T.textMuted, fontFamily: 'monospace', fontSize: 10, minWidth: 70 }}>{e.time}</span>
          <span style={{ flex: 1 }}>{e.message}</span>
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: e.type === 'breach' ? T.redLight : e.type === 'warn' ? T.amberLight : T.greenLight,
            color: e.type === 'breach' ? T.red : e.type === 'warn' ? T.amber : T.green
          }}>{e.level}</span>
        </div>
      ))}
    </div>
  );
}

export default function TriggerEngine({ onToast }) {
  const [triggerData, setTriggerData] = useState(() =>
    TRIGGERS.reduce((acc, t) => ({ ...acc, [t.key]: t.currentValue }), {})
  );
  const [events, setEvents] = useState([
    { icon: <CheckCircle size={14} color={T.green} />, time: new Date().toLocaleTimeString(), message: 'Trigger Engine initialized', type: 'info', level: 'INFO' },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef(null);

  // Live data simulation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTriggerData(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (key === 'platform') return;
          const fluctuation = (Math.random() - 0.5) * 4;
          next[key] = Math.max(0, next[key] + fluctuation);
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Check for threshold breaches
  useEffect(() => {
    TRIGGERS.forEach(t => {
      const val = triggerData[t.key];
      if (val >= t.threshold) {
        const existing = events.find(e => e.message.includes(t.name) && e.type === 'breach');
        if (!existing || events.indexOf(existing) > 3) {
          addEvent(t.icon, `${t.name} THRESHOLD BREACHED: ${val.toFixed(1)}${t.unit} > ${t.threshold}${t.unit}`, 'breach', 'BREACH');
        }
      }
    });
  }, [triggerData]);

  const addEvent = (icon, message, type, level) => {
    setEvents(prev => [{ icon, time: new Date().toLocaleTimeString(), message, type, level }, ...prev.slice(0, 49)]);
  };

  const simulateBreach = (trigger) => {
    const breachValue = trigger.threshold * (1.2 + Math.random() * 0.3);
    setTriggerData(prev => ({ ...prev, [trigger.key]: breachValue }));
    addEvent(trigger.icon, `SIMULATED: ${trigger.name} pushed to ${breachValue.toFixed(1)}${trigger.unit}`, 'breach', 'SIM');
    if (onToast) onToast(`⚡ ${trigger.name} threshold breached! Value: ${breachValue.toFixed(1)}${trigger.unit}`);
  };

  const simulateAllBreaches = () => {
    setIsSimulating(true);
    TRIGGERS.forEach((t, i) => {
      setTimeout(() => {
        simulateBreach(t);
        if (i === TRIGGERS?.length - 1) {
          setTimeout(() => setIsSimulating(false), 1000);
          addEvent(<AlertTriangle size={14} color={T.orange} />, 'ALL TRIGGERS BREACHED — Composite trigger FIRING', 'breach', 'FIRE');
        }
      }, i * 600);
    });
  };

  const resetAll = () => {
    setTriggerData(TRIGGERS?.reduce((acc, t) => ({ ...acc, [t.key]: t.key === 'platform' ? 0 : t.currentValue * 0.6 }), {}));
    addEvent(<RefreshCw size={14} color={T.blue} />, 'All triggers reset to normal values', 'info', 'RESET');
  };

  const maxValues = { rainfall: 100, aqi: 500, traffic: 10, platform: 120, heat: 55 };

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Composite Trigger Engine
          </h2>
          <p style={{ fontSize: 13, color: T.textSec }}>
            5 live mock API triggers — breach thresholds to fire composite payouts
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={resetAll} style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> Reset All
          </button>
          <button className="btn-primary" onClick={simulateAllBreaches} disabled={isSimulating}
            style={{ width: 'auto', padding: '8px 18px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            {isSimulating ? <><Activity size={12} /> Simulating...</> : <><Zap size={12} /> Breach All</>}
          </button>
        </div>
      </div>

      {/* Trigger Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: 20 }}>
        {TRIGGERS.map((trigger, i) => {
          const val = triggerData[trigger.key] || 0;
          const breached = val >= trigger.threshold;
          return (
            <div key={i} className={`card fade-up ${breached ? 'trigger-breached' : ''}`}
              style={{
                padding: 20, animationDelay: `${i * 60}ms`,
                border: breached ? `2px solid ${T.red}` : `1px solid ${T.border}`,
                boxShadow: breached ? `0 0 20px ${T.red}20` : T.shadow
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{trigger.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{trigger.name}</p>
                    <p style={{ fontSize: 10, color: T.textMuted }}>{trigger.apiName}</p>
                  </div>
                </div>
                <span className={`trigger-status-badge ${breached ? 'active' : triggerData[trigger.key] > trigger.threshold * 0.7 ? 'monitoring' : 'clear'}`}>
                  {breached ? 'FIRING' : triggerData[trigger.key] > trigger.threshold * 0.7 ? 'WATCH' : 'CLEAR'}
                </span>
              </div>

              <TriggerMeter value={val} threshold={trigger.threshold} max={maxValues[trigger.key] || 100}
                color={breached ? T.red : T.blue} unit={trigger.unit} label={trigger.cond} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: T.textMuted }}>
                  Last update: {new Date().toLocaleTimeString()}
                </span>
                <button onClick={() => simulateBreach(trigger)} disabled={breached}
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: breached ? T.greenLight : T.redLight, color: breached ? T.green : T.red,
                    border: `1px solid ${breached ? T.green + '30' : T.red + '30'}`,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all .15s'
                  }}>
                  {breached ? '✓ Breached' : '⚡ Simulate Breach'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="two-col">
        {/* Composite Evaluation */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Composite Trigger Status</h3>
            <PillTag color={TRIGGERS.every(t => triggerData[t.key] >= t.threshold) ? T.red : T.green}>
              {TRIGGERS.every(t => triggerData[t.key] >= t.threshold) ? 'ALL FIRED' : 'PARTIAL'}
            </PillTag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TRIGGERS.map((t, i) => {
              const val = triggerData[t.key] || 0;
              const met = val >= t.threshold;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: met ? T.greenLight : T.bg, borderRadius: 10,
                  border: `1px solid ${met ? T.green + '30' : T.border}`
                }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{t.name}: {val.toFixed(1)}{t.unit}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: met ? T.green : T.red
                  }}>{met ? '✓ MET' : '✕ NOT MET'}</span>
                </div>
              );
            })}
          </div>

          {TRIGGERS?.every(t => triggerData[t.key] >= t.threshold) && (
            <div className="pop-in" style={{
              marginTop: 16, padding: '16px 18px', borderRadius: 12,
              background: `linear-gradient(135deg, ${T.red}, ${T.orange})`, color: 'white', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <AlertTriangle size={24} color="white" style={{ marginBottom: 6 }} />
              <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>COMPOSITE TRIGGER FIRED</p>
              <p style={{ fontSize: 12, opacity: 0.9 }}>All 5 conditions met — payout eligible</p>
            </div>
          )}

          {/* Trigger Logic Display */}
          <div style={{
            marginTop: 18, background: T.bg, borderRadius: 12, padding: 18,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11, border: `1px solid ${T.border}`, lineHeight: 2.2
          }}>
            <div style={{ color: T.textMuted }}>// Composite trigger conditions</div>
            {TRIGGERS.map((t, i) => (
              <div key={i}>
                <span style={{ color: T.blue }}>{i === 0 ? 'IF' : 'AND'}</span>{' '}
                {t.key}{' '}
                <span style={{ color: T.orange }}>&gt;</span>{' '}
                <span style={{ color: triggerData[t.key] >= t.threshold ? T.green : T.red }}>{t.threshold}</span>
                {' '}<span style={{ color: T.textMuted }}>// {triggerData[t.key]?.toFixed(1)}</span>
              </div>
            ))}
            <div style={{ marginTop: 4 }}>
              <span style={{ color: T.blue }}>THEN</span>{' '}
              <span style={{ color: T.orange }}>trigger</span>(
              <span style={{ color: T.green }}>"COMPOSITE_PAYOUT"</span>)
            </div>
          </div>
        </div>

        {/* Live Event Log */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Live Event Log</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="pulse-dot" style={{ background: T.red, width: 5, height: 5 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: T.red }}>LIVE</span>
            </div>
          </div>
          <EventLog events={events} />
        </div>
      </div>
    </div>
  );
}
