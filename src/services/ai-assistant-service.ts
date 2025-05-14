import { substreamsService, NFTEvent, BridgeEvent, MarketplaceEvent } from './substreams-service';

// Define the types of queries the AI assistant can handle
export type AIQueryType = 
  | 'nft_info' 
  | 'wallet_activity' 
  | 'market_analysis' 
  | 'bridge_status' 
  | 'general';

// Define the AI assistant response structure
export interface AIAssistantResponse {
  text: string;
  data?: any;
  queryType?: AIQueryType;
  relatedEvents?: Array<NFTEvent | BridgeEvent | MarketplaceEvent>;
}

/**
 * Service for AI assistant functionality that leverages Substreams data
 */
export class AIAssistantService {
  /**
   * Process a user query and generate a response using Substreams data
   * @param query The user's query text
   * @returns AI assistant response
   */
  async processQuery(query: string): Promise<AIAssistantResponse> {
    try {
      // Determine the type of query
      const queryType = this.classifyQuery(query);
      
      // Process the query based on its type
      switch (queryType) {
        case 'nft_info':
          return this.processNFTInfoQuery(query);
        case 'wallet_activity':
          return this.processWalletActivityQuery(query);
        case 'market_analysis':
          return this.processMarketAnalysisQuery(query);
        case 'bridge_status':
          return this.processBridgeStatusQuery(query);
        case 'general':
        default:
          return this.processGeneralQuery(query);
      }
    } catch (error) {
      console.error('Error processing AI assistant query:', error);
      return {
        text: 'I encountered an error while processing your request. Please try again.'
      };
    }
  }

  /**
   * Classify the user query into a specific type
   * @param query The user's query text
   * @returns The classified query type
   */
  private classifyQuery(query: string): AIQueryType {
    const normalizedQuery = query.toLowerCase();
    
    // Simple keyword-based classification
    if (normalizedQuery.includes('nft') || 
        normalizedQuery.includes('token') || 
        normalizedQuery.includes('mint') || 
        normalizedQuery.includes('metadata')) {
      return 'nft_info';
    }
    
    if (normalizedQuery.includes('wallet') || 
        normalizedQuery.includes('account') || 
        normalizedQuery.includes('address') || 
        normalizedQuery.includes('my nfts') || 
        normalizedQuery.includes('my tokens')) {
      return 'wallet_activity';
    }
    
    if (normalizedQuery.includes('market') || 
        normalizedQuery.includes('price') || 
        normalizedQuery.includes('value') || 
        normalizedQuery.includes('sale') || 
        normalizedQuery.includes('listing')) {
      return 'market_analysis';
    }
    
    if (normalizedQuery.includes('bridge') || 
        normalizedQuery.includes('transfer') || 
        normalizedQuery.includes('cross-chain') || 
        normalizedQuery.includes('layerzero')) {
      return 'bridge_status';
    }
    
    return 'general';
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

  /**
   * Process NFT info queries
   * @param query The user's query
   * @returns AI assistant response with NFT information
   */
  private async processNFTInfoQuery(query: string): Promise<AIAssistantResponse> {
    const tokenAddresses = this.extractTokenAddresses(query);
    
    if (tokenAddresses.length > 0) {
      // Get NFT events for the specific token
      const events = await substreamsService.getNFTEventsByToken(tokenAddresses[0]);
      
      if (events.length > 0) {
        const latestEvent = events[0];
        
        return {
          text: `I found information about the NFT with address ${tokenAddresses[0]}. ` +
                `This token was ${latestEvent.type}ed on ${new Date(latestEvent.timestamp).toLocaleString()}. ` +
                (latestEvent.metadata ? 
                  `It's called "${latestEvent.metadata.name}" with the symbol ${latestEvent.metadata.symbol}.` : 
                  'I don\'t have detailed metadata for this token.'),
          data: latestEvent.metadata,
          queryType: 'nft_info',
          relatedEvents: events
        };
      }
    }
    
    // Fallback: Get recent NFT events
    const recentEvents = await substreamsService.getNFTEvents(5);
    
    return {
      text: 'Here are some recent NFT activities on Solana that I found through Substreams:',
      queryType: 'nft_info',
      relatedEvents: recentEvents
    };
  }

  /**
   * Process wallet activity queries
   * @param query The user's query
   * @returns AI assistant response with wallet activity information
   */
  private async processWalletActivityQuery(query: string): Promise<AIAssistantResponse> {
    const walletAddresses = this.extractTokenAddresses(query);
    
    if (walletAddresses.length > 0) {
      // Get NFT events for the specific wallet
      const events = await substreamsService.getNFTEventsByWallet(walletAddresses[0]);
      
      if (events.length > 0) {
        // Count event types
        const mintCount = events.filter(e => e.type === 'mint').length;
        const transferCount = events.filter(e => e.type === 'transfer').length;
        const burnCount = events.filter(e => e.type === 'burn').length;
        const compressedCount = events.filter(e => e.type === 'compressed').length;
        
        return {
          text: `I found ${events.length} NFT activities for wallet ${walletAddresses[0]}. ` +
                `This includes ${mintCount} mints, ${transferCount} transfers, ${burnCount} burns, and ${compressedCount} compressed token operations. ` +
                `The most recent activity was on ${new Date(events[0].timestamp).toLocaleString()}.`,
          queryType: 'wallet_activity',
          relatedEvents: events
        };
      }
    }
    
    // Fallback: General wallet info
    return {
      text: 'I can help you track your NFT wallet activity on Solana. ' +
            'Please provide a wallet address, and I\'ll show you recent mints, transfers, and other activities.',
      queryType: 'wallet_activity'
    };
  }

  /**
   * Process market analysis queries
   * @param query The user's query
   * @returns AI assistant response with market analysis information
   */
  private async processMarketAnalysisQuery(query: string): Promise<AIAssistantResponse> {
    // Get recent marketplace events
    const events = await substreamsService.getMarketplaceEvents(10);
    
    if (events.length > 0) {
      // Calculate average price
      const salesEvents = events.filter(e => e.type === 'sale' && e.price);
      const averagePrice = salesEvents.length > 0 ?
        salesEvents.reduce((sum, event) => sum + parseFloat(event.price || '0'), 0) / salesEvents.length :
        0;
      
      // Count event types
      const listingCount = events.filter(e => e.type === 'listing').length;
      const saleCount = salesEvents.length;
      const offerCount = events.filter(e => e.type === 'offer').length;
      const cancelCount = events.filter(e => e.type === 'cancel').length;
      
      return {
        text: `Based on recent marketplace data from Solana Substreams, I found ${events.length} marketplace events. ` +
              `There were ${listingCount} new listings, ${saleCount} sales, ${offerCount} offers, and ${cancelCount} cancellations. ` +
              (averagePrice > 0 ? `The average sale price was ${averagePrice.toFixed(2)} SOL.` : ''),
        queryType: 'market_analysis',
        relatedEvents: events
      };
    }
    
    return {
      text: 'I don\'t have enough recent marketplace data to provide a meaningful analysis at the moment.',
      queryType: 'market_analysis'
    };
  }

  /**
   * Process bridge status queries
   * @param query The user's query
   * @returns AI assistant response with bridge status information
   */
  private async processBridgeStatusQuery(query: string): Promise<AIAssistantResponse> {
    const tokenAddresses = this.extractTokenAddresses(query);
    const walletAddresses = this.extractTokenAddresses(query);
    
    // Get recent bridge events
    const events = await substreamsService.getBridgeEvents(10);
    
    if (events.length > 0) {
      // Filter by token or wallet if provided
      let filteredEvents = events;
      if (tokenAddresses.length > 0) {
        filteredEvents = events.filter(e => e.tokenAddress === tokenAddresses[0]);
      } else if (walletAddresses.length > 0) {
        filteredEvents = events.filter(e => 
          e.fromAddress === walletAddresses[0] || 
          e.toAddress === walletAddresses[0]
        );
      }
      
      // Count by status
      const pendingCount = filteredEvents.filter(e => e.status === 'pending').length;
      const completedCount = filteredEvents.filter(e => e.status === 'completed').length;
      const failedCount = filteredEvents.filter(e => e.status === 'failed').length;
      
      // Count by chain
      const chainCounts: Record<string, number> = {};
      filteredEvents.forEach(e => {
        chainCounts[e.fromChain] = (chainCounts[e.fromChain] || 0) + 1;
        chainCounts[e.toChain] = (chainCounts[e.toChain] || 0) + 1;
      });
      
      const chainsText = Object.entries(chainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([chain, count]) => `${chain} (${count})`)
        .join(', ');
      
      return {
        text: `I found ${filteredEvents.length} bridge events through Solana Substreams. ` +
              `Status breakdown: ${completedCount} completed, ${pendingCount} pending, and ${failedCount} failed. ` +
              `Most active chains: ${chainsText}.`,
        queryType: 'bridge_status',
        relatedEvents: filteredEvents
      };
    }
    
    return {
      text: 'I don\'t have enough recent bridge data to provide a meaningful analysis at the moment.',
      queryType: 'bridge_status'
    };
  }

  /**
   * Process general queries
   * @param query The user's query
   * @returns AI assistant response for general queries
   */
  private async processGeneralQuery(query: string): Promise<AIAssistantResponse> {
    return {
      text: 'I\'m your Solana OpenAPI assistant, powered by Solana Substreams! I can help you with: \n' +
            '- NFT information and metadata\n' +
            '- Wallet activity tracking\n' +
            '- Marketplace analysis\n' +
            '- Bridge status monitoring\n\n' +
            'What would you like to know about?',
      queryType: 'general'
    };
  }
}

// Export a singleton instance
export const aiAssistantService = new AIAssistantService();
