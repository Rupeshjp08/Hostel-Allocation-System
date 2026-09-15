const mongoose = require('mongoose');
const dns = require('dns');

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
 */
const connectDB = async () => {
  // Already connected or connecting — reuse the existing connection
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn(
      'MONGO_URI is missing. The API will start, but database features will stay offline until you add it in backend/.env.'
    );
    return;
  }

  const sanitized = sanitizeUri(mongoUri);

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully to ${sanitized} (status: ${getDatabaseStatus()})`);
  } catch (error) {
    console.error(`MongoDB connection attempt failed: ${error.message}`);

    if (
      error.message.includes('querySrv') ||
      error.code === 'ECONNREFUSED' ||
      error.message.includes('ENOTFOUND')
    ) {
      console.log('Local DNS server failed SRV query. Retrying Node DNS resolution with public DNS (8.8.8.8, 8.8.4.4)...');
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        await mongoose.connect(mongoUri);
        console.log(`MongoDB connected successfully via public DNS fallback (status: ${getDatabaseStatus()})`);
        return;
      } catch (fallbackErr) {
        console.error(`MongoDB connection fallback failed: ${fallbackErr.message}`);
      }
    }

    console.error(
      'Diagnostic hint: If using MongoDB Atlas, check Windows DNS settings (8.8.8.8 / 8.8.4.4), network firewall, or Atlas IP whitelist.'
    );
  }
};

module.exports = {
  connectDB,
  getDatabaseStatus,
  sanitizeUri,
};
