/**
 * @file ai-agent/substreams-client.js
 * @description Client for interacting with The Graph Substreams on Solana
 */

const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Query Substreams data based on entity type and filters
 * @param {string} entityType - The type of entity to query (nft, bridge, marketplace)
 * @param {Object} filters - Filters to apply to the query
 * @param {Object} config - Configuration options
 * @returns {Array<Object>} - Array of entities matching the query
 */
const querySubstreams = async (entityType, filters = {}, config) => {
  try {
    // Build the GraphQL query based on entity type
    const query = buildGraphqlQuery(entityType, filters);

    // Call The Graph API
    const response = await axios.post(config.substreamsEndpoint, {
      query,
      variables: {
        ...filters,
        first: 100,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        // If authentication is required
        ...(config.substreamsApiKey && { 'Authorization': `Bearer ${config.substreamsApiKey}` }),
      },
    });

    // Extract and return the data
    if (response.data.errors) {
      logger.error('GraphQL errors:', response.data.errors);
      throw new Error('Error querying Substreams data: ' + response.data.errors[0].message);
    }

    // Return the correct data based on entity type
    switch (entityType) {
      case 'nft':
        return response.data.data.nftActivities || [];
      case 'bridge':
        return response.data.data.bridgeActivities || [];
      case 'marketplace':
        return response.data.data.marketplaceActivities || [];
      default:
        return [];
    }
  } catch (error) {
    logger.error(`Error querying Substreams for ${entityType}`, error);
    throw new Error(`Failed to query Substreams data: ${error.message}`);
  }
};

/**
 * Build a GraphQL query based on entity type and filters
 * @param {string} entityType - The type of entity to query
 * @param {Object} filters - Filters to apply to the query
 * @returns {string} - The GraphQL query
 */
const buildGraphqlQuery = (entityType, filters) => {
  // Common fields for all entities
  const commonFields = `
    id
    activityType
    transactionHash
    blockNumber
    blockTimestamp
  `;

  // Entity-specific fields and filters
  switch (entityType) {
    case 'nft':
      return `
        query NFTActivities($first: Int, $collection: String) {
          nftActivities(
            first: $first
            ${filters.collection ? 'where: { collection: $collection }' : ''}
            orderBy: blockTimestamp
            orderDirection: desc
          ) {
            ${commonFields}
            tokenAddress
            fromAddress
            toAddress
            amount
            isCompressed
            collection
            tokenName
            tokenSymbol
            tokenUri
            attributesJson
          }
        }
      `;

    case 'bridge':
      return `
        query BridgeActivities($first: Int, $sourceChainId: Int, $destinationChainId: Int) {
          bridgeActivities(
            first: $first
            ${filters.sourceChainId ? 'where: { sourceChainId: $sourceChainId }' : ''}
            ${filters.destinationChainId ? 'where: { destinationChainId: $destinationChainId }' : ''}
            orderBy: blockTimestamp
            orderDirection: desc
          ) {
            ${commonFields}
            tokenAddress
            amount
            sender
            recipient
            bridgeProvider
            sourceChainId
            destinationChainId
            sourceAddress
            destinationAddress
            status
            feesPaid
            feeToken
            nonce
            sourceTransactionHash
            extraDataJson
          }
        }
      `;

    case 'marketplace':
      return `
        query MarketplaceActivities($first: Int, $marketplace: String, $collection: String) {
          marketplaceActivities(
            first: $first
            ${filters.marketplace ? 'where: { marketplace: $marketplace }' : ''}
            ${filters.collection ? 'where: { collection: $collection }' : ''}
            orderBy: blockTimestamp
            orderDirection: desc
          ) {
            ${commonFields}
            marketplace
            tokenAddress
            seller
            buyer
            bidder
            initiator
            price
            priceToken
            listingId
            collection
            auctionHouse
            marketplaceFee
            royaltyFee
            bidAmount
            expiryTime
            action
            extraDataJson
          }
        }
      `;

    default:
      return '';
  }
};

/**
 * Fetch general Solana chain statistics
 * @param {Object} config - Configuration options
 * @returns {Object} - Solana chain statistics
 */
const fetchChainStats = async (config) => {
  try {
    // For this example, we'll make a simple API call to get chain stats
    const response = await axios.get(config.solanaStatsEndpoint, {
      headers: {
        ...(config.solanaStatsApiKey && { 'Authorization': `Bearer ${config.solanaStatsApiKey}` }),
      },
    });

    return {
      blockHeight: response.data.blockHeight,
      tps: response.data.tps,
      activeWallets: response.data.activeWallets,
      dailyTransactions: response.data.dailyTransactions,
      marketCap: response.data.marketCap,
      price: response.data.price,
      // Add other relevant stats
    };
  } catch (error) {
    logger.error('Error fetching Solana chain stats', error);

    // Return mock data if the API call fails
    return {
      blockHeight: 0,
      tps: 0,
      activeWallets: 0,
      dailyTransactions: 0,
      marketCap: 0,
      price: 0,
    };
  }
};

module.exports = {
  querySubstreams,
  fetchChainStats,
};
