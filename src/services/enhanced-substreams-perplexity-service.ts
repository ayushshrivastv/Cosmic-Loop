/**
 * Enhanced service for integrating Solana Substreams data with Perplexity's Sonar API
 * This service provides advanced features for optimizing API usage, caching, and context management
 */

import { substreamsService, NFTEvent, BridgeEvent, MarketplaceEvent } from './substreams-service';
import { enhancedPerplexityService } from './enhanced-perplexity-service';
import { webSearchService } from './web-search-service';
import { AIQueryType } from './ai-assistant-service';

/**
 * Response structure for the Enhanced Substreams-Perplexity integration
 */
export interface EnhancedSubstreamsPerplexityResponse {
  text: string;
  data?: Record<string, unknown> | Array<NFTEvent | BridgeEvent | MarketplaceEvent> | null;
  queryType: AIQueryType;
  relatedEvents?: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  searchResults?: string;
  conversationId?: string;
  tokenUsage?: number;
  processingTime?: number;
}

/**
 * Enhanced service for integrating Solana Substreams data with Perplexity's Sonar API
 */
export class EnhancedSubstreamsPerplexityService {
  // Cache for blockchain data to improve response time
  private dataCache: Map<string, { data: Record<string, unknown> | null; timestamp: number; events: Array<NFTEvent | BridgeEvent | MarketplaceEvent> }> = new Map();
  private searchCache: Map<string, { results: string; timestamp: number }> = new Map();
  private queryClassificationCache: Map<string, { type: AIQueryType; timestamp: number }> = new Map();
  
  private readonly DATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly CLASSIFICATION_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  
  // Conversation tracking
  private conversations: Map<string, { messages: Array<{ role: string; content: string }>; lastUpdated: number }> = new Map();
  private readonly CONVERSATION_TTL = 60 * 60 * 1000; // 1 hour

  /**
   * Process a blockchain query using Perplexity's Sonar API and Substreams data
   * @param query The user's query text
   * @param queryType The classified query type
   * @param conversationId Optional conversation ID for context management
   * @returns Enhanced AI response with blockchain data and financial analysis
   */
  async processBlockchainQuery(
    query: string,
    queryType: AIQueryType,
    conversationId?: string
  ): Promise<EnhancedSubstreamsPerplexityResponse> {
    const startTime = Date.now();
    
    try {
      // Generate a conversation ID if not provided
      const actualConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Start generating a response immediately with a placeholder
      // while we fetch the blockchain data in parallel
      const responsePromise = this.generateInitialResponse(query, queryType, actualConversationId);
      
      // Fetch blockchain data in parallel
      const blockchainDataPromise = this.getBlockchainData(query, queryType);
      
      // Fetch relevant web search results in parallel for context enhancement
      const webSearchPromise = this.getRelevantSearchResults(query, queryType);
      
      // Wait for all operations to complete
      const [initialResponse, { blockchainData, relatedEvents }, searchResults] = await Promise.all([
        responsePromise,
        blockchainDataPromise,
        webSearchPromise
      ]);
      
      // If we have blockchain data, enhance the response with financial analysis
      let finalResponse = initialResponse;
      let tokenUsage = 0;
      
      if (blockchainData || searchResults) {
        // Combine blockchain data and search results for context
        const enhancedContext = {
          blockchainData: blockchainData || {},
          searchResults: searchResults || "",
          queryType
        };
        
        finalResponse = await enhancedPerplexityService.generateBlockchainFinancialAnalysis(
          query, 
          actualConversationId,
          enhancedContext
        );
        
        // Get token usage
        const usageStats = enhancedPerplexityService.getTokenUsage();
        tokenUsage = usageStats['blockchain'] || 0;
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        text: finalResponse,
        data: blockchainData,
        queryType,
        relatedEvents: relatedEvents?.length > 0 ? relatedEvents : undefined,
        searchResults: searchResults || undefined,
        conversationId: actualConversationId,
        tokenUsage,
        processingTime
      };
    } catch (error) {
      console.error('Error in EnhancedSubstreamsPerplexityService:', error);
      return {
        text: 'I encountered an error while processing blockchain data. Please try again.',
        queryType,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Process a financial query using Perplexity's Sonar API
   * @param query The user's query text
   * @param conversationId Optional conversation ID for context management
   * @returns Enhanced AI response with financial analysis
   */
  async processFinancialQuery(
    query: string,
    conversationId?: string
  ): Promise<EnhancedSubstreamsPerplexityResponse> {
    const startTime = Date.now();
    
    try {
      // Generate a conversation ID if not provided
      const actualConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Check if we have this query in cache
      const cacheKey = `financial:${query.toLowerCase().trim()}`;
      const cachedResponse = this.searchCache.get(cacheKey);
      
      let searchResults = '';
      if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.SEARCH_CACHE_TTL) {
        searchResults = cachedResponse.results;
      } else {
        // Get relevant web search results for financial context
        searchResults = await this.performWebSearch(query, 'financial');
        
        // Cache the search results
        this.searchCache.set(cacheKey, {
          results: searchResults,
          timestamp: Date.now()
        });
      }
      
      // Generate the financial analysis with the search results as context
      const response = await enhancedPerplexityService.generateFinancialAnalysis(
        query,
        actualConversationId,
        { searchResults }
      );
      
      // Get token usage
      const usageStats = enhancedPerplexityService.getTokenUsage();
      const tokenUsage = usageStats['financial'] || 0;
      
      const processingTime = Date.now() - startTime;
      
      return {
        text: response,
        queryType: 'market_analysis',
        searchResults,
        conversationId: actualConversationId,
        tokenUsage,
        processingTime
      };
    } catch (error) {
      console.error('Error in financial analysis processing:', error);
      return {
        text: 'I encountered an error while analyzing financial data. Please try again.',
        queryType: 'market_analysis',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Process a general query using Perplexity's Sonar API
   * @param query The user's general query
   * @param conversationId Optional conversation ID for context management
   * @returns AI response for general questions with financial context
   */
  async processGeneralQuery(
    query: string,
    conversationId?: string
  ): Promise<EnhancedSubstreamsPerplexityResponse> {
    const startTime = Date.now();
    
    try {
      // Generate a conversation ID if not provided
      const actualConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // For general queries, we use Perplexity without specific blockchain context
      const response = await enhancedPerplexityService.generateFinancialAnalysis(
        query,
        actualConversationId
      );
      
      // Get token usage
      const usageStats = enhancedPerplexityService.getTokenUsage();
      const tokenUsage = usageStats['financial'] || 0;
      
      const processingTime = Date.now() - startTime;
      
      return {
        text: response,
        queryType: 'general',
        conversationId: actualConversationId,
        tokenUsage,
        processingTime
      };
    } catch (error) {
      console.error('Error in general query processing:', error);
      return {
        text: 'I encountered an error while processing your question. Please try again.',
        queryType: 'general',
        processingTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Detect the query type based on content analysis
   * @param query The user's query
   * @returns The detected query type
   */
  async detectQueryType(query: string): Promise<AIQueryType> {
    // Check cache first
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `classification:${normalizedQuery}`;
    const cachedClassification = this.queryClassificationCache.get(cacheKey);
    
    if (cachedClassification && (Date.now() - cachedClassification.timestamp) < this.CLASSIFICATION_CACHE_TTL) {
      return cachedClassification.type;
    }
    
    // Perform classification based on keywords and patterns
    let queryType: AIQueryType = 'general';
    
    // NFT related queries
    if (normalizedQuery.match(/nft|token|collectible|mint|metadata|compressed/i)) {
      queryType = 'nft_info';
    }
    // Wallet related queries
    else if (normalizedQuery.match(/wallet|balance|address|account|transaction|transfer/i)) {
      queryType = 'wallet_activity';
    }
    // Marketplace related queries
    else if (normalizedQuery.match(/marketplace|listing|sale|offer|auction|price|floor|volume/i)) {
      queryType = 'market_analysis';
    }
    // Bridge related queries
    else if (normalizedQuery.match(/bridge|cross.?chain|layerzero|wormhole|portal/i)) {
      queryType = 'bridge_status';
    }
    // Financial analysis related queries
    else if (normalizedQuery.match(/financ|invest|market|asset|portfolio|return|analysis|trend|forecast|predict/i)) {
      queryType = 'financial_analysis';
    }
    
    // Cache the classification result
    this.queryClassificationCache.set(cacheKey, {
      type: queryType,
      timestamp: Date.now()
    });
    
    return queryType;
  }
  
  /**
   * Generate an initial response while blockchain data is being fetched
   * @param query The user's query
   * @param queryType The type of query
   * @param conversationId Conversation ID for context management
   * @returns An initial response text
   */
  private async generateInitialResponse(
    query: string, 
    queryType: AIQueryType,
    conversationId: string
  ): Promise<string> {
    // Generate a quick initial response based on the query type
    return await enhancedPerplexityService.generateFinancialAnalysis(
      `You are responding to a ${queryType} query. Provide a brief initial response while I gather more detailed blockchain data. The query is: ${query}`,
      conversationId
    );
  }
  
  /**
   * Get blockchain data for the query, using cache when available
   * @param query The user's query
   * @param queryType The type of query
   * @returns Blockchain data and related events
   */
  private async getBlockchainData(
    query: string, 
    queryType: AIQueryType
  ): Promise<{
    blockchainData: Record<string, unknown> | null;
    relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  }> {
    let blockchainData: Record<string, unknown> | null = null;
    let relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent> = [];
    
    // Create a cache key based on query type and normalized query
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `${queryType}:${normalizedQuery}`;
    
    // Check if we have cached data
    const cachedData = this.dataCache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < this.DATA_CACHE_TTL) {
      console.log(`Using cached blockchain data for ${queryType} query`);
      return {
        blockchainData: cachedData.data,
        relatedEvents: cachedData.events
      };
    }
    
    // Fetch blockchain data based on query type
    try {
      switch (queryType) {
        case 'nft_info':
          relatedEvents = await this.fetchNFTData(query);
          blockchainData = {
            nftEvents: relatedEvents,
            type: 'nft_info'
          };
          break;
          
        case 'wallet_activity':
          relatedEvents = await this.fetchWalletData(query);
          blockchainData = {
            walletEvents: relatedEvents,
            type: 'wallet_activity'
          };
          break;
          
        case 'market_analysis':
          relatedEvents = await this.fetchMarketData(query);
          blockchainData = {
            marketplaceEvents: relatedEvents,
            type: 'market_analysis'
          };
          break;
          
        case 'bridge_status':
          relatedEvents = await this.fetchBridgeData(query);
          blockchainData = {
            bridgeEvents: relatedEvents,
            type: 'bridge_status'
          };
          break;
          
        case 'financial_analysis':
          // For market analysis, we combine multiple data sources
          const nftEvents = await this.fetchNFTData(query);
          const marketEvents = await this.fetchMarketData(query);
          const bridgeEvents = await this.fetchBridgeData(query);
          
          blockchainData = {
            nftEvents: nftEvents.slice(0, 5),
            marketplaceEvents: marketEvents.slice(0, 5),
            bridgeEvents: bridgeEvents.slice(0, 5),
            type: 'financial_analysis'
          };
          
          relatedEvents = [
            ...nftEvents.slice(0, 5),
            ...marketEvents.slice(0, 5),
            ...bridgeEvents.slice(0, 5)
          ];
          break;
          
        default:
          // For general queries, don't fetch specific blockchain data
          break;
      }
      
      // Cache the data if we have results
      if (blockchainData) {
        this.dataCache.set(cacheKey, {
          data: blockchainData,
          events: relatedEvents,
          timestamp: Date.now()
        });
      }
      
      return { blockchainData, relatedEvents };
    } catch (error) {
      console.error(`Error fetching blockchain data for ${queryType} query:`, error);
      return { blockchainData: null, relatedEvents: [] };
    }
  }
  
  /**
   * Get relevant web search results for the query
   * @param query The user's query
   * @param queryType The type of query
   * @returns Search results as a string
   */
  private async getRelevantSearchResults(
    query: string,
    queryType: AIQueryType
  ): Promise<string> {
    // Only perform web search for certain query types
    if (queryType !== 'market_analysis' && queryType !== 'general') {
      return '';
    }
    
    return await this.performWebSearch(query, queryType);
  }
  
  /**
   * Perform a web search for relevant information
   * @param query The user's query
   * @param context The search context
   * @returns Search results as a string
   */
  private async performWebSearch(
    query: string,
    context: string
  ): Promise<string> {
    try {
      // Check cache first
      const normalizedQuery = query.toLowerCase().trim();
      const cacheKey = `search:${context}:${normalizedQuery}`;
      const cachedSearch = this.searchCache.get(cacheKey);
      
      if (cachedSearch && (Date.now() - cachedSearch.timestamp) < this.SEARCH_CACHE_TTL) {
        return cachedSearch.results;
      }
      
      // Enhance the query with context-specific terms
      let enhancedQuery = query;
      if (context === 'market_analysis') {
        enhancedQuery = `${query} solana blockchain financial analysis`;
      } else if (context === 'nft') {
        enhancedQuery = `${query} solana nft`;
      } else if (context === 'bridge') {
        enhancedQuery = `${query} solana cross-chain bridge`;
      }
      
      // Perform the web search
      const searchResults = await webSearchService.search(enhancedQuery);
      
      // Format the results as a string
      let formattedResults = '';
      if (searchResults && searchResults.length > 0) {
        formattedResults = searchResults.map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.snippet}\nURL: ${result.link}\n`;
        }).join('\n');
      }
      
      // Cache the search results
      this.searchCache.set(cacheKey, {
        results: formattedResults,
        timestamp: Date.now()
      });
      
      return formattedResults;
    } catch (error) {
      console.error('Error performing web search:', error);
      return '';
    }
  }

  /**
   * Fetch NFT data relevant to the query
   * @param query The user's NFT-related query
   * @returns Array of NFT events
   */
  private async fetchNFTData(query: string): Promise<NFTEvent[]> {
    // Extract potential token addresses from the query
    const tokenAddresses = this.extractAddresses(query);
    
    if (tokenAddresses.length > 0) {
      // If we found token addresses, get events for those specific tokens
      return await substreamsService.getNFTEventsByToken(tokenAddresses[0]);
    } else {
      // Otherwise, get recent NFT events
      return await substreamsService.getNFTEvents(10);
    }
  }

  /**
   * Fetch wallet activity data relevant to the query
   * @param query The user's wallet-related query
   * @returns Array of NFT events related to the wallet
   */
  private async fetchWalletData(query: string): Promise<NFTEvent[]> {
    // Extract potential wallet addresses from the query
    const walletAddresses = this.extractAddresses(query);
    
    if (walletAddresses.length > 0) {
      // If we found wallet addresses, get events for those specific wallets
      return await substreamsService.getNFTEventsByWallet(walletAddresses[0]);
    } else {
      // Otherwise, get recent NFT events as a fallback
      return await substreamsService.getNFTEvents(10);
    }
  }

  /**
   * Fetch marketplace data relevant to the query
   * @param query The user's marketplace-related query
   * @returns Array of marketplace events
   */
  private async fetchMarketData(query: string): Promise<MarketplaceEvent[]> {
    // For now, we just get recent marketplace events
    // This could be enhanced to filter by specific marketplaces, price ranges, etc.
    return await substreamsService.getMarketplaceEvents(10);
  }

  /**
   * Fetch bridge data relevant to the query
   * @param query The user's bridge-related query
   * @returns Array of bridge events
   */
  private async fetchBridgeData(query: string): Promise<BridgeEvent[]> {
    // For now, we just get recent bridge events
    // This could be enhanced to filter by specific chains, status, etc.
    return await substreamsService.getBridgeEvents(10);
  }

  /**
   * Extract potential Solana addresses from a query
   * @param query The user's query text
   * @returns Array of potential Solana addresses
   */
  private extractAddresses(query: string): string[] {
    // Simple regex to match potential Solana addresses (base58 encoded strings)
    const addressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    return query.match(addressRegex) || [];
  }
  
  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.dataCache.clear();
    this.searchCache.clear();
    this.queryClassificationCache.clear();
    console.log('All caches cleared');
  }
  
  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getCacheStats(): Record<string, number> {
    return {
      dataCache: this.dataCache.size,
      searchCache: this.searchCache.size,
      queryClassificationCache: this.queryClassificationCache.size,
      conversations: this.conversations.size
    };
  }
}

// Export a singleton instance
export const enhancedSubstreamsPerplexityService = new EnhancedSubstreamsPerplexityService();
