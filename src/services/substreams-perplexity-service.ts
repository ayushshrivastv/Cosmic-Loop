/**
 * Service for integrating Solana Substreams data with Perplexity's Sonar API
 * This service enhances the AI responses with real blockchain data and financial analysis
 */

import { substreamsService, NFTEvent, BridgeEvent, MarketplaceEvent } from './substreams-service';
import { perplexityService } from './perplexity-service';
import { webSearchService } from './web-search-service';
import { AIQueryType } from './ai-assistant-service';
import { BlockchainData } from '../api/perplexity/types';

/**
 * Response structure for the Substreams-Perplexity integration
 */
export interface SubstreamsPerplexityResponse {
  text: string;
  data?: BlockchainData;
  queryType: AIQueryType;
  relatedEvents?: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  searchResults?: string;
  conversationId?: string;
  tokenUsage?: number;
  processingTime?: number;
}

/**
 * Service for integrating Solana Substreams data with Perplexity's Sonar API
 */
export class SubstreamsPerplexityService {
  // Cache for blockchain data to improve response time
  private cache: Map<string, { data: BlockchainData; timestamp: number }> = new Map();
  private financialCache: Map<string, { analysis: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // Cache time-to-live: 60 seconds
  private readonly FINANCIAL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Process a blockchain query using Perplexity's Sonar API and Substreams data
   * @param query The user's query text
   * @param queryType The classified query type
   * @returns Enhanced AI response with blockchain data and financial analysis
   */
  async processBlockchainQuery(
    query: string,
    queryType: AIQueryType
  ): Promise<SubstreamsPerplexityResponse> {
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
      
      // If we have blockchain data, enhance the response with financial analysis
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
      console.error('Error in SubstreamsPerplexityService:', error);
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
    return await perplexityService.generateFinancialAnalysis(
      `You are responding to a ${queryType} query. Provide a brief initial response while I gather more detailed blockchain data. The query is: ${query}`
    );
  }
  
  /**
   * Get blockchain data for the query, using cache when available
   * @param query The user's query
   * @param queryType The type of query
   * @returns Blockchain data and related events
   */
  private async getBlockchainData(query: string, queryType: AIQueryType): Promise<{
    blockchainData: BlockchainData;
    relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  }> {
    let blockchainData: BlockchainData | null = null;
    let relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent> = [];
    
    // Create a cache key based on query type and normalized query
    const cacheKey = `${queryType}:${query.toLowerCase().trim()}`;
    
    // Check if we have cached data
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_TTL) {
      console.log('Using cached blockchain data');
      return {
        blockchainData: cachedData.data,
        relatedEvents: []
      };
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
    
    // Ensure blockchainData is never null
    const safeBlockchainData: BlockchainData = blockchainData || {
      type: 'empty',
      events: []
    };
    
    // Cache the result
    const result = { blockchainData: safeBlockchainData, relatedEvents };
    this.cache.set(cacheKey, {
      data: safeBlockchainData,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  /**
   * Enhance the initial response with blockchain data and financial analysis
   * @param query The user's query
   * @param initialResponse The initial response
   * @param blockchainData The blockchain data
   * @returns Enhanced response with financial analysis
   */
  private async enhanceResponseWithBlockchainData(
    query: string,
    initialResponse: string,
    blockchainData: BlockchainData
  ): Promise<string> {
    // Generate a more detailed response using the blockchain data and financial analysis
    return await perplexityService.generateBlockchainFinancialAnalysis(
      query,
      JSON.stringify(blockchainData, null, 2)
    );
  }

  // Process financial queries using the cached data when available

  /**
   * Process a financial analysis query using Perplexity's Sonar API
   * @param query The user's query text
   * @returns Enhanced AI response with financial analysis
   */
  async processFinancialQuery(query: string): Promise<SubstreamsPerplexityResponse> {
    try {
      // Normalize the query for caching
      const normalizedQuery = query.toLowerCase().trim();
      const cacheKey = `financial:${normalizedQuery}`;
      
      // Check cache first
      const cachedAnalysis = this.financialCache.get(cacheKey);
      if (cachedAnalysis && Date.now() - cachedAnalysis.timestamp < this.FINANCIAL_CACHE_TTL) {
        console.log('Using cached financial analysis');
        return {
          text: cachedAnalysis.analysis,
          queryType: 'market_analysis'
        };
      }
      
      // Generate financial analysis
      const analysis = await perplexityService.generateFinancialAnalysis(query);
      
      // Cache the analysis
      this.financialCache.set(cacheKey, {
        analysis,
        timestamp: Date.now()
      });
      
      return {
        text: analysis,
        queryType: 'market_analysis'
      };
    } catch (error) {
      console.error('Error in financial analysis processing:', error);
      return {
        text: 'I encountered an error while analyzing financial data. Please try again.',
        queryType: 'market_analysis'
      };
    }
  }

  /**
   * Process a general query using Perplexity's Sonar API
   * @param query The user's general query
   * @returns AI response for general questions with financial context
   */
  async processGeneralQuery(query: string): Promise<SubstreamsPerplexityResponse> {
    try {
      // For general queries, we use Perplexity without specific context
      const aiResponse = await perplexityService.generateFinancialAnalysis(query);
      
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
export const substreamsPerplexityService = new SubstreamsPerplexityService();
