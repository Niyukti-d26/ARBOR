import express from 'express';
import { triggers, claims, workers } from '../data/mockData.js';
const router = express.Router();

// POST /api/triggers/simulate
router.post('/simulate', (req, res) => {
  const { triggerType, city, zone } = req.body;

  // Season validation
  const month = new Date().getMonth();
  const isMonsoon = month >= 5 && month <= 8;
  const isSummer = month >= 2 && month <= 4;

  if (isMonsoon && triggerType === 'Extreme Heat') {
    return res.status(400).json({ error: 'Heat trigger disabled during monsoon season' });
  }
  if (isSummer && triggerType === 'Heavy Rainfall') {
    return res.status(400).json({ error: 'Rain trigger disabled during summer season' });
  }

  // Create claim
  const claim = {
    id: `CLM-SIM-${Date.now()}`,
    workerId: workers[0].id,
    worker: workers[0].name,
    trigger: triggerType,
    zone: zone || workers[0].zone,
    city: city || workers[0].city,
    amount: { starter: 200, standard: 300, pro: 400 }[workers[0].plan] || 300,
    status: 'detected',
    fraudScore: 0.02,
    date: new Date().toISOString().split('T')[0],
    isSimulation: true,
  };

  claims.unshift(claim);
  setTimeout(() => { claim.status = 'verified'; }, 2000);
  setTimeout(() => { claim.status = 'paid'; }, 5000);

  res.json({ success: true, claim });
});

// GET /api/triggers/log
router.get('/log', (req, res) => {
  res.json(triggers);
});

export default router;
