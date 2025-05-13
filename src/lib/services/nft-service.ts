/**
 * @file nft-service.ts
 * @description Service for NFT-related API operations
 */

import { ApiService } from './api-service';
import { SupportedChain } from '../utils/layer-zero';

/**
 * NFT metadata interface
 */
export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  [key: string]: any;
}

/**
 * NFT collection interface
 */
export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  creator?: string;
  description?: string;
  image?: string;
}

/**
 * NFT interface
 */
export interface NFT {
  id: string;
  tokenId: string | number;
  ownerAddress: string;
  uri: string;
  metadata: NFTMetadata;
  chain: SupportedChain;
  contractAddress: string;
  isCompressed: boolean;
  createdAt: string;
  collection: NFTCollection;
}

/**
 * Bridge operation interface
 */
export interface BridgeOperation {
  id: string;
  sourceChain: SupportedChain;
  sourceAddress: string;
  destinationChain: SupportedChain;
  destinationAddress: string;
  sourceTransactionHash?: string;
  destinationTransactionHash?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for NFT-related operations
 */
export class NFTService extends ApiService {
  /**
   * Get NFTs owned by a specific address
   * @param ownerAddress - Owner wallet address
   * @param chain - Blockchain (optional)
   * @param limit - Maximum number of NFTs to return
   * @param offset - Pagination offset
   * @returns Array of NFTs
   */
  async getNFTsByOwner(
    ownerAddress: string,
    chain?: SupportedChain,
    limit = 10,
    offset = 0
  ): Promise<NFT[]> {
    const query = `
      query GetNFTsByOwner($ownerAddress: String!, $chain: Chain, $limit: Int, $offset: Int) {
        nftsByOwner(ownerAddress: $ownerAddress, chain: $chain, limit: $limit, offset: $offset) {
          id
          tokenId
          ownerAddress
          uri
          metadata
          chain
          contractAddress
          isCompressed
          createdAt
          collection {
            id
            name
            symbol
            description
            image
          }
        }
      }
    `;

    const variables = {
      ownerAddress,
      chain: chain ? chain.toUpperCase() : undefined,
      limit,
      offset,
    };

    try {
      const result = await this.executeQuery<{ nftsByOwner: NFT[] }>(query, variables, undefined, {
        // Cache NFTs for a shorter time, as they may change frequently
        cacheTtl: 15000
      });

      return result.nftsByOwner;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a specific NFT
   * @param nftId - NFT ID
   * @returns NFT details or null if not found
   */
  async getNFTDetails(nftId: string): Promise<NFT | null> {
    const query = `
      query GetNFTDetails($nftId: ID!) {
        nftDetails(nftId: $nftId) {
          id
          tokenId
          ownerAddress
          uri
          metadata
          chain
          contractAddress
          isCompressed
          createdAt
          collection {
            id
            name
            symbol
            description
            image
          }
        }
      }
    `;

    const variables = {
      nftId,
    };

    try {
      const result = await this.executeQuery<{ nftDetails: NFT }>(query, variables);
      return result.nftDetails;
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      return null;
    }
  }

  /**
   * Get bridge operations for a specific NFT
   * @param nftId - NFT ID
   * @returns Array of bridge operations
   */
  async getNFTBridgeHistory(nftId: string): Promise<BridgeOperation[]> {
    const query = `
      query GetNFTBridgeHistory($nftId: ID!) {
        bridgeOperations(nftId: $nftId) {
          id
          sourceChain
          sourceAddress
          destinationChain
          destinationAddress
          sourceTransactionHash
          destinationTransactionHash
          status
          errorMessage
          completedAt
          createdAt
          updatedAt
        }
      }
    `;

    const variables = {
      nftId,
    };

    try {
      const result = await this.executeQuery<{ bridgeOperations: BridgeOperation[] }>(query, variables);
      return result.bridgeOperations;
    } catch (error) {
      console.error('Error fetching bridge history:', error);
      // Return empty array instead of throwing, so UI can still render
      return [];
    }
  }

  /**
   * Bridge an NFT to another chain
   * @param nftId - NFT ID
   * @param sourceChain - Source blockchain
   * @param sourceAddress - Source wallet address
   * @param destinationChain - Destination blockchain
   * @param destinationAddress - Destination wallet address
   * @returns Bridge operation details
   */
  async bridgeNFT(
    nftId: string,
    sourceChain: SupportedChain,
    sourceAddress: string,
    destinationChain: SupportedChain,
    destinationAddress: string
  ): Promise<BridgeOperation> {
    const mutation = `
      mutation BridgeNFT(
        $nftId: ID!
        $sourceChain: Chain!
        $sourceAddress: String!
        $destinationChain: Chain!
        $destinationAddress: String!
      ) {
        bridgeNFT(
          nftId: $nftId
          sourceChain: $sourceChain
          sourceAddress: $sourceAddress
          destinationChain: $destinationChain
          destinationAddress: $destinationAddress
        ) {
          id
          sourceChain
          sourceAddress
          destinationChain
          destinationAddress
          sourceTransactionHash
          status
          createdAt
        }
      }
    `;

    const variables = {
      nftId,
      sourceChain: sourceChain.toUpperCase(),
      sourceAddress,
      destinationChain: destinationChain.toUpperCase(),
      destinationAddress,
    };

    // This is a mutation that should invalidate the NFT cache
    const nftCachePattern = new RegExp(`GetNFTsByOwner.*${sourceAddress}`);
    const result = await this.executeMutation<{ bridgeNFT: BridgeOperation }>(mutation, variables, undefined, {
      invalidateCache: nftCachePattern
    });

    return result.bridgeNFT;
  }

  /**
   * Get NFT collections created by a specific address
   * @param creatorAddress - Creator wallet address
   * @param limit - Maximum number of collections to return
   * @param offset - Pagination offset
   * @returns Array of NFT collections
   */
  async getNFTCollectionsByCreator(
    creatorAddress: string,
    limit = 10,
    offset = 0
  ): Promise<NFTCollection[]> {
    const query = `
      query GetNFTCollectionsByCreator($creatorAddress: String!, $limit: Int, $offset: Int) {
        nftCollectionsByCreator(creatorAddress: $creatorAddress, limit: $limit, offset: $offset) {
          id
          name
          symbol
          description
          image
          creator
        }
      }
    `;

    const variables = {
      creatorAddress,
      limit,
      offset,
    };

    try {
      const result = await this.executeQuery<{ nftCollectionsByCreator: NFTCollection[] }>(query, variables);
      return result.nftCollectionsByCreator;
    } catch (error) {
      console.error('Error fetching NFT collections:', error);
      return [];
    }
  }

  /**
   * Subscribe to NFT ownership changes
   * @param walletAddress - Wallet address to monitor
   * @param onUpdate - Callback for ownership updates
   * @returns Unsubscribe function
   */
  subscribeToNFTOwnershipChanges(
    walletAddress: string,
    onUpdate: (data: { nft: NFT; eventType: 'added' | 'removed' | 'updated' }) => void
  ) {
    const subscription = `
      subscription NFTOwnershipChanged($walletAddress: String!) {
        nftOwnershipChanged(walletAddress: $walletAddress) {
          nft {
            id
            tokenId
            ownerAddress
            uri
            metadata
            chain
            contractAddress
            isCompressed
            createdAt
            collection {
              id
              name
              symbol
            }
          }
          eventType
        }
      }
    `;

    const variables = {
      walletAddress,
    };

    return this.createSubscription(subscription, variables, onUpdate);
  }

  /**
   * Subscribe to bridge operation updates
   * @param bridgeOperationId - Bridge operation ID to monitor
   * @param onUpdate - Callback for bridge updates
   * @returns Unsubscribe function
   */
  subscribeToBridgeUpdates(
    bridgeOperationId: string,
    onUpdate: (data: BridgeOperation) => void
  ) {
    const subscription = `
      subscription BridgeOperationUpdated($bridgeOperationId: ID!) {
        bridgeOperationUpdated(bridgeOperationId: $bridgeOperationId) {
          id
          status
          sourceTransactionHash
          destinationTransactionHash
          errorMessage
          completedAt
          updatedAt
        }
      }
    `;

    const variables = {
      bridgeOperationId,
    };

    return this.createSubscription(subscription, variables, onUpdate);
  }
}

// Export singleton instance
export const nftService = new NFTService();
