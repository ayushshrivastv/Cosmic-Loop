/**
 * @file index.js
 * @description Main entry point for the Cosmic Loop backend
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const config = require('config');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServer } = require('@apollo/server');
const { WebSocketServer } = require('ws');
const { createRedisClient } = require('./utils/redis');
const { applyRateLimiting } = require('./middleware/rate-limiting');
const { setupWebSocketServer } = require('./websockets');
const { typeDefs, resolvers } = require('./graphql');
const { createDbConnection } = require('./database');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors(config.get('server.cors')));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
applyRateLimiting(app);

// Initialize Redis
const redisClient = createRedisClient();

// Setup WebSocket server
const wss = new WebSocketServer({
  server,
  path: config.get('websocket.path')
});
setupWebSocketServer(wss, redisClient);

// Initialize Apollo GraphQL server
async function startApolloServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: config.get('graphql.introspection'),
    playground: config.get('graphql.playground'),
    context: ({ req }) => {
      return {
        req,
        redisClient,
        db: createDbConnection()
      };
    },
  });

  await apolloServer.start();

  app.use(
    config.get('graphql.path'),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        req,
        redisClient,
        db: createDbConnection()
      }),
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start the server
  const PORT = config.get('server.port');
  const HOST = config.get('server.host');

  server.listen(PORT, HOST, () => {
    logger.info(`Server running at http://${HOST}:${PORT}`);
    logger.info(`GraphQL endpoint at http://${HOST}:${PORT}${config.get('graphql.path')}`);
    logger.info(`WebSocket endpoint at ws://${HOST}:${PORT}${config.get('websocket.path')}`);
  });

  return { app, server };
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startApolloServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { startApolloServer };
