/**
 * @file graphql/resolvers/ai-assistant.js
 * @description GraphQL resolvers for the AI assistant
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');
let aiAgent = null;

// Initialize the AI agent
const initAiAgent = async () => {
  if (!aiAgent) {
    try {
      const aiAgentService = require('../../services/ai-agent');
      aiAgent = await aiAgentService.initialize({
        pineconeApiKey: process.env.PINECONE_API_KEY,
        pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
        pineconeIndex: process.env.PINECONE_INDEX,
        substreamsEndpoint: process.env.SUBSTREAMS_ENDPOINT,
        substreamsApiKey: process.env.SUBSTREAMS_API_KEY,
        solanaStatsEndpoint: process.env.SOLANA_STATS_ENDPOINT,
        solanaStatsApiKey: process.env.SOLANA_STATS_API_KEY,
      });
      logger.info('AI agent initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI agent', error);
      throw new Error('Failed to initialize AI agent');
    }
  }
  return aiAgent;
};

// In-memory store for chat conversations (would be replaced with database in production)
const chatConversations = {};

// AI assistant resolvers
const aiAssistantResolvers = {
  Query: {
    askAssistant: async (_, { question, conversationId }, { user }) => {
      try {
        const agent = await initAiAgent();

        // Get user context
        const userContext = {
          address: user?.address,
          connectedChains: user?.connectedChains || [],
          nftCollections: user?.nftCollections || [],
          recentActivity: user?.recentActivity || [],
        };

        // If we have a conversation ID, include conversation history
        if (conversationId && chatConversations[conversationId]) {
          const conversation = chatConversations[conversationId];

          // Format messages for the AI context
          userContext.conversationHistory = conversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          }));
        }

        // Get response from AI agent
        const response = await agent.ask(question, userContext);

        // Store the question and response in conversation history if conversationId provided
        if (conversationId) {
          await storeMessage(conversationId, 'user', question, user?.id);
          await storeMessage(conversationId, 'assistant', response.text, user?.id, response.components);
        }

        return response;
      } catch (error) {
        logger.error('Error in askAssistant resolver', error);
        return {
          text: "I'm sorry, but I encountered an error while processing your question. Please try again later.",
          error: error.message,
        };
      }
    },

    getNftStats: async (_, { collection }, { user }) => {
      try {
        const agent = await initAiAgent();
        return await agent.getNftStats(collection);
      } catch (error) {
        logger.error(`Error in getNftStats resolver for collection ${collection}`, error);
        return {
          collection,
          error: error.message,
        };
      }
    },

    getBridgeStats: async (_, __, { user }) => {
      try {
        const agent = await initAiAgent();
        return await agent.getBridgeStats();
      } catch (error) {
        logger.error('Error in getBridgeStats resolver', error);
        return {
          error: error.message,
        };
      }
    },

    getMarketplaceStats: async (_, __, { user }) => {
      try {
        const agent = await initAiAgent();
        return await agent.getMarketplaceStats();
      } catch (error) {
        logger.error('Error in getMarketplaceStats resolver', error);
        return {
          error: error.message,
        };
      }
    },

    getChainStats: async (_, __, { user }) => {
      try {
        const agent = await initAiAgent();
        return await agent.getSolanaInsights();
      } catch (error) {
        logger.error('Error in getChainStats resolver', error);
        return {
          error: error.message,
        };
      }
    },

    getChatConversations: async (_, __, { user }) => {
      // In a real implementation, this would fetch from a database
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        // Filter conversations for this user
        const userConversations = Object.values(chatConversations)
          .filter(convo => convo.userId === user.id)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return userConversations;
      } catch (error) {
        logger.error('Error in getChatConversations resolver', error);
        throw error;
      }
    },

    getChatConversation: async (_, { id }, { user }) => {
      // In a real implementation, this would fetch from a database
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        const conversation = chatConversations[id];

        // Check if conversation exists and belongs to user
        if (!conversation || conversation.userId !== user.id) {
          return null;
        }

        return conversation;
      } catch (error) {
        logger.error(`Error in getChatConversation resolver for ID ${id}`, error);
        throw error;
      }
    },
  },

  Mutation: {
    createChatConversation: async (_, { title }, { user, pubsub }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        // Create new conversation
        const conversation = {
          id,
          title: title || 'New Conversation',
          messages: [],
          userId: user.id,
          createdAt: now,
          updatedAt: now,
        };

        // Store in memory (would be database in production)
        chatConversations[id] = conversation;

        return conversation;
      } catch (error) {
        logger.error('Error in createChatConversation resolver', error);
        throw error;
      }
    },

    addChatMessage: async (_, { conversationId, message }, { user, pubsub }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        // Check if conversation exists and belongs to user
        const conversation = chatConversations[conversationId];
        if (!conversation || conversation.userId !== user.id) {
          throw new Error('Conversation not found');
        }

        // Create and store the message
        const newMessage = await storeMessage(
          conversationId,
          message.role,
          message.content,
          user.id
        );

        // If this is a user message, generate an AI response
        if (message.role === 'user') {
          // Use askAssistant resolver to keep logic centralized
          setTimeout(async () => {
            try {
              await aiAssistantResolvers.Query.askAssistant(
                null,
                { question: message.content, conversationId },
                { user }
              );
            } catch (error) {
              logger.error('Error generating AI response', error);
            }
          }, 100);
        }

        // Publish to subscription
        if (pubsub) {
          pubsub.publish(`CHAT_MESSAGE_ADDED_${conversationId}`, {
            onChatMessageAdded: newMessage,
          });
        }

        return newMessage;
      } catch (error) {
        logger.error('Error in addChatMessage resolver', error);
        throw error;
      }
    },

    updateConversationTitle: async (_, { conversationId, title }, { user }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        // Check if conversation exists and belongs to user
        const conversation = chatConversations[conversationId];
        if (!conversation || conversation.userId !== user.id) {
          throw new Error('Conversation not found');
        }

        // Update title
        conversation.title = title;
        conversation.updatedAt = new Date().toISOString();

        return conversation;
      } catch (error) {
        logger.error('Error in updateConversationTitle resolver', error);
        throw error;
      }
    },

    deleteChatConversation: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        // Check if conversation exists and belongs to user
        const conversation = chatConversations[id];
        if (!conversation || conversation.userId !== user.id) {
          throw new Error('Conversation not found');
        }

        // Delete conversation
        delete chatConversations[id];

        return true;
      } catch (error) {
        logger.error('Error in deleteChatConversation resolver', error);
        throw error;
      }
    },
  },

  Subscription: {
    onChatMessageAdded: {
      subscribe: (_, { conversationId }, { pubsub }) => {
        return pubsub.asyncIterator(`CHAT_MESSAGE_ADDED_${conversationId}`);
      },
    },
  },
};

// Helper function to store a message
async function storeMessage(conversationId, role, content, userId, components = []) {
  // Check if conversation exists
  const conversation = chatConversations[conversationId];
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Create message
  const id = uuidv4();
  const now = new Date().toISOString();

  const message = {
    id,
    role,
    content,
    timestamp: now,
    components,
  };

  // Add to conversation
  conversation.messages.push(message);
  conversation.updatedAt = now;

  return message;
}

module.exports = aiAssistantResolvers;
