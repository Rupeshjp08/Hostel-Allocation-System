// Vercel Serverless Function entrypoint
// Wraps the Express app so Vercel can invoke it as a single serverless function.

const path = require('path');

// Only load local dotenv when running in local development (not on Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({
      path: path.resolve(__dirname, '../backend/.env'),
    });
  } catch (_) {
    // Dotenv is optional in dev if env vars are already loaded in environment
  }
}

const { connectDB } = require('../backend/src/config/db');
const app = require('../backend/src/app');

module.exports = async (req, res) => {
  const url = req.url || '';
  const isHealthCheck = url === '/api/health' || url === '/health' || url.startsWith('/api/health?');

  // Attempt database connection
  try {
    await connectDB();
  } catch (error) {
    console.error('[Serverless] DB connection error:', error.message);

    // Allow health check endpoint to proceed even if DB is down so it can report diagnostic status
    if (!isHealthCheck) {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Database connection failed.',
        error: 'Database is unreachable. Please verify MongoDB Atlas Network Access IP whitelist (allow 0.0.0.0/0).',
      });
    }
  }

  // Delegate request to Express app
  return app(req, res);
};
