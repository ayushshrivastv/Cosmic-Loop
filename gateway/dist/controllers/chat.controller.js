"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModels = exports.textCompletion = exports.chatCompletion = void 0;
const perplexity_service_1 = __importDefault(require("../services/perplexity.service"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Handle chat completion requests
 */
const chatCompletion = async (req, res) => {
    try {
        const { messages, model, max_tokens, temperature, top_p, presence_penalty, stream } = req.body;
        logger_1.default.info('Chat completion request received', {
            clientId: req.clientId,
            messageCount: messages.length,
            model
        });
        // Send request to Perplexity API
        const response = await perplexity_service_1.default.sendRequest(messages, {
            model,
            max_tokens,
            temperature,
            top_p,
            presence_penalty,
            stream
        });
        // Extract the assistant's message from the response
        const assistantMessage = response.choices[0].message.content;
        // Return a simplified response to the client
        return res.status(200).json({
            id: response.id,
            text: assistantMessage,
            model: response.model,
            usage: response.usage,
            citations: response.citations || []
        });
    }
    catch (error) {
        logger_1.default.error('Error in chat completion', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while processing your request'
        });
    }
};
exports.chatCompletion = chatCompletion;
/**
 * Handle text completion requests (simpler interface than chat)
 */
const textCompletion = async (req, res) => {
    try {
        const { prompt, system_prompt, model, max_tokens, temperature, top_p, presence_penalty, stream } = req.body;
        logger_1.default.info('Text completion request received', {
            clientId: req.clientId,
            promptLength: prompt.length,
            model
        });
        // Convert simple prompt to chat messages format
        const messages = [];
        // Add system prompt if provided
        if (system_prompt) {
            messages.push({
                role: 'system',
                content: system_prompt
            });
        }
        // Add user prompt
        messages.push({
            role: 'user',
            content: prompt
        });
        // Send request to Perplexity API
        const response = await perplexity_service_1.default.sendRequest(messages, {
            model,
            max_tokens,
            temperature,
            top_p,
            presence_penalty,
            stream
        });
        // Extract the assistant's message from the response
        const assistantMessage = response.choices[0].message.content;
        // Return a simplified response for text completion
        return res.status(200).json({
            id: response.id,
            text: assistantMessage,
            model: response.model,
            usage: response.usage,
            citations: response.citations || []
        });
    }
    catch (error) {
        logger_1.default.error('Error in text completion', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while processing your request'
        });
    }
};
exports.textCompletion = textCompletion;
/**
 * Get available models
 */
const getModels = async (req, res) => {
    try {
        const models = await perplexity_service_1.default.getModels();
        return res.status(200).json({
            models
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching models', {
            error: error.message
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching available models'
        });
    }
};
exports.getModels = getModels;
