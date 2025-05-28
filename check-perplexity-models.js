/**
 * Check Available Perplexity Models
 * 
 * This script checks which models are available with your Perplexity API key.
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

console.log('\n===== Checking Perplexity API Models =====\n');
console.log('Using API Key:', PERPLEXITY_API_KEY.substring(0, 5) + '...');

async function checkModels() {
  try {
    // Try to get models (Perplexity might not have a models endpoint like OpenAI)
    const response = await axios.get(
      'https://api.perplexity.ai/models',
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        }
      }
    );
    
    console.log('✅ Available models:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Could not fetch models directly:', error.message);
    
    // If models endpoint doesn't exist, let's try an alternative approach
    console.log('\nTrying a simple request to check API access...');
    
    try {
      // Try a simple chat completion to check error messages
      const chatResponse = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'unknown-model',  // Intentionally use invalid model to get error with model list
          messages: [
            { role: 'user', content: 'Hello' }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
          }
        }
      );
      
      console.log('Response:', chatResponse.data);
    } catch (chatError) {
      console.log('Response error:');
      if (chatError.response && chatError.response.data && chatError.response.data.error) {
        console.log('API message:', chatError.response.data.error.message);
        
        // Try to extract model names from error message
        const modelMatch = chatError.response.data.error.message.match(/Permitted models include: ([^.]+)/);
        if (modelMatch && modelMatch[1]) {
          const modelList = modelMatch[1].split(',').map(m => m.trim());
          console.log('\n✅ AVAILABLE MODELS:');
          modelList.forEach(model => console.log(`- ${model}`));
          return modelList;
        }
      } else {
        console.log('Full error:', chatError);
      }
    }
  }
  
  console.log('\n❓ Could not determine available models automatically.');
  console.log('Please check the Perplexity documentation for the latest models:');
  console.log('https://docs.perplexity.ai/guides/model-cards');
  
  return null;
}

// Run the check
checkModels()
  .then(models => {
    if (models) {
      console.log('\nTo update your .env.local file, use one of these models.');
    }
    console.log('\n===== Check Complete =====');
  })
  .catch(err => {
    console.error('\nUnexpected error:', err);
  });
