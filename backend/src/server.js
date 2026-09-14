require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB, getDatabaseStatus } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
};

startServer();
