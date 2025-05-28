"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple test script to verify the gateway functionality
 *
 * Run with: npx ts-node src/test-gateway.ts
 */
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
// Configuration
const GATEWAY_URL = 'http://localhost:3001/api/v1';
const API_KEY = 'test-api-key-1'; // This should match one of the API_KEYS in your .env file
// Test the chat completions endpoint
async function testChatCompletions() {
    try {
        console.log('Testing chat completions endpoint...');
        const response = await axios_1.default.post(`${GATEWAY_URL}/chat/completions`, {
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Tell me about Solana blockchain in one sentence.' }
            ],
            max_tokens: 100,
            temperature: 0.7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            }
        });
        console.log('Chat completions response:');
        console.log('Status:', response.status);
        console.log('Response ID:', response.data.id);
        console.log('Text:', response.data.text.substring(0, 100) + '...');
        console.log('Model:', response.data.model);
        console.log('Token Usage:', response.data.usage);
        console.log('✅ Chat completions test successful\n');
        return true;
    }
    catch (error) {
        console.error('❌ Chat completions test failed:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
            // Add more detailed error information
            if (error.response.data && error.response.data.error) {
                console.error('Error details:', error.response.data.error);
            }
            // Log the request that caused the error
            console.error('Request data:', JSON.stringify(error.config?.data, null, 2));
        }
        else {
            console.error(error);
        }
        return false;
    }
}
// Test the text completions endpoint
async function testTextCompletions() {
    try {
        console.log('Testing text completions endpoint...');
        const response = await axios_1.default.post(`${GATEWAY_URL}/completions`, {
            prompt: 'What are the main features of the Solana blockchain?',
            system_prompt: 'You are a blockchain expert. Be concise.',
            max_tokens: 150,
            temperature: 0.5
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            }
        });
        console.log('Text completions response:');
        console.log('Status:', response.status);
        console.log('Response ID:', response.data.id);
        console.log('Text:', response.data.text.substring(0, 100) + '...');
        console.log('Model:', response.data.model);
        console.log('Token Usage:', response.data.usage);
        console.log('✅ Text completions test successful\n');
        return true;
    }
    catch (error) {
        console.error('❌ Text completions test failed:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
            // Add more detailed error information
            if (error.response.data && error.response.data.error) {
                console.error('Error details:', error.response.data.error);
            }
            // Log the request that caused the error
            console.error('Request data:', JSON.stringify(error.config?.data, null, 2));
        }
        else {
            console.error(error);
        }
        return false;
    }
}
// Test the templates endpoint
async function testTemplates() {
    try {
        console.log('Testing templates endpoint...');
        const response = await axios_1.default.get(`${GATEWAY_URL}/templates`, {
            headers: {
                'X-API-Key': API_KEY
            }
        });
        console.log('Templates response:');
        console.log('Status:', response.status);
        console.log('Templates count:', response.data.templates.length);
        console.log('✅ Templates test successful\n');
        // If templates exist, test using one
        if (response.data.templates && response.data.templates.length > 0) {
            const templateId = response.data.templates[0].id;
            await testUseTemplate(templateId);
        }
        return true;
    }
    catch (error) {
        console.error('❌ Templates test failed:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        }
        else {
            console.error(error);
        }
        return false;
    }
}
// Test using a template
async function testUseTemplate(templateId) {
    try {
        console.log(`Testing use template endpoint with template ID: ${templateId}...`);
        const response = await axios_1.default.post(`${GATEWAY_URL}/templates/${templateId}/use`, {
            data: 'SOL price and trading volume for the past week',
            aspects: 'market trends, trading patterns, price support levels'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            }
        });
        console.log('Use template response:');
        console.log('Status:', response.status);
        console.log('System prompt:', response.data.systemPrompt.substring(0, 100) + '...');
        console.log('User prompt:', response.data.userPrompt);
        console.log('✅ Use template test successful\n');
        return true;
    }
    catch (error) {
        console.error('❌ Use template test failed:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        }
        else {
            console.error(error);
        }
        return false;
    }
}
// Test the health endpoint
async function testHealth() {
    try {
        console.log('Testing health endpoint...');
        const response = await axios_1.default.get(`${GATEWAY_URL.replace('/api/v1', '')}/health`);
        console.log('Health response:');
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        console.log('✅ Health test successful\n');
        return true;
    }
    catch (error) {
        console.error('❌ Health test failed:');
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        }
        else {
            console.error(error);
        }
        return false;
    }
}
// Run all tests
async function runTests() {
    console.log('🚀 Starting Gateway API tests...\n');
    // First check if the gateway is running
    const healthResult = await testHealth();
    if (!healthResult) {
        console.error('❌ Gateway does not appear to be running. Please start the gateway first.');
        return;
    }
    // Run the rest of the tests
    await testChatCompletions();
    await testTextCompletions();
    await testTemplates();
    console.log('🎉 All tests completed!');
}
// Execute tests
runTests().catch(error => {
    console.error('Unexpected error during tests:', error);
});
