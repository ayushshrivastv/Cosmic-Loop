/**
 * Service for integrating with the Rust-based Substreams package
 * This service connects to the actual Substreams package and processes real blockchain data
 */

import axios from 'axios';
import { NFTEvent, BridgeEvent, MarketplaceEvent } from './substreams-service';
import { enhancedSubstreamsService } from './enhanced-substreams-service';

// Configuration for the Substreams package endpoint
const SUBSTREAMS_PACKAGE_API_URL = process.env.NEXT_PUBLIC_SUBSTREAMS_PACKAGE_API_URL || '/api/substreams';

/**
 * Service for integrating with the Rust-based Substreams package
 */
export class SubstreamsIntegrationService {
  private apiUrl: string;
  
  constructor(apiUrl: string = SUBSTREAMS_PACKAGE_API_URL) {
    this.apiUrl = apiUrl;
  }
  
  /**
   * Execute the Substreams package with the specified parameters
   * @param module The Substreams module to execute
   * @param params The parameters for the module
   * @returns The result of the Substreams execution
   */
  async executeSubstreamsPackage(module: string, params: any): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/execute`, {
        module,
        params
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error executing Substreams package module ${module}:`, error);
      throw error;
    }
  }
  
  /**
   * Get NFT events from the Substreams package
   * @param options Query options
   * @returns Array of NFT events
   */
  async getNFTEvents(options: {
    limit?: number;
    types?: Array<'mint' | 'transfer' | 'burn' | 'compressed'>;
    startTime?: string;
    endTime?: string;
    sortBy?: 'timestamp' | 'blockNumber';
    sortDirection?: 'asc' | 'desc';
  } = {}): Promise<NFTEvent[]> {
    try {
      // Try to get real data from the Substreams package
      const result = await this.executeSubstreamsPackage('nft_events', options);
      return result.events;
    } catch (error) {
      console.warn('Failed to get NFT events from Substreams package, falling back to enhanced service:', error);
      // Fall back to the enhanced service if the package execution fails
      return enhancedSubstreamsService.getNFTEvents(options);
    }
  }
  
  /**
   * Get bridge events from the Substreams package
   * @param limit Maximum number of events to fetch
   * @returns Array of bridge events
   */
  async getBridgeEvents(limit: number = 10): Promise<BridgeEvent[]> {
    try {
      // Try to get real data from the Substreams package
      const result = await this.executeSubstreamsPackage('bridge_events', { limit });
      return result.events;
    } catch (error) {
      console.warn('Failed to get bridge events from Substreams package, falling back to mock data:', error);
      // Fall back to mock data if the package execution fails
      return [];
    }
  }
  
  /**
   * Get marketplace events from the Substreams package
   * @param limit Maximum number of events to fetch
   * @returns Array of marketplace events
   */
  async getMarketplaceEvents(limit: number = 10): Promise<MarketplaceEvent[]> {
    try {
      // Try to get real data from the Substreams package
      const result = await this.executeSubstreamsPackage('marketplace_events', { limit });
      return result.events;
    } catch (error) {
      console.warn('Failed to get marketplace events from Substreams package, falling back to mock data:', error);
      // Fall back to mock data if the package execution fails
      return [];
    }
  }
  
  /**
   * Get NFT events for a specific token from the Substreams package
   * @param tokenAddress The token address to query
   * @param limit Maximum number of events to fetch
   * @returns Array of NFT events for the token
   */
  async getNFTEventsByToken(tokenAddress: string, limit: number = 10): Promise<NFTEvent[]> {
    try {
      // Try to get real data from the Substreams package
      const result = await this.executeSubstreamsPackage('nft_events_by_token', {
        tokenAddress,
        limit
      });
      return result.events;
    } catch (error) {
      console.warn('Failed to get NFT events by token from Substreams package, falling back to enhanced service:', error);
      // Fall back to the enhanced service if the package execution fails
      return enhancedSubstreamsService.getNFTEvents({
        limit,
        types: ['mint', 'transfer', 'burn', 'compressed']
      }).then(events => events.filter(event => event.tokenAddress === tokenAddress));
    }
  }
  
  /**
   * Get NFT events for a specific wallet from the Substreams package
   * @param walletAddress The wallet address to query
   * @param limit Maximum number of events to fetch
   * @returns Array of NFT events for the wallet
   */
  async getNFTEventsByWallet(walletAddress: string, limit: number = 10): Promise<NFTEvent[]> {
    try {
      // Try to get real data from the Substreams package
      const result = await this.executeSubstreamsPackage('nft_events_by_wallet', {
        walletAddress,
        limit
      });
      return result.events;
    } catch (error) {
      console.warn('Failed to get NFT events by wallet from Substreams package, falling back to enhanced service:', error);
      // Fall back to the enhanced service if the package execution fails
      return enhancedSubstreamsService.getNFTEvents({
        limit: limit * 2,
        types: ['mint', 'transfer', 'burn', 'compressed']
      }).then(events => events.filter(event => 
        event.fromAddress === walletAddress || 
        event.toAddress === walletAddress
      ).slice(0, limit));
    }
  }
  
  /**
   * Get account transactions from the Substreams package
   * @param address Wallet address
   * @param limit Maximum number of transactions
   * @returns Transaction data
   */
  async getAccountTransactions(address: string, limit: number = 10): Promise<any[]> {
    try {
      // Try to get real data from the Substreams package
      const result = await this.executeSubstreamsPackage('account_transactions', {
        address,
        limit
      });
      return result.transactions;
    } catch (error) {
      console.warn('Failed to get account transactions from Substreams package, falling back to enhanced service:', error);
      // Fall back to the enhanced service if the package execution fails
      return enhancedSubstreamsService.getAccountTransactions(address, limit);
    }
  }
  
  /**
   * Get NFT collections with analytics data from the Substreams package
   * @param limit Maximum number of collections to fetch
   * @returns Array of collections with analytics
   */
  async getNFTCollections(limit: number = 10): Promise<any[]> {
    try {
      // Try to get real data from the Substreams package
      const result = await this.executeSubstreamsPackage('nft_collections', { limit });
      return result.collections;
    } catch (error) {
      console.warn('Failed to get NFT collections from Substreams package, falling back to enhanced service:', error);
      // Fall back to the enhanced service if the package execution fails
      return enhancedSubstreamsService.getNFTCollections(limit);
    }
  }
}

// Export a singleton instance
export const substreamsIntegrationService = new SubstreamsIntegrationService();
