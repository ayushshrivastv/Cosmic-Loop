/**
 * API Configuration
 * Contains API keys and configuration for external services
 */

// Load from environment variables in production
export const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// API configuration
export const API_CONFIG = {
  perplexity: {
    baseUrl: 'https://api.perplexity.ai',
    model: 'sonar-medium-online', // or sonar-small-online, etc.
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-flash',
  }
};

// Validate required API keys
export const validateApiKeys = () => {
  const missingKeys = [];
  
  if (!PERPLEXITY_API_KEY) {
    missingKeys.push('PERPLEXITY_API_KEY');
  }
  
  if (!GEMINI_API_KEY) {
    missingKeys.push('GEMINI_API_KEY');
  }
  
  if (missingKeys.length > 0) {
    console.warn(`Warning: Missing API keys: ${missingKeys.join(', ')}`);
    return false;
  }
  
  return true;
};
