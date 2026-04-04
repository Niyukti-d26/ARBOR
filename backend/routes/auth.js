import express from 'express';
import jwt from 'jsonwebtoken';
import { workers, admins, otpStore, adminOtpStore } from '../data/mockData.js';

const router = express.Router();

// Simple password map for demo (no bcrypt needed)
const ADMIN_PASSWORDS = {
  'admin@gigshield.com': 'admin123',
  'ops@gigshield.com':   'ops123',
};

// POST /api/auth/worker/send-otp
router.post('/worker/send-otp', (req, res) => {
  const { phone, aadhaarLast4 } = req.body;
  if (!phone || !aadhaarLast4)
    return res.status(400).json({ error: 'Phone and Aadhaar required' });

  const worker = workers.find(w => w.phone === phone);
  if (!worker || worker.aadhaarLast4 !== aadhaarLast4)
    return res.status(401).json({ error: 'Phone and Aadhaar do not match our records' });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  console.log(`[GigShield OTP] Phone: ${phone}  OTP: ${otp}`);

  res.json({ success: true, message: 'OTP sent — check server console' });
});

// POST /api/auth/worker/verify-otp
router.post('/worker/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const stored = otpStore[phone];

  if (!stored || stored.otp !== otp)
    return res.status(401).json({ error: 'Invalid OTP' });
  if (Date.now() > stored.expiresAt)
    return res.status(401).json({ error: 'OTP expired' });

  const worker = workers.find(w => w.phone === phone);
  delete otpStore[phone];

  const token = jwt.sign({ workerId: worker.id, phone },
    process.env.JWT_SECRET || 'gigshield_secret', { expiresIn: '7d' });

  res.json({
    token,
    worker: {
      id: worker.id, name: worker.name, phone: worker.phone,
      plan: worker.plan, city: worker.city, zone: worker.zone,
    },
  });
});

// POST /api/auth/admin/login
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const key = email?.toLowerCase();
  const admin = admins.find(a => a.email === key);

  if (!admin || ADMIN_PASSWORDS[key] !== password)
    return res.status(401).json({ error: 'Invalid credentials' });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  adminOtpStore[key] = { otp, expiresAt: Date.now() + 5 * 60 * 1000, adminId: admin.id };
  console.log(`[GigShield Admin 2FA] Email: ${email}  OTP: ${otp}`);

  res.json({ success: true, message: '2FA OTP sent — check server console' });
});

// POST /api/auth/admin/verify-2fa
router.post('/admin/verify-2fa', (req, res) => {
  const { email, otp } = req.body;
  const key = email?.toLowerCase();
  const stored = adminOtpStore[key];

  if (!stored || stored.otp !== otp)
    return res.status(401).json({ error: 'Invalid 2FA code' });
  if (Date.now() > stored.expiresAt)
    return res.status(401).json({ error: '2FA code expired' });

  const admin = admins.find(a => a.email === key);
  delete adminOtpStore[key];

  const token = jwt.sign({ adminId: admin.id, email: key, role: admin.role },
    process.env.JWT_ADMIN_SECRET || 'gigshield_admin_secret', { expiresIn: '12h' });

  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

export default router;
