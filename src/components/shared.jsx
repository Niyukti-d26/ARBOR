import { T } from '../data/constants';

export function Spinner({ color = "white", size = 16 }) {
  return (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}40`, borderTopColor: color,
      borderRadius: "50%", animation: "spin .7s linear infinite",
      display: "inline-block", flexShrink: 0
    }} />
  );
}

export function TrustBadge({ score }) {
  const color = score >= 80 ? T.green : score >= 60 ? T.amber : T.red;
  const label = score >= 80 ? "Trusted" : score >= 60 ? "Building" : "New";
  return (
    <span className="pill" style={{ background: color + "18", color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

export function ProgressBar({ value, max, color = T.orange, height = 8 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ height, background: T.border, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: height / 2, background: color,
        width: `${pct}%`, transition: "width .8s cubic-bezier(.4,0,.2,1)"
      }} />
    </div>
  );
}

export function SectionHeader({ title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
      {right}
    </div>
  );
}

export function PillTag({ children, color = T.orange }) {
  return (
    <span className="pill" style={{ background: color + "15", color, border: `1px solid ${color}25` }}>
      {children}
    </span>
  );
}
