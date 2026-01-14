const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production',
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error', { error: err.message });
    process.exit(1);
  }
}

module.exports = connectDB;

