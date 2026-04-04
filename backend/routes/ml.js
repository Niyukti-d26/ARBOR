import express from 'express';
import { gigs, workers } from '../data/mockData.js';
const router = express.Router();

// ── Income Predictor (linear regression mock) ──
function predictIncome({ zone, weather, platform, hour, dayOfWeek, season }) {
  let base = 650;
  // Weather adjustment
  if (weather === 'rainy') base *= 0.28;
  else if (weather === 'heat') base *= 0.52;
  else if (weather === 'outage') base *= 0.15;
  // Hour adjustment
  const peakHours = [8, 9, 12, 13, 19, 20, 21];
  if (peakHours.includes(hour)) base *= 1.35;
  // Day adjustment
  if (dayOfWeek === 0 || dayOfWeek === 6) base *= 1.2;
  // Season
  if (season === 'monsoon') base *= 0.85;
  else if (season === 'summer') base *= 0.9;
  return Math.round(base);
}

// ── Fraud Detector ──
function detectFraud({ gpsMatch, claimCount, hasGigActivity, claimsPerMinute }) {
  let score = 0;
  if (!gpsMatch) score += 0.5;
  if (claimsPerMinute >= 3) score += 0.35;
  if (!hasGigActivity) score += 0.25;
  if (claimCount > 10) score += 0.15;
  return Math.min(1, score);
}

// ── Trust Scorer ──
function calculateTrust(workerId) {
  const worker = workers.find(w => w.id === workerId);
  if (!worker) return 50;
  return worker.trustScore;
}

// POST /api/ml/predict-income
router.post('/predict-income', (req, res) => {
  const { zone, weather, platform, hour, dayOfWeek, season } = req.body;
  const predicted = predictIncome({ zone, weather: weather || 'clear', platform, hour: hour || 12, dayOfWeek: dayOfWeek || 1, season: season || 'other' });
  res.json({
    predictedEarnings: predicted,
    confidence: 0.87 + Math.random() * 0.1,
    factors: {
      weather: weather || 'clear',
      hour: hour || 12,
      dayType: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday',
    },
  });
});

// POST /api/ml/check-fraud
router.post('/check-fraud', (req, res) => {
  const { gpsMatch = true, claimCount = 1, hasGigActivity = true, claimsPerMinute = 1 } = req.body;
  const fraudProbability = detectFraud({ gpsMatch, claimCount, hasGigActivity, claimsPerMinute });
  res.json({
    fraudProbability,
    isFlagged: fraudProbability > 0.6,
    level: fraudProbability > 0.8 ? 'high' : fraudProbability > 0.5 ? 'medium' : 'low',
    reasons: [
      !gpsMatch && 'GPS location does not match registered zone',
      claimsPerMinute >= 3 && '3+ workers claiming same trigger same minute',
      !hasGigActivity && 'No gig activity recorded on this day',
    ].filter(Boolean),
  });
});

// GET /api/ml/trust-score/:workerId
router.get('/trust-score/:workerId', (req, res) => {
  const score = calculateTrust(req.params.workerId);
  res.json({
    workerId: req.params.workerId,
    trustScore: score,
    level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
    breakdown: {
      legitimateClaims: Math.floor(score / 5),
      onTimePayments: Math.floor(score / 2),
      monthsActive: Math.floor(score / 10),
    },
  });
});

export default router;
