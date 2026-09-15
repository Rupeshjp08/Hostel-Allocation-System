const mongoose = require('mongoose');

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const sanitizeUri = (uri) => {
  if (!uri) return '';
  try {
    return uri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@');
  } catch (e) {
    return 'mongodb+srv://****:****@****';
  }
};

const getDatabaseStatus = () => {
  return connectionStates[mongoose.connection.readyState] || 'unknown';
};

/**
 * Connect to MongoDB. Safe to call multiple times — if a connection is already
 * established or in progress, this is a no-op.  Critical for Vercel Serverless
 * Functions where the module scope is reused across warm invocations.
 *
 * Unlike the previous version, this function now THROWS on failure so callers
 * can return a proper 503 instead of letting Mongoose operations silently fail.
 */
const connectDB = async () => {
  // Already connected — reuse the existing connection
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Currently connecting — wait for the existing attempt to settle
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', resolve);
    });
    if (mongoose.connection.readyState === 1) return;
    // If we're still not connected after waiting, fall through to retry
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      'MONGO_URI environment variable is not set. Add it in Vercel project settings or in backend/.env for local development.'
    );
  }

  const sanitized = sanitizeUri(mongoUri);
  console.log(`[DB] Connecting to ${sanitized} ...`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000, // Fail fast on serverless (Vercel has 10s limit on Hobby)
    });
    console.log(`[DB] Connected successfully (status: ${getDatabaseStatus()})`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    throw new Error('Database connection failed. Check MONGO_URI and MongoDB Atlas IP whitelist.');
  }
};

module.exports = {
  connectDB,
  getDatabaseStatus,
  sanitizeUri,
};
