import { useState } from 'react';
import { T, PLANS } from '../data/constants';
import { ProgressBar } from '../components/shared';

export default function Plans({ currentPlan, onSelect }) {
  const user = { plan: currentPlan || 'standard' };
  const onChangePlan = onSelect;
  const [calcIncome, setCalcIncome] = useState(1000);
  const [calcDays, setCalcDays] = useState(8);
  const [calcPlan, setCalcPlan] = useState("standard");

  const selectedCalcPlan = PLANS.find(p => p.id === calcPlan) || PLANS[1];
  const estPayout = Math.min(calcDays * selectedCalcPlan.dailyPayout, selectedCalcPlan.cap * 4);
  const premium = selectedCalcPlan.price * 4;

  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>
        Protection Plans
      </h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>
        Affordable weekly premiums · Automatic payouts · Cancel anytime
      </p>

      {/* Plan Cards */}
      <div className="three-col" style={{ marginBottom: 24 }}>
        {PLANS.map(p => (
          <div key={p.id}
            className={`plan-card${p.id === "standard" ? " featured" : ""}`}
            onClick={() => onChangePlan(p.id)}
            style={{ cursor: "pointer" }}
          >
            {p.tag && (
              <div style={{
                position: "absolute", top: 14, right: -20,
                background: `linear-gradient(90deg, ${p.color}, ${p.color}CC)`,
                color: "white", fontSize: 9, fontWeight: 700,
                padding: "4px 28px", transform: "rotate(35deg)",
                letterSpacing: 1
              }}>{p.tag}</div>
            )}
            <h3 style={{ fontSize: 20, fontWeight: 800, color: p.id === "standard" ? T.orange : T.text, marginBottom: 4 }}>
              {p.name}
            </h3>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
              {p.id === "starter" ? "For new gig workers" : p.id === "standard" ? "Most chosen plan" : "For power earners"}
            </p>
            <p style={{ fontSize: 34, fontWeight: 800, color: p.color, margin: "14px 0" }}>
              ₹{p.price} <span style={{ fontSize: 14, fontWeight: 400, color: T.textMuted }}>/week</span>
            </p>
            <ul style={{ listStyle: "none", margin: "18px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                `₹${p.dailyPayout}/day payout on disruptions`,
                `Weekly cap: ₹${p.cap.toLocaleString()}`,
                `${p.days} payout days/week max`,
                p.id === "starter" ? "Monsoon + Heat triggers" : "All trigger types",
                p.id !== "starter" ? "Community Shield access" : "Basic trust scoring",
                p.id === "pro" ? "Full auto-payout (trust >75)" : p.id === "standard" ? "Pre-Shield alerts" : null,
                p.id === "pro" ? "Priority claim processing" : null,
              ].filter(Boolean).map((feat, i) => (
                <li key={i} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: p.color, fontSize: 8, flexShrink: 0 }}>✦</span>
                  {feat}
                </li>
              ))}
            </ul>
            <button
              className="btn-primary"
              style={{
                background: p.id === "standard" ? `linear-gradient(135deg, ${T.orange}, #FF8C5A)` : "transparent",
                color: p.id === "standard" ? "white" : T.text,
                border: p.id === "standard" ? "none" : `1px solid ${T.border}`,
                boxShadow: p.id === "standard" ? `0 4px 14px ${T.orange}55` : "none",
              }}
            >
              {user.plan === p.id ? `Current Plan` : `Select ${p.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Viability Calculator */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Viability Calculator</h3>
          <span className="pill" style={{ background: T.blueLight, color: T.blue }}>LIVE ESTIMATE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, alignItems: "end" }}>
          <div>
            <label className="label">Daily Income (₹)</label>
            <input className="input" type="number" value={calcIncome} onChange={e => setCalcIncome(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Disruption Days/Month</label>
            <input className="input" type="number" value={calcDays} onChange={e => setCalcDays(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Plan</label>
            <select className="input" value={calcPlan} onChange={e => setCalcPlan(e.target.value)}>
              {PLANS.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price}/wk)</option>)}
            </select>
          </div>
          <div style={{
            background: T.greenLight, border: `1px solid ${T.green}30`,
            borderRadius: 12, padding: 16, textAlign: "center"
          }}>
            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: ".04em" }}>EST. MONTHLY PAYOUT</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: T.green }}>₹{estPayout.toLocaleString()}</p>
            <p style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>vs ₹{premium}/mo premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}
