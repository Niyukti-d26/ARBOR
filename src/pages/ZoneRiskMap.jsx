import { useState } from 'react';
import { T, CITY_ZONES, CITIES } from '../data/constants';

const RISK_CONFIG = {
  high: { color: '#E23744', bg: '#FEF0F1', label: 'High' },
  medium: { color: '#F59E0B', bg: '#FFFBEB', label: 'Medium' },
  low: { color: '#60B246', bg: '#EDF7EA', label: 'Low' },
};

// Generate zone risk data
const generateZoneRisk = () => {
  const zones = [];
  CITIES.forEach(city => {
    const cityZones = CITY_ZONES[city] || [];
    cityZones.forEach(zone => {
      const isFlood = zone.flood;
      const riskLevel = isFlood
        ? (Math.random() > 0.4 ? 'high' : 'medium')
        : (Math.random() > 0.7 ? 'medium' : 'low');
      const triggers = [];
      if (riskLevel === 'high') {
        triggers.push(Math.random() > 0.5 ? 'Heavy Rainfall' : 'Extreme Heat');
        if (Math.random() > 0.6) triggers.push('AQI Emergency');
      } else if (riskLevel === 'medium') {
        triggers.push(Math.random() > 0.5 ? 'AQI Emergency' : 'Platform Outage');
      }
      zones.push({
        id: `${city}-${zone.name}`,
        city, zone: zone.name, isFlood,
        risk: riskLevel,
        triggers: triggers.join(', ') || 'None',
        workers: Math.floor(200 + Math.random() * 800),
        avgIncome: Math.floor(450 + Math.random() * 300),
      });
    });
  });
  return zones;
};

const ZONE_DATA = generateZoneRisk();

const ACTIVE_TRIGGERS = [
  { id: 'T001', name: 'Heavy Rainfall', city: 'Mumbai', zones: 'Kurla, Sion, Dharavi', threshold: '20mm', current: '34mm', active: true, color: '#3B82F6' },
  { id: 'T002', name: 'AQI Emergency', city: 'Delhi', zones: 'Yamuna Khadar, Burari', threshold: 'AQI 200', current: 'AQI 285', active: true, color: '#F59E0B' },
  { id: 'T003', name: 'Extreme Heat', city: 'Chennai', zones: 'Velachery, Porur', threshold: '40°C', current: '38.5°C', active: false, color: '#E23744' },
  { id: 'T004', name: 'Platform Outage', city: 'Hyderabad', zones: 'All zones', threshold: '30 min', current: '12 min', active: false, color: '#7C3AED' },
];

export default function ZoneRiskMap() {
  const [selectedCity, setSelectedCity] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = ZONE_DATA.filter(z =>
    (selectedCity === 'all' || z.city === selectedCity) &&
    (z.zone.toLowerCase().includes(search.toLowerCase()) || z.city.toLowerCase().includes(search.toLowerCase()))
  );

  const riskCounts = {
    high: filtered.filter(z => z.risk === 'high').length,
    medium: filtered.filter(z => z.risk === 'medium').length,
    low: filtered.filter(z => z.risk === 'low').length,
  };

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number">{filtered.length}</div>
          <div className="stat-label">Total Zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#E23744' }}>{riskCounts.high}</div>
          <div className="stat-label">High Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#F59E0B' }}>{riskCounts.medium}</div>
          <div className="stat-label">Medium Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#60B246' }}>{riskCounts.low}</div>
          <div className="stat-label">Low Risk</div>
        </div>
      </div>

      {/* ── Trigger Engine ── */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Trigger Engine — Live State</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Monitors real-time conditions and fires claims automatically</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACTIVE_TRIGGERS.map(tr => (
            <div key={tr.id} style={{
              display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 8,
              background: tr.active ? `${tr.color}11` : T.bg,
              border: `1px solid ${tr.active ? `${tr.color}33` : T.border}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tr.active ? tr.color : T.border, ...(tr.active ? { animation: 'pulse 1.5s infinite' } : {}) }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{tr.name}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>· {tr.city}</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{tr.zones} · Threshold: {tr.threshold} · Now: {tr.current}</div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 5,
                background: tr.active ? tr.color : '#EDF7EA',
                color: tr.active ? 'white' : '#60B246',
              }}>
                {tr.active ? '● FIRING' : '✓ Normal'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Risk Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Zone Risk Table</div>
          <div style={{ flex: 1 }} />
          <input className="input" placeholder="Search zone..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 200, padding: '6px 12px', fontSize: 12 }} />
          <select className="input" value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={{ maxWidth: 140, padding: '6px 12px', fontSize: 12 }}>
            <option value="all">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>City</th>
              <th>Risk Level</th>
              <th>Active Triggers</th>
              <th>Workers</th>
              <th>Avg Income</th>
              <th>Flood-Prone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map(z => {
              const rc = RISK_CONFIG[z.risk];
              return (
                <tr key={z.id}>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{z.zone}</td>
                  <td style={{ fontSize: 12, color: T.textSec }}>{z.city}</td>
                  <td>
                    <span className="badge" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span>
                  </td>
                  <td style={{ fontSize: 12, color: T.textSec }}>{z.triggers || '—'}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{z.workers}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>₹{z.avgIncome}</td>
                  <td>
                    {z.isFlood
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: '#E23744' }}>⚠ Yes</span>
                      : <span style={{ fontSize: 11, color: T.textMuted }}>No</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
