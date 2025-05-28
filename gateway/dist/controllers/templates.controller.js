"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTemplate = exports.getTemplateById = exports.getAllTemplates = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
// In-memory storage for prompt templates
// In a production environment, this would be stored in a database
const promptTemplates = {
    'financial-analysis': {
        name: 'Financial Analysis',
        description: 'Analyze financial data and market trends',
        systemPrompt: `You are an advanced AI assistant specializing in financial analysis. Your purpose is to help users understand financial data, market trends, and investment strategies with real-time insights.

When analyzing financial data:
1. Focus on providing objective, data-driven insights
2. Highlight key trends and patterns in the data
3. Consider both technical and fundamental analysis when relevant
4. Provide context about market conditions
5. Explain complex financial concepts in an accessible way

LIMITATIONS:
- You do NOT provide financial advice or investment recommendations
- You do NOT predict future prices or market movements with certainty`,
        userPromptTemplate: 'Please analyze the following financial data: {{data}}. Consider the following aspects: {{aspects}}.',
        parameters: [
            {
                name: 'data',
                description: 'The financial data to analyze',
                required: true,
                type: 'string'
            },
            {
                name: 'aspects',
                description: 'Specific aspects to focus on in the analysis',
                required: false,
                type: 'string',
                default: 'trends, patterns, market conditions'
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    'blockchain-analysis': {
        name: 'Blockchain Analysis',
        description: 'Analyze blockchain data and crypto market trends',
        systemPrompt: `You are an advanced AI assistant specializing in blockchain analysis. Your purpose is to help users understand blockchain data, crypto market trends, and on-chain metrics with real-time insights.

When analyzing blockchain data:
1. Focus on providing objective, data-driven insights from on-chain metrics
2. Highlight key trends and patterns in the blockchain data
3. Consider both on-chain activity and market conditions
4. Explain complex blockchain concepts in an accessible way

LIMITATIONS:
- You do NOT provide financial advice or investment recommendations
- You do NOT predict future prices or market movements with certainty
- You do NOT have access to private wallet information`,
        userPromptTemplate: 'Please analyze the following blockchain data: {{data}}. Focus on {{aspects}} and consider the time period {{timePeriod}}.',
        parameters: [
            {
                name: 'data',
                description: 'The blockchain data to analyze',
                required: true,
                type: 'string'
            },
            {
                name: 'aspects',
                description: 'Specific aspects to focus on in the analysis',
                required: false,
                type: 'string',
                default: 'transaction volume, active addresses, network activity'
            },
            {
                name: 'timePeriod',
                description: 'The time period to consider in the analysis',
                required: false,
                type: 'string',
                default: 'the past week'
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    }
};
/**
 * Get all prompt templates
 */
const getAllTemplates = (req, res) => {
    try {
        // Convert the templates object to an array
        const templates = Object.entries(promptTemplates).map(([id, template]) => ({
            id,
            ...template
        }));
        return res.status(200).json({
            templates
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching templates', {
            error: error.message
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching templates'
        });
    }
};
exports.getAllTemplates = getAllTemplates;
/**
 * Get a specific prompt template by ID
 */
const getTemplateById = (req, res) => {
    try {
        const { id } = req.params;
        // Check if template exists
        if (!promptTemplates[id]) {
            return res.status(404).json({
                error: 'Template not found',
                message: `No template found with ID: ${id}`
            });
        }
        return res.status(200).json({
            id,
            ...promptTemplates[id]
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching template', {
            error: error.message,
            templateId: req.params.id
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching the template'
        });
    }
};
exports.getTemplateById = getTemplateById;
/**
 * Use a prompt template to generate a completion
 */
const useTemplate = (req, res) => {
    try {
        const { id } = req.params;
        const paramValues = req.body;
        // Check if template exists
        if (!promptTemplates[id]) {
            return res.status(404).json({
                error: 'Template not found',
                message: `No template found with ID: ${id}`
            });
        }
        const template = promptTemplates[id];
        // Validate required parameters
        const missingParams = template.parameters
            .filter(param => param.required && !paramValues[param.name])
            .map(param => param.name);
        if (missingParams.length > 0) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: `The following required parameters are missing: ${missingParams.join(', ')}`
            });
        }
        // Fill in the template with parameter values
        let userPrompt = template.userPromptTemplate;
        // Replace template variables with actual values
        template.parameters.forEach(param => {
            const value = paramValues[param.name] !== undefined
                ? paramValues[param.name]
                : param.default;
            if (value !== undefined) {
                userPrompt = userPrompt.replace(new RegExp(`{{${param.name}}}`, 'g'), String(value));
            }
        });
        // Return the filled template
        return res.status(200).json({
            systemPrompt: template.systemPrompt,
            userPrompt,
            templateId: id,
            templateName: template.name
        });
    }
    catch (error) {
        logger_1.default.error('Error using template', {
            error: error.message,
            templateId: req.params.id
        });
        return res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while using the template'
        });
    }
};
exports.useTemplate = useTemplate;
