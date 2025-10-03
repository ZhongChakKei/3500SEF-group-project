import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { authenticate, requireAdmin } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // React frontend URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/admin-only', authenticate, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin-only content',
    data: { user: req.user }
  });
});

// Protected route for all authenticated users
app.get('/api/protected', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Protected content',
    data: { user: req.user }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;