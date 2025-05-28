"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = exports.globalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Global rate limiter for all API endpoints
 */
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.RATE_LIMIT_WINDOW_MS, // Default: 15 minutes
    max: config_1.RATE_LIMIT_MAX, // Default: 100 requests per window
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
        logger_1.default.warn('Rate limit exceeded', {
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
const createRateLimiter = (options) => {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs || config_1.RATE_LIMIT_WINDOW_MS,
        max: options.max || config_1.RATE_LIMIT_MAX,
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
            logger_1.default.warn('Custom rate limit exceeded', {
                clientId: req.clientId,
                ip: req.ip,
                path: req.path,
                limit: options.max,
                window: options.windowMs
            });
            res.status(429).json(options.message);
        }
    });
};
exports.createRateLimiter = createRateLimiter;
