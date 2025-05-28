// Script to check environment variables without exposing full values
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Check Perplexity API configuration
const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
const perplexityModel = process.env.PERPLEXITY_MODEL;

// Check Gemini API configuration
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL;

console.log('\n===== Environment Variables Check =====\n');

// Check Perplexity configuration
console.log('PERPLEXITY_API_KEY:', perplexityApiKey 
  ? `Set (${perplexityApiKey.substring(0, 5)}...)` 
  : 'NOT SET');
console.log('PERPLEXITY_MODEL:', perplexityModel || 'NOT SET');

// Check Gemini configuration
console.log('GEMINI_API_KEY:', geminiApiKey 
  ? `Set (${geminiApiKey.substring(0, 5)}...)` 
  : 'NOT SET');
console.log('GEMINI_MODEL:', geminiModel || 'NOT SET');

console.log('\n===== Check Complete =====\n');
