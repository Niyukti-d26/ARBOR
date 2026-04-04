import express from 'express';
import { policies, workers, claims, payments } from '../data/mockData.js';
const router = express.Router();

// GET /api/policy/active
router.get('/active', (req, res) => {
  const policy = policies.find(p => p.workerId === workers[0].id);
  res.json(policy);
});

// POST /api/policy/upgrade
router.post('/upgrade', (req, res) => {
  const { plan } = req.body;
  const policy = policies.find(p => p.workerId === workers[0].id);
  if (policy) {
    policy.plan = plan;
    policy.weeklyPremium = { starter: 50, standard: 80, pro: 120 }[plan];
    policy.coverageCap = { starter: 1000, standard: 1500, pro: 2500 }[plan];
    policy.dailyPayout = { starter: 200, standard: 300, pro: 400 }[plan];
    workers[0].plan = plan;
  }
  res.json({ success: true, policy });
});

// GET /api/policy/history
router.get('/history', (req, res) => {
  res.json(policies.filter(p => p.workerId === workers[0].id));
});

// GET /api/payments/history
router.get('/payments/history', (req, res) => {
  res.json(payments.filter(p => p.workerId === workers[0].id));
});

// POST /api/payments/premium
router.post('/payments/premium', (req, res) => {
  const newPayment = {
    id: `PAY-${Date.now()}`,
    workerId: workers[0].id,
    amount: { starter: 50, standard: 80, pro: 120 }[workers[0].plan] || 80,
    method: 'UPI',
    status: 'success',
    date: new Date().toISOString().split('T')[0],
  };
  payments.unshift(newPayment);
  res.json(newPayment);
});

export default router;
