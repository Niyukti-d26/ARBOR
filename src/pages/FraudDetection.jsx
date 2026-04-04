import { T, ANOMALIES } from '../data/constants';
import { PillTag, ProgressBar } from '../components/shared';

const levelColors = { high: T.red, med: T.amber, low: T.green };

export default function FraudDetection({ onToast }) {
  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>
        Fraud Detection & Anomaly Engine
      </h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>
        ML-powered fraud detection with real-time anomaly scoring
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "CLAIMS SCANNED", value: "1,847", color: T.blue },
          { label: "FRAUD DETECTED", value: "23", color: T.red },
          { label: "FALSE POSITIVE RATE", value: "2.1%", color: T.green },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: ".04em", marginTop: 4 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Anomaly list */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Anomalies</h3>
            <PillTag color={T.red}>{ANOMALIES.length} flagged</PillTag>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ANOMALIES.map((a, i) => {
              const color = levelColors[a.level] || T.amber;
              return (
                <div key={i} className="anomaly-item">
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: color + "15", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14, color, flexShrink: 0
                  }}>{a.score}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{a.worker}</p>
                    <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{a.reason}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-sm"
                      onClick={() => onToast && onToast(`Reviewing ${a.worker}...`)}>
                      Review
                    </button>
                    <button className="btn-sm" style={{ color: T.red, borderColor: T.red + "40" }}
                      onClick={() => onToast && onToast(`${a.worker} flagged for investigation`)}>
                      Flag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fraud Detection Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Detection Methods</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { method: "GPS Spoofing Detection", acc: 97, desc: "Cross-reference with cell tower triangulation", color: T.blue },
                { method: "Behavioral Analysis", acc: 89, desc: "Claim patterns vs historical worker behavior", color: T.orange },
                { method: "Device Fingerprinting", acc: 94, desc: "Detect multi-account from same device", color: "#7C3AED" },
                { method: "Community Validation", acc: 91, desc: "Cross-check with zone peer reports", color: T.green },
              ].map((m, i) => (
                <div key={i} style={{
                  background: T.bg, borderRadius: 10, padding: "12px 14px",
                  border: `1px solid ${T.border}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{m.method}</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.acc}%</span>
                  </div>
                  <ProgressBar value={m.acc} max={100} color={m.color} height={5} />
                  <p style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Fraud Risk Distribution</h3>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Low Risk", pct: 78, color: T.green },
                { label: "Medium", pct: 15, color: T.amber },
                { label: "High Risk", pct: 7, color: T.red },
              ].map((r, i) => (
                <div key={i} style={{ flex: r.pct, textAlign: "center" }}>
                  <div style={{
                    height: 80, background: r.color + "15",
                    borderRadius: 8, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    border: `1px solid ${r.color}25`
                  }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{r.pct}%</p>
                  </div>
                  <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginTop: 6 }}>{r.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
