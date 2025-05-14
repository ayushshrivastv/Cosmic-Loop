/**
 * @file ai-agent/index.js
 * @description AI agent service that connects to Substreams data and provides insights for the chat interface
 */

const { createClient } = require('@pinecone-database/pinecone');
const { createEmbedding } = require('./embeddings');
const { querySubstreams, fetchChainStats } = require('./substreams-client');
const { generateResponse } = require('./llm-client');
const { extractEntities, formatResponse } = require('./utils');
const logger = require('../../utils/logger');

// Initialize Pinecone client
let pineconeClient = null;

/**
 * Initialize the AI agent service
 * @param {Object} config - Configuration options
 * @returns {Object} - The initialized AI agent service
 */
const initialize = async (config) => {
  logger.info('Initializing AI Agent service...');

  try {
    // Initialize Pinecone for vector storage
    pineconeClient = await createClient({
      apiKey: config.pineconeApiKey,
      environment: config.pineconeEnvironment,
    });

    logger.info('AI Agent service initialized successfully');
    return {
      ask: async (question, userContext) => askAgent(question, userContext, config),
      getSolanaInsights: async () => getSolanaInsights(config),
      getNftStats: async (collection) => getNftStats(collection, config),
      getBridgeStats: async () => getBridgeStats(config),
      getMarketplaceStats: async () => getMarketplaceStats(config),
    };
  } catch (error) {
    logger.error('Failed to initialize AI Agent service', error);
    throw error;
  }
};

/**
 * Main function to ask the AI agent a question
 * @param {string} question - The user's question
 * @param {Object} userContext - The user's context (wallet, history, etc.)
 * @param {Object} config - Configuration options
 * @returns {Object} - The AI agent's response
 */
const askAgent = async (question, userContext, config) => {
  logger.info(`Processing question: ${question}`);

  try {
    // Extract entities from the question
    const entities = extractEntities(question);

    // Create embedding for the question
    const embedding = await createEmbedding(question);

    // Get relevant context from vector database
    const index = pineconeClient.index(config.pineconeIndex);
    const queryResponse = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    // Extract context from vector search results
    const vectorContext = queryResponse.matches.map(match => match.metadata.text).join('\n');

    // Fetch additional data from Substreams based on entities
    let substreamsData = {};
    if (entities.nft) {
      substreamsData.nft = await querySubstreams('nft', entities.nft, config);
    }
    if (entities.bridge) {
      substreamsData.bridge = await querySubstreams('bridge', entities.bridge, config);
    }
    if (entities.marketplace) {
      substreamsData.marketplace = await querySubstreams('marketplace', entities.marketplace, config);
    }

    // Generate response using LLM
    const response = await generateResponse({
      question,
      vectorContext,
      substreamsData,
      userContext,
      config,
    });

    // Format and return the response
    return formatResponse(response);
  } catch (error) {
    logger.error('Error processing question', error);
    return {
      text: "I'm sorry, but I encountered an error while processing your question. Please try again later.",
      error: error.message,
    };
  }
};

/**
 * Get general Solana blockchain insights
 * @param {Object} config - Configuration options
 * @returns {Object} - Solana blockchain insights
 */
const getSolanaInsights = async (config) => {
  try {
    const stats = await fetchChainStats(config);
    return {
      blockHeight: stats.blockHeight,
      tps: stats.tps,
      activeWallets: stats.activeWallets,
      dailyTransactions: stats.dailyTransactions,
      // Add other relevant stats
    };
  } catch (error) {
    logger.error('Error fetching Solana insights', error);
    return {
      error: 'Failed to fetch Solana insights',
    };
  }
};

/**
 * Get NFT collection statistics
 * @param {string} collection - The NFT collection to query
 * @param {Object} config - Configuration options
 * @returns {Object} - NFT collection statistics
 */
const getNftStats = async (collection, config) => {
  try {
    const nftData = await querySubstreams('nft', { collection }, config);

    // Process and aggregate NFT data
    const totalMinted = nftData.filter(event => event.activity_type === 'mint').length;
    const totalBurned = nftData.filter(event => event.activity_type === 'burn').length;
    const totalTransferred = nftData.filter(event => event.activity_type === 'transfer').length;

    // Calculate other metrics
    const activeCount = totalMinted - totalBurned;

    return {
      collection,
      totalMinted,
      totalBurned,
      totalTransferred,
      activeCount,
      // Add other relevant stats
    };
  } catch (error) {
    logger.error(`Error fetching NFT stats for collection ${collection}`, error);
    return {
      error: `Failed to fetch NFT stats for collection ${collection}`,
    };
  }
};

/**
 * Get cross-chain bridge statistics
 * @param {Object} config - Configuration options
 * @returns {Object} - Bridge statistics
 */
const getBridgeStats = async (config) => {
  try {
    const bridgeData = await querySubstreams('bridge', {}, config);

    // Process and aggregate bridge data
    const outboundCount = bridgeData.filter(event => event.activity_type === 'bridge_out').length;
    const inboundCount = bridgeData.filter(event => event.activity_type === 'bridge_in').length;

    // Calculate other metrics
    const totalVolume = bridgeData.reduce((sum, event) => sum + (event.amount || 0), 0);

    // Count by destination chain
    const chainCounts = {};
    bridgeData.forEach(event => {
      const chainId = event.destination_chain_id || event.source_chain_id;
      if (chainId) {
        chainCounts[chainId] = (chainCounts[chainId] || 0) + 1;
      }
    });

    return {
      outboundCount,
      inboundCount,
      totalVolume,
      chainCounts,
      // Add other relevant stats
    };
  } catch (error) {
    logger.error('Error fetching bridge stats', error);
    return {
      error: 'Failed to fetch bridge stats',
    };
  }
};

/**
 * Get marketplace statistics
 * @param {Object} config - Configuration options
 * @returns {Object} - Marketplace statistics
 */
const getMarketplaceStats = async (config) => {
  try {
    const marketplaceData = await querySubstreams('marketplace', {}, config);

    // Process and aggregate marketplace data
    const listingCount = marketplaceData.filter(event => event.activity_type === 'listing').length;
    const saleCount = marketplaceData.filter(event => event.activity_type === 'sale').length;
    const bidCount = marketplaceData.filter(event => event.activity_type === 'bid').length;

    // Calculate total volume
    const totalVolume = marketplaceData
      .filter(event => event.activity_type === 'sale')
      .reduce((sum, event) => sum + (event.price || 0), 0);

    // Count by marketplace
    const marketplaceCounts = {};
    marketplaceData.forEach(event => {
      const marketplace = event.marketplace;
      if (marketplace) {
        marketplaceCounts[marketplace] = (marketplaceCounts[marketplace] || 0) + 1;
      }
    });

    return {
      listingCount,
      saleCount,
      bidCount,
      totalVolume,
      marketplaceCounts,
      // Add other relevant stats
    };
  } catch (error) {
    logger.error('Error fetching marketplace stats', error);
    return {
      error: 'Failed to fetch marketplace stats',
    };
  }
};

module.exports = {
  initialize,
};
