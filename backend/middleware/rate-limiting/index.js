/**
 * @file index.js
 * @description Rate limiting middleware to prevent API abuse
 */

const rateLimit = require('express-rate-limit');
const config = require('config');
const Redis = require('ioredis');
const { createRedisClient } = require('../../utils/redis');
const logger = require('../../utils/logger');

/**
 * Apply rate limiting middleware to Express app
 * @param {Express} app - Express application
 */
function applyRateLimiting(app) {
  // Get configuration
  const rateLimitConfig = config.get('rateLimit');

  // Standard rate limiter for most API endpoints
  const standardLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    standardHeaders: rateLimitConfig.standardHeaders,
    legacyHeaders: rateLimitConfig.legacyHeaders,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000 / 60), // minutes
      });
    },
  });

  // More restrictive limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 15, // minutes
      });
    },
  });

  // Limiter for GraphQL endpoint to prevent complex query abuse
  const graphqlLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`GraphQL rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many GraphQL requests, please try again later.',
        retryAfter: 5, // minutes
      });
    },
  });

  // Apply standard rate limiting globally
  app.use(standardLimiter);

  // Apply specific rate limiters to routes
  app.use('/auth', authLimiter);
  app.use(config.get('graphql.path'), graphqlLimiter);

  // NFT minting rate limiter
  const mintingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 minting operations per hour
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Minting rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many minting operations, please try again later.',
        retryAfter: 60, // minutes
      });
    },
  });

  // Bridge operation rate limiter
  const bridgeLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // limit each IP to 5 bridge operations per 30 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Bridge rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many bridge operations, please try again later.',
        retryAfter: 30, // minutes
      });
    },
  });

  // Apply NFT-specific rate limiters
  app.use('/api/nft/mint', mintingLimiter);
  app.use('/api/bridge', bridgeLimiter);

  logger.info('Rate limiting middleware applied');
}

module.exports = {
  applyRateLimiting,
};
