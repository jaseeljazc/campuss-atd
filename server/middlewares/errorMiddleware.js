const logger = require('../config/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log error with context
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  let status = err.statusCode || err.status || 500;
  
  // Map common error types to status codes
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400;
  } else if (err.name === 'UnauthorizedError' || err.message?.includes('token')) {
    status = 401;
  } else if (err.message?.includes('not found')) {
    status = 404;
  } else if (err.message?.includes('Forbidden') || err.message?.includes('not authorized')) {
    status = 403;
  }

  // Don't expose internal error details in production
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;

