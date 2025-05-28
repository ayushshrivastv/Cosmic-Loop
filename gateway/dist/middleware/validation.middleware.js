"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.textCompletionSchema = exports.chatCompletionSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware factory for validating request data
 * @param schema Joi schema for validation
 * @param property Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown properties
        });
        if (!error) {
            next();
        }
        else {
            const errorDetails = error.details.map((detail) => ({
                message: detail.message,
                path: detail.path,
            }));
            logger_1.default.debug('Request validation failed', {
                path: req.path,
                method: req.method,
                property,
                errors: errorDetails,
            });
            res.status(400).json({
                error: 'Validation error',
                message: 'The request data failed validation',
                details: errorDetails,
            });
        }
    };
};
exports.validate = validate;
/**
 * Schema for validating chat completion requests
 */
exports.chatCompletionSchema = joi_1.default.object({
    messages: joi_1.default.array()
        .items(joi_1.default.object({
        role: joi_1.default.string().valid('system', 'user', 'assistant').required(),
        content: joi_1.default.string().required(),
    }))
        .min(1)
        .required()
        .messages({
        'array.min': 'At least one message is required',
        'array.base': 'Messages must be an array',
        'any.required': 'Messages are required',
    }),
    model: joi_1.default.string().messages({
        'string.base': 'Model must be a string',
    }),
    max_tokens: joi_1.default.number().integer().min(1).max(32000).messages({
        'number.base': 'Max tokens must be a number',
        'number.integer': 'Max tokens must be an integer',
        'number.min': 'Max tokens must be at least 1',
        'number.max': 'Max tokens cannot exceed 32000',
    }),
    temperature: joi_1.default.number().min(0).max(2).messages({
        'number.base': 'Temperature must be a number',
        'number.min': 'Temperature must be at least 0',
        'number.max': 'Temperature cannot exceed 2',
    }),
    top_p: joi_1.default.number().min(0).max(1).messages({
        'number.base': 'Top P must be a number',
        'number.min': 'Top P must be at least 0',
        'number.max': 'Top P cannot exceed 1',
    }),
    presence_penalty: joi_1.default.number().min(-2).max(2).messages({
        'number.base': 'Presence penalty must be a number',
        'number.min': 'Presence penalty must be at least -2',
        'number.max': 'Presence penalty cannot exceed 2',
    }),
    stream: joi_1.default.boolean().messages({
        'boolean.base': 'Stream must be a boolean',
    }),
});
/**
 * Schema for validating simple text completion requests
 */
exports.textCompletionSchema = joi_1.default.object({
    prompt: joi_1.default.string().required().messages({
        'string.base': 'Prompt must be a string',
        'any.required': 'Prompt is required',
    }),
    system_prompt: joi_1.default.string().messages({
        'string.base': 'System prompt must be a string',
    }),
    model: joi_1.default.string().messages({
        'string.base': 'Model must be a string',
    }),
    max_tokens: joi_1.default.number().integer().min(1).max(32000).messages({
        'number.base': 'Max tokens must be a number',
        'number.integer': 'Max tokens must be an integer',
        'number.min': 'Max tokens must be at least 1',
        'number.max': 'Max tokens cannot exceed 32000',
    }),
    temperature: joi_1.default.number().min(0).max(2).messages({
        'number.base': 'Temperature must be a number',
        'number.min': 'Temperature must be at least 0',
        'number.max': 'Temperature cannot exceed 2',
    }),
    top_p: joi_1.default.number().min(0).max(1).messages({
        'number.base': 'Top P must be a number',
        'number.min': 'Top P must be at least 0',
        'number.max': 'Top P cannot exceed 1',
    }),
    presence_penalty: joi_1.default.number().min(-2).max(2).messages({
        'number.base': 'Presence penalty must be a number',
        'number.min': 'Presence penalty must be at least -2',
        'number.max': 'Presence penalty cannot exceed 2',
    }),
    stream: joi_1.default.boolean().messages({
        'boolean.base': 'Stream must be a boolean',
    }),
});
