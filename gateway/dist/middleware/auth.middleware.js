"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.jwtAuth = exports.apiKeyAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to authenticate requests using API keys
 */
const apiKeyAuth = (req, res, next) => {
    // Get API key from header
    const apiKey = req.header('X-API-Key');
    // Check if API key is provided
    if (!apiKey) {
        logger_1.default.warn('API key missing in request', {
            ip: req.ip,
            path: req.path
        });
        return res.status(401).json({
            error: 'API key is required',
            message: 'Please provide a valid API key in the X-API-Key header'
        });
    }
    // Validate API key
    if (!config_1.API_KEYS.includes(apiKey)) {
        logger_1.default.warn('Invalid API key used', {
            ip: req.ip,
            path: req.path,
            partialKey: apiKey.substring(0, 4) + '...'
        });
        return res.status(401).json({
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }
    // Store client ID for logging/tracking
    req.clientId = apiKey.substring(0, 8); // Use part of the API key as a client identifier
    logger_1.default.debug('Request authenticated with API key', {
        clientId: req.clientId,
        path: req.path
    });
    next();
};
exports.apiKeyAuth = apiKeyAuth;
/**
 * Middleware to authenticate requests using JWT
 */
const jwtAuth = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // Check if token is provided
    if (!token) {
        return res.status(401).json({
            error: 'Authentication token is required',
            message: 'Please provide a valid JWT token in the Authorization header'
        });
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        // Add user to request
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.default.warn('Invalid JWT token', {
            ip: req.ip,
            path: req.path,
            error: error.message
        });
        return res.status(401).json({
            error: 'Invalid token',
            message: 'The provided authentication token is not valid or has expired'
        });
    }
};
exports.jwtAuth = jwtAuth;
/**
 * Middleware to check if user has required role
 * @param roles Array of allowed roles
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'You must be authenticated to access this resource'
            });
        }
        if (!roles.includes(req.user.role)) {
            logger_1.default.warn('Unauthorized role access attempt', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: roles,
                path: req.path
            });
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'You do not have the required permissions to access this resource'
            });
        }
        next();
    };
};
exports.checkRole = checkRole;
