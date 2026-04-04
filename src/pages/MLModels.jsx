import { useState } from 'react';
import { T, ML_MODELS } from '../data/constants';
import { Spinner } from '../components/shared';

const iconColors = { blue: T.blue, purple: "#7C3AED", green: T.green, orange: T.orange };

export default function MLModels() {
  const [training, setTraining] = useState({});
  const [progress, setProgress] = useState({});

  const startTraining = (idx) => {
    setTraining(t => ({ ...t, [idx]: true }));
    setProgress(p => ({ ...p, [idx]: 0 }));
    const interval = setInterval(() => {
      setProgress(p => {
        const val = (p[idx] || 0) + Math.random() * 15;
        if (val >= 100) {
          clearInterval(interval);
          setTimeout(() => setTraining(t => ({ ...t, [idx]: false })), 500);
          return { ...p, [idx]: 100 };
        }
        return { ...p, [idx]: val };
      });
    }, 200);
  };

  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>
        ML Model Dashboard
      </h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>
        Real-time model performance, training, and inference metrics
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {ML_MODELS.map((m, i) => {
          const color = iconColors[m.color] || T.blue;
          const isTraining = training[i];
          const prog = progress[i] || 0;

          return (
            <div key={i} className="model-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: color + "15",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22
                }}>{m.icon}</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</p>
                  <p style={{ fontSize: 11, color: T.textMuted }}>{m.type}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "ACCURACY", value: m.accuracy },
                  { label: "LATENCY", value: m.latency },
                  { label: "DATASET", value: "48K samples" },
                  { label: "LAST TRAINED", value: "2h ago" },
                ].map((metric, j) => (
                  <div key={j} style={{
                    background: T.bg, borderRadius: 10, padding: "10px 12px",
                    border: `1px solid ${T.border}`
                  }}>
                    <p style={{ fontSize: 9, color: T.textMuted, fontWeight: 700, letterSpacing: ".05em" }}>
                      {metric.label}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>{metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Training progress */}
              {isTraining && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${prog}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}AA)`,
                      borderRadius: 3, transition: "width 0.1s"
                    }} />
                  </div>
                  <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textAlign: "center" }}>
                    Training... {Math.round(prog)}%
                  </p>
                </div>
              )}

              <button
                className="btn-sm"
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, padding: "10px 14px"
                }}
                onClick={() => !isTraining && startTraining(i)}
                disabled={isTraining}
              >
                {isTraining ? <><Spinner color={color} size={14} /> Training...</> : <>▶ Retrain Model</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Model pipeline */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>ML Pipeline Architecture</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Data Ingestion", icon: "📥", color: T.blue },
            { label: "→", icon: null },
            { label: "Feature Engineering", icon: "⚙️", color: T.orange },
            { label: "→", icon: null },
            { label: "Model Training", icon: "🧠", color: "#7C3AED" },
            { label: "→", icon: null },
            { label: "Validation", icon: "✅", color: T.green },
            { label: "→", icon: null },
            { label: "Deployment", icon: "🚀", color: T.red },
          ].map((step, i) => (
            step.icon === null ? (
              <span key={i} style={{ color: T.textMuted, fontSize: 18 }}>→</span>
            ) : (
              <div key={i} style={{
                background: step.color + "10", border: `1px solid ${step.color}25`,
                borderRadius: 10, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ fontSize: 16 }}>{step.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: step.color }}>{step.label}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
