"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const templates_controller_1 = require("../controllers/templates.controller");
const universal_controller_1 = require("../controllers/universal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Apply API key authentication to all routes
router.use(auth_middleware_1.apiKeyAuth);
// Chat completion endpoint
router.post('/chat/completions', (0, validation_middleware_1.validate)(validation_middleware_1.chatCompletionSchema), (0, rate_limit_middleware_1.createRateLimiter)({ max: 50, windowMs: 60 * 1000 }), // 50 requests per minute
chat_controller_1.chatCompletion);
// Text completion endpoint (simpler interface)
router.post('/completions', (0, validation_middleware_1.validate)(validation_middleware_1.textCompletionSchema), (0, rate_limit_middleware_1.createRateLimiter)({ max: 50, windowMs: 60 * 1000 }), // 50 requests per minute
chat_controller_1.textCompletion);
// Get available models
router.get('/models', (0, rate_limit_middleware_1.createRateLimiter)({ max: 100, windowMs: 60 * 1000 }), // 100 requests per minute
chat_controller_1.getModels);
// Prompt templates endpoints
router.get('/templates', (0, rate_limit_middleware_1.createRateLimiter)({ max: 100, windowMs: 60 * 1000 }), // 100 requests per minute
templates_controller_1.getAllTemplates);
router.get('/templates/:id', (0, rate_limit_middleware_1.createRateLimiter)({ max: 100, windowMs: 60 * 1000 }), // 100 requests per minute
templates_controller_1.getTemplateById);
router.post('/templates/:id/use', (0, rate_limit_middleware_1.createRateLimiter)({ max: 50, windowMs: 60 * 1000 }), // 50 requests per minute
templates_controller_1.useTemplate);
// Universal query routes
router.post('/universal', auth_middleware_1.apiKeyAuth, universal_controller_1.universalQuery);
router.get('/prompt-templates', auth_middleware_1.apiKeyAuth, universal_controller_1.getPromptTemplates);
router.get('/prompt-templates/category/:category', auth_middleware_1.apiKeyAuth, universal_controller_1.getTemplatesByCategory);
router.get('/prompt-templates/:id', auth_middleware_1.apiKeyAuth, universal_controller_1.getPromptTemplate);
router.post('/prompt-templates/:id/use', auth_middleware_1.apiKeyAuth, universal_controller_1.usePromptTemplate);
exports.default = router;
