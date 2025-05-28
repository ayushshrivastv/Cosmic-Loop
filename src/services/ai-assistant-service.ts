import { NFTEvent, BridgeEvent, MarketplaceEvent } from './substreams-service';
import { substreamsGeminiService } from './substreams-gemini-service';
import { substreamsPerplexityService } from './substreams-perplexity-service';

// Define the types of queries the AI assistant can handle
export type AIQueryType = 
  | 'nft_info' 
  | 'wallet_activity' 
  | 'market_analysis' 
  | 'bridge_status' 
  | 'web_search'
  | 'repo_info'
  | 'financial_analysis'
  | 'general';

// Define the AI assistant response structure
export interface AIAssistantResponse {
  text: string;
  data?: Record<string, unknown>;
  queryType?: AIQueryType;
  relatedEvents?: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
}

/**
 * Service for AI assistant functionality that leverages Substreams data with Gemini AI
 */
export class AIAssistantService {
  // Cache for query classification to avoid redundant processing
  private queryClassCache: Map<string, { type: AIQueryType; timestamp: number }> = new Map();
  private readonly QUERY_CACHE_TTL = 60 * 1000; // 60 seconds

  /**
   * Process a user query and generate a response using Substreams data and Gemini AI
   * @param query The user's query text
   * @returns AI assistant response
   */
  /**
   * Process a user query and generate a response with streaming capability
   * @param query The user's query text
   * @param onUpdate Optional callback for streaming updates
   * @returns AI assistant response
   */
  async processQuery(query: string, onUpdate?: (partialResponse: AIAssistantResponse) => void): Promise<AIAssistantResponse> {
    try {
      // Start a timer to measure response time
      const startTime = Date.now();
      
      // Determine the type of query (using cache if available)
      const queryType = await this.getCachedQueryType(query);
      
      // Create a placeholder response that will be shown immediately
      const placeholderResponse: AIAssistantResponse = {
        text: this.getTypingIndicator(),
        queryType
      };
      
      // If streaming is enabled, send the initial placeholder response
      if (onUpdate) {
        onUpdate(placeholderResponse);
      }
      
      // Process the query based on its type using the integrated SubstreamsGeminiService
      let response;
      
      // Use Promise.race to implement a timeout for slow responses
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          // If it's taking too long, send a partial response
          if (onUpdate) {
            onUpdate({
              text: "I'm still working on a comprehensive answer...",
              queryType
            });
          }
        }, 2000); // Send update after 2 seconds if still processing
      });
      
      switch (queryType) {
        case 'nft_info':
        case 'wallet_activity':
        case 'market_analysis':
        case 'bridge_status':
          // For blockchain data queries, use the blockchain processing
          // Determine if we should use Perplexity or Gemini based on query content
          if (this.shouldUsePerplexity(query)) {
            response = await substreamsPerplexityService.processBlockchainQuery(query, queryType);
          } else {
            response = await substreamsGeminiService.processBlockchainQuery(query, queryType);
          }
          break;
        
        case 'financial_analysis':
          // For financial analysis queries, use Perplexity's Sonar API
          response = await substreamsPerplexityService.processFinancialQuery(query);
          break;
        
        case 'web_search':
          // For web search queries
          response = await substreamsGeminiService.processWebSearchQuery(query);
          break;
        
        case 'repo_info':
          // For repository info queries
          response = await substreamsGeminiService.processRepositoryInfoQuery(query);
          break;
        
        case 'general':
        default:
          // For general queries, determine if we should use Perplexity or Gemini
          if (this.shouldUsePerplexity(query)) {
            response = await substreamsPerplexityService.processGeneralQuery(query);
          } else {
            response = await substreamsGeminiService.processGeneralQuery(query);
          }
          break;
      }
      
      // Log the response time for monitoring
      const responseTime = Date.now() - startTime;
      console.log(`Query processed in ${responseTime}ms`);
      
      // Convert the SubstreamsGeminiResponse to AIAssistantResponse
      const finalResponse: AIAssistantResponse = {
        text: response.text,
        data: response.data,
        queryType: response.queryType,
        relatedEvents: response.relatedEvents
      };
      
      // Send the final response if streaming is enabled
      if (onUpdate) {
        onUpdate(finalResponse);
      }
      
      return finalResponse;
    } catch (error) {
      console.error('Error processing AI assistant query:', error);
      const errorResponse = {
        text: 'I encountered an error while processing your request. Please try again.'
      };
      
      // Send error response if streaming is enabled
      if (onUpdate) {
        onUpdate(errorResponse);
      }
      
      return errorResponse;
    }
  }

  /**
   * Get a cached query type or classify the query if not in cache
   * @param query The user's query text
   * @returns The query type
   */
  private async getCachedQueryType(query: string): Promise<AIQueryType> {
    // Normalize the query for consistent matching and caching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check if we have this query type cached
    const cachedType = this.queryClassCache.get(normalizedQuery);
    if (cachedType && Date.now() - cachedType.timestamp < this.QUERY_CACHE_TTL) {
      console.log('Using cached query classification');
      return cachedType.type;
    }
    
    // If not cached, classify the query
    const queryType = this.classifyQuery(normalizedQuery);
    
    // Cache the result
    this.queryClassCache.set(normalizedQuery, {
      type: queryType,
      timestamp: Date.now()
    });
    
    return queryType;
  }

  /**
   * Get a typing indicator message based on query type
   * @returns A typing indicator message
   */
  private getTypingIndicator(): string {
    return 'Thinking...';
  }

  /**
   * Classify the query to determine the appropriate processing method
   * @param query The user's query text
   * @returns The query type
   */
  private classifyQuery(query: string): AIQueryType {
    // Normalize the query for consistent matching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check for financial analysis queries
    if (
      normalizedQuery.includes('financial') ||
      normalizedQuery.includes('finance') ||
      normalizedQuery.includes('investment') ||
      normalizedQuery.includes('invest') ||
      normalizedQuery.includes('stock') ||
      normalizedQuery.includes('portfolio') ||
      normalizedQuery.includes('asset') ||
      normalizedQuery.includes('fund') ||
      normalizedQuery.includes('return') ||
      normalizedQuery.includes('roi') ||
      normalizedQuery.includes('analysis')
    ) {
      return 'financial_analysis';
    }
    
    // Check for NFT-related queries
    if (
      normalizedQuery.includes('nft') ||
      normalizedQuery.includes('token') ||
      normalizedQuery.includes('collectible') ||
      normalizedQuery.match(/mint(ed|ing)?/) ||
      normalizedQuery.includes('collection')
    ) {
      return 'nft_info';
    }
    
    // Check for wallet-related queries
    if (
      normalizedQuery.includes('wallet') ||
      normalizedQuery.includes('address') ||
      normalizedQuery.includes('account') ||
      normalizedQuery.includes('balance') ||
      normalizedQuery.includes('transaction') ||
      normalizedQuery.match(/send|receive|transfer/)
    ) {
      return 'wallet_activity';
    }
    
    // Check for marketplace-related queries
    if (
      normalizedQuery.includes('market') ||
      normalizedQuery.includes('price') ||
      normalizedQuery.includes('trading') ||
      normalizedQuery.includes('volume') ||
      normalizedQuery.includes('listing') ||
      normalizedQuery.includes('sale') ||
      normalizedQuery.includes('buy') ||
      normalizedQuery.includes('sell')
    ) {
      return 'market_analysis';
    }
    
    // Check for bridge-related queries
    if (normalizedQuery.includes('bridge') || 
        normalizedQuery.includes('cross-chain') || 
        normalizedQuery.includes('transfer') || 
        normalizedQuery.includes('wormhole')) {
      return 'bridge_status';
    }
    
    // Default to general query type
    return 'general';
  }
  
  /**
   * Determine if a query should use Perplexity's Sonar API based on content
   * @param query The user's query text
   * @returns Boolean indicating if Perplexity should be used
   */
  private shouldUsePerplexity(query: string): boolean {
    // Normalize the query for consistent matching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check for financial or market analysis keywords that would benefit from Perplexity
    const financialKeywords = [
      'financial', 'finance', 'investment', 'invest', 'stock', 'portfolio',
      'asset', 'fund', 'return', 'roi', 'analysis', 'trend', 'forecast',
      'predict', 'market', 'price', 'trading', 'volume', 'chart', 'graph',
      'compare', 'correlation', 'performance', 'metric', 'indicator'
    ];
    
    // Check if any financial keywords are present in the query
    return financialKeywords.some(keyword => normalizedQuery.includes(keyword));
  }

  /**
   * Extract potential token addresses from a query
   * @param query The user's query text
   * @returns Array of potential token addresses
   */
  private extractTokenAddresses(query: string): string[] {
    // Simple regex to match potential Solana addresses
    const addressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    return query.match(addressRegex) || [];
  }
}

// Export a singleton instance
export const aiAssistantService = new AIAssistantService();
