/**
 * @file ai-service/index.ts
 * @description Client for interacting with the AI assistant backend service
 */

import { ApiService } from '../api-service';
import { gql } from '@apollo/client';

// Type definitions
export interface AIComponent {
  type: 'TEXT' | 'CODE' | 'DATA' | 'TABLE' | 'CHART' | 'TOKEN' | 'LINK';
  content?: string;
  data?: any;
  headers?: string[];
  address?: string;
  url?: string;
}

export interface AIResponse {
  text: string;
  components?: AIComponent[];
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  components?: AIComponent[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface NFTStats {
  collection: string;
  totalMinted: number;
  totalBurned: number;
  totalTransferred: number;
  activeCount: number;
  floorPrice?: number;
  averagePrice?: number;
  volumeLast24h?: number;
  volumeLast7d?: number;
  error?: string;
}

export interface BridgeStats {
  outboundCount: number;
  inboundCount: number;
  totalVolume: number;
  chainCounts: Record<string, number>;
  topDestinations?: string[];
  error?: string;
}

export interface MarketplaceStats {
  listingCount: number;
  saleCount: number;
  bidCount: number;
  totalVolume: number;
  marketplaceCounts: Record<string, number>;
  error?: string;
}

export interface ChainStats {
  blockHeight: number;
  tps: number;
  activeWallets: number;
  dailyTransactions: number;
  marketCap?: number;
  price?: number;
  error?: string;
}

// GraphQL queries and mutations
const ASK_ASSISTANT = gql`
  query AskAssistant($question: String!, $conversationId: ID) {
    askAssistant(question: $question, conversationId: $conversationId) {
      text
      components {
        type
        content
        data
        headers
        address
        url
      }
      error
    }
  }
`;

const GET_NFT_STATS = gql`
  query GetNftStats($collection: String!) {
    getNftStats(collection: $collection) {
      collection
      totalMinted
      totalBurned
      totalTransferred
      activeCount
      floorPrice
      averagePrice
      volumeLast24h
      volumeLast7d
      error
    }
  }
`;

const GET_BRIDGE_STATS = gql`
  query GetBridgeStats {
    getBridgeStats {
      outboundCount
      inboundCount
      totalVolume
      chainCounts
      topDestinations
      error
    }
  }
`;

const GET_MARKETPLACE_STATS = gql`
  query GetMarketplaceStats {
    getMarketplaceStats {
      listingCount
      saleCount
      bidCount
      totalVolume
      marketplaceCounts
      error
    }
  }
`;

const GET_CHAIN_STATS = gql`
  query GetChainStats {
    getChainStats {
      blockHeight
      tps
      activeWallets
      dailyTransactions
      marketCap
      price
      error
    }
  }
`;

/**
 * Service for interacting with the AI assistant
 */
export class AIService extends ApiService {
  /**
   * Ask the AI assistant a question
   * @param question - The question to ask
   * @param conversationId - Optional conversation ID for context
   * @returns The AI's response
   */
  async askAssistant(question: string, conversationId?: string): Promise<AIResponse> {
    try {
      const variables = {
        question,
        conversationId,
      };

      const result = await this.executeQuery<{ askAssistant: AIResponse }>(
        ASK_ASSISTANT,
        variables
      );

      return result.askAssistant;
    } catch (error) {
      console.error('Error asking assistant:', error);
      return {
        text: "I'm sorry, but I encountered an error while processing your question. Please try again later.",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get statistics for an NFT collection
   * @param collection - The collection name or ID
   * @returns NFT collection statistics
   */
  async getNftStats(collection: string): Promise<NFTStats> {
    try {
      const variables = {
        collection,
      };

      const result = await this.executeQuery<{ getNftStats: NFTStats }>(
        GET_NFT_STATS,
        variables
      );

      return result.getNftStats;
    } catch (error) {
      console.error('Error getting NFT stats:', error);
      return {
        collection,
        totalMinted: 0,
        totalBurned: 0,
        totalTransferred: 0,
        activeCount: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get statistics about bridge operations
   * @returns Bridge statistics
   */
  async getBridgeStats(): Promise<BridgeStats> {
    try {
      const result = await this.executeQuery<{ getBridgeStats: BridgeStats }>(
        GET_BRIDGE_STATS
      );

      return result.getBridgeStats;
    } catch (error) {
      console.error('Error getting bridge stats:', error);
      return {
        outboundCount: 0,
        inboundCount: 0,
        totalVolume: 0,
        chainCounts: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get marketplace statistics
   * @returns Marketplace statistics
   */
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      const result = await this.executeQuery<{ getMarketplaceStats: MarketplaceStats }>(
        GET_MARKETPLACE_STATS
      );

      return result.getMarketplaceStats;
    } catch (error) {
      console.error('Error getting marketplace stats:', error);
      return {
        listingCount: 0,
        saleCount: 0,
        bidCount: 0,
        totalVolume: 0,
        marketplaceCounts: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get general Solana chain statistics
   * @returns Chain statistics
   */
  async getChainStats(): Promise<ChainStats> {
    try {
      const result = await this.executeQuery<{ getChainStats: ChainStats }>(
        GET_CHAIN_STATS
      );

      return result.getChainStats;
    } catch (error) {
      console.error('Error getting chain stats:', error);
      return {
        blockHeight: 0,
        tps: 0,
        activeWallets: 0,
        dailyTransactions: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
