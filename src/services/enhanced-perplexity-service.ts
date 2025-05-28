/**
 * Enhanced service for interacting with Perplexity's Sonar API via the Gateway
 */
import { 
  PERPLEXITY_API_KEY, 
  PERPLEXITY_MODEL, 
  PERPLEXITY_MAX_TOKENS, 
  PERPLEXITY_TEMPERATURE,
  FINANCIAL_ANALYSIS_PROMPT,
  BLOCKCHAIN_FINANCIAL_PROMPT
} from '../config/perplexity.config';
import { gatewayClientService } from './gateway-client.service';

/**
 * Interface for conversation context
 */
interface ConversationContext {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  lastUpdated: number;
}

/**
 * Interface for cached response
 */
interface CachedResponse {
  response: string;
  timestamp: number;
  tokens: number;
}

/**
 * Enhanced service for interacting with Perplexity's Sonar API via the Gateway
 */
export class EnhancedPerplexityService {
  private readonly contextCache: Map<string, ConversationContext> = new Map();
  private readonly responseCache: Map<string, CachedResponse> = new Map();
  private readonly CONTEXT_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private tokenUsage: Record<string, number> = {};

  constructor() {
    // Initialize with empty token usage tracking
    this.tokenUsage = {
      financial: 0,
      blockchain: 0,
      general: 0
    };
  }

  /**
   * Generate a financial analysis using Perplexity's Sonar API via the Gateway
   * @param query The user's query
   * @param conversationId Optional conversation ID for context management
   * @param blockchainData Optional blockchain data to provide to the model
   * @returns The generated response text
   */
  async generateFinancialAnalysis(
    query: string, 
    conversationId?: string, 
    blockchainData?: Record<string, unknown>
  ): Promise<string> {
    try {
      // If API key is not set, return a fallback message
      if (!PERPLEXITY_API_KEY) {
        console.warn('Perplexity API key not set. Using fallback response.');
        return 'I need an API key to provide intelligent financial analysis. Please set the PERPLEXITY_API_KEY environment variable.';
      }

      // Check cache for this query
      if (!conversationId) {
        const cacheKey = this.generateCacheKey(query, 'financial', blockchainData);
        const cachedResponse = this.responseCache.get(cacheKey);
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_TTL) {
          console.log('Using cached financial analysis response');
          return cachedResponse.response;
        }
      }

      // Get or create conversation context
      const context = this.getConversationContext(conversationId);
      
      // If this is a new conversation or the first message, add the system prompt
      if (context.messages.length === 0) {
        context.messages.push({
          role: 'system',
          content: FINANCIAL_ANALYSIS_PROMPT
        });
      }
      
      // Add the user's query to the conversation
      const userContent = blockchainData 
        ? `${query}\n\nHere is some blockchain data that might be relevant:\n${JSON.stringify(blockchainData, null, 2)}`
        : query;
        
      context.messages.push({
        role: 'user',
        content: userContent
      });

      // Use the gateway client to send the request
      const response = await gatewayClientService.sendChatCompletion(
        context.messages,
        {
          model: PERPLEXITY_MODEL,
          max_tokens: PERPLEXITY_MAX_TOKENS,
          temperature: PERPLEXITY_TEMPERATURE
        }
      );
      
      // Add the assistant's response to the conversation
      context.messages.push({
        role: 'assistant',
        content: response
      });
      
      // Update the context in the cache
      this.updateConversationContext(context, conversationId);
      
      // Cache the response if not in a conversation
      if (!conversationId) {
        const cacheKey = this.generateCacheKey(query, 'financial', blockchainData);
        this.responseCache.set(cacheKey, {
          response,
          timestamp: Date.now(),
          tokens: 0 // Token count not available from gateway client
        });
      }
      
      // Update token usage estimate (approximate since we don't have actual token count)
      this.tokenUsage.financial += userContent.length / 4; // Rough estimate
      
      return response;
    } catch (error) {
      console.error('Error generating financial analysis from Perplexity:', error);
      return 'I encountered an error while analyzing financial data. Please try again later.';
    }
  }

  /**
   * Generate a blockchain financial analysis using Perplexity's Sonar API via the Gateway
   * @param query The user's query
   * @param conversationId Optional conversation ID for context management
   * @param blockchainData JSON string or object of blockchain data
   * @returns The generated response text
   */
  async generateBlockchainFinancialAnalysis(
    query: string, 
    conversationId?: string,
    blockchainData?: Record<string, unknown>
  ): Promise<string> {
    try {
      // If API key is not set, return a fallback message
      if (!PERPLEXITY_API_KEY) {
        console.warn('Perplexity API key not set. Using fallback response.');
        return 'I need an API key to provide intelligent blockchain financial analysis. Please set the PERPLEXITY_API_KEY environment variable.';
      }

      // Check cache for this query if we have blockchain data
      if (!conversationId && blockchainData) {
        const cacheKey = this.generateCacheKey(query, 'blockchain_financial', blockchainData);
        const cachedResponse = this.responseCache.get(cacheKey);
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_TTL) {
          console.log('Using cached blockchain financial analysis response');
          return cachedResponse.response;
        }
      }

      // Get or create conversation context
      const context = this.getConversationContext(conversationId);
      
      // If this is a new conversation or the first message, add the system prompt
      if (context.messages.length === 0) {
        context.messages.push({
          role: 'system',
          content: BLOCKCHAIN_FINANCIAL_PROMPT
        });
      }
      
      // Add the user's query with blockchain data to the conversation
      let userContent = query;
      
      // If blockchain data is provided, include it in the message
      if (blockchainData) {
        userContent += `\n\nHere is the blockchain data for analysis:\n${JSON.stringify(blockchainData, null, 2)}`;
      }
      
      context.messages.push({
        role: 'user',
        content: userContent
      });

      // Use the gateway client to send the request
      const response = await gatewayClientService.sendChatCompletion(
        context.messages,
        {
          model: PERPLEXITY_MODEL,
          max_tokens: PERPLEXITY_MAX_TOKENS,
          temperature: PERPLEXITY_TEMPERATURE
        }
      );
      
      // Add the assistant's response to the conversation
      context.messages.push({
        role: 'assistant',
        content: response
      });
      
      // Update the context in the cache
      this.updateConversationContext(context, conversationId);
      
      // Cache the response if not in a conversation and has blockchain data
      if (!conversationId && blockchainData) {
        const cacheKey = this.generateCacheKey(query, 'blockchain_financial', blockchainData);
        this.responseCache.set(cacheKey, {
          response,
          timestamp: Date.now(),
          tokens: 0 // Token count not available from gateway client
        });
      }
      
      // Update token usage estimate
      this.tokenUsage.blockchain += userContent.length / 4; // Rough estimate
      
      return response;
    } catch (error) {
      console.error('Error generating blockchain financial analysis from Perplexity:', error);
      return 'I encountered an error while analyzing blockchain financial data. Please try again later.';
    }
  }

  /**
   * Get conversation context from cache or create a new one
   * @param conversationId Optional conversation ID
   * @returns Conversation context
   */
  private getConversationContext(conversationId?: string): ConversationContext {
    if (!conversationId) {
      return { messages: [], lastUpdated: Date.now() };
    }

    const context = this.contextCache.get(conversationId);
    if (context) {
      // Check if context is still valid
      if (Date.now() - context.lastUpdated < this.CONTEXT_TTL) {
        return context;
      }
      // Context expired, remove it
      this.contextCache.delete(conversationId);
    }

    // Create new context
    return { messages: [], lastUpdated: Date.now() };
  }

  /**
   * Update conversation context in cache
   * @param context Conversation context
   * @param conversationId Optional conversation ID
   */
  private updateConversationContext(context: ConversationContext, conversationId?: string): void {
    if (conversationId) {
      context.lastUpdated = Date.now();
      this.contextCache.set(conversationId, context);
    }
  }

  /**
   * Generate a cache key for a query
   * @param query The query string
   * @param type The type of query
   * @param data Optional data to include in the key
   * @returns The cache key
   */
  private generateCacheKey(query: string, type: string, data?: Record<string, unknown>): string {
    const normalizedQuery = query.toLowerCase().trim();
    if (data) {
      const dataHash = JSON.stringify(data).slice(0, 100);
      return `${type}:${normalizedQuery}:${dataHash}`;
    }
    return `${type}:${normalizedQuery}`;
  }
  
  /**
   * Get token usage statistics
   * @returns Token usage by category
   */
  getTokenUsage(): Record<string, number> {
    return { ...this.tokenUsage };
  }
  
  /**
   * Reset token usage statistics
   */
  resetTokenUsage(): void {
    this.tokenUsage = {
      financial: 0,
      blockchain: 0,
      general: 0
    };
  }
  
  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.contextCache.clear();
    this.responseCache.clear();
    this.resetTokenUsage();
    console.log('All caches cleared');
  }

  /**
   * Make a streaming request to the Perplexity API
   * @param messages Array of messages to send
   * @param onUpdate Callback for streaming updates
   * @returns The final response text
   */
  async makeStreamingRequest(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    onUpdate: (partialResponse: string) => void
  ): Promise<string> {
    try {
      // If API key is not set, return a fallback message
      if (!PERPLEXITY_API_KEY) {
        console.warn('Perplexity API key not set. Using fallback response.');
        return 'I need an API key to provide intelligent responses. Please set the PERPLEXITY_API_KEY environment variable.';
      }

      // Use the gateway client to send the streaming request
      const response = await gatewayClientService.sendStreamingChatCompletion(
        messages,
        {
          model: PERPLEXITY_MODEL,
          max_tokens: PERPLEXITY_MAX_TOKENS,
          temperature: PERPLEXITY_TEMPERATURE,
          stream: true
        },
        onUpdate
      );
      
      // Update token usage estimate
      this.tokenUsage.general += JSON.stringify(messages).length / 4; // Rough estimate
      
      return response;
    } catch (error) {
      console.error('Error making streaming request to Perplexity:', error);
      return 'I encountered an error while processing your request. Please try again later.';
    }
  }

  /**
   * Clear a conversation from the context cache
   * @param conversationId The conversation ID to clear
   */
  clearConversation(conversationId: string): void {
    if (this.contextCache.has(conversationId)) {
      this.contextCache.delete(conversationId);
      console.log(`Conversation ${conversationId} cleared from context cache`);
    }
  }

  // Rate limiting and message pruning are now handled by the gateway
}

// Export a singleton instance
export const enhancedPerplexityService = new EnhancedPerplexityService();
