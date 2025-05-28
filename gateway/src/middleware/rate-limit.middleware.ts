import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config';
import logger from '../utils/logger';

/**
 * Global rate limiter for all API endpoints
 */
export const globalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // Default: 15 minutes
  max: RATE_LIMIT_MAX, // Default: 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.'
  },
  keyGenerator: (req) => {
    // Use API key or IP address as the rate limit key
    return req.clientId || req.ip || 'unknown';
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      clientId: req.clientId,
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json(options.message);
  }
});

/**
 * Create a custom rate limiter for specific endpoints
 * @param options Custom rate limit options
 */
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || RATE_LIMIT_WINDOW_MS,
    max: options.max || RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: options.message || 'You have exceeded the rate limit. Please try again later.'
    },
    keyGenerator: (req) => {
      // Use API key or IP address as the rate limit key
      return req.clientId || req.ip || 'unknown';
    },
    handler: (req, res, next, options) => {
      logger.warn('Custom rate limit exceeded', {
        clientId: req.clientId,
        ip: req.ip,
        path: req.path,
        limit: (options as any).max,
        window: (options as any).windowMs
      });
      
      res.status(429).json(options.message);
    }
  });
};
