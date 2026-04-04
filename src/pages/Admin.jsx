import { useState } from 'react';
import { T, ADMIN_DATA, RECENT_CLAIMS, PLANS } from '../data/constants';
import { Spinner, ProgressBar, PillTag, SectionHeader } from '../components/shared';
import { exportAdminExcel } from '../utils/exportExcel';

const statusStyles = {
  paid:    [T.green, T.greenLight],
  review:  [T.amber, T.amberLight],
  flagged: [T.red, T.redLight],
};

export default function Admin({ user, onToast }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAdminExcel(user);
      onToast && onToast("ARBOR_AdminReport.xlsx downloaded!");
    } catch {
      onToast && onToast("Export failed — check console");
    } finally {
      setExporting(false);
    }
  };

  const stats = [
    { label: "Total Users",     value: ADMIN_DATA.totalUsers.toLocaleString(), icon: "👥", color: T.blue },
    { label: "Active Today",    value: ADMIN_DATA.activeToday.toLocaleString(), icon: "✅", color: T.green },
    { label: "Active Claims",   value: ADMIN_DATA.activeClaims.toString(),      icon: "📋", color: T.orange },
    { label: "Paid This Week",  value: `₹${(ADMIN_DATA.paidThisWeek / 1000).toFixed(0)}K`, icon: "💸", color: T.green },
    { label: "Fraud Alerts",    value: ADMIN_DATA.fraudAlerts.toString(),        icon: "🚨", color: T.red },
    { label: "Avg Trust Score", value: `${ADMIN_DATA.avgTrustScore}/100`,        icon: "⭐", color: T.amber },
  ];

  return (
    <div className="page-section">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: T.orange, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
          }}>⚙</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Admin Console</h2>
            <p style={{ fontSize: 12, color: T.textSec }}>ARBOR Operations Dashboard</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="risk-pulse" style={{ background: T.green }} />
            <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Live</span>
          </div>
          <button className="btn-export" onClick={handleExport} disabled={exporting}>
            {exporting ? <><Spinner size={14} /> Exporting...</> : <>📊 Export Excel</>}
          </button>
        </div>
      </div>

      {/* Export info */}
      <div style={{
        background: T.greenLight, border: `1px solid ${T.green}30`,
        borderRadius: 12, padding: "12px 16px", marginBottom: 20,
        display: "flex", gap: 10, alignItems: "center"
      }}>
        <span style={{ fontSize: 16 }}>📁</span>
        <p style={{ fontSize: 12, color: "#0a5c2a", lineHeight: 1.5 }}>
          Exports a <strong>4-sheet Excel</strong>: Summary, Claims, Worker Profile, Zone Risk Map
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: "center", padding: "14px 16px" }}>
            <p style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginTop: 3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Fraud banner */}
      <div style={{
        background: T.redLight, border: `1px solid ${T.red}30`,
        borderRadius: 12, padding: "14px 16px", marginBottom: 24,
        display: "flex", gap: 10, alignItems: "center"
      }}>
        <span style={{ fontSize: 22 }}>🚨</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.red }}>{ADMIN_DATA.fraudAlerts} fraud alerts require review</p>
          <p style={{ fontSize: 12, color: T.textSec }}>GPS spoofing · Trust score &lt; 40 · Duplicate claim attempt</p>
        </div>
      </div>

      {/* Claims table */}
      <SectionHeader title="Recent Claims" right={
        <PillTag color={T.orange}>{RECENT_CLAIMS.length} records</PillTag>
      } />
      <div className="card" style={{ overflow: "hidden", marginBottom: 24 }}>
        {RECENT_CLAIMS.map((c, i) => {
          const [color, bg] = statusStyles[c.status] || [T.textMuted, T.bg];
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              borderBottom: i < RECENT_CLAIMS.length - 1 ? `1px solid ${T.border}` : "none"
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: T.bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700,
                color: T.textSec, flexShrink: 0
              }}>
                {c.user.split(" ").map(w => w[0]).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>
                  {c.user} <span style={{ fontSize: 11, color: T.textSec, fontWeight: 400 }}>· {c.zone}</span>
                </p>
                <p style={{ fontSize: 11, color: T.textSec }}>{c.trigger} · {c.city}</p>
              </div>
              <div style={{ textAlign: "right", marginRight: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700 }}>₹{c.amount}</p>
                <span className="pill" style={{ background: bg, color, fontSize: 10 }}>{c.status}</span>
              </div>
              <div style={{ textAlign: "center", minWidth: 36 }}>
                <p style={{
                  fontSize: 14, fontWeight: 700,
                  color: c.aiScore >= 80 ? T.green : c.aiScore >= 60 ? T.amber : T.red
                }}>{c.aiScore}%</p>
                <p style={{ fontSize: 9, color: T.textMuted, fontWeight: 600 }}>AI</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan distribution */}
      <SectionHeader title="Plan Distribution" />
      <div className="card" style={{ padding: 20 }}>
        {[
          { plan: "Starter", count: 3842, pct: 30, idx: 0 },
          { plan: "Standard", count: 6424, pct: 50, idx: 1 },
          { plan: "Pro", count: 2581, pct: 20, idx: 2 },
        ].map((d, i) => {
          const p = PLANS[d.idx];
          return (
            <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{d.plan}</span>
                <span style={{ fontSize: 12, color: T.textSec }}>{d.count.toLocaleString()} · {d.pct}%</span>
              </div>
              <ProgressBar value={d.pct} max={100} color={p.color} height={6} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
