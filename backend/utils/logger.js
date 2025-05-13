/**
 * @file logger.js
 * @description Centralized logging utility for the backend
 */

const winston = require('winston');
const config = require('config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Create format for console logs
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Create format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Get log level from environment or default to 'info'
const level = process.env.LOG_LEVEL || 'info';

// Create the logger
const logger = winston.createLogger({
  level,
  levels,
  format: fileFormat,
  transports: [
    // Console logging
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // All logs
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Handle the case if we're not in production
if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized in development mode');
}

module.exports = logger;
