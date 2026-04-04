import { T, WEATHER_DATA, ZONES } from '../data/constants';
import { PillTag } from '../components/shared';

const riskColors = { high: T.red, medium: T.amber, low: T.green };

export default function LiveMonitor({ onToast }) {
  return (
    <div className="page-section">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>
        Live Environmental Monitor
      </h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 20 }}>
        Real-time data from OpenWeatherMap, CPCB AQI, HERE Traffic APIs
      </p>

      {/* Weather Grid */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Current Conditions — Chennai, Tamil Nadu</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 6,
              background: T.redLight, border: `1px solid ${T.red}20`,
              fontSize: 10, fontWeight: 700, color: T.red
            }}>
              <div className="pulse-dot" style={{ background: T.red, width: 5, height: 5 }} />LIVE
            </div>
            <span style={{ fontSize: 11, color: T.textMuted }}>Updated just now</span>
          </div>
        </div>
        <div className="weather-grid">
          {WEATHER_DATA.map((w, i) => (
            <div key={i} className="weather-item">
              <div style={{ fontSize: 30, marginBottom: 6 }}>{w.icon}</div>
              <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: ".05em" }}>{w.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, margin: "4px 0" }}>{w.value}</p>
              <p style={{ fontSize: 10, color: T.textMuted }}>{w.unit}</p>
              <span className={`weather-status ${w.status}`}>{w.statusText}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-side">
        {/* Risk Zone Map */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Risk Zone Map — Chennai</h3>
            <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}
              onClick={() => onToast && onToast("Zone scan started — scanning 24 micro-zones...")}>
              Refresh Zones
            </button>
          </div>
          <div className="zone-map">
            <div className="zone-bg" />
            <div className="zone-grid-lines" />
            <div className="zone-dot danger" style={{ top: "40%", left: "30%" }} title="T.Nagar - HIGH RISK" />
            <div className="zone-dot danger" style={{ top: "55%", left: "45%" }} title="Vadapalani - HIGH RISK" />
            <div className="zone-dot warn" style={{ top: "30%", left: "60%" }} title="Anna Nagar - WARNING" />
            <div className="zone-dot warn" style={{ top: "65%", left: "25%" }} title="Chrompet - WARNING" />
            <div className="zone-dot safe" style={{ top: "20%", left: "75%" }} title="OMR - CLEAR" />
            <div className="zone-dot safe" style={{ top: "75%", left: "70%" }} title="Sholinganallur - CLEAR" />
            <div className="zone-dot safe" style={{ top: "45%", left: "80%" }} title="Velachery - CLEAR" />
            <div style={{
              position: "absolute", bottom: 12, left: 14, fontSize: 10,
              display: "flex", gap: 14, color: T.textMuted
            }}>
              {[{ c: T.red, l: "High Risk" }, { c: T.amber, l: "Warning" }, { c: T.green, l: "Clear" }].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.c + "99" }} />
                  {item.l}
                </div>
              ))}
            </div>
          </div>

          <table className="zone-table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Zone</th><th>Risk Level</th><th>Workers</th><th>Active Disruption</th></tr>
            </thead>
            <tbody>
              {ZONES.map((z, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{z.name}</td>
                  <td><PillTag color={riskColors[z.risk]}>{z.risk.toUpperCase()}</PillTag></td>
                  <td>{z.workers}</td>
                  <td><PillTag color={z.disruption === "None" ? T.green : T.red}>{z.disruption}</PillTag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pre-Shield Alert */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Pre-Shield Alert</h3>
              <PillTag color={T.blue}>PREDICTIVE</PillTag>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: T.blueLight, borderRadius: 12, padding: "14px 16px", border: `1px solid ${T.blue}25` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.blue, marginBottom: 4 }}>PREDICTED — 3 hrs from now</p>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Heavy rain expected in Adyar</p>
                <p style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>Avoid this zone by 6 PM</p>
              </div>
              <div style={{ background: T.amberLight, borderRadius: 12, padding: "14px 16px", border: `1px solid ${T.amber}25` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.amber, marginBottom: 4 }}>WATCH — Tomorrow AM</p>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Cyclone alert — coastal zones</p>
                <p style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>Coverage auto-activates at trigger</p>
              </div>
            </div>
          </div>

          {/* Income Impact Score */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Income Impact Score</h3>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <p style={{ fontSize: 52, fontWeight: 800, color: T.red, lineHeight: 1 }}>68%</p>
              <p style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>Income drop detected today</p>
              <div style={{ marginTop: 14, height: 10, background: T.border, borderRadius: 5, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: "68%",
                  background: `linear-gradient(90deg, ${T.red}, ${T.orange})`,
                  borderRadius: 5
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                <span>0%</span><span>30% threshold</span><span>100%</span>
              </div>
              <div style={{
                marginTop: 14, padding: "12px 14px",
                background: T.greenLight, borderRadius: 10,
                border: `1px solid ${T.green}20`
              }}>
                <p style={{ fontWeight: 700, color: T.green, fontSize: 14 }}>ELIGIBLE FOR PAYOUT</p>
                <p style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>Estimated: ₹300 today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
