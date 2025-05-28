"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePromptTemplate = exports.getPromptTemplate = exports.getTemplatesByCategory = exports.getPromptTemplates = exports.universalQuery = void 0;
const prompt_library_service_1 = require("../services/prompt-library.service");
const perplexity_service_1 = __importDefault(require("../services/perplexity.service"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Handle universal query requests
 */
const universalQuery = async (req, res) => {
    try {
        const { query, model, max_tokens, temperature } = req.body;
        if (!query) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Query is required'
            });
        }
        logger_1.default.info('Universal query request received', {
            clientId: req.clientId,
            queryLength: query.length
        });
        // Process the query using the prompt library
        const { systemPrompt, userPrompt } = prompt_library_service_1.promptLibraryService.processQuery(query);
        logger_1.default.debug('Generated prompts for query', {
            templateDetected: true,
            systemPromptLength: systemPrompt.length,
            userPromptLength: userPrompt.length
        });
        // Send request to Perplexity API
        const response = await perplexity_service_1.default.sendRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], {
            model,
            max_tokens,
            temperature
        });
        // Extract the assistant's message from the response
        const assistantMessage = response.choices[0].message.content;
        // Return a response with metadata about the template used
        return res.status(200).json({
            id: response.id,
            text: assistantMessage,
            model: response.model,
            usage: response.usage,
            citations: response.citations || [],
            metadata: {
                promptEngineered: true,
                systemPromptPreview: systemPrompt.substring(0, 100) + '...',
                detectedIntent: prompt_library_service_1.promptLibraryService.detectTemplate(query)
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error in universal query', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while processing your request'
        });
    }
};
exports.universalQuery = universalQuery;
/**
 * Get all available prompt templates
 */
const getPromptTemplates = async (req, res) => {
    try {
        const templates = prompt_library_service_1.promptLibraryService.getAllTemplates().map(template => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            tags: template.tags,
            parameters: template.parameters
        }));
        return res.status(200).json({
            templates
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching prompt templates', {
            error: error.message
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching prompt templates'
        });
    }
};
exports.getPromptTemplates = getPromptTemplates;
/**
 * Get templates by category
 */
const getTemplatesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const templates = prompt_library_service_1.promptLibraryService.getTemplatesByCategory(category).map(template => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            tags: template.tags,
            parameters: template.parameters
        }));
        return res.status(200).json({
            category,
            templates
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching templates by category', {
            error: error.message,
            category: req.params.category
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching templates by category'
        });
    }
};
exports.getTemplatesByCategory = getTemplatesByCategory;
/**
 * Get a specific prompt template
 */
const getPromptTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = prompt_library_service_1.promptLibraryService.getTemplate(id);
        if (!template) {
            return res.status(404).json({
                error: 'Not found',
                message: `Template with ID '${id}' not found`
            });
        }
        return res.status(200).json({
            template: {
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                tags: template.tags,
                parameters: template.parameters,
                systemPromptPreview: template.systemPrompt.substring(0, 200) + '...',
                userPromptTemplate: template.userPromptTemplate
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching prompt template', {
            error: error.message,
            templateId: req.params.id
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching the prompt template'
        });
    }
};
exports.getPromptTemplate = getPromptTemplate;
/**
 * Use a specific template with parameters
 */
const usePromptTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const parameters = req.body;
        const template = prompt_library_service_1.promptLibraryService.getTemplate(id);
        if (!template) {
            return res.status(404).json({
                error: 'Not found',
                message: `Template with ID '${id}' not found`
            });
        }
        // Generate prompts using the template
        const { systemPrompt, userPrompt } = prompt_library_service_1.promptLibraryService.useTemplate(id, parameters);
        return res.status(200).json({
            templateId: id,
            templateName: template.name,
            systemPrompt,
            userPrompt,
            parameters
        });
    }
    catch (error) {
        logger_1.default.error('Error using prompt template', {
            error: error.message,
            templateId: req.params.id,
            parameters: req.body
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while using the prompt template'
        });
    }
};
exports.usePromptTemplate = usePromptTemplate;
