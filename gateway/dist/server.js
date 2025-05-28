"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const logger_1 = __importDefault(require("./utils/logger"));
const api_routes_1 = __importDefault(require("./routes/api.routes"));
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
// Create Express application
const app = (0, express_1.default)();
// Apply middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json()); // Parse JSON request bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// Request logging
app.use((0, morgan_1.default)(config_1.IS_PRODUCTION ? 'combined' : 'dev', {
    stream: {
        write: (message) => {
            logger_1.default.info(message.trim());
        },
    },
}));
// Apply global rate limiter
app.use(rate_limit_middleware_1.globalRateLimiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: config_1.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use('/api/v1', api_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `The requested resource '${req.path}' was not found on this server`,
    });
});
// Error handler
app.use((err, req, res, next) => {
    logger_1.default.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json({
        error: 'Internal Server Error',
        message: config_1.IS_PRODUCTION
            ? 'An unexpected error occurred'
            : err.message || 'An unexpected error occurred',
    });
});
// Start the server
const port = parseInt(config_1.SERVER_PORT, 10);
app.listen(port, () => {
    logger_1.default.info(`Server started in ${config_1.NODE_ENV} mode`, {
        port,
        nodeEnv: config_1.NODE_ENV,
    });
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logger_1.default.error('Unhandled Promise Rejection', {
        reason: reason.message,
        stack: reason.stack,
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
    });
    // Exit with error
    process.exit(1);
});
exports.default = app;
