"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = require("../config");
class PerplexityService {
    constructor() {
        this.apiKey = config_1.PERPLEXITY_API_KEY;
        this.baseUrl = config_1.PERPLEXITY_BASE_URL;
        // Validate API key
        if (!this.apiKey) {
            throw new Error('Perplexity API key is not set');
        }
    }
    /**
     * Send a request to the Perplexity Sonar API
     * @param messages Array of messages to send to the API
     * @param options Optional parameters for the request
     * @returns The API response
     */
    async sendRequest(messages, options = {}) {
        try {
            // Use the exact same format that worked in our debug script
            const requestData = {
                model: options.model || config_1.DEFAULT_MODEL,
                messages,
                max_tokens: options.max_tokens || config_1.DEFAULT_MAX_TOKENS,
                temperature: options.temperature || config_1.DEFAULT_TEMPERATURE
            };
            // Log the request for debugging
            logger_1.default.debug('Sending request to Perplexity API', {
                model: requestData.model,
                messageCount: messages.length,
                maxTokens: requestData.max_tokens
            });
            // Send the request using the exact same format as our debug script
            const startTime = Date.now();
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            const duration = Date.now() - startTime;
            logger_1.default.debug('Received response from Perplexity API', {
                duration,
                status: response.status,
                statusText: response.statusText,
                responseId: response.data.id,
                model: response.data.model,
                choicesLength: response.data.choices?.length
            });
            return response.data;
        }
        catch (error) {
            // Enhanced error handling
            if (axios_1.default.isAxiosError(error) && error.response) {
                logger_1.default.error('Perplexity API error response', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    requestData: error.config?.data
                });
            }
            else {
                logger_1.default.error('Unknown error with Perplexity API', {
                    error: error.message,
                    stack: error.stack
                });
            }
            throw error;
        }
    }
    /**
     * Handle errors from the Perplexity API
     * @param error The error from the API
     */
    handleApiError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            logger_1.default.error('Perplexity API error', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        }
        else if (error.request) {
            // The request was made but no response was received
            logger_1.default.error('No response received from Perplexity API', {
                request: error.request
            });
        }
        else {
            // Something happened in setting up the request that triggered an Error
            logger_1.default.error('Error setting up Perplexity API request', {
                message: error.message
            });
        }
    }
    /**
     * Get available models from the Perplexity API
     * @returns List of available models
     */
    async getModels() {
        try {
            // This is a placeholder - Perplexity may not have a models endpoint
            // In a real implementation, you might fetch this from Perplexity's API
            // or maintain a list of supported models
            return [
                'llama-3.1-sonar-small-32k-online',
                'llama-3.1-sonar-small-32k',
                'llama-3.1-sonar-large-32k-online',
                'llama-3.1-sonar-large-32k',
                'sonar-small-online',
                'sonar-small-chat',
                'sonar-medium-online',
                'sonar-medium-chat',
                'sonar-large-online',
                'sonar-large-chat',
                'mistral-7b-instruct',
                'mixtral-8x7b-instruct'
            ];
        }
        catch (error) {
            logger_1.default.error('Error fetching models from Perplexity API', { error });
            throw error;
        }
    }
}
exports.default = new PerplexityService();
