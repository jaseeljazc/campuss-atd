const { createLogger, format, transports } = require('winston');
const env = require('./env');

const logger = createLogger({
  level: env.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'class-companion-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(
          ({ level, message, timestamp, stack, ...meta }) =>
            `${timestamp} [${level}]: ${stack || message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`
        )
      ),
    }),
  ],
});

module.exports = logger;

