const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
};

if (!env.mongoUri) {
  // In real production you'd fail fast, here we just log a warning via console
  // Logger is not yet wired here to avoid cyclic deps.
  console.warn('MONGO_URI is not set. Set it in your .env file.');
}

module.exports = env;

