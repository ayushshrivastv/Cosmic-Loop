import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { SERVER_PORT, NODE_ENV, IS_PRODUCTION } from './config';
import logger from './utils/logger';
import apiRoutes from './routes/api.routes';
import { globalRateLimiter } from './middleware/rate-limit.middleware';

// Create Express application
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Request logging
app.use(
  morgan(IS_PRODUCTION ? 'combined' : 'dev', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

// Apply global rate limiter
app.use(globalRateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource '${req.path}' was not found on this server`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: IS_PRODUCTION
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred',
  });
});

// Start the server
const port = parseInt(SERVER_PORT, 10);
app.listen(port, () => {
  logger.info(`Server started in ${NODE_ENV} mode`, {
    port,
    nodeEnv: NODE_ENV,
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.message,
    stack: reason.stack,
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  // Exit with error
  process.exit(1);
});

export default app;
