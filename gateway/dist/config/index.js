"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_LEVEL = exports.RATE_LIMIT_MAX = exports.RATE_LIMIT_WINDOW_MS = exports.API_KEYS = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.DEFAULT_PRESENCE_PENALTY = exports.DEFAULT_TOP_P = exports.DEFAULT_TEMPERATURE = exports.DEFAULT_MAX_TOKENS = exports.DEFAULT_MODEL = exports.PERPLEXITY_BASE_URL = exports.PERPLEXITY_API_KEY = exports.IS_PRODUCTION = exports.NODE_ENV = exports.SERVER_PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
// Server configuration
exports.SERVER_PORT = process.env.GATEWAY_PORT || '3001';
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.IS_PRODUCTION = exports.NODE_ENV === 'production';
// Perplexity API configuration
exports.PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
exports.PERPLEXITY_BASE_URL = process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai';
// Default Perplexity model settings (can be overridden by client requests)
exports.DEFAULT_MODEL = process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online';
exports.DEFAULT_MAX_TOKENS = parseInt(process.env.PERPLEXITY_MAX_TOKENS || '8000');
exports.DEFAULT_TEMPERATURE = parseFloat(process.env.PERPLEXITY_TEMPERATURE || '0.2');
exports.DEFAULT_TOP_P = parseFloat(process.env.PERPLEXITY_TOP_P || '0.9');
exports.DEFAULT_PRESENCE_PENALTY = parseFloat(process.env.PERPLEXITY_PRESENCE_PENALTY || '0.1');
// API security
exports.JWT_SECRET = process.env.JWT_SECRET || 'perplexity-gateway-dev-secret';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
exports.API_KEYS = (process.env.API_KEYS || '').split(',').filter(Boolean);
// Rate limiting
exports.RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
exports.RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100'); // 100 requests per window
// Logging
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
// Validate critical configuration
if (!exports.PERPLEXITY_API_KEY && exports.NODE_ENV !== 'test') {
    console.error('FATAL ERROR: PERPLEXITY_API_KEY is not set in the environment variables.');
    process.exit(1);
}
if (exports.IS_PRODUCTION && exports.JWT_SECRET === 'perplexity-gateway-dev-secret') {
    console.error('WARNING: Using default JWT_SECRET in production environment!');
}
if (exports.IS_PRODUCTION && exports.API_KEYS.length === 0) {
    console.error('WARNING: No API_KEYS defined in production environment!');
}
