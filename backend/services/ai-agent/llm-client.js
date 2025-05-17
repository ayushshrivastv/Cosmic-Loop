/**
 * @file ai-agent/llm-client.js
 * @description Client for interacting with language models
 */

const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Generate a response using a large language model
 * @param {Object} options - Options for generating the response
 * @param {string} options.question - The user's question
 * @param {string} options.vectorContext - Context from vector search
 * @param {Object} options.substreamsData - Data from Substreams
 * @param {Object} options.userContext - User context (wallet, history, etc.)
 * @param {Object} options.config - Configuration options
 * @returns {Object} - The generated response
 */
const generateResponse = async ({ question, vectorContext, substreamsData, userContext, config }) => {
  try {
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Prepare context from Substreams data
    const nftContext = prepareNftContext(substreamsData.nft);
    const bridgeContext = prepareBridgeContext(substreamsData.bridge);
    const marketplaceContext = prepareMarketplaceContext(substreamsData.marketplace);

    // Prepare user context
    const userContextString = prepareUserContext(userContext);

    // Create system message with context
    const systemMessage = `
      You are SolanaAI, an intelligent assistant for the Solana OpenAPI platform that specializes in NFTs, cross-chain bridging, and blockchain activities on Solana.
      You have access to real-time on-chain data via The Graph Substreams.
      Answer questions accurately and helpfully based on the available data.
      Current time: ${new Date().toISOString()}

      ${userContextString}

      ${vectorContext ? `Context from previous blockchain activities:\n${vectorContext}\n\n` : ''}

      ${nftContext ? `NFT Data:\n${nftContext}\n\n` : ''}
      ${bridgeContext ? `Bridge Data:\n${bridgeContext}\n\n` : ''}
      ${marketplaceContext ? `Marketplace Data:\n${marketplaceContext}\n\n` : ''}

      IMPORTANT: If you don't know the answer to a question, say so. Don't make up information.
    `;

    // Create messages array
    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: question }
    ];

    // If there's a conversation history, add it to the messages
    if (userContext && userContext.conversationHistory && userContext.conversationHistory.length > 0) {
      // Insert conversation history before the current question
      const history = userContext.conversationHistory.map(item => ({
        role: item.role,
        content: item.content
      }));

      messages.splice(1, 0, ...history);
    }

    // Call OpenAI API to generate response
    const response = await axios.post(endpoint, {
      model: 'gpt-4-turbo', // Use latest available model
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    // Extract and return the response
    return {
      text: response.data.choices[0].message.content,
      usage: response.data.usage,
    };
  } catch (error) {
    logger.error('Error generating response from LLM', error);
    return {
      text: "I'm sorry, but I encountered an error while generating a response. Please try again later.",
      error: error.message,
    };
  }
};

/**
 * Prepare NFT context for the language model
 * @param {Array<Object>} nftData - NFT data from Substreams
 * @returns {string} - Formatted NFT context
 */
const prepareNftContext = (nftData) => {
  if (!nftData || nftData.length === 0) {
    return '';
  }

  // Format NFT data for the language model
  return `
    NFT Activities (last ${nftData.length} events):
    ${nftData.map(activity => {
      let activityDescription = '';

      switch (activity.activityType) {
        case 'mint':
          activityDescription = `Minted by ${activity.toAddress} at ${activity.blockTimestamp}`;
          break;
        case 'transfer':
          activityDescription = `Transferred from ${activity.fromAddress} to ${activity.toAddress} at ${activity.blockTimestamp}`;
          break;
        case 'burn':
          activityDescription = `Burned by ${activity.fromAddress} at ${activity.blockTimestamp}`;
          break;
        default:
          activityDescription = `${activity.activityType} at ${activity.blockTimestamp}`;
      }

      return `- Token ${activity.tokenAddress} (${activity.tokenName || 'Unknown'}) - ${activityDescription} - Collection: ${activity.collection || 'Unknown'}`;
    }).join('\n')}
  `;
};

/**
 * Prepare bridge context for the language model
 * @param {Array<Object>} bridgeData - Bridge data from Substreams
 * @returns {string} - Formatted bridge context
 */
const prepareBridgeContext = (bridgeData) => {
  if (!bridgeData || bridgeData.length === 0) {
    return '';
  }

  // Format bridge data for the language model
  return `
    Bridge Activities (last ${bridgeData.length} events):
    ${bridgeData.map(activity => {
      let activityDescription = '';

      switch (activity.activityType) {
        case 'bridge_out':
          activityDescription = `Sent from Solana to chain ${activity.destinationChainId} by ${activity.sender} at ${activity.blockTimestamp}`;
          break;
        case 'bridge_in':
          activityDescription = `Received on Solana from chain ${activity.sourceChainId} to ${activity.recipient} at ${activity.blockTimestamp}`;
          break;
        default:
          activityDescription = `${activity.activityType} at ${activity.blockTimestamp}`;
      }

      return `- Token ${activity.tokenAddress} (Amount: ${activity.amount}) - ${activityDescription} - Status: ${activity.status}`;
    }).join('\n')}
  `;
};

/**
 * Prepare marketplace context for the language model
 * @param {Array<Object>} marketplaceData - Marketplace data from Substreams
 * @returns {string} - Formatted marketplace context
 */
const prepareMarketplaceContext = (marketplaceData) => {
  if (!marketplaceData || marketplaceData.length === 0) {
    return '';
  }

  // Format marketplace data for the language model
  return `
    Marketplace Activities (last ${marketplaceData.length} events):
    ${marketplaceData.map(activity => {
      let activityDescription = '';

      switch (activity.activityType) {
        case 'listing':
          activityDescription = `Listed by ${activity.seller} at ${activity.blockTimestamp} for ${activity.price} ${activity.priceToken}`;
          break;
        case 'sale':
          activityDescription = `Sold by ${activity.seller} to ${activity.buyer} at ${activity.blockTimestamp} for ${activity.price} ${activity.priceToken}`;
          break;
        case 'bid':
          activityDescription = `Bid by ${activity.bidder} at ${activity.blockTimestamp} for ${activity.bidAmount} ${activity.priceToken}`;
          break;
        case 'cancel':
          activityDescription = `Canceled by ${activity.initiator} at ${activity.blockTimestamp}`;
          break;
        default:
          activityDescription = `${activity.activityType} at ${activity.blockTimestamp}`;
      }

      return `- Token ${activity.tokenAddress} on ${activity.marketplace} - ${activityDescription} - Collection: ${activity.collection || 'Unknown'}`;
    }).join('\n')}
  `;
};

/**
 * Prepare user context for the language model
 * @param {Object} userContext - User context (wallet, history, etc.)
 * @returns {string} - Formatted user context
 */
const prepareUserContext = (userContext) => {
  if (!userContext) {
    return 'No user context available.';
  }

  let contextString = 'User Context:';

  if (userContext.address) {
    contextString += `\nWallet Address: ${userContext.address}`;
  }

  if (userContext.connectedChains && userContext.connectedChains.length > 0) {
    contextString += `\nConnected Chains: ${userContext.connectedChains.join(', ')}`;
  }

  if (userContext.nftCollections && userContext.nftCollections.length > 0) {
    contextString += `\nNFT Collections: ${userContext.nftCollections.join(', ')}`;
  }

  if (userContext.recentActivity && userContext.recentActivity.length > 0) {
    contextString += `\nRecent Activity:`;
    userContext.recentActivity.forEach(activity => {
      contextString += `\n- ${activity.type} on ${activity.chain} at ${activity.timestamp}`;
    });
  }

  return contextString;
};

module.exports = {
  generateResponse,
};
