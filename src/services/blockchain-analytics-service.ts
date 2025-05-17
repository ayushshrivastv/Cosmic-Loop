/**
 * Advanced blockchain analytics service for Solana data
 * This service provides powerful analytics and insights based on Substreams data
 */

import { enhancedSubstreamsService, MarketplaceEvent } from './enhanced-substreams-service';
import { substreamsIntegrationService } from './substreams-integration-service';

/**
 * Interface for NFT collection analytics
 */
export interface NFTCollectionAnalytics {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
  floorPrice?: number;
  volume24h?: number;
  volumeChange?: number;
  owners: number;
  ownershipConcentration?: number;
  mintCount: number;
  transferCount: number;
  burnCount: number;
  averageHoldTime?: number;
  priceHistory?: Array<{ timestamp: string; price: number; }>;
}

/**
 * Interface for wallet analytics
 */
export interface WalletAnalytics {
  address: string;
  nftCount: number;
  tokenBalances: Array<{ token: string; balance: string; usdValue: number; }>;
  totalValue: number;
  transactionCount: number;
  firstActivity: string;
  lastActivity: string;
  topInteractions: Array<{ address: string; count: number; }>;
  activityByType: Record<string, number>;
}

/**
 * Interface for market trend analytics
 */
export interface MarketTrendAnalytics {
  period: '24h' | '7d' | '30d';
  volumeChange: number;
  floorPriceChange: number;
  salesCount: number;
  averagePrice: number;
  topCollections: Array<{ name: string; volume: number; }>;
  topSales: Array<{ collection: string; price: number; timestamp: string; }>;
}

/**
 * Advanced blockchain analytics service for Solana data
 */
export class BlockchainAnalyticsService {
  /**
   * Get comprehensive analytics for an NFT collection
   * @param collectionId Collection ID or address
   * @returns Collection analytics
   */
  async getCollectionAnalytics(collectionId: string): Promise<NFTCollectionAnalytics> {
    try {
      // Get collection data from the integration service
      const collections = await substreamsIntegrationService.getNFTCollections(20);
      const collection = collections.find(c => c.id === collectionId || c.name.toLowerCase() === collectionId.toLowerCase());
      
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      
      // Get price history (mock data for now)
      const priceHistory = this.generateMockPriceHistory(30);
      
      // Calculate average hold time (mock data for now)
      const averageHoldTime = Math.floor(Math.random() * 90) + 30; // 30-120 days
      
      // Calculate ownership concentration (mock data for now)
      const ownershipConcentration = Math.random() * 0.5; // 0-0.5 (lower is more distributed)
      
      return {
        ...collection,
        volumeChange: (Math.random() * 40) - 20, // -20% to +20%
        ownershipConcentration,
        averageHoldTime,
        priceHistory
      };
    } catch (error) {
      console.error('Error getting collection analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get comprehensive analytics for a wallet
   * @param address Wallet address
   * @returns Wallet analytics
   */
  async getWalletAnalytics(address: string): Promise<WalletAnalytics> {
    try {
      // Get account balances
      const balances = await enhancedSubstreamsService.getAccountBalances(address);
      
      // Get transactions
      const transactions = await enhancedSubstreamsService.getAccountTransactions(address, 100);
      
      // Get NFT events for this wallet
      const nftEvents = await substreamsIntegrationService.getNFTEventsByWallet(address, 50);
      
      // Calculate total value
      const totalValue = balances.reduce((sum, balance) => sum + balance.usdValue, 0);
      
      // Calculate first and last activity
      const timestamps = transactions.map(tx => new Date(tx.timestamp).getTime());
      const firstActivity = new Date(Math.min(...timestamps)).toISOString();
      const lastActivity = new Date(Math.max(...timestamps)).toISOString();
      
      // Calculate activity by type
      const activityByType = transactions.reduce((acc: Record<string, number>, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate top interactions (addresses this wallet interacts with most)
      const interactionCounts: Record<string, number> = {};
      transactions.forEach(tx => {
        const otherAddress = tx.from === address ? tx.to : tx.from;
        if (otherAddress) {
          interactionCounts[otherAddress] = (interactionCounts[otherAddress] || 0) + 1;
        }
      });
      
      const topInteractions = Object.entries(interactionCounts)
        .map(([address, count]) => ({ address, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      return {
        address,
        nftCount: nftEvents.filter(event => event.toAddress === address).length,
        tokenBalances: balances.map(b => ({
          token: b.token,
          balance: b.balance,
          usdValue: b.usdValue
        })),
        totalValue,
        transactionCount: transactions.length,
        firstActivity,
        lastActivity,
        topInteractions,
        activityByType
      };
    } catch (error) {
      console.error('Error getting wallet analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get market trend analytics
   * @param period Time period for analysis
   * @returns Market trend analytics
   */
  async getMarketTrendAnalytics(period: '24h' | '7d' | '30d' = '24h'): Promise<MarketTrendAnalytics> {
    try {
      // Get collections
      const collections = await substreamsIntegrationService.getNFTCollections(10);
      
      // Get marketplace events
      const marketplaceEvents = await enhancedSubstreamsService.getMarketplaceEvents(100);
      
      // Filter sales by period
      const periodInMs = period === '24h' ? 24 * 60 * 60 * 1000 : 
                        period === '7d' ? 7 * 24 * 60 * 60 * 1000 : 
                        30 * 24 * 60 * 60 * 1000;
      
      const cutoffDate = new Date(Date.now() - periodInMs);
      const salesInPeriod = marketplaceEvents.filter((event: MarketplaceEvent) => 
        event.type === 'sale' && new Date(event.timestamp) >= cutoffDate
      );
      
      // Calculate average price
      const prices = salesInPeriod.map((sale: MarketplaceEvent) => parseFloat(sale.price || '0'));
      const averagePrice = prices.length > 0 ? 
        prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length : 0;
      
      // Generate top sales (mock data for now)
      const topSales = this.generateMockTopSales(collections, 5);
      
      // Generate volume change (mock data for now)
      const volumeChange = (Math.random() * 40) - 20; // -20% to +20%
      
      // Generate floor price change (mock data for now)
      const floorPriceChange = (Math.random() * 30) - 15; // -15% to +15%
      
      return {
        period,
        volumeChange,
        floorPriceChange,
        salesCount: salesInPeriod.length,
        averagePrice,
        topCollections: collections
          .map(collection => ({ name: collection.name, volume: collection.volume24h || 0 }))
          .sort((a, b) => b.volume - a.volume),
        topSales
      };
    } catch (error) {
      console.error('Error getting market trend analytics:', error);
      throw error;
    }
  }
  
  /**
   * Generate mock price history for development
   * @param days Number of days of history
   * @returns Price history data
   */
  private generateMockPriceHistory(days: number): Array<{ timestamp: string; price: number; }> {
    const history = [];
    let price = 5 + Math.random() * 10; // Starting price between 5-15
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      
      // Random price movement (-10% to +10%)
      const change = price * (Math.random() * 0.2 - 0.1);
      price += change;
      
      // Ensure price doesn't go below 0.1
      price = Math.max(0.1, price);
      
      history.push({
        timestamp: date.toISOString(),
        price: parseFloat(price.toFixed(3))
      });
    }
    
    return history;
  }
  
  /**
   * Generate mock top sales for development
   * @param collections Collections data
   * @param count Number of sales to generate
   * @returns Top sales data
   */
  private generateMockTopSales(
    collections: Array<{ name: string; }>, 
    count: number
  ): Array<{ collection: string; price: number; timestamp: string; }> {
    const sales = [];
    
    for (let i = 0; i < count; i++) {
      const collection = collections[Math.floor(Math.random() * collections.length)];
      
      sales.push({
        collection: collection.name,
        price: 10 + Math.random() * 90, // 10-100 SOL
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
      });
    }
    
    // Sort by price (highest first)
    return sales.sort((a, b) => b.price - a.price);
  }
  
  /**
   * Get marketplace events with advanced filtering
   * @param options Query options
   * @returns Filtered marketplace events
   */
  async getMarketplaceEvents(options: {
    limit?: number;
    types?: Array<'listing' | 'sale' | 'offer' | 'cancel'>;
    minPrice?: number;
    maxPrice?: number;
    startTime?: string;
    endTime?: string;
    collections?: string[];
  } = {}): Promise<any[]> {
    const {
      limit = 20,
      types,
      minPrice,
      maxPrice,
      startTime,
      endTime,
      collections
    } = options;
    
    try {
      // Get all marketplace events
      const events = await enhancedSubstreamsService.getMarketplaceEvents(limit * 2);
      
      // Apply filters
      let filteredEvents = events;
      
      if (types && types.length > 0) {
        filteredEvents = filteredEvents.filter((event: MarketplaceEvent) => types.includes(event.type));
      }
      
      if (minPrice !== undefined) {
        filteredEvents = filteredEvents.filter((event: MarketplaceEvent) => 
          event.price && parseFloat(event.price) >= minPrice
        );
      }
      
      if (maxPrice !== undefined) {
        filteredEvents = filteredEvents.filter((event: MarketplaceEvent) => 
          event.price && parseFloat(event.price) <= maxPrice
        );
      }
      
      if (startTime) {
        filteredEvents = filteredEvents.filter((event: MarketplaceEvent) => 
          new Date(event.timestamp) >= new Date(startTime)
        );
      }
      
      if (endTime) {
        filteredEvents = filteredEvents.filter((event: MarketplaceEvent) => 
          new Date(event.timestamp) <= new Date(endTime)
        );
      }
      
      if (collections && collections.length > 0) {
        // This would require collection information in the events
        // For now, we'll just simulate this filter with a random subset
        filteredEvents = filteredEvents.filter(() => Math.random() > 0.5);
      }
      
      return filteredEvents.slice(0, limit);
    } catch (error) {
      console.error('Error getting marketplace events:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const blockchainAnalyticsService = new BlockchainAnalyticsService();
