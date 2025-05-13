/**
 * @file chain-service.ts
 * @description Service for chain-related API operations
 */

import { ApiService } from './api-service';
import { SupportedChain } from '../utils/layer-zero';

/**
 * Chain information interface
 */
export interface ChainInfo {
  chain: SupportedChain;
  name: string;
  logo: string;
  isEVM: boolean;
  rpcEndpoint: string;
  explorerUrl: string;
  nativeToken: string;
  isSupported: boolean;
  testnet: boolean;
  lzChainId: number;
  gasPrice?: string;
  blockHeight?: number;
}

/**
 * Bridge fee estimate interface
 */
export interface BridgeFeeEstimate {
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
  estimatedFee: number;
  feeToken: string;
  estimatedTimeSeconds: number;
  gasPrice?: string;
  message?: string;
}

/**
 * Service for chain-related API operations
 */
export class ChainService extends ApiService {
  /**
   * Get supported chains for bridging
   * @param includeBridgeInfo - Whether to include bridge contract info
   * @returns Array of supported chain information
   */
  async getSupportedChains(includeBridgeInfo: boolean = false): Promise<ChainInfo[]> {
    const query = `
      query GetSupportedChains($includeBridgeInfo: Boolean) {
        supportedChains(includeBridgeInfo: $includeBridgeInfo) {
          chain
          name
          logo
          isEVM
          rpcEndpoint
          explorerUrl
          nativeToken
          isSupported
          testnet
          lzChainId
          gasPrice
          blockHeight
        }
      }
    `;

    const variables = {
      includeBridgeInfo
    };

    // Cache supported chains for a longer time (10 minutes)
    const result = await this.executeQuery<{ supportedChains: ChainInfo[] }>(query, variables, undefined, {
      cacheTtl: 600000
    });

    return result.supportedChains;
  }

  /**
   * Get chain information by chain ID
   * @param chain - Chain identifier
   * @returns Chain information
   */
  async getChainInfo(chain: SupportedChain): Promise<ChainInfo | null> {
    const query = `
      query GetChainInfo($chain: Chain!) {
        chainInfo(chain: $chain) {
          chain
          name
          logo
          isEVM
          rpcEndpoint
          explorerUrl
          nativeToken
          isSupported
          testnet
          lzChainId
          gasPrice
          blockHeight
        }
      }
    `;

    const variables = {
      chain: chain.toUpperCase()
    };

    try {
      const result = await this.executeQuery<{ chainInfo: ChainInfo }>(query, variables, undefined, {
        showErrorToast: false,
        cacheTtl: 60000 // 1 minute cache
      });
      return result.chainInfo;
    } catch (error) {
      console.error(`Error fetching chain info for ${chain}:`, error);
      return null;
    }
  }

  /**
   * Get current gas prices for a chain
   * @param chain - Chain identifier
   * @returns Current gas price in native units
   */
  async getGasPrice(chain: SupportedChain): Promise<string | null> {
    const query = `
      query GetGasPrice($chain: Chain!) {
        gasPrice(chain: $chain)
      }
    `;

    const variables = {
      chain: chain.toUpperCase()
    };

    try {
      const result = await this.executeQuery<{ gasPrice: string }>(query, variables, undefined, {
        useCache: true,
        cacheTtl: 30000, // 30 second cache for gas prices
        showErrorToast: false
      });
      return result.gasPrice;
    } catch (error) {
      console.error(`Error fetching gas price for ${chain}:`, error);
      return null;
    }
  }

  /**
   * Estimate bridge fee for NFT transfer
   * @param sourceChain - Source blockchain
   * @param destinationChain - Destination blockchain
   * @param nftId - NFT ID
   * @returns Fee estimate details
   */
  async estimateBridgeFee(
    sourceChain: SupportedChain,
    destinationChain: SupportedChain,
    nftId: string
  ): Promise<BridgeFeeEstimate> {
    const query = `
      query EstimateBridgeFee($sourceChain: Chain!, $destinationChain: Chain!, $nftId: ID!) {
        estimateBridgeFee(
          sourceChain: $sourceChain
          destinationChain: $destinationChain
          nftId: $nftId
        ) {
          sourceChain
          destinationChain
          estimatedFee
          feeToken
          estimatedTimeSeconds
          gasPrice
          message
        }
      }
    `;

    const variables = {
      sourceChain: sourceChain.toUpperCase(),
      destinationChain: destinationChain.toUpperCase(),
      nftId,
    };

    // Use short cache TTL for fee estimates
    const result = await this.executeQuery<{ estimateBridgeFee: BridgeFeeEstimate }>(query, variables, undefined, {
      cacheTtl: 20000
    });

    return result.estimateBridgeFee;
  }

  /**
   * Check if a transaction has been confirmed
   * @param chain - Blockchain
   * @param txHash - Transaction hash
   * @returns Whether the transaction is confirmed
   */
  async isTransactionConfirmed(
    chain: SupportedChain,
    txHash: string
  ): Promise<boolean> {
    const query = `
      query IsTransactionConfirmed($chain: Chain!, $txHash: String!) {
        isTransactionConfirmed(chain: $chain, txHash: $txHash)
      }
    `;

    const variables = {
      chain: chain.toUpperCase(),
      txHash,
    };

    try {
      const result = await this.executeQuery<{ isTransactionConfirmed: boolean }>(query, variables, undefined, {
        useCache: false, // Never cache transaction status
        showErrorToast: false
      });
      return result.isTransactionConfirmed;
    } catch (error) {
      console.error(`Error checking transaction status for ${txHash}:`, error);
      return false;
    }
  }

  /**
   * Get current token prices in USD
   * @param tokens - Array of token symbols (e.g., ["ETH", "SOL"])
   * @returns Object mapping token symbols to USD prices
   */
  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    const query = `
      query GetTokenPrices($tokens: [String!]!) {
        tokenPrices(tokens: $tokens)
      }
    `;

    const variables = {
      tokens,
    };

    try {
      const result = await this.executeQuery<{ tokenPrices: Record<string, number> }>(query, variables, undefined, {
        cacheTtl: 300000, // 5 minute cache for token prices
        showErrorToast: false
      });
      return result.tokenPrices;
    } catch (error) {
      console.error('Error fetching token prices:', error);
      // Return empty object instead of throwing
      return {};
    }
  }

  /**
   * Subscribe to gas price updates
   * @param chains - Array of chains to monitor
   * @param onUpdate - Callback for gas price updates
   * @returns Unsubscribe function
   */
  subscribeToGasPriceUpdates(
    chains: SupportedChain[],
    onUpdate: (data: { chain: SupportedChain; gasPrice: string }) => void
  ) {
    const subscription = `
      subscription GasPriceUpdated($chains: [Chain!]!) {
        gasPriceUpdated(chains: $chains) {
          chain
          gasPrice
        }
      }
    `;

    const variables = {
      chains: chains.map(chain => chain.toUpperCase()),
    };

    return this.createSubscription(subscription, variables, onUpdate);
  }
}

// Export singleton instance
export const chainService = new ChainService();
