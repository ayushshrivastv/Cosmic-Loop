import { Router } from 'express';
import { chatCompletion, textCompletion, getModels } from '../controllers/chat.controller';
import { getAllTemplates, getTemplateById, useTemplate } from '../controllers/templates.controller';
import { universalQuery, getPromptTemplates, getTemplatesByCategory, getPromptTemplate, usePromptTemplate } from '../controllers/universal.controller';
import { apiKeyAuth } from '../middleware/auth.middleware';
import { validate, chatCompletionSchema, textCompletionSchema } from '../middleware/validation.middleware';
import { createRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Apply API key authentication to all routes
router.use(apiKeyAuth);

// Chat completion endpoint
router.post(
  '/chat/completions',
  validate(chatCompletionSchema),
  createRateLimiter({ max: 50, windowMs: 60 * 1000 }), // 50 requests per minute
  chatCompletion
);

// Text completion endpoint (simpler interface)
router.post(
  '/completions',
  validate(textCompletionSchema),
  createRateLimiter({ max: 50, windowMs: 60 * 1000 }), // 50 requests per minute
  textCompletion
);

// Get available models
router.get(
  '/models',
  createRateLimiter({ max: 100, windowMs: 60 * 1000 }), // 100 requests per minute
  getModels
);

// Prompt templates endpoints
router.get(
  '/templates',
  createRateLimiter({ max: 100, windowMs: 60 * 1000 }), // 100 requests per minute
  getAllTemplates
);

router.get(
  '/templates/:id',
  createRateLimiter({ max: 100, windowMs: 60 * 1000 }), // 100 requests per minute
  getTemplateById
);

router.post(
  '/templates/:id/use',
  createRateLimiter({ max: 50, windowMs: 60 * 1000 }), // 50 requests per minute
  useTemplate
);

// Universal query routes
router.post('/universal', apiKeyAuth, universalQuery);
router.get('/prompt-templates', apiKeyAuth, getPromptTemplates);
router.get('/prompt-templates/category/:category', apiKeyAuth, getTemplatesByCategory);
router.get('/prompt-templates/:id', apiKeyAuth, getPromptTemplate);
router.post('/prompt-templates/:id/use', apiKeyAuth, usePromptTemplate);

export default router;
