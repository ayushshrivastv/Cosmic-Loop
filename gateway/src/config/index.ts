import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Server configuration
export const SERVER_PORT = process.env.GATEWAY_PORT || '3001';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

// Perplexity API configuration
export const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
export const PERPLEXITY_BASE_URL = process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai';

// Default Perplexity model settings (can be overridden by client requests)
export const DEFAULT_MODEL = process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online';
export const DEFAULT_MAX_TOKENS = parseInt(process.env.PERPLEXITY_MAX_TOKENS || '8000');
export const DEFAULT_TEMPERATURE = parseFloat(process.env.PERPLEXITY_TEMPERATURE || '0.2');
export const DEFAULT_TOP_P = parseFloat(process.env.PERPLEXITY_TOP_P || '0.9');
export const DEFAULT_PRESENCE_PENALTY = parseFloat(process.env.PERPLEXITY_PRESENCE_PENALTY || '0.1');

// API security
export const JWT_SECRET = process.env.JWT_SECRET || 'perplexity-gateway-dev-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const API_KEYS = (process.env.API_KEYS || '').split(',').filter(Boolean);

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100'); // 100 requests per window

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Validate critical configuration
if (!PERPLEXITY_API_KEY && NODE_ENV !== 'test') {
  console.error('FATAL ERROR: PERPLEXITY_API_KEY is not set in the environment variables.');
  process.exit(1);
}

if (IS_PRODUCTION && JWT_SECRET === 'perplexity-gateway-dev-secret') {
  console.error('WARNING: Using default JWT_SECRET in production environment!');
}

if (IS_PRODUCTION && API_KEYS.length === 0) {
  console.error('WARNING: No API_KEYS defined in production environment!');
}
