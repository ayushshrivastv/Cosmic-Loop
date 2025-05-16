/**
 * @file v2-config.ts
 * @description Configuration for LayerZero V2 cross-chain messaging
 * This file contains the configuration for LayerZero V2 endpoints, supported chains,
 * and contract addresses used for omnichain data access.
 */

import { SupportedChain } from '../utils/layer-zero';

// LayerZero V2 endpoint configuration
export const LAYERZERO_V2_CONFIG = {
  // Solana endpoint configuration
  [SupportedChain.Solana]: {
    endpointId: "ENDPOINT_ID_SOLANA", // Replace with actual endpoint ID in production
    programId: "PROGRAM_ID_SOLANA",   // Replace with deployed program ID in production
  },

  // Ethereum endpoint configuration
  [SupportedChain.Ethereum]: {
    endpointId: 1,
    contractAddress: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1", // Example endpoint address
  },

  // Arbitrum endpoint configuration
  [SupportedChain.Arbitrum]: {
    endpointId: 2,
    contractAddress: "0x45f7e9c1105a3Cf76D7d4aA43424fAE73C8365fe", // Example endpoint address
  },

  // Optimism endpoint configuration
  [SupportedChain.Optimism]: {
    endpointId: 3,
    contractAddress: "0x2cB1A7aeCeFC2c39283E9017A665321eE5543d12", // Example endpoint address
  },

  // Polygon endpoint configuration
  [SupportedChain.Polygon]: {
    endpointId: 4,
    contractAddress: "0xa5B7D85a8f27dd7907dc8FdC21FA5657D5E2F901", // Example endpoint address
  },

  // Avalanche endpoint configuration
  [SupportedChain.Avalanche]: {
    endpointId: 5,
    contractAddress: "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8", // Example endpoint address
  },

  // BNB Chain endpoint configuration
  [SupportedChain.BSC]: {
    endpointId: 6,
    contractAddress: "0x3c2269811836af69497E5F486A85D7316753cf62", // Example endpoint address
  },
};

// Chain ID mapping for LayerZero V2
export const LZ_V2_CHAIN_IDS = {
  [SupportedChain.Solana]: 999,    // Example ID for Solana
  [SupportedChain.Ethereum]: 101,   // Ethereum mainnet
  [SupportedChain.Arbitrum]: 110,   // Arbitrum One
  [SupportedChain.Optimism]: 111,   // Optimism
  [SupportedChain.Polygon]: 109,    // Polygon
  [SupportedChain.Avalanche]: 106,  // Avalanche
  [SupportedChain.BSC]: 102,        // BNB Chain
};

// Message types for cross-chain queries
export enum MessageType {
  NFT_DATA = 1,
  TOKEN_TRANSFER = 2,
  MARKET_ACTIVITY = 3,
  WALLET_HISTORY = 4,
}

// Message categories for UI presentation
export const MESSAGE_CATEGORIES = {
  [MessageType.NFT_DATA]: {
    name: 'NFT Data',
    description: 'Query NFT ownership and metadata across chains',
    icon: 'Image', // Icon name matching lucide-react icons
  },
  [MessageType.TOKEN_TRANSFER]: {
    name: 'Token Transfer',
    description: 'View token transfer history and balances',
    icon: 'Coins', // Icon name matching lucide-react icons
  },
  [MessageType.MARKET_ACTIVITY]: {
    name: 'Market Activity',
    description: 'Get DEX and marketplace activity data',
    icon: 'BarChart', // Icon name matching lucide-react icons
  },
  [MessageType.WALLET_HISTORY]: {
    name: 'Wallet History',
    description: 'View cross-chain wallet activity and transactions',
    icon: 'Wallet', // Icon name matching lucide-react icons
  },
};

// Standard options for the LayerZero V2 adapter
export const DEFAULT_ADAPTER_PARAMS = {
  version: 2,
  gasLimit: 200000,
  nativeForDst: 0,
  extraGas: 0,
};

// Status codes for cross-chain messages
export enum MessageStatus {
  PENDING = 'pending',
  INFLIGHT = 'inflight',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

// Define the available message executors
export enum MessageExecutor {
  SMART_CONTRACT = 1,
  OFFCHAIN_WORKER = 2,
  INDEXER = 3,
}

// Gas estimation by chain (in native token)
export const GAS_ESTIMATION_BY_CHAIN = {
  [SupportedChain.Solana]: {
    baseGas: 0.000005,
    perByte: 0.0000001,
  },
  [SupportedChain.Ethereum]: {
    baseGas: 0.0005,
    perByte: 0.00001,
  },
  [SupportedChain.Arbitrum]: {
    baseGas: 0.0001,
    perByte: 0.000001,
  },
  [SupportedChain.Optimism]: {
    baseGas: 0.0001,
    perByte: 0.000001,
  },
  [SupportedChain.Polygon]: {
    baseGas: 0.01,
    perByte: 0.0001,
  },
  [SupportedChain.Avalanche]: {
    baseGas: 0.001,
    perByte: 0.00001,
  },
  [SupportedChain.BSC]: {
    baseGas: 0.0005,
    perByte: 0.000005,
  },
};
