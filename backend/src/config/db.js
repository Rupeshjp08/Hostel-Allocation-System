const mongoose = require('mongoose');
const dns = require('dns');

// Connection states matching mongoose.connection.readyState
const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Clean and normalize the MongoDB URI string.
 * Strips surrounding quotes, whitespace, and accidental variable name prefix.
 */
const getCleanMongoUri = () => {
  let uri = process.env.MONGO_URI;
  if (!uri || typeof uri !== 'string') return '';
  uri = uri.trim();

  // Strip leading variable prefix if accidentally pasted (e.g. MONGO_URI=mongodb+srv://...)
  if (uri.startsWith('MONGO_URI=')) {
    uri = uri.slice(10).trim();
  }

  // Strip wrapping single or double quotes
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  return uri;
};

/**
 * Safely extract the host name from MongoDB URI without exposing credentials.
 */
const getMongoHost = (uri) => {
  if (!uri) return 'unknown';
  try {
    const atIndex = uri.indexOf('@');
    if (atIndex !== -1) {
      const afterAt = uri.slice(atIndex + 1);
      return afterAt.split('/')[0].split('?')[0];
    }
    return 'hidden';
  } catch (_) {
    return 'hidden';
  }
};

/**
 * Sanitize URI for safe logging (replaces password with ****).
 */
const sanitizeUri = (uri) => {
  if (!uri) return '';
  try {
    return uri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@');
  } catch (_) {
    return 'mongodb+srv://****:****@****';
  }
};

const getDatabaseStatus = () => {
  return connectionStates[mongoose.connection.readyState] || 'unknown';
};

// Global cache for serverless environments (prevents multiple connections across warm invocations)
let cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with caching and retry capability for serverless functions.
 */
const connectDB = async () => {
  // 1. If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If cached connection exists and is ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 3. If a connection attempt is currently in-flight, await it
  if (cached.promise) {
    try {
      return await cached.promise;
    } catch (_) {
      // If the pending attempt failed, reset and fall through to retry
      cached.promise = null;
      cached.conn = null;
    }
  }

  const mongoUri = getCleanMongoUri();

  if (!mongoUri) {
    throw new Error(
      'MONGO_URI environment variable is not set. Add it in Vercel project settings or in backend/.env for local development.'
    );
  }

  const host = getMongoHost(mongoUri);
  console.log(`[DB] Connecting to MongoDB host: ${host} ...`);

  const opts = {
    bufferCommands: false, // Do not buffer queries indefinitely when disconnected
    serverSelectionTimeoutMS: 5000, // Fail fast (5s) to stay well within Vercel's 10s serverless limit
    connectTimeoutMS: 8000,
  };

  const attemptConnect = async (useFallbackDns = false) => {
    if (useFallbackDns) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (dnsErr) {
        console.warn(`[DB] Could not set fallback DNS servers: ${dnsErr.message}`);
      }
    }

    return mongoose.connect(mongoUri, opts);
  };

  cached.promise = (async () => {
    try {
      const conn = await attemptConnect(false);
      console.log(`[DB] Connected successfully to ${host} (state: connected)`);
      cached.conn = conn;
      return conn;
    } catch (firstErr) {
      // Check if the failure was an SRV DNS lookup failure
      if (firstErr.message && firstErr.message.includes('querySrv')) {
        console.warn('[DB] SRV query failed with system DNS. Retrying with public DNS (8.8.8.8, 1.1.1.1)...');
        try {
          const conn = await attemptConnect(true);
          console.log(`[DB] Connected successfully to ${host} using public DNS (state: connected)`);
          cached.conn = conn;
          return conn;
        } catch (retryErr) {
          cached.promise = null;
          cached.conn = null;
          console.error(`[DB] Connection retry failed: ${retryErr.name} - ${retryErr.message}`);
          throw retryErr;
        }
      }

      // Reset cached promise on failure so next request can retry
      cached.promise = null;
      cached.conn = null;
      console.error(`[DB] Connection failed: ${firstErr.name} - ${firstErr.message}`);
      throw firstErr;
    }
  })();

  return cached.promise;
};

module.exports = {
  connectDB,
  getDatabaseStatus,
  getCleanMongoUri,
  getMongoHost,
  sanitizeUri,
};
