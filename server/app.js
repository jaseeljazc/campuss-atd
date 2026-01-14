const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin === '*' ? '*' : env.clientOrigin,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(cookieParser());

// Logging
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
    },
  })
);

// Rate limiting (basic global rate limit)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', apiLimiter);
app.use('/attendance', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/', routes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

