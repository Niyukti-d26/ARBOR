import express from 'express';
import { workers, claims, payments } from '../data/mockData.js';
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  res.json({
    activeWorkers: workers.filter(w => w.status === 'active').length,
    premiumsCollected: payments.reduce((s, p) => s + (p.status === 'success' ? p.amount : 0), 0),
    payoutsToday: claims.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0),
    pendingClaims: claims.filter(c => c.status === 'pending').length,
  });
});

// GET /api/admin/workers
router.get('/workers', (req, res) => {
  res.json(workers);
});

// GET /api/admin/claims/queue
router.get('/claims/queue', (req, res) => {
  res.json(claims);
});

// PUT /api/admin/claims/:id/approve
router.put('/claims/:id/approve', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  claim.status = 'approved';
  res.json({ success: true, claim });
});

// PUT /api/admin/claims/:id/reject
router.put('/claims/:id/reject', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  claim.status = 'rejected';
  res.json({ success: true, claim });
});

// GET /api/admin/payouts
router.get('/payouts', (req, res) => {
  res.json(claims.filter(c => c.status === 'paid'));
});

// GET /api/admin/fraud-alerts
router.get('/fraud-alerts', (req, res) => {
  const flagged = claims.filter(c => c.fraudScore > 0.5);
  res.json(flagged.map(c => ({ ...c, fraudProbability: c.fraudScore, level: c.fraudScore > 0.8 ? 'high' : 'medium' })));
});

export default router;
