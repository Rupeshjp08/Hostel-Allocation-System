const mongoose = require('mongoose');

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getDatabaseStatus = () => {
  return connectionStates[mongoose.connection.readyState] || 'unknown';
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn(
      'MONGO_URI is missing. The API will start, but database features will stay offline until you add it in backend/.env.'
    );
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected (${getDatabaseStatus()})`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error(
      'Start MongoDB locally or paste a MongoDB Atlas connection string into backend/.env, then restart the server.'
    );
  }
};

module.exports = {
  connectDB,
  getDatabaseStatus,
};
