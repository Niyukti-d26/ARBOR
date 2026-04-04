import { useState, useEffect } from 'react';
import { T, CITY_ZONES } from '../data/constants';
import { getRealtimeService } from '../services/realtimeData';

export default function ZoneRiskMap() {
  const [data, setData] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const svc = getRealtimeService();

  useEffect(() => {
    const zones = CITY_ZONES[selectedCity] || [];
    svc.initZones(zones);
    svc.start();
    setData(svc.getSnapshot());
    const unsub = svc.subscribe(d => setData(d));
    return unsub;
  }, [selectedCity]);

  if (!data) return null;

  const zones = CITY_ZONES[selectedCity] || [];

  return (
    <div className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Zone Risk Map</h2>
          <p style={{ fontSize: 13, color: T.textSec }}>Real-time risk heatmap across zones</p>
        </div>
        <select className="input" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
          style={{ width: 180 }}>
          {Object.keys(CITY_ZONES).map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Heatmap Grid */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{selectedCity} — Zone Heatmap</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {zones.map((z, i) => {
            const zoneData = data.zones.find(d => d.name === z.name);
            const risk = zoneData?.riskScore || (z.flood ? 7 : 3);
            const color = risk > 7 ? T.red : risk > 5 ? T.amber : T.green;
            return (
              <div key={i} style={{
                padding: '16px 14px', borderRadius: 12, textAlign: 'center',
                background: `${color}10`, border: `2px solid ${color}30`,
                transition: 'all .3s', cursor: 'default'
              }}>
                <span style={{ fontSize: 24 }}>{z.flood ? '🌊' : '📍'}</span>
                <p style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{z.name}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{risk.toFixed(1)}</p>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: color + '20', color
                }}>{risk > 7 ? 'HIGH RISK' : risk > 5 ? 'ELEVATED' : 'NORMAL'}</span>
                {zoneData && (
                  <p style={{ fontSize: 10, color: T.textMuted, marginTop: 6 }}>
                    {zoneData.activeWorkers} workers · {zoneData.activeClaims} claims
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="zone-table">
          <thead>
            <tr>
              <th>Zone</th><th>Risk Score</th><th>Flood Prone</th><th>Workers</th><th>Active Claims</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z, i) => {
              const zd = data.zones.find(d => d.name === z.name);
              const risk = zd?.riskScore || (z.flood ? 6 : 2);
              const color = risk > 7 ? T.red : risk > 5 ? T.amber : T.green;
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{z.name}</td>
                  <td><span style={{ fontWeight: 700, color }}>{risk.toFixed(1)}/10</span></td>
                  <td>{z.flood ? <span style={{ color: T.red, fontWeight: 600 }}>🌊 Yes</span> : <span style={{ color: T.green }}>No</span>}</td>
                  <td>{zd?.activeWorkers || '—'}</td>
                  <td>{zd?.activeClaims || 0}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                      background: color + '15', color
                    }}>{zd?.disruption || 'Normal'}</span>
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
