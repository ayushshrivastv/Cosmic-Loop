/**
 * @file redis.js
 * @description Redis client utility for caching and pub/sub
 */

const Redis = require('ioredis');
const config = require('config');
const logger = require('./logger');

let redisClient = null;

/**
 * Creates a Redis client using configuration settings
 * @returns {Redis} Redis client instance
 */
function createRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const options = {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.password'),
    db: config.get('redis.db'),
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  redisClient = new Redis(options);

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
  });

  redisClient.on('reconnecting', () => {
    logger.info('Redis client reconnecting');
  });

  return redisClient;
}

/**
 * Set a value in Redis with an optional expiration time
 * @param {string} key - Redis key
 * @param {string|object} value - Value to store
 * @param {number} expirySeconds - Expiration time in seconds (optional)
 * @returns {Promise<string>} - "OK" if successful
 */
async function setCache(key, value, expirySeconds = null) {
  if (!redisClient) {
    createRedisClient();
  }

  const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

  if (expirySeconds) {
    return redisClient.set(key, stringValue, 'EX', expirySeconds);
  }

  return redisClient.set(key, stringValue);
}

/**
 * Get a value from Redis
 * @param {string} key - Redis key
 * @param {boolean} parseJson - Whether to parse the value as JSON
 * @returns {Promise<any>} - The value or null if not found
 */
async function getCache(key, parseJson = false) {
  if (!redisClient) {
    createRedisClient();
  }

  const value = await redisClient.get(key);

  if (value && parseJson) {
    try {
      return JSON.parse(value);
    } catch (error) {
      logger.error(`Error parsing cached JSON for key ${key}:`, error);
      return null;
    }
  }

  return value;
}

/**
 * Delete a key from Redis
 * @param {string} key - Redis key
 * @returns {Promise<number>} - Number of keys deleted
 */
async function deleteCache(key) {
  if (!redisClient) {
    createRedisClient();
  }

  return redisClient.del(key);
}

/**
 * Set a hash field in Redis
 * @param {string} key - Redis key
 * @param {string} field - Hash field
 * @param {string|object} value - Value to store
 * @returns {Promise<number>} - 1 if field was created, 0 if updated
 */
async function setHashField(key, field, value) {
  if (!redisClient) {
    createRedisClient();
  }

  const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

  return redisClient.hset(key, field, stringValue);
}

/**
 * Get a hash field from Redis
 * @param {string} key - Redis key
 * @param {string} field - Hash field
 * @param {boolean} parseJson - Whether to parse the value as JSON
 * @returns {Promise<any>} - The value or null if not found
 */
async function getHashField(key, field, parseJson = false) {
  if (!redisClient) {
    createRedisClient();
  }

  const value = await redisClient.hget(key, field);

  if (value && parseJson) {
    try {
      return JSON.parse(value);
    } catch (error) {
      logger.error(`Error parsing cached hash JSON for key ${key} field ${field}:`, error);
      return null;
    }
  }

  return value;
}

/**
 * Get all hash fields from Redis
 * @param {string} key - Redis key
 * @param {boolean} parseJson - Whether to parse values as JSON
 * @returns {Promise<object>} - Object with field-value pairs
 */
async function getAllHashFields(key, parseJson = false) {
  if (!redisClient) {
    createRedisClient();
  }

  const hash = await redisClient.hgetall(key);

  if (hash && parseJson) {
    const parsedHash = {};

    for (const field in hash) {
      try {
        parsedHash[field] = JSON.parse(hash[field]);
      } catch (error) {
        logger.error(`Error parsing cached hash JSON for key ${key} field ${field}:`, error);
        parsedHash[field] = hash[field];
      }
    }

    return parsedHash;
  }

  return hash;
}

/**
 * Publish a message to a Redis channel
 * @param {string} channel - Channel name
 * @param {string|object} message - Message to publish
 * @returns {Promise<number>} - Number of clients that received the message
 */
async function publish(channel, message) {
  if (!redisClient) {
    createRedisClient();
  }

  const stringMessage = typeof message === 'object' ? JSON.stringify(message) : message;

  return redisClient.publish(channel, stringMessage);
}

/**
 * Subscribe to a Redis channel
 * @param {string} channel - Channel name
 * @param {function} callback - Callback function to execute when a message is received
 * @returns {Redis} - Redis client instance (subscriber)
 */
function subscribe(channel, callback) {
  const subscriber = new Redis({
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.password'),
    db: config.get('redis.db'),
  });

  subscriber.subscribe(channel, (err, count) => {
    if (err) {
      logger.error(`Error subscribing to channel ${channel}:`, err);
      return;
    }

    logger.info(`Subscribed to ${count} channel(s). Listening for updates on ${channel}`);
  });

  subscriber.on('message', (subscribedChannel, message) => {
    if (subscribedChannel === channel) {
      try {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage);
      } catch (error) {
        callback(message);
      }
    }
  });

  return subscriber;
}

module.exports = {
  createRedisClient,
  setCache,
  getCache,
  deleteCache,
  setHashField,
  getHashField,
  getAllHashFields,
  publish,
  subscribe,
};
