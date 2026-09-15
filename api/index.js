// Vercel Serverless Function entrypoint
// Wraps the Express app so Vercel can invoke it as a single function.

const path = require('path');

// Load environment variables from backend/.env when running locally.
// On Vercel production, env vars are injected by the platform.
try {
  require(path.resolve(__dirname, '../backend/node_modules/dotenv')).config({
    path: path.resolve(__dirname, '../backend/.env'),
  });
} catch (_) {
  // dotenv not available — env vars must come from the platform
}

const { connectDB } = require('../backend/src/config/db');
const app = require('../backend/src/app');

module.exports = async (req, res) => {
  // Connect (or reconnect) to MongoDB on every request.
  // connectDB() is idempotent — it returns immediately when already connected.
  // If the connection fails, it throws, and we return a 503 to the client.
  try {
    await connectDB();
  } catch (error) {
    console.error('[Serverless] DB connection error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database connection failed.',
    });
  }

  return app(req, res);
};
