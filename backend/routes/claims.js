import express from 'express';
import { claims, workers } from '../data/mockData.js';
const router = express.Router();

// GET /api/claims
router.get('/', (req, res) => {
  const workerId = workers[0].id;
  res.json(claims.filter(c => c.workerId === workerId));
});

// POST /api/claims/initiate
router.post('/initiate', (req, res) => {
  const { trigger, zone } = req.body;
  const newClaim = {
    id: `CLM-${Date.now()}`,
    workerId: workers[0].id,
    worker: workers[0].name,
    zone: zone || workers[0].zone,
    city: workers[0].city,
    trigger,
    amount: { starter: 200, standard: 300, pro: 400 }[workers[0].plan] || 300,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    fraudScore: Math.random() * 0.15,
  };
  claims.unshift(newClaim);
  setTimeout(() => { newClaim.status = 'approved'; }, 3000);
  setTimeout(() => { newClaim.status = 'paid'; }, 6000);
  res.json(newClaim);
});

// GET /api/claims/:id/status
router.get('/:id/status', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  res.json({ id: claim.id, status: claim.status, amount: claim.amount });
});

export default router;
