/**
 * Service for integrating Solana Substreams data with Gemini AI
 * This service enhances the AI responses with real blockchain data
 */

import { substreamsService, NFTEvent, BridgeEvent, MarketplaceEvent } from './substreams-service';
import { geminiService } from './gemini-service';
import { webSearchService } from './web-search-service';
import { AIQueryType } from './ai-assistant-service';

/**
 * Response structure for the Substreams-Gemini integration
 */
export interface SubstreamsGeminiResponse {
  text: string;
  data?: any;
  queryType: AIQueryType;
  relatedEvents?: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  searchResults?: string;
}

/**
 * Service for integrating Solana Substreams data with Gemini AI
 */
export class SubstreamsGeminiService {
  // Cache for blockchain data to improve response time
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // Cache time-to-live: 60 seconds

  /**
   * Process a blockchain query using Gemini AI and Substreams data
   * @param query The user's query text
   * @param queryType The classified query type
   * @returns Enhanced AI response with blockchain data
   */
  async processBlockchainQuery(
    query: string,
    queryType: AIQueryType
  ): Promise<SubstreamsGeminiResponse> {
    try {
      // Start generating a response immediately with a placeholder
      // while we fetch the blockchain data in parallel
      const responsePromise = this.generateInitialResponse(query, queryType);
      
      // Fetch blockchain data in parallel
      const blockchainDataPromise = this.getBlockchainData(query, queryType);
      
      // Wait for both operations to complete
      const [initialResponse, { blockchainData, relatedEvents }] = await Promise.all([
        responsePromise,
        blockchainDataPromise
      ]);
      
      // If we have blockchain data, enhance the response
      let finalResponse = initialResponse;
      if (blockchainData) {
        finalResponse = await this.enhanceResponseWithBlockchainData(
          query, 
          initialResponse, 
          blockchainData
        );
      }
      
      return {
        text: finalResponse,
        data: blockchainData,
        queryType,
        relatedEvents: relatedEvents?.length > 0 ? relatedEvents : undefined
      };
    } catch (error) {
      console.error('Error in SubstreamsGeminiService:', error);
      return {
        text: 'I encountered an error while processing blockchain data. Please try again.',
        queryType
      };
    }
  }
  
  /**
   * Generate an initial response while blockchain data is being fetched
   * @param query The user's query
   * @param queryType The type of query
   * @returns An initial response text
   */
  private async generateInitialResponse(query: string, queryType: AIQueryType): Promise<string> {
    // Generate a quick initial response based on the query type
    return await geminiService.generateResponse(
      query, 
      `You are responding to a ${queryType} query. Provide a brief initial response while I gather more detailed blockchain data.`
    );
  }
  
  /**
   * Get blockchain data for the query, using cache when available
   * @param query The user's query
   * @param queryType The type of query
   * @returns Blockchain data and related events
   */
  private async getBlockchainData(query: string, queryType: AIQueryType): Promise<{
    blockchainData: any;
    relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  }> {
    let blockchainData: any = null;
    let relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent> = [];
    
    // Create a cache key based on query type and normalized query
    const cacheKey = `${queryType}:${query.toLowerCase().trim()}`;
    
    // Check if we have cached data
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_TTL) {
      console.log('Using cached blockchain data');
      return cachedData.data;
    }
    
    // Fetch relevant blockchain data based on query type
    switch (queryType) {
      case 'nft_info':
        relatedEvents = await this.fetchNFTData(query);
        blockchainData = { nftEvents: relatedEvents };
        break;
      
      case 'wallet_activity':
        relatedEvents = await this.fetchWalletData(query);
        blockchainData = { walletEvents: relatedEvents };
        break;
      
      case 'market_analysis':
        relatedEvents = await this.fetchMarketData(query);
        blockchainData = { marketEvents: relatedEvents };
        break;
      
      case 'bridge_status':
        relatedEvents = await this.fetchBridgeData(query);
        blockchainData = { bridgeEvents: relatedEvents };
        break;
      
      default:
        // For other query types, we don't fetch specific blockchain data
        break;
    }
    
    // Cache the result
    const result = { blockchainData, relatedEvents };
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  /**
   * Enhance the initial response with blockchain data
   * @param query The user's query
   * @param initialResponse The initial response
   * @param blockchainData The blockchain data
   * @returns Enhanced response
   */
  private async enhanceResponseWithBlockchainData(
    query: string,
    initialResponse: string,
    blockchainData: any
  ): Promise<string> {
    // Generate a more detailed response using the blockchain data
    return await this.generateEnhancedResponse(query, 'general', blockchainData);
  }

  // Cache for web search results to improve response time
  private webSearchCache: Map<string, { results: string; timestamp: number }> = new Map();
  private readonly WEB_SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache for repository info responses
  private repoInfoCache: Map<string, { response: string; timestamp: number }> = new Map();
  private readonly REPO_INFO_CACHE_TTL = 30 * 60 * 1000; // 30 minutes (repo info rarely changes)

  /**
   * Process a web search query using Gemini AI
   * @param query The user's query text
   * @returns Enhanced AI response with web search results
   */
  async processWebSearchQuery(query: string): Promise<SubstreamsGeminiResponse> {
    try {
      // Start generating a quick initial response
      const initialResponsePromise = geminiService.generateResponse(
        query, 
        'You are responding to a web search query. Provide a brief initial response while I search for more information.'
      );

      // Normalize the query for caching
      const normalizedQuery = query.toLowerCase().trim();
      const cacheKey = `web_search:${normalizedQuery}`;
      
      // Check cache first
      let searchResults: string;
      const cachedSearch = this.webSearchCache.get(cacheKey);
      
      if (cachedSearch && Date.now() - cachedSearch.timestamp < this.WEB_SEARCH_CACHE_TTL) {
        console.log('Using cached web search results');
        searchResults = cachedSearch.results;
      } else {
        // Perform web search if not in cache
        searchResults = await webSearchService.searchAndFormat(query);
        
        // Cache the results
        this.webSearchCache.set(cacheKey, {
          results: searchResults,
          timestamp: Date.now()
        });
      }
      
      // Get initial response
      const initialResponse = await initialResponsePromise;
      
      // Generate final response with search results
      const finalResponse = await geminiService.generateResponse(query, searchResults);
      
      return {
        text: finalResponse,
        queryType: 'web_search',
        searchResults
      };
    } catch (error) {
      console.error('Error in web search processing:', error);
      return {
        text: 'I encountered an error while searching the web. Please try again.',
        queryType: 'web_search'
      };
    }
  }

  /**
   * Process a repository info query using Gemini AI
   * @param query The user's query about the repository
   * @returns AI response with repository information
   */
  async processRepositoryInfoQuery(query: string): Promise<SubstreamsGeminiResponse> {
    try {
      // Normalize the query for caching
      const normalizedQuery = query.toLowerCase().trim();
      const cacheKey = `repo_info:${normalizedQuery}`;
      
      // Check cache first
      const cachedResponse = this.repoInfoCache.get(cacheKey);
      if (cachedResponse && Date.now() - cachedResponse.timestamp < this.REPO_INFO_CACHE_TTL) {
        console.log('Using cached repository info response');
        return {
          text: cachedResponse.response,
          queryType: 'repo_info'
        };
      }
      
      // For repository queries, we use the repository context from the system prompt
      const aiResponse = await geminiService.generateResponse(query);
      
      // Cache the response
      this.repoInfoCache.set(cacheKey, {
        response: aiResponse,
        timestamp: Date.now()
      });
      
      return {
        text: aiResponse,
        queryType: 'repo_info'
      };
    } catch (error) {
      console.error('Error in repository info processing:', error);
      return {
        text: 'I encountered an error while retrieving repository information. Please try again.',
        queryType: 'repo_info'
      };
    }
  }

  /**
   * Process a general query using Gemini AI
   * @param query The user's general query
   * @returns AI response for general questions
   */
  async processGeneralQuery(query: string): Promise<SubstreamsGeminiResponse> {
    try {
      // For general queries, we use Gemini without specific context
      const aiResponse = await geminiService.generateResponse(query);
      
      return {
        text: aiResponse,
        queryType: 'general'
      };
    } catch (error) {
      console.error('Error in general query processing:', error);
      return {
        text: 'I encountered an error while processing your question. Please try again.',
        queryType: 'general'
      };
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
   * Generate an enhanced response using Gemini AI
   * @param query The user's query
   * @param queryType The classified query type
   * @param blockchainData Optional blockchain data to include in the prompt
   * @returns AI-generated response text
   */
  private async generateEnhancedResponse(
    query: string,
    queryType: AIQueryType,
    blockchainData?: any
  ): Promise<string> {
    if (blockchainData) {
      // If we have blockchain data, use the blockchain-specific Gemini method
      return await geminiService.generateBlockchainResponse(
        query,
        JSON.stringify(blockchainData, null, 2)
      );
    } else {
      // Otherwise, use the general Gemini method
      return await geminiService.generateResponse(query);
    }
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
}

// Export a singleton instance
export const substreamsGeminiService = new SubstreamsGeminiService();
