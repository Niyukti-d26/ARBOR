// ── ARBOR AI Fraud Detector (Advanced) ──
// In production, this would call an ML model endpoint

// ── GPS Spoofing Detection ──
const ZONE_COORDS = {
  'Bellandur': { lat: 12.9279, lng: 77.6751, city: 'Bengaluru' },
  'Koramangala': { lat: 12.9352, lng: 77.6245, city: 'Bengaluru' },
  'Kurla': { lat: 19.0726, lng: 72.8794, city: 'Mumbai' },
  'Velachery': { lat: 12.9815, lng: 80.2180, city: 'Chennai' },
  'Yamuna Khadar': { lat: 28.6300, lng: 77.2500, city: 'Delhi' },
  'Hadapsar': { lat: 18.5089, lng: 73.9260, city: 'Pune' },
  'Tiljala': { lat: 22.5300, lng: 88.3800, city: 'Kolkata' },
  'Malkajgiri': { lat: 17.4500, lng: 78.5200, city: 'Hyderabad' },
};

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Detect GPS spoofing by comparing claimed location to registered zone
 */
export function detectGpsSpoofing(claimedZone, gpsLat, gpsLng) {
  const zoneCoords = ZONE_COORDS[claimedZone];
  if (!zoneCoords || !gpsLat || !gpsLng) {
    return { isSpoofed: false, distance: 0, confidence: 0 };
  }
  const distance = haversineDistance(zoneCoords.lat, zoneCoords.lng, gpsLat, gpsLng);
  const isSpoofed = distance > 10; // >10km from zone center
  return {
    isSpoofed,
    distance: Math.round(distance),
    confidence: isSpoofed ? Math.min(99, 80 + Math.floor(distance / 50)) : 5 + Math.floor(Math.random() * 10),
    claimedZone,
    claimedCity: zoneCoords.city,
    actualLat: gpsLat,
    actualLng: gpsLng,
    expectedLat: zoneCoords.lat,
    expectedLng: zoneCoords.lng,
  };
}

// ── Historical Weather Data (mock IMD records per city per month) ──
const HISTORICAL_WEATHER = {
  Bengaluru: { 0: { avgRain: 2, avgTemp: 28 }, 1: { avgRain: 3, avgTemp: 30 }, 2: { avgRain: 5, avgTemp: 33 }, 3: { avgRain: 12, avgTemp: 34 }, 4: { avgRain: 35, avgTemp: 31 }, 5: { avgRain: 45, avgTemp: 28 }, 6: { avgRain: 55, avgTemp: 26 }, 7: { avgRain: 60, avgTemp: 26 }, 8: { avgRain: 40, avgTemp: 27 }, 9: { avgRain: 25, avgTemp: 28 }, 10: { avgRain: 10, avgTemp: 27 }, 11: { avgRain: 4, avgTemp: 27 } },
  Mumbai: { 0: { avgRain: 0, avgTemp: 30 }, 1: { avgRain: 0, avgTemp: 31 }, 2: { avgRain: 0, avgTemp: 33 }, 3: { avgRain: 1, avgTemp: 34 }, 4: { avgRain: 25, avgTemp: 33 }, 5: { avgRain: 80, avgTemp: 30 }, 6: { avgRain: 95, avgTemp: 28 }, 7: { avgRain: 75, avgTemp: 28 }, 8: { avgRain: 35, avgTemp: 30 }, 9: { avgRain: 10, avgTemp: 32 }, 10: { avgRain: 2, avgTemp: 32 }, 11: { avgRain: 0, avgTemp: 31 } },
  Chennai: { 0: { avgRain: 10, avgTemp: 29 }, 1: { avgRain: 5, avgTemp: 30 }, 2: { avgRain: 2, avgTemp: 33 }, 3: { avgRain: 5, avgTemp: 36 }, 4: { avgRain: 20, avgTemp: 37 }, 5: { avgRain: 15, avgTemp: 36 }, 6: { avgRain: 20, avgTemp: 35 }, 7: { avgRain: 30, avgTemp: 34 }, 8: { avgRain: 40, avgTemp: 33 }, 9: { avgRain: 55, avgTemp: 31 }, 10: { avgRain: 60, avgTemp: 29 }, 11: { avgRain: 30, avgTemp: 28 } },
  Delhi: { 0: { avgRain: 5, avgTemp: 15 }, 1: { avgRain: 8, avgTemp: 18 }, 2: { avgRain: 5, avgTemp: 25 }, 3: { avgRain: 8, avgTemp: 35 }, 4: { avgRain: 15, avgTemp: 40 }, 5: { avgRain: 60, avgTemp: 35 }, 6: { avgRain: 80, avgTemp: 33 }, 7: { avgRain: 55, avgTemp: 33 }, 8: { avgRain: 25, avgTemp: 32 }, 9: { avgRain: 5, avgTemp: 28 }, 10: { avgRain: 2, avgTemp: 20 }, 11: { avgRain: 3, avgTemp: 16 } },
  Hyderabad: { 0: { avgRain: 3, avgTemp: 26 }, 1: { avgRain: 5, avgTemp: 29 }, 2: { avgRain: 8, avgTemp: 33 }, 3: { avgRain: 15, avgTemp: 36 }, 4: { avgRain: 40, avgTemp: 34 }, 5: { avgRain: 55, avgTemp: 30 }, 6: { avgRain: 50, avgTemp: 28 }, 7: { avgRain: 45, avgTemp: 28 }, 8: { avgRain: 35, avgTemp: 29 }, 9: { avgRain: 15, avgTemp: 28 }, 10: { avgRain: 5, avgTemp: 27 }, 11: { avgRain: 3, avgTemp: 25 } },
  Pune: { 0: { avgRain: 1, avgTemp: 25 }, 1: { avgRain: 1, avgTemp: 27 }, 2: { avgRain: 3, avgTemp: 31 }, 3: { avgRain: 10, avgTemp: 33 }, 4: { avgRain: 30, avgTemp: 31 }, 5: { avgRain: 50, avgTemp: 27 }, 6: { avgRain: 45, avgTemp: 26 }, 7: { avgRain: 40, avgTemp: 26 }, 8: { avgRain: 25, avgTemp: 27 }, 9: { avgRain: 10, avgTemp: 28 }, 10: { avgRain: 3, avgTemp: 27 }, 11: { avgRain: 1, avgTemp: 25 } },
  Kolkata: { 0: { avgRain: 8, avgTemp: 22 }, 1: { avgRain: 15, avgTemp: 25 }, 2: { avgRain: 20, avgTemp: 30 }, 3: { avgRain: 35, avgTemp: 33 }, 4: { avgRain: 50, avgTemp: 33 }, 5: { avgRain: 60, avgTemp: 32 }, 6: { avgRain: 65, avgTemp: 31 }, 7: { avgRain: 50, avgTemp: 31 }, 8: { avgRain: 30, avgTemp: 30 }, 9: { avgRain: 15, avgTemp: 28 }, 10: { avgRain: 5, avgTemp: 25 }, 11: { avgRain: 3, avgTemp: 22 } },
};

/**
 * Detect fake weather claims using historical data
 * Returns whether the claimed weather event is consistent with historical data
 */
export function detectFakeWeather(city, claimType, claimedDate) {
  const month = claimedDate ? new Date(claimedDate).getMonth() : new Date().getMonth();
  const cityData = HISTORICAL_WEATHER[city];
  if (!cityData) return { isFake: false, confidence: 0, reason: '' };
  const monthData = cityData[month];

  if (claimType === 'Heavy Rainfall' || claimType === 'rain') {
    if (monthData.avgRain < 5) {
      return {
        isFake: true,
        confidence: 94,
        reason: `Historical IMD data shows avg rainfall of ${monthData.avgRain}mm for ${city} in ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month]}. Heavy rain claim is statistically implausible (p < 0.02).`,
        historicalAvg: monthData.avgRain,
        month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month],
      };
    }
  }

  if (claimType === 'Extreme Heat' || claimType === 'heat') {
    if (monthData.avgTemp < 30) {
      return {
        isFake: true,
        confidence: 91,
        reason: `Historical IMD data shows avg temperature of ${monthData.avgTemp}°C for ${city} in ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month]}. Extreme heat claim is statistically implausible (p < 0.03).`,
        historicalAvg: monthData.avgTemp,
        month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month],
      };
    }
  }

  return {
    isFake: false,
    confidence: 8 + Math.floor(Math.random() * 10),
    reason: `Weather claim is consistent with historical data for ${city}.`,
    historicalAvg: claimType.includes('Rain') ? monthData.avgRain : monthData.avgTemp,
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month],
  };
}

/**
 * Detect velocity anomaly — claims filed impossibly fast
 */
export function detectVelocityAnomaly(claimTimestamps) {
  if (!claimTimestamps || claimTimestamps.length < 2) {
    return { isAnomaly: false, claimsPerHour: 0, confidence: 0 };
  }
  const sorted = claimTimestamps.sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i] - sorted[i - 1]);
  }
  const minGap = Math.min(...gaps);
  const claimsPerHour = 3600000 / (minGap || 1);
  const isAnomaly = minGap < 300000; // less than 5 minutes between claims
  return {
    isAnomaly,
    claimsPerHour: Math.round(claimsPerHour * 10) / 10,
    minGapSeconds: Math.round(minGap / 1000),
    confidence: isAnomaly ? Math.min(96, 75 + Math.floor(claimsPerHour * 2)) : 5,
    reason: isAnomaly
      ? `${gaps.length + 1} claims filed within ${Math.round(minGap / 60000)} minutes. Minimum gap: ${Math.round(minGap / 1000)}s. Statistical anomaly: p < 0.001.`
      : null,
  };
}

/**
 * Composite advanced fraud score — combines all detection signals
 */
export function computeAdvancedFraudScore({ gpsResult, weatherResult, velocityResult, basicResult }) {
  let score = 0;
  let signals = [];

  if (gpsResult?.isSpoofed) {
    score += 0.4;
    signals.push({ type: 'GPS Spoofing', icon: '📍', severity: 'high', detail: `Location mismatch: ${gpsResult.distance}km from zone`, confidence: gpsResult.confidence });
  }
  if (weatherResult?.isFake) {
    score += 0.35;
    signals.push({ type: 'Fake Weather Claim', icon: '🌤️', severity: 'high', detail: weatherResult.reason, confidence: weatherResult.confidence });
  }
  if (velocityResult?.isAnomaly) {
    score += 0.25;
    signals.push({ type: 'Velocity Anomaly', icon: '⚡', severity: 'medium', detail: velocityResult.reason, confidence: velocityResult.confidence });
  }
  if (basicResult?.fraudScore > 0.5) {
    score += basicResult.fraudScore * 0.3;
    signals.push({ type: basicResult.fraudLabel || 'Pattern Match', icon: '🔍', severity: basicResult.fraudScore > 0.8 ? 'high' : 'medium', detail: basicResult.reason || 'Suspicious pattern detected', confidence: basicResult.confidence });
  }

  score = Math.min(1, score);
  return {
    compositeScore: Math.round(score * 100),
    riskLevel: score > 0.7 ? 'critical' : score > 0.4 ? 'high' : score > 0.2 ? 'medium' : 'low',
    signals,
    totalSignals: signals.length,
    recommendation: score > 0.6 ? 'BLOCK' : score > 0.3 ? 'REVIEW' : 'APPROVE',
  };
}

/**
 * Returns a fraud assessment for a given claim (original function — kept intact)
 * @param {object} claim - { type, workerId, zone, timestamp, amount }
 * @param {string} fraudType - null | 'gps_spoofing' | 'duplicate' | 'coordinated'
 * @returns {{ fraudScore: number, confidence: number, reason: string | null }}
 */
export function fraudDetector(claim, fraudType = null) {
  // Simulate AI processing delay visually (actual delay is done in UI)
  
  if (fraudType === 'gps_spoofing') {
    return {
      fraudScore: 0.92,
      confidence: 97,
      reason: 'GPS Spoofing — Worker location (Andheri, Mumbai) does not match claimed zone (Bellandur, Bengaluru). Distance: 1,392 km.',
      fraudLabel: 'GPS Spoofing',
    };
  }

  if (fraudType === 'duplicate') {
    return {
      fraudScore: 0.88,
      confidence: 94,
      reason: 'Duplicate Claim — Same trigger (Heavy Rainfall) claimed twice within 47 minutes. Previous claim: CLM-2481.',
      fraudLabel: 'Duplicate Claim',
    };
  }

  if (fraudType === 'coordinated') {
    return {
      fraudScore: 0.95,
      confidence: 99,
      reason: 'Coordinated Fraud Pattern — 14 workers in the same zone filed claims for the same trigger within 90 seconds. Statistical anomaly: p < 0.001.',
      fraudLabel: 'Coordinated Ring',
    };
  }

  // Normal claim — low fraud risk
  // Occasionally trigger the edge case (low confidence) for demo purposes
  const roll = Math.random();
  if (roll < 0.05) {
    // Edge case: low confidence
    return {
      fraudScore: 0.45 + Math.random() * 0.2,
      confidence: 60 + Math.floor(Math.random() * 20),
      reason: null,
      fraudLabel: null,
      isEdgeCase: true,
    };
  }

  return {
    fraudScore: 0.05 + Math.random() * 0.15,
    confidence: 88 + Math.floor(Math.random() * 10),
    reason: null,
    fraudLabel: null,
  };
}
