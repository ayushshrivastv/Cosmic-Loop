"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Debug script to test the Perplexity API directly
 *
 * This script bypasses our gateway and tests the Perplexity API directly
 * to help diagnose what's wrong with our implementation.
 *
 * Run with: npx ts-node src/debug-perplexity-api.ts
 */
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env.local') });
// Extract API key from .env.local
const API_KEY = process.env.PERPLEXITY_API_KEY;
if (!API_KEY) {
    console.error('Error: PERPLEXITY_API_KEY not found in .env.local file');
    process.exit(1);
}
console.log('Found Perplexity API key:', API_KEY.substring(0, 10) + '...');
// Perplexity API configuration
const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';
async function testPerplexityAPI() {
    try {
        console.log('🔍 Testing Perplexity API directly...\n');
        // Test request data
        const requestData = {
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Tell me about Solana blockchain in one sentence.' }
            ],
            max_tokens: 100,
            temperature: 0.7
        };
        console.log('Request data:', JSON.stringify(requestData, null, 2));
        // Send request to Perplexity API
        const response = await axios_1.default.post(`${PERPLEXITY_BASE_URL}/chat/completions`, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        console.log('\n✅ Perplexity API test successful!');
        console.log('Status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        // Extract the important parts of the response
        console.log('\nImportant response fields:');
        console.log('- ID:', response.data.id);
        console.log('- Model:', response.data.model);
        console.log('- Choices:', response.data.choices.length);
        console.log('- First choice message:', response.data.choices[0].message);
        console.log('- Usage:', response.data.usage);
        return true;
    }
    catch (error) {
        console.error('\n❌ Perplexity API test failed:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('Status:', error.response.status);
            console.error('Error data:', JSON.stringify(error.response.data, null, 2));
            // Log request details
            console.error('\nRequest details:');
            console.error('- URL:', error.config?.url);
            console.error('- Method:', error.config?.method?.toUpperCase());
            console.error('- Headers:', JSON.stringify(error.config?.headers, null, 2));
            console.error('- Data:', error.config?.data);
        }
        else {
            console.error('Unknown error:', error);
        }
        return false;
    }
}
// Run the test
testPerplexityAPI().catch(error => {
    console.error('Unexpected error:', error);
});
