/**
 * Test script for the Universal Query API
 * 
 * This script tests the prompt engineering library and universal query functionality
 * Run with: npx ts-node src/test-universal.ts
 */
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });

// Configuration
const GATEWAY_URL = 'http://localhost:3001/api/v1';
const API_KEY = 'test-api-key-1'; // This should match one of the API_KEYS in your .env file

// Test the prompt templates endpoint
async function testPromptTemplates() {
  try {
    console.log('Testing prompt templates endpoint...');
    
    const response = await axios.get(
      `${GATEWAY_URL}/prompt-templates`,
      {
        headers: {
          'X-API-Key': API_KEY
        }
      }
    );
    
    console.log('Prompt templates response:');
    console.log('Status:', response.status);
    console.log('Templates count:', response.data.templates.length);
    console.log('Template categories:', [...new Set(response.data.templates.map((t: { category: string }) => t.category))]);
    console.log('✅ Prompt templates test successful\n');
    
    return response.data.templates;
  } catch (error) {
    console.error('❌ Prompt templates test failed:');
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error(error);
    }
    
    return [];
  }
}

// Test a specific template
async function testPromptTemplate(templateId: string) {
  try {
    console.log(`Testing prompt template endpoint for template ID: ${templateId}...`);
    
    const response = await axios.get(
      `${GATEWAY_URL}/prompt-templates/${templateId}`,
      {
        headers: {
          'X-API-Key': API_KEY
        }
      }
    );
    
    console.log('Prompt template response:');
    console.log('Status:', response.status);
    console.log('Template name:', response.data.template.name);
    console.log('System prompt preview:', response.data.template.systemPromptPreview);
    console.log('User prompt template:', response.data.template.userPromptTemplate);
    console.log('Parameters:', response.data.template.parameters.map((p: { name: string }) => p.name).join(', '));
    console.log('✅ Prompt template test successful\n');
    
    return response.data.template;
  } catch (error) {
    console.error(`❌ Prompt template test failed for template ID: ${templateId}`);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error(error);
    }
    
    return null;
  }
}

// Test using a template
async function testUseTemplate(templateId: string, parameters: Record<string, string | number | boolean>) {
  try {
    console.log(`Testing use template endpoint for template ID: ${templateId}...`);
    
    const response = await axios.post(
      `${GATEWAY_URL}/prompt-templates/${templateId}/use`,
      parameters,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );
    
    console.log('Use template response:');
    console.log('Status:', response.status);
    console.log('Template name:', response.data.templateName);
    console.log('System prompt:', response.data.systemPrompt.substring(0, 100) + '...');
    console.log('User prompt:', response.data.userPrompt);
    console.log('✅ Use template test successful\n');
    
    return response.data;
  } catch (error) {
    console.error(`❌ Use template test failed for template ID: ${templateId}`);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error(error);
    }
    
    return null;
  }
}

// Test the universal query endpoint
async function testUniversalQuery(query: string) {
  try {
    console.log('Testing universal query endpoint...');
    console.log('Query:', query);
    
    const response = await axios.post(
      `${GATEWAY_URL}/universal`,
      {
        query,
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );
    
    console.log('Universal query response:');
    console.log('Status:', response.status);
    console.log('Response ID:', response.data.id);
    console.log('Detected intent:', response.data.metadata.detectedIntent);
    console.log('System prompt preview:', response.data.metadata.systemPromptPreview);
    console.log('Text:', response.data.text.substring(0, 150) + '...');
    console.log('Token usage:', response.data.usage);
    console.log('✅ Universal query test successful\n');
    
    return response.data;
  } catch (error) {
    console.error('❌ Universal query test failed:');
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.data && error.response.data.error) {
        console.error('Error details:', error.response.data.error);
      }
      
      console.error('Request data:', JSON.stringify(error.config?.data, null, 2));
    } else {
      console.error(error);
    }
    
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Universal Query API tests...\n');
  
  // Test prompt templates
  const templates = await testPromptTemplates();
  
  if (templates.length > 0) {
    // Test a specific template
    const templateId = templates[0].id;
    const template = await testPromptTemplate(templateId);
    
    if (template) {
      // Test using the template
      const parameters: Record<string, string> = {};
      template.parameters.forEach((param: { name: string; required: boolean }) => {
        if (param.required) {
          // Provide a default value for required parameters
          if (param.name === 'query' || param.name === 'data') {
            parameters[param.name] = 'Tell me about Solana blockchain';
          } else if (param.name === 'concept') {
            parameters[param.name] = 'blockchain technology';
          } else if (param.name === 'problem') {
            parameters[param.name] = 'How to optimize a blockchain for high throughput';
          } else if (param.name === 'format') {
            parameters[param.name] = 'short story';
          } else if (param.name === 'genre') {
            parameters[param.name] = 'science fiction';
          } else if (param.name === 'topic') {
            parameters[param.name] = 'future of blockchain';
          } else if (param.name === 'language') {
            parameters[param.name] = 'JavaScript';
          } else if (param.name === 'functionality') {
            parameters[param.name] = 'connects to a blockchain API';
          } else {
            parameters[param.name] = 'default value';
          }
        }
      });
      
      await testUseTemplate(templateId, parameters);
    }
  }
  
  // Test universal query with different types of queries
  const queries = [
    'Explain how Solana achieves high throughput',
    'Write a short story about a blockchain developer',
    'What are the main features of proof of history?',
    'How can I optimize my Solana smart contract for performance?',
    'Analyze the recent price trends of SOL token'
  ];
  
  for (const query of queries) {
    await testUniversalQuery(query);
  }
  
  console.log('🎉 All tests completed!');
}

// Execute tests
runTests().catch(error => {
  console.error('Unexpected error during tests:', error);
});
