/**
 * Environment Variable Check Script
 * 
 * This script checks if critical API keys are properly set in your environment.
 * Run with: node -r dotenv/config check-env.js
 */

console.log('\n===== Environment Variables Check =====\n');

// Check for Perplexity API key
const perplexityKeySet = !!process.env.PERPLEXITY_API_KEY;
console.log('PERPLEXITY_API_KEY is set:', perplexityKeySet ? '✅ Yes' : '❌ No');
if (!perplexityKeySet) {
  console.log('  → Add PERPLEXITY_API_KEY to your .env.local file');
}

// Check for Gemini API key
const geminiKeySet = !!process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY is set:', geminiKeySet ? '✅ Yes' : '❌ No');
if (!geminiKeySet) {
  console.log('  → Add GEMINI_API_KEY to your .env.local file');
}

// Check other important keys based on your architecture
const openAIKeySet = !!process.env.OPENAI_API_KEY;
console.log('OPENAI_API_KEY is set:', openAIKeySet ? '✅ Yes' : '❌ No');

const pineconeKeySet = !!process.env.PINECONE_API_KEY;
console.log('PINECONE_API_KEY is set:', pineconeKeySet ? '✅ Yes' : '❌ No');

console.log('\n=======================================\n');

// Check API configuration imports
try {
  // This won't work in CommonJS, just for diagnostic purposes
  console.log('Note: This script cannot check your TypeScript imports directly.');
  console.log('Make sure your config files properly import these environment variables.');
  console.log('\nVerify that:');
  console.log('- @/config/api.config.ts correctly imports PERPLEXITY_API_KEY and GEMINI_API_KEY');
  console.log('- Your clients use these imported values');
} catch (err) {
  console.log('Could not check imports:', err.message);
}
