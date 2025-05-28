/**
 * Test API Setup
 * 
 * This script tests if your Perplexity and Gemini API keys are working correctly.
 * Run with: node -r dotenv/config test-api-setup.js
 */

// Convert to ES Module syntax
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure dotenv
dotenv.config({ path: '.env.local' });

console.log('\n===== API Configuration Test =====\n');

// Test function
async function testAPIs() {
  // Check if API keys are set
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log('PERPLEXITY_API_KEY is set:', perplexityKey ? '✅ Yes' : '❌ No');
  console.log('GEMINI_API_KEY is set:', geminiKey ? '✅ Yes' : '❌ No');

  if (!perplexityKey || !geminiKey) {
    console.log('\n❌ Missing API key(s). Please set them in your .env.local file.');
    return;
  }

  // Test Perplexity API
  console.log('\nTesting Perplexity API connection...');
  try {
    // Try using their online API endpoint instead
    const perplexityResponse = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'mixtral-8x7b-instruct', // Try the third model from our list
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant.' },
          { role: 'user', content: 'Hello from the API test!' }
        ],
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityKey}`
        }
      }
    );

    if (perplexityResponse.status === 200) {
      console.log('✅ Perplexity API connection successful!');
      console.log('   Response:', perplexityResponse.data.choices[0].message.content.substring(0, 50) + '...');
    }
  } catch (error) {
    console.log('❌ Perplexity API error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data).substring(0, 100) + '...');
    }
  }

  // Test Gemini API
  console.log('\nTesting Gemini API connection...');
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent('Hello from the API test!');
    const text = result.response.text();
    
    console.log('✅ Gemini API connection successful!');
    console.log('   Response:', text.substring(0, 50) + '...');
  } catch (error) {
    console.log('❌ Gemini API error:', error.message);
  }

  console.log('\n===== Setup Complete =====');
  console.log('Now you can use the integrated architecture with both APIs.');
}

// Run the test
testAPIs().catch(err => {
  console.error('Unexpected error during tests:', err);
});
