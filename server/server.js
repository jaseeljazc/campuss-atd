const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const { initCronJobs } = require('./cron');

async function startServer() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  initCronJobs();

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection', { error: err.message });
    server.close(() => process.exit(1));
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

startServer();

