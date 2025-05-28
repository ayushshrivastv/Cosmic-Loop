import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

/**
 * Middleware factory for validating request data
 * @param schema Joi schema for validation
 * @param property Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema: Joi.Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
    });

    if (!error) {
      next();
    } else {
      const errorDetails = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      logger.debug('Request validation failed', {
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

/**
 * Schema for validating chat completion requests
 */
export const chatCompletionSchema = Joi.object({
  messages: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid('system', 'user', 'assistant').required(),
        content: Joi.string().required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one message is required',
      'array.base': 'Messages must be an array',
      'any.required': 'Messages are required',
    }),
  model: Joi.string().messages({
    'string.base': 'Model must be a string',
  }),
  max_tokens: Joi.number().integer().min(1).max(32000).messages({
    'number.base': 'Max tokens must be a number',
    'number.integer': 'Max tokens must be an integer',
    'number.min': 'Max tokens must be at least 1',
    'number.max': 'Max tokens cannot exceed 32000',
  }),
  temperature: Joi.number().min(0).max(2).messages({
    'number.base': 'Temperature must be a number',
    'number.min': 'Temperature must be at least 0',
    'number.max': 'Temperature cannot exceed 2',
  }),
  top_p: Joi.number().min(0).max(1).messages({
    'number.base': 'Top P must be a number',
    'number.min': 'Top P must be at least 0',
    'number.max': 'Top P cannot exceed 1',
  }),
  presence_penalty: Joi.number().min(-2).max(2).messages({
    'number.base': 'Presence penalty must be a number',
    'number.min': 'Presence penalty must be at least -2',
    'number.max': 'Presence penalty cannot exceed 2',
  }),
  stream: Joi.boolean().messages({
    'boolean.base': 'Stream must be a boolean',
  }),
});

/**
 * Schema for validating simple text completion requests
 */
export const textCompletionSchema = Joi.object({
  prompt: Joi.string().required().messages({
    'string.base': 'Prompt must be a string',
    'any.required': 'Prompt is required',
  }),
  system_prompt: Joi.string().messages({
    'string.base': 'System prompt must be a string',
  }),
  model: Joi.string().messages({
    'string.base': 'Model must be a string',
  }),
  max_tokens: Joi.number().integer().min(1).max(32000).messages({
    'number.base': 'Max tokens must be a number',
    'number.integer': 'Max tokens must be an integer',
    'number.min': 'Max tokens must be at least 1',
    'number.max': 'Max tokens cannot exceed 32000',
  }),
  temperature: Joi.number().min(0).max(2).messages({
    'number.base': 'Temperature must be a number',
    'number.min': 'Temperature must be at least 0',
    'number.max': 'Temperature cannot exceed 2',
  }),
  top_p: Joi.number().min(0).max(1).messages({
    'number.base': 'Top P must be a number',
    'number.min': 'Top P must be at least 0',
    'number.max': 'Top P cannot exceed 1',
  }),
  presence_penalty: Joi.number().min(-2).max(2).messages({
    'number.base': 'Presence penalty must be a number',
    'number.min': 'Presence penalty must be at least -2',
    'number.max': 'Presence penalty cannot exceed 2',
  }),
  stream: Joi.boolean().messages({
    'boolean.base': 'Stream must be a boolean',
  }),
});
