/**
 * @file index.js
 * @description Database connection utility using Knex.js
 */

const knex = require('knex');
const config = require('config');
const logger = require('../utils/logger');

let db = null;

/**
 * Create and configure a database connection
 * @returns {Knex} Knex database instance
 */
function createDbConnection() {
  if (db) {
    return db;
  }

  try {
    const dbConfig = config.get('database');
    db = knex(dbConfig);

    logger.info('Database connection established');

    // Test the connection
    db.raw('SELECT 1+1 AS result')
      .then(() => {
        logger.info('Database connection verified');
      })
      .catch((err) => {
        logger.error('Database connection test failed:', err);
      });

    return db;
  } catch (error) {
    logger.error('Failed to create database connection:', error);
    throw error;
  }
}

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
async function closeDbConnection() {
  if (db) {
    try {
      await db.destroy();
      db = null;
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }
}

module.exports = {
  createDbConnection,
  closeDbConnection,
};
