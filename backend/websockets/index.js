/**
 * @file index.js
 * @description WebSocket server implementation for real-time notifications and events
 */

const logger = require('../utils/logger');
const config = require('config');
const jwt = require('jsonwebtoken');

// Store connected clients
const clients = new Map();

// Event types for the WebSocket server
const WS_EVENTS = {
  NFT_MINTED: 'nft:minted',
  NFT_TRANSFERRED: 'nft:transferred',
  BRIDGE_INITIATED: 'bridge:initiated',
  BRIDGE_UPDATED: 'bridge:updated',
  BRIDGE_COMPLETED: 'bridge:completed',
  BRIDGE_FAILED: 'bridge:failed',
  EVENT_UPDATED: 'event:updated',
  EVENT_PARTICIPANT_ADDED: 'event:participant:added',
  NFT_CLAIMED: 'nft:claimed',
  VERIFICATION_COMPLETED: 'verification:completed',
  SERVER_NOTIFICATION: 'server:notification',
};

/**
 * Set up WebSocket server
 * @param {WebSocketServer} wss - WebSocket server instance
 * @param {Redis} redisClient - Redis client for pub/sub
 */
function setupWebSocketServer(wss, redisClient) {
  // Set up connection handling
  wss.on('connection', (ws, req) => {
    handleConnection(ws, req, redisClient);
  });

  // Set up Redis subscription for real-time events
  setupRedisSubscription(redisClient);

  // Set up ping interval to keep connections alive
  const pingInterval = config.get('websocket.pingInterval');

  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.isAlive === false) {
        return client.terminate();
      }

      client.isAlive = false;
      client.ping();
    });
  }, pingInterval);

  logger.info('WebSocket server initialized');
}

/**
 * Handle new WebSocket connection
 * @param {WebSocket} ws - WebSocket connection
 * @param {Request} req - HTTP request object
 * @param {Redis} redisClient - Redis client
 */
function handleConnection(ws, req, redisClient) {
  const id = generateClientId();

  // Extract client IP for logging
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();

  logger.info(`WebSocket client connected: ${id} from ${ip}`);

  // Set initial properties
  ws.id = id;
  ws.isAlive = true;
  ws.subscriptions = new Set();

  // Store client reference
  clients.set(id, ws);

  // Authenticate client if token is provided
  let userId = null;
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  if (token) {
    try {
      const decoded = jwt.verify(token, config.get('jwt.secret'));
      userId = decoded.userId;
      ws.userId = userId;
      logger.info(`WebSocket client ${id} authenticated as user ${userId}`);
    } catch (error) {
      logger.warn(`Invalid token for WebSocket client ${id}: ${error.message}`);
    }
  }

  // Set up ping/pong for connection monitoring
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleClientMessage(ws, data, redisClient);
    } catch (error) {
      logger.error(`Invalid WebSocket message from client ${id}: ${error.message}`);
      sendErrorMessage(ws, 'Invalid message format');
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    logger.info(`WebSocket client disconnected: ${id}`);
    clients.delete(id);
  });

  // Send welcome message
  sendMessage(ws, {
    type: WS_EVENTS.SERVER_NOTIFICATION,
    data: {
      message: 'Connected to Cosmic Loop WebSocket server',
      clientId: id,
      authenticated: !!userId,
    },
  });
}

/**
 * Handle client messages
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} data - Message data
 * @param {Redis} redisClient - Redis client
 */
function handleClientMessage(ws, data, redisClient) {
  const { type, payload } = data;

  switch (type) {
    case 'subscribe':
      handleSubscribe(ws, payload);
      break;
    case 'unsubscribe':
      handleUnsubscribe(ws, payload);
      break;
    case 'ping':
      sendMessage(ws, { type: 'pong' });
      break;
    default:
      logger.warn(`Unknown message type from client ${ws.id}: ${type}`);
      sendErrorMessage(ws, 'Unknown message type');
  }
}

/**
 * Handle client subscription request
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} payload - Subscription payload
 */
function handleSubscribe(ws, payload) {
  const { channel, filters = {} } = payload;

  if (!channel) {
    return sendErrorMessage(ws, 'Missing channel in subscription request');
  }

  // Store subscription with filters
  ws.subscriptions.add(JSON.stringify({ channel, filters }));

  logger.info(`Client ${ws.id} subscribed to ${channel} with filters: ${JSON.stringify(filters)}`);

  sendMessage(ws, {
    type: 'subscribed',
    data: {
      channel,
      filters,
    },
  });
}

/**
 * Handle client unsubscribe request
 * @param {WebSocket} ws - WebSocket connection
 * @param {Object} payload - Unsubscription payload
 */
function handleUnsubscribe(ws, payload) {
  const { channel, filters = {} } = payload;

  if (!channel) {
    return sendErrorMessage(ws, 'Missing channel in unsubscription request');
  }

  // Remove subscription
  const subscriptionKey = JSON.stringify({ channel, filters });
  ws.subscriptions.delete(subscriptionKey);

  logger.info(`Client ${ws.id} unsubscribed from ${channel}`);

  sendMessage(ws, {
    type: 'unsubscribed',
    data: {
      channel,
    },
  });
}

/**
 * Set up Redis subscription for real-time events
 * @param {Redis} redisClient - Redis client
 */
function setupRedisSubscription(redisClient) {
  const subscriber = redisClient.duplicate();

  subscriber.subscribe('ws:events', (err, count) => {
    if (err) {
      logger.error('Failed to subscribe to Redis channel:', err);
      return;
    }

    logger.info(`Subscribed to ${count} Redis channel(s) for WebSocket events`);
  });

  subscriber.on('message', (channel, message) => {
    try {
      const event = JSON.parse(message);
      broadcastEvent(event);
    } catch (error) {
      logger.error('Error processing Redis message:', error);
    }
  });
}

/**
 * Broadcast an event to all applicable clients
 * @param {Object} event - Event to broadcast
 */
function broadcastEvent(event) {
  const { type, data, filters = {} } = event;

  logger.debug(`Broadcasting event: ${type} with filters: ${JSON.stringify(filters)}`);

  clients.forEach((client) => {
    if (shouldReceiveEvent(client, type, filters)) {
      sendMessage(client, {
        type,
        data,
      });
    }
  });
}

/**
 * Determine if a client should receive a particular event
 * @param {WebSocket} client - WebSocket client
 * @param {string} eventType - Event type
 * @param {Object} eventFilters - Event filters
 * @returns {boolean} - Whether the client should receive the event
 */
function shouldReceiveEvent(client, eventType, eventFilters) {
  // Check if client has subscribed to this event type
  for (const subscription of client.subscriptions) {
    try {
      const { channel, filters } = JSON.parse(subscription);

      if (channel === eventType || channel === '*') {
        // Check if filters match
        if (matchesFilters(filters, eventFilters)) {
          return true;
        }
      }
    } catch (error) {
      logger.error(`Invalid subscription format: ${subscription}`);
    }
  }

  return false;
}

/**
 * Check if event filters match subscription filters
 * @param {Object} subscriptionFilters - Filters set in subscription
 * @param {Object} eventFilters - Filters set in event
 * @returns {boolean} - Whether the filters match
 */
function matchesFilters(subscriptionFilters, eventFilters) {
  // Empty filters match everything
  if (Object.keys(subscriptionFilters).length === 0) {
    return true;
  }

  // Check each subscription filter against event filters
  for (const [key, value] of Object.entries(subscriptionFilters)) {
    // If filter value is array, check if event value is in array
    if (Array.isArray(value)) {
      if (!value.includes(eventFilters[key])) {
        return false;
      }
    }
    // Otherwise, check for exact match
    else if (value !== eventFilters[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Send a message to a WebSocket client
 * @param {WebSocket} client - WebSocket client
 * @param {Object} message - Message to send
 */
function sendMessage(client, message) {
  if (client.readyState === client.OPEN) {
    client.send(JSON.stringify(message));
  }
}

/**
 * Send an error message to a WebSocket client
 * @param {WebSocket} client - WebSocket client
 * @param {string} errorMessage - Error message
 */
function sendErrorMessage(client, errorMessage) {
  sendMessage(client, {
    type: 'error',
    data: {
      message: errorMessage,
    },
  });
}

/**
 * Generate a unique client ID
 * @returns {string} - Unique client ID
 */
function generateClientId() {
  return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Publish an event to connected clients
 * @param {string} type - Event type
 * @param {Object} data - Event data
 * @param {Object} filters - Event filters
 * @param {Redis} redisClient - Redis client
 */
async function publishEvent(type, data, filters = {}, redisClient) {
  const event = {
    type,
    data,
    filters,
    timestamp: Date.now(),
  };

  await redisClient.publish('ws:events', JSON.stringify(event));
  logger.debug(`Published ${type} event to Redis`);
}

module.exports = {
  setupWebSocketServer,
  publishEvent,
  WS_EVENTS,
};
