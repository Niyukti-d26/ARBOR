import express from 'express';
import { workers, gigs } from '../data/mockData.js';
const router = express.Router();

// GET /api/worker/profile (mock — uses first worker as demo)
router.get('/profile', (req, res) => {
  res.json(workers[0]);
});

// PUT /api/worker/profile
router.put('/profile', (req, res) => {
  Object.assign(workers[0], req.body);
  res.json(workers[0]);
});

// GET /api/worker/income/daily-avg
router.get('/income/daily-avg', (req, res) => {
  const workerId = workers[0].id;
  const workerGigs = gigs.filter(g => g.workerId === workerId);
  const last30 = workerGigs.slice(-30);

  const normal = last30.filter(g => g.dayType === 'normal');
  const disrupted = last30.filter(g => g.dayType !== 'normal');

  const avg = arr => arr.length ? Math.round(arr.reduce((s, g) => s + g.earningsNet, 0) / arr.length) : 0;

  const baseline = avg(normal) || 650;
  const disruptedAvg = avg(disrupted) || 180;
  const dropPercent = Math.round((baseline - disruptedAvg) / baseline * 100);
  const riskMultiplier = dropPercent > 60 ? 1.4 : dropPercent > 40 ? 1.2 : 1.0;

  res.json({
    baseline,
    disruptedAvg,
    dropPercent,
    weeklyEarnings: baseline * 7,
    monthlyEarnings: baseline * 30,
    riskMultiplier,
    normalDays: normal.length,
    disruptedDays: disrupted.length,
  });
});

// GET /api/worker/income/history
router.get('/income/history', (req, res) => {
  const workerId = workers[0].id;
  const workerGigs = gigs.filter(g => g.workerId === workerId).slice(-30);
  res.json(workerGigs);
});

export default router;
