/**
 * @file analytics-service.ts
 * @description Service for analytics-related API operations
 */

import { ApiService } from './api-service';
import { SupportedChain } from '../utils/layer-zero';

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  totalNFTs: number;
  totalBridgeOperations: number;
  totalEvents: number;
  totalClaims: number;
  activeUsers: number;
  dailyTransactions: number;
  weeklyGrowthPercent: number;
}

/**
 * Chain volume data interface
 */
export interface ChainVolumeData {
  chain: SupportedChain;
  name: string;
  volume: number;
  percentage: number;
  transactions: number;
}

/**
 * Time series data point interface
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

/**
 * Bridge statistics interface
 */
export interface BridgeStats {
  totalBridgeOperations: number;
  successRate: number;
  averageCompletionTimeSeconds: number;
  popularSourceChains: ChainVolumeData[];
  popularDestinationChains: ChainVolumeData[];
  dailyOperations: TimeSeriesDataPoint[];
  weeklyOperations: TimeSeriesDataPoint[];
  monthlyOperations: TimeSeriesDataPoint[];
  gasUsed: number;
  feesPaid: number;
}

/**
 * NFT statistics interface
 */
export interface NFTStats {
  totalNFTs: number;
  totalCollections: number;
  totalOwners: number;
  nftsByChain: ChainVolumeData[];
  compressedTokenPercentage: number;
  dailyMints: TimeSeriesDataPoint[];
  weeklyMints: TimeSeriesDataPoint[];
  monthlyMints: TimeSeriesDataPoint[];
  topCollections: {
    id: string;
    name: string;
    supply: number;
    owners: number;
  }[];
}

/**
 * Service for analytics-related operations
 */
export class AnalyticsService extends ApiService {
  /**
   * Get dashboard overview statistics
   * @param period - Time period for analytics
   * @returns Dashboard statistics
   */
  async getDashboardStats(period: 'day' | 'week' | 'month' = 'day'): Promise<DashboardStats> {
    const query = `
      query GetDashboardStats($period: String!) {
        dashboardStats(period: $period) {
          totalNFTs
          totalBridgeOperations
          totalEvents
          totalClaims
          activeUsers
          dailyTransactions
          weeklyGrowthPercent
        }
      }
    `;

    const variables = {
      period,
    };

    try {
      const result = await this.executeQuery<{ dashboardStats: DashboardStats }>(query, variables, undefined, {
        cacheTtl: 60000 // 1 minute cache for dashboard stats
      });
      return result.dashboardStats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return empty stats instead of throwing
      return {
        totalNFTs: 0,
        totalBridgeOperations: 0,
        totalEvents: 0,
        totalClaims: 0,
        activeUsers: 0,
        dailyTransactions: 0,
        weeklyGrowthPercent: 0
      };
    }
  }

  /**
   * Get NFT statistics
   * @param period - Time period for analytics
   * @param limit - Maximum number of top collections to return
   * @returns NFT statistics
   */
  async getNFTStats(period: 'day' | 'week' | 'month' = 'week', limit = 5): Promise<NFTStats> {
    const query = `
      query GetNFTStats($period: String!, $limit: Int) {
        nftStats(period: $period, limit: $limit) {
          totalNFTs
          totalCollections
          totalOwners
          nftsByChain {
            chain
            name
            volume
            percentage
            transactions
          }
          compressedTokenPercentage
          dailyMints {
            timestamp
            value
          }
          weeklyMints {
            timestamp
            value
          }
          monthlyMints {
            timestamp
            value
          }
          topCollections {
            id
            name
            supply
            owners
          }
        }
      }
    `;

    const variables = {
      period,
      limit,
    };

    try {
      const result = await this.executeQuery<{ nftStats: NFTStats }>(query, variables, undefined, {
        cacheTtl: 60000 // 1 minute cache for NFT stats
      });
      return result.nftStats;
    } catch (error) {
      console.error('Error fetching NFT stats:', error);
      // Return empty stats instead of throwing
      return {
        totalNFTs: 0,
        totalCollections: 0,
        totalOwners: 0,
        nftsByChain: [],
        compressedTokenPercentage: 0,
        dailyMints: [],
        weeklyMints: [],
        monthlyMints: [],
        topCollections: []
      };
    }
  }

  /**
   * Get bridge statistics
   * @param period - Time period for analytics
   * @param limit - Maximum number of chains to return
   * @returns Bridge statistics
   */
  async getBridgeStats(period: 'day' | 'week' | 'month' = 'week', limit = 5): Promise<BridgeStats> {
    const query = `
      query GetBridgeStats($period: String!, $limit: Int) {
        bridgeStats(period: $period, limit: $limit) {
          totalBridgeOperations
          successRate
          averageCompletionTimeSeconds
          popularSourceChains {
            chain
            name
            volume
            percentage
            transactions
          }
          popularDestinationChains {
            chain
            name
            volume
            percentage
            transactions
          }
          dailyOperations {
            timestamp
            value
          }
          weeklyOperations {
            timestamp
            value
          }
          monthlyOperations {
            timestamp
            value
          }
          gasUsed
          feesPaid
        }
      }
    `;

    const variables = {
      period,
      limit,
    };

    try {
      const result = await this.executeQuery<{ bridgeStats: BridgeStats }>(query, variables, undefined, {
        cacheTtl: 60000 // 1 minute cache for bridge stats
      });
      return result.bridgeStats;
    } catch (error) {
      console.error('Error fetching bridge stats:', error);
      // Return empty stats instead of throwing
      return {
        totalBridgeOperations: 0,
        successRate: 0,
        averageCompletionTimeSeconds: 0,
        popularSourceChains: [],
        popularDestinationChains: [],
        dailyOperations: [],
        weeklyOperations: [],
        monthlyOperations: [],
        gasUsed: 0,
        feesPaid: 0
      };
    }
  }

  /**
   * Get user-specific analytics
   * @param walletAddress - User wallet address
   * @param period - Time period for analytics
   * @returns User-specific analytics data
   */
  async getUserAnalytics(walletAddress: string, period: 'day' | 'week' | 'month' = 'week') {
    const query = `
      query GetUserAnalytics($walletAddress: String!, $period: String!) {
        userAnalytics(walletAddress: $walletAddress, period: $period) {
          totalNFTs
          totalBridgeOperations
          uniqueChains
          totalTransactions
          firstActivityDate
          eventParticipation
          claimCount
          transactionVolume
          activityByDay {
            timestamp
            value
          }
        }
      }
    `;

    const variables = {
      walletAddress,
      period,
    };

    try {
      const result = await this.executeQuery(query, variables, undefined, {
        cacheTtl: 60000, // 1 minute cache for user analytics
        showErrorToast: false
      });
      return result.userAnalytics;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      // Return null instead of throwing for user-specific data
      return null;
    }
  }

  /**
   * Subscribe to real-time analytics updates
   * @param walletAddress - Wallet address to monitor
   * @param onUpdate - Callback for analytics updates
   * @returns Unsubscribe function
   */
  subscribeToAnalyticsUpdates(
    walletAddress: string,
    onUpdate: (data: { type: string; data: any }) => void
  ) {
    const subscription = `
      subscription AnalyticsUpdated($walletAddress: String!) {
        analyticsUpdated(walletAddress: $walletAddress) {
          type
          data
        }
      }
    `;

    const variables = {
      walletAddress,
    };

    return this.createSubscription(subscription, variables, onUpdate);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
