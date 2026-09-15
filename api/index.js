// Vercel Serverless Function entrypoint
// Wraps the Express app so Vercel can invoke it as a single function.

const path = require('path');

// Load environment variables from backend/.env when running locally.
// On Vercel production, env vars are injected by the platform.
// Use try/catch because dotenv lives in backend/node_modules, which is
// bundled via the "includeFiles" directive in vercel.json.
try {
  require(path.resolve(__dirname, '../backend/node_modules/dotenv')).config({
    path: path.resolve(__dirname, '../backend/.env'),
  });
} catch (_) {
  // dotenv not available — env vars must come from the platform
}

const { connectDB } = require('../backend/src/config/db');
const app = require('../backend/src/app');

// Connect to MongoDB before the first request. The connectDB function is safe
// to call multiple times — it no-ops when already connected.
let dbReady = connectDB();

module.exports = async (req, res) => {
  await dbReady;
  return app(req, res);
};
