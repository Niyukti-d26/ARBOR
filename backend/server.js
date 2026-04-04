import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

// Routes
import authRoutes from './routes/auth.js';
import workerRoutes from './routes/worker.js';
import claimsRoutes from './routes/claims.js';
import policyRoutes from './routes/policy.js';
import paymentsRoutes from './routes/payments.js';
import triggersRoutes from './routes/triggers.js';
import adminRoutes from './routes/admin.js';
import mlRoutes from './routes/ml.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', server: 'GigShield API', version: '1.0.0' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/triggers', triggersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);

// Socket.io
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join-city', (city) => {
    socket.join(`city-${city}`);
    console.log(`[Socket] ${socket.id} joined city-${city}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Simulate real-time weather events every 30s
setInterval(() => {
  io.emit('weather-update', {
    timestamp: new Date().toISOString(),
    message: 'Weather data refreshed',
  });
}, 30000);

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🛡 GigShield backend running on http://localhost:${PORT}`);
  console.log(`📊 API docs: http://localhost:${PORT}/health`);
});

export { io };
