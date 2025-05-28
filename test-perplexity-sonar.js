/**
 * Test Script for Perplexity Sonar API
 * 
 * This script tests the Perplexity Sonar API with correct parameters.
 * Run with: node test-perplexity-sonar.js
 */

// Convert to ES Module syntax
import dotenv from 'dotenv';
import axios from 'axios';

// Configure dotenv
dotenv.config({ path: '.env.local' });

// Get API key from environment
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('❌ Error: PERPLEXITY_API_KEY is not set in your .env.local file');
  process.exit(1);
}

console.log('\n===== Perplexity Sonar API Test =====\n');
console.log('Using API Key:', PERPLEXITY_API_KEY.substring(0, 5) + '...');

// Updated model names for Perplexity API as of May 2025
const PERPLEXITY_MODELS = [
  // Search Models
  'sonar-pro',  // Advanced search with grounding
  'sonar',      // Lightweight, cost-effective search
  
  // Research Models
  'sonar-deep-research',  // Comprehensive research model
  
  // Reasoning Models
  'sonar-reasoning-pro',  // Premier reasoning with Chain of Thought
  'sonar-reasoning',      // Fast real-time reasoning with search
  
  // Offline Models (non-search)
  'r1-1776'               // DeepSeek R1 model (no search)
];

// Test function
async function testSonarAPI() {
  const query = "What are the latest developments in Solana blockchain?";
  console.log(`\nQuery: "${query}"`);
  
  // Test each model
  for (const model of PERPLEXITY_MODELS) {
    console.log(`\nTesting model: ${model}`);
    
    try {
      // Make the API request with current best practices for Sonar API
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: model,
          messages: [
            { role: 'user', content: query }
          ],
          web_search: true, // Enable web search for Sonar
          max_tokens: 300
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
          }
        }
      );
      
      console.log('✅ Success!');
      console.log('Response preview:', response.data.choices[0].message.content.substring(0, 100) + '...');
      
      if (response.data.references) {
        console.log(`References: ${response.data.references.length} sources found`);
      }
      
      // If this model works, we can use it
      console.log(`\n✅ MODEL FOUND: ${model} works with your API key!`);
      console.log(`Update your .env.local file to use this model.`);
      
      // We found a working model, no need to test more
      return model;
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        if (error.response.data && error.response.data.error) {
          console.log('API message:', error.response.data.error.message);
        }
      }
    }
  }
  
  console.log('\n❌ None of the tested models worked with your API key.');
  console.log('Possible issues:');
  console.log('1. Your API key may not have access to Sonar models');
  console.log('2. The API endpoints or parameters may have changed');
  console.log('3. Your account may need to be upgraded for Sonar access');
  console.log('\nPlease check the Perplexity documentation for the latest information:');
  console.log('https://docs.perplexity.ai/');
}

// Run the test
testSonarAPI()
  .then(workingModel => {
    if (workingModel) {
      console.log('\n===== Test Completed Successfully =====');
      console.log(`Working model found: ${workingModel}`);
      console.log('\nTo update your .env.local file, add or modify this line:');
      console.log(`PERPLEXITY_MODEL=${workingModel}`);
    } else {
      console.log('\n===== Test Completed with Errors =====');
    }
  })
  .catch(err => {
    console.error('\nUnexpected error during test:', err);
  });
