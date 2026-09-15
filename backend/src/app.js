const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');
const { getDatabaseStatus } = require('./config/db');

const app = express();

// ---------------------------------------------------------------------------
// CORS – allow local dev origins + Vercel production/preview domains
// ---------------------------------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, mobile apps)
      if (!origin) return callback(null, true);

      // Explicitly listed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Any localhost port (dev)
      if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);

      // Vercel preview & production domains
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);

      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hostel Room Allocation API is running',
    data: {
      service: 'hostel-room-allocation-backend',
      database: getDatabaseStatus(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ---------------------------------------------------------------------------
// 404 catch-all (only for /api paths so it doesn't interfere with frontend)
// ---------------------------------------------------------------------------
app.all('/api/{*path}', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

module.exports = app;
