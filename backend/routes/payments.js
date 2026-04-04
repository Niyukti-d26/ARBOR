import express from 'express';
import { payments, workers } from '../data/mockData.js';
const router = express.Router();

router.post('/premium', (req, res) => {
  const newPayment = {
    id: `PAY-${Date.now()}`,
    workerId: workers[0].id,
    amount: { starter: 50, standard: 80, pro: 120 }[workers[0].plan] || 80,
    method: req.body.method || 'UPI',
    status: 'success',
    date: new Date().toISOString().split('T')[0],
  };
  payments.unshift(newPayment);
  res.json(newPayment);
});

router.get('/history', (req, res) => {
  res.json(payments.filter(p => p.workerId === workers[0].id));
});

export default router;
