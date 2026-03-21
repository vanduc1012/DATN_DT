const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./features/auth/auth.routes');
const userRoutes = require('./features/users/user.routes');
const pitchRoutes = require('./features/pitches/pitch.routes');
const bookingRoutes = require('./features/bookings/booking.routes');
const reviewRoutes = require('./features/reviews/review.routes');

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());

// Rate limiting — dev mode nới lỏng, production thắt chặt
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { success: false, message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// ── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev', {
    stream: { write: (message) => logger.http(message.trim()) },
  }));
}

// ── Static Files (uploads) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server đang hoạt động 🟢', timestamp: new Date().toISOString() });
});

const statsRoutes = require('./features/stats/stats.routes');

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pitches', pitchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
