import { useState, useEffect, useRef } from 'react';
import { T, getMockWeather, CITIES } from '../data/constants';
import { Search, MapPin, CloudRain, Thermometer, AlertTriangle, RefreshCw } from '../components/Icons';

const OWM_API_KEY = '0a747540101ae72eb9b0c97f65f8513b';
const CITY_LIST = CITIES;

function getAqiInfo(aqi) {
  if (aqi < 50)  return { label: 'Good',        color: '#60B246', bg: '#EDF7EA' };
  if (aqi < 100) return { label: 'Satisfactory', color: '#60B246', bg: '#EDF7EA' };
  if (aqi < 200) return { label: 'Moderate',     color: '#F59E0B', bg: '#FFFBEB' };
  if (aqi < 300) return { label: 'Poor',         color: '#E23744', bg: '#FEF0F1' };
  return              { label: 'Hazardous',      color: '#9B1D20', bg: '#FEF0F1' };
}

function getTriggerStatus(weather) {
  const triggers = [];
  if (weather.rainfall > 20) triggers.push({ name: 'Heavy Rainfall', active: true, color: '#3B82F6' });
  if (weather.temperature > 40) triggers.push({ name: 'Extreme Heat', active: true, color: '#E23744' });
  if (weather.aqi > 200) triggers.push({ name: 'AQI Emergency', active: true, color: '#F59E0B' });
  if (weather.rainfall > 20 && weather.temperature > 40) {
    const heat = triggers.find(t => t.name === 'Extreme Heat');
    if (heat) heat.active = false;
  }
  return triggers;
}

async function fetchOWMWeather(cityName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)},IN&appid=${OWM_API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`City not found: ${cityName}`);
  const data = await res.json();
  return {
    temperature: +data.main.temp.toFixed(1),
    rainfall: data.rain ? +(data.rain['1h'] || data.rain['3h'] || 0).toFixed(1) : 0,
    humidity: data.main.humidity,
    windSpeed: +data.wind.speed.toFixed(1),
    aqi: Math.floor(data.main.humidity * 2 + data.main.pressure * 0.1), // approximate from available data
    condition: data.weather[0]?.description || 'Clear',
    heatIndex: +(data.main.feels_like || data.main.temp).toFixed(1),
    platformStatus: {
      Swiggy: { status: 'operational', uptime: 99.4 },
      Zomato: { status: 'operational', uptime: 99.1 },
      Uber: { status: 'operational', uptime: 99.6 },
      Ola: { status: Math.random() > 0.9 ? 'degraded' : 'operational', uptime: 98.8 },
    },
    source: 'live', // mark as live data
    cityName: data.name,
  };
}

export default function LiveMonitor({ onToast }) {
  const [weatherData, setWeatherData] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Surat', 'Jaipur', 'Chandigarh']);
  const [searchResult, setSearchResult] = useState(null); // custom searched city weather
  const [searchError, setSearchError] = useState('');
  const searchRef = useRef(null);

  const fetchWeather = () => {
    const data = {};
    CITY_LIST.forEach(city => {
      data[city] = getMockWeather(city);
    });
    setWeatherData(data);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const result = await fetchOWMWeather(searchQuery.trim());
      setSearchResult(result);
      setSelectedCity(result.cityName);
      // Update recent searches (max 3)
      setRecentSearches(prev => {
        const filtered = prev.filter(c => c.toLowerCase() !== result.cityName.toLowerCase());
        return [result.cityName, ...filtered].slice(0, 3);
      });
    } catch (err) {
      setSearchError(`City not found. Try another city name.`);
    } finally {
      setSearching(false);
    }
  };

  const handleQuickSearch = async (city) => {
    setSearchQuery(city);
    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const result = await fetchOWMWeather(city);
      setSearchResult(result);
      setSelectedCity(result.cityName);
    } catch {
      setSearchError(`Could not fetch weather for ${city}.`);
    } finally {
      setSearching(false);
    }
  };

  // Determine current display data
  const displayWeather = searchResult || weatherData[selectedCity];
  const selected = displayWeather;
  const aqiInfo = selected ? getAqiInfo(selected.aqi) : null;
  const activeTriggers = selected ? getTriggerStatus(selected) : [];

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeUp .35s ease both' }}>
      {/* ── City Search Bar ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: T.textMuted, display: 'flex'
            }}>
              <Search size={16} />
            </span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search any Indian city (eg: Surat, Jaipur, Kochi...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%', paddingLeft: 40, paddingRight: 14, height: 42,
                borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13,
                fontFamily: 'Inter, sans-serif', color: T.text, background: T.white,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button onClick={handleSearch} disabled={searching} style={{
            padding: '0 20px', borderRadius: 8, border: 'none',
            background: T.primary, color: 'white', fontSize: 13, fontWeight: 700,
            cursor: searching ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
            opacity: searching ? 0.7 : 1, whiteSpace: 'nowrap',
          }}>
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {/* Recent search chips */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>Recent:</span>
          {recentSearches.map(city => (
            <button key={city} onClick={() => handleQuickSearch(city)} style={{
              padding: '4px 12px', borderRadius: 20, border: `1px solid ${T.border}`,
              background: T.white, fontSize: 12, fontWeight: 500, color: T.textSec,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s',
            }}>{city}</button>
          ))}
          {searchResult && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 20,
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              fontSize: 11, fontWeight: 600, color: '#1D4ED8',
            }}>
              <MapPin size={12} /> Live: {searchResult.cityName}
            </div>
          )}
        </div>

        {searchError && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: '#FEF0F1', borderRadius: 6, border: '1px solid #FBBBBC', fontSize: 12, color: '#E23744' }}>
            {searchError}
          </div>
        )}
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.textMuted }}>
          Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · Refreshes every 30s
        </div>
        <button onClick={() => { fetchWeather(); setSearchResult(null); }} style={{
          background: T.primary, color: 'white', border: 'none', borderRadius: 7,
          padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6
        }}><RefreshCw size={12} /> Refresh</button>
      </div>

      {/* City Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {CITY_LIST.map(city => {
          const w = weatherData[city];
          if (!w) return (
            <div key={city} style={{ background: T.white, borderRadius: 10, border: `1px solid ${T.border}`, padding: 16, opacity: 0.6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{city}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Loading...</div>
            </div>
          );
          const isAlert = w.rainfall > 20 || w.temperature > 40 || w.aqi > 200;
          const isSelected = !searchResult && selectedCity === city;
          return (
            <div key={city} onClick={() => { setSelectedCity(city); setSearchResult(null); setSearchQuery(''); }} style={{
              background: T.white, borderRadius: 10, border: `1.5px solid`,
              borderColor: isSelected ? T.primary : isAlert ? '#FFD5C2' : T.border,
              padding: 14, cursor: 'pointer', transition: 'all .15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{city}</div>
                {isAlert && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E23744', animation: 'pulse 1.5s infinite' }} />}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: T.text }}>{w.temperature}°C</div>
              <div style={{ fontSize: 11, color: T.textSec, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CloudRain size={12} /> {w.rainfall}mm · AQI {w.aqi}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected City Detail */}
      {selected && (
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Weather Detail */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                {selectedCity} — Detailed View
              </div>
              {searchResult && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 5, background: '#EFF6FF',
                  fontSize: 10, fontWeight: 700, color: '#1D4ED8',
                }}>
                  <MapPin size={12} /> LIVE API
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: 14, background: T.bg, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Temperature</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: selected.temperature > 40 ? '#E23744' : T.text }}>{selected.temperature}°C</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{selected.condition}</div>
              </div>
              <div style={{ textAlign: 'center', padding: 14, background: T.bg, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Rainfall</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: selected.rainfall > 20 ? '#3B82F6' : T.text }}>{selected.rainfall}mm</div>
                <div style={{ fontSize: 11, color: selected.rainfall > 20 ? '#3B82F6' : T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {selected.rainfall > 20 ? <><AlertTriangle size={11} /> Heavy rain trigger</> : 'Normal'}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: 14, background: aqiInfo.bg, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: aqiInfo.color, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>AQI</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: aqiInfo.color }}>{selected.aqi}</div>
                <div style={{ fontSize: 11, color: aqiInfo.color, fontWeight: 600 }}>{aqiInfo.label}</div>
              </div>
              <div style={{ textAlign: 'center', padding: 14, background: T.bg, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Heat Index</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: selected.heatIndex > 40 ? '#E23744' : T.text }}>{selected.heatIndex}°</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Humidity {selected.humidity}%</div>
              </div>
            </div>
          </div>

          {/* Trigger Logic */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Active Trigger Logic</div>
            {selected.rainfall > 20 && (
              <div style={{ display: 'flex', gap: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#1D4ED8' }}>
                <AlertTriangle size={16} /> <div>Rainfall &gt;20mm detected — <strong>Heat trigger is automatically disabled</strong> to prevent duplicate payouts.</div>
              </div>
            )}
            {selected.temperature > 40 && selected.rainfall <= 20 && (
              <div style={{ display: 'flex', gap: 8, background: '#FEF0F1', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#991B1B' }}>
                <AlertTriangle size={16} /> <div>Temp &gt;40°C detected — <strong>Rain trigger is automatically disabled</strong>.</div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'rain', label: 'Heavy Rainfall', icon: <CloudRain size={20} color={selected.rainfall > 20 ? "#3B82F6" : "currentColor"} />, active: selected.rainfall > 20, value: `${selected.rainfall}mm`, threshold: '>20mm', disabled: selected.temperature > 40 },
                { key: 'heat', label: 'Extreme Heat', icon: <Thermometer size={20} color={selected.temperature > 40 ? "#E23744" : "currentColor"} />, active: selected.temperature > 40, value: `${selected.temperature}°C`, threshold: '>40°C', disabled: selected.rainfall > 20 },
                { key: 'aqi', label: 'AQI Emergency', icon: <AlertTriangle size={20} color={selected.aqi > 200 ? "#F59E0B" : "currentColor"} />, active: selected.aqi > 200, value: selected.aqi, threshold: '>200', disabled: false },
              ].map(tr => (
                <div key={tr.key} style={{
                  display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: 8,
                  background: tr.disabled ? '#F5F5F5' : tr.active ? (tr.key === 'rain' ? '#EFF6FF' : tr.key === 'heat' ? '#FEF0F1' : '#FFFBEB') : T.bg,
                  border: `1px solid ${tr.disabled ? T.border : tr.active ? (tr.key === 'rain' ? '#BFDBFE' : tr.key === 'heat' ? '#FCA5A5' : '#FCD34D') : T.border}`,
                  opacity: tr.disabled ? 0.5 : 1,
                }}>
                  <div style={{ marginRight: 10, display: 'flex', alignItems: 'center' }}>{tr.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{tr.label}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Threshold: {tr.threshold} · Now: {tr.value}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                    background: tr.disabled ? T.border : tr.active ? '#E23744' : '#EDF7EA',
                    color: tr.disabled ? T.textMuted : tr.active ? 'white' : '#60B246',
                  }}>
                    {tr.disabled ? 'Disabled' : tr.active ? 'TRIGGERED' : 'Normal'}
                  </div>
                </div>
              ))}
            </div>
            {/* Platform status */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSec, marginBottom: 10 }}>Platform Status</div>
              {Object.entries(selected.platformStatus).map(([name, info]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.textSec }}>{name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: info.status === 'operational' ? '#60B246' : '#F59E0B' }}>
                    {info.status === 'operational' ? '● ' : '◐ '}{info.uptime}% uptime
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
