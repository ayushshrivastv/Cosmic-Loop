/**
 * @file ai-agent/utils.js
 * @description Utility functions for the AI agent
 */

const logger = require('../../utils/logger');

/**
 * Extract entities from a question
 * @param {string} question - The user's question
 * @returns {Object} - Extracted entities (nft, bridge, marketplace)
 */
const extractEntities = (question) => {
  // Convert question to lowercase for easier matching
  const lowerQuestion = question.toLowerCase();

  // Initialize entities object
  const entities = {
    nft: null,
    bridge: null,
    marketplace: null,
  };

  // Extract NFT-related information
  if (lowerQuestion.includes('nft') || lowerQuestion.includes('token') || lowerQuestion.includes('collection')) {
    entities.nft = extractNftEntities(lowerQuestion);
  }

  // Extract bridge-related information
  if (lowerQuestion.includes('bridge') || lowerQuestion.includes('cross-chain') || lowerQuestion.includes('layerzero') || lowerQuestion.includes('wormhole')) {
    entities.bridge = extractBridgeEntities(lowerQuestion);
  }

  // Extract marketplace-related information
  if (lowerQuestion.includes('marketplace') || lowerQuestion.includes('magic eden') || lowerQuestion.includes('tensor') || lowerQuestion.includes('auction') || lowerQuestion.includes('list') || lowerQuestion.includes('sale') || lowerQuestion.includes('bid')) {
    entities.marketplace = extractMarketplaceEntities(lowerQuestion);
  }

  return entities;
};

/**
 * Extract NFT-related entities from a question
 * @param {string} question - The lowercase user question
 * @returns {Object} - Extracted NFT entities
 */
const extractNftEntities = (question) => {
  const entities = {};

  // Try to extract collection name
  const collectionRegex = /collection\s+(?:called|named)?\s+['"](.*?)['"]|collection[:\s]+([a-zA-Z0-9_]+)|(([a-zA-Z0-9_]+)\s+collection)/i;
  const collectionMatch = question.match(collectionRegex);
  if (collectionMatch) {
    entities.collection = collectionMatch[1] || collectionMatch[2] || collectionMatch[4];
  }

  // Try to extract token address
  const addressRegex = /(0x[a-fA-F0-9]{40}|[a-zA-Z0-9]{32,44})/;
  const addressMatch = question.match(addressRegex);
  if (addressMatch) {
    entities.tokenAddress = addressMatch[1];
  }

  // Try to extract token name
  const tokenNameRegex = /token\s+(?:called|named)?\s+['"](.*?)['"]|token[:\s]+([a-zA-Z0-9_]+)/i;
  const tokenNameMatch = question.match(tokenNameRegex);
  if (tokenNameMatch) {
    entities.tokenName = tokenNameMatch[1] || tokenNameMatch[2];
  }

  return entities;
};

/**
 * Extract bridge-related entities from a question
 * @param {string} question - The lowercase user question
 * @returns {Object} - Extracted bridge entities
 */
const extractBridgeEntities = (question) => {
  const entities = {};

  // Try to extract source chain
  const sourceChainRegex = /from\s+(?:chain|network)?\s+([a-zA-Z0-9_]+)/i;
  const sourceChainMatch = question.match(sourceChainRegex);
  if (sourceChainMatch) {
    entities.sourceChain = sourceChainMatch[1];
  }

  // Try to extract destination chain
  const destChainRegex = /to\s+(?:chain|network)?\s+([a-zA-Z0-9_]+)/i;
  const destChainMatch = question.match(destChainRegex);
  if (destChainMatch) {
    entities.destinationChain = destChainMatch[1];
  }

  // Try to extract bridge provider
  const bridgeRegex = /(layerzero|wormhole|portal|stargate|synapse|across|hop)/i;
  const bridgeMatch = question.match(bridgeRegex);
  if (bridgeMatch) {
    entities.bridgeProvider = bridgeMatch[1].toLowerCase();
  }

  return entities;
};

/**
 * Extract marketplace-related entities from a question
 * @param {string} question - The lowercase user question
 * @returns {Object} - Extracted marketplace entities
 */
const extractMarketplaceEntities = (question) => {
  const entities = {};

  // Try to extract marketplace name
  const marketplaceRegex = /(magic\s*eden|tensor|opensea|solanart|formfunction|metaplex|auction\s*house)/i;
  const marketplaceMatch = question.match(marketplaceRegex);
  if (marketplaceMatch) {
    let marketplace = marketplaceMatch[1].toLowerCase();

    // Normalize marketplace names
    if (marketplace === 'magic eden' || marketplace === 'magiceden') {
      marketplace = 'magiceden';
    } else if (marketplace === 'auction house') {
      marketplace = 'auction_house';
    }

    entities.marketplace = marketplace;
  }

  // Try to extract activity type
  if (question.includes('list')) {
    entities.activityType = 'listing';
  } else if (question.includes('sale') || question.includes('sold') || question.includes('buy') || question.includes('bought')) {
    entities.activityType = 'sale';
  } else if (question.includes('bid') || question.includes('offer')) {
    entities.activityType = 'bid';
  } else if (question.includes('cancel')) {
    entities.activityType = 'cancel';
  }

  // Also get collection from shared NFT extraction
  const nftEntities = extractNftEntities(question);
  if (nftEntities.collection) {
    entities.collection = nftEntities.collection;
  }

  return entities;
};

/**
 * Format the response for the frontend
 * @param {Object} response - The raw response from the language model
 * @returns {Object} - Formatted response with UI components
 */
const formatResponse = (response) => {
  // If there's an error, return it as is
  if (response.error) {
    return response;
  }

  try {
    const text = response.text;
    const formattedResponse = {
      text,
      components: [],
    };

    // Parse response for special formatting

    // Check for code blocks and extract them
    const codeBlocks = text.match(/```(?:json)?\s*([\s\S]*?)```/g);
    if (codeBlocks) {
      codeBlocks.forEach((block) => {
        const codeContent = block.replace(/```(?:json)?\s*([\s\S]*?)```/, '$1').trim();

        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(codeContent);

          // If it's valid JSON, add a data component
          formattedResponse.components.push({
            type: 'data',
            data: jsonData,
          });
        } catch (e) {
          // Not valid JSON, treat as code
          formattedResponse.components.push({
            type: 'code',
            content: codeContent,
          });
        }
      });
    }

    // Check for table formatting (markdown tables)
    const tableRegex = /\|(.+)\|\s*\n\|([-:]+\|)+\s*\n(\|.+\|\s*\n)+/g;
    const tables = text.match(tableRegex);
    if (tables) {
      tables.forEach((tableText) => {
        // Parse the markdown table
        const rows = tableText.trim().split('\n');
        const headers = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
        const data = rows.slice(2).map(row => {
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
          const rowData = {};
          headers.forEach((header, index) => {
            if (index < cells.length) {
              rowData[header] = cells[index];
            }
          });
          return rowData;
        });

        formattedResponse.components.push({
          type: 'table',
          headers,
          data,
        });
      });
    }

    // Extract any NFT/token references that might need to be displayed
    const tokenAddressRegex = /token\s*address[:\s]+([a-zA-Z0-9]{32,44})/gi;
    const tokenMatches = [...text.matchAll(tokenAddressRegex)];
    if (tokenMatches.length > 0) {
      tokenMatches.forEach((match) => {
        formattedResponse.components.push({
          type: 'token',
          address: match[1],
        });
      });
    }

    return formattedResponse;
  } catch (error) {
    logger.error('Error formatting response', error);
    return {
      text: response.text,
      error: 'Error formatting response',
    };
  }
};

module.exports = {
  extractEntities,
  formatResponse,
};
