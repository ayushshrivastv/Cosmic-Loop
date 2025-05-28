/**
 * Perplexity API Substreams Integration
 * Integrates Solana Substreams data with Perplexity's Sonar API
 */

import { perplexityService, PerplexityServiceResponse } from './service';
import { substreamsService, NFTEvent, BridgeEvent, MarketplaceEvent } from '@/services/substreams-service';
import { AIQueryType } from '@/services/ai-assistant-service';
import { webSearchService } from '@/services/web-search-service';

/**
 * Response structure for the Substreams-Perplexity integration
 */
export interface SubstreamsPerplexityResponse {
  text: string;
  data?: Record<string, unknown>;
  queryType: AIQueryType;
  relatedEvents?: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  searchResults?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Service for integrating Solana Substreams data with Perplexity's Sonar API
 */
export class SubstreamsPerplexityIntegration {
  // Cache for blockchain data to improve response time
  private cache: Map<string, { data: Record<string, unknown>; timestamp: number }> = new Map();
  private financialCache: Map<string, { analysis: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // Cache time-to-live: 60 seconds

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
      let finalResponse: PerplexityServiceResponse = {
        text: initialResponse
      };
      
      if (blockchainData) {
        finalResponse = await perplexityService.generateBlockchainAnalysis(
          query, 
          blockchainData
        );
      }
      
      return {
        text: finalResponse.text,
        data: blockchainData,
        queryType,
        relatedEvents: relatedEvents?.length > 0 ? relatedEvents : undefined,
        usage: finalResponse.usage
      };
    } catch (error) {
      console.error('Error in SubstreamsPerplexityIntegration:', error);
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
    const response = await perplexityService.generateFinancialAnalysis(
      `You are responding to a ${queryType} query. Provide a brief initial response while I gather more detailed blockchain data. The query is: ${query}`
    );
    return response.text;
  }
  
  /**
   * Get blockchain data for the query, using cache when available
   * @param query The user's query
   * @param queryType The type of query
   * @returns Blockchain data and related events
   */
  private async getBlockchainData(query: string, queryType: AIQueryType): Promise<{
    blockchainData: Record<string, unknown>;
    relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
  }> {
    let blockchainData: Record<string, unknown> = {};
    let relatedEvents: Array<NFTEvent | BridgeEvent | MarketplaceEvent> = [];
    
    // Create a cache key based on query type and normalized query
    const cacheKey = `${queryType}:${query.toLowerCase().trim()}`;
    
    // Check if we have cached data
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_TTL) {
      return {
        blockchainData: cachedData.data,
        relatedEvents: Array.isArray(cachedData.data.events) ? cachedData.data.events : []
      };
    }
    
    // Fetch relevant blockchain data based on query type
    try {
      switch (queryType) {
        case 'nft_info':
          const nftEvents = await this.fetchNFTData(query);
          blockchainData = {
            type: 'nft_data',
            events: nftEvents,
            count: nftEvents.length,
            query: query
          };
          relatedEvents = nftEvents;
          break;
          
        case 'wallet_activity':
          const walletEvents = await this.fetchWalletData(query);
          blockchainData = {
            type: 'wallet_data',
            events: walletEvents,
            count: walletEvents.length,
            addresses: this.extractAddresses(query),
            query: query
          };
          relatedEvents = walletEvents;
          break;
          
        case 'market_analysis':
          const marketEvents = await this.fetchMarketData(query);
          blockchainData = {
            type: 'marketplace_data',
            events: marketEvents,
            count: marketEvents.length,
            query: query
          };
          relatedEvents = marketEvents;
          break;
          
        case 'bridge_status':
          const bridgeEvents = await this.fetchBridgeData(query);
          blockchainData = {
            type: 'bridge_data',
            events: bridgeEvents,
            count: bridgeEvents.length,
            query: query
          };
          relatedEvents = bridgeEvents;
          break;
          
        case 'market_analysis':
          // For market analysis, we might want to include a mix of data
          const searchResults = await webSearchService.search(query);
          blockchainData = {
            type: 'market_analysis',
            searchResults: searchResults,
            query: query
          };
          break;
          
        default:
          // For other query types, we don't have specific blockchain data
          blockchainData = {
            type: 'general',
            query: query
          };
      }
      
      // Cache the data for future use
      if (blockchainData) {
        this.cache.set(cacheKey, {
          data: blockchainData,
          timestamp: Date.now()
        });
      }
      
      return { blockchainData, relatedEvents };
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      return { blockchainData: {}, relatedEvents: [] };
    }
  }

  /**
   * Process a financial analysis query using Perplexity's Sonar API
   * @param query The user's query text
   * @returns Enhanced AI response with financial analysis
   */
  async processFinancialQuery(query: string): Promise<SubstreamsPerplexityResponse> {
    try {
      // Create a cache key based on the normalized query
      const cacheKey = `financial:${query.toLowerCase().trim()}`;
      
      // Check if we have cached analysis
      const cachedAnalysis = this.financialCache.get(cacheKey);
      if (cachedAnalysis && Date.now() - cachedAnalysis.timestamp < this.CACHE_TTL) {
        return {
          text: cachedAnalysis.analysis,
          queryType: 'market_analysis'
        };
      }
      
      // Try to get web search results to enhance the financial analysis
      let additionalContext = '';
      try {
        const searchResults = await webSearchService.search(query);
        if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
          const formattedResults = searchResults.map(result => 
            `${result.title}\n${result.snippet}\nSource: ${result.link}`
          ).join('\n\n');
          additionalContext = `Recent web search results related to this query:\n${formattedResults}\n\nPlease incorporate relevant information from these results in your analysis.`;
        }
      } catch (searchError) {
        console.warn('Error getting search results for financial query:', searchError);
        // Continue without search results
      }
      
      // Generate financial analysis
      const analysis = await perplexityService.generateFinancialAnalysis(query, additionalContext);
      
      // Cache the analysis
      this.financialCache.set(cacheKey, {
        analysis: analysis.text,
        timestamp: Date.now()
      });
      
      return {
        text: analysis.text,
        queryType: 'market_analysis',
        usage: analysis.usage
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
        text: aiResponse.text,
        queryType: 'general',
        usage: aiResponse.usage
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
export const substreamsPerplexityIntegration = new SubstreamsPerplexityIntegration();
