/**
 * @file layer-zero-config.ts
 * @description Configuration for LayerZero cross-chain messaging
 * This file contains the configuration for LayerZero endpoints, supported chains,
 * and contract addresses used for cross-chain NFT bridging.
 */

import { SupportedChain } from './utils/layer-zero';

// LayerZero endpoints by chain
export const LAYER_ZERO_ENDPOINTS = {
  [SupportedChain.Solana]: 'https://devnet-endpoint.layerzero.network/solana',
  [SupportedChain.Ethereum]: 'https://testnet-endpoint.layerzero.network/ethereum',
  [SupportedChain.Polygon]: 'https://testnet-endpoint.layerzero.network/polygon',
  [SupportedChain.Arbitrum]: 'https://testnet-endpoint.layerzero.network/arbitrum',
  [SupportedChain.Optimism]: 'https://testnet-endpoint.layerzero.network/optimism',
  [SupportedChain.Avalanche]: 'https://testnet-endpoint.layerzero.network/avalanche',
  [SupportedChain.BinanceSmartChain]: 'https://testnet-endpoint.layerzero.network/bsc',
};

// RPC endpoints for each supported chain
export const CHAIN_RPC_ENDPOINTS = {
  [SupportedChain.Solana]: 'https://api.devnet.solana.com',
  [SupportedChain.Ethereum]: 'https://rpc.ankr.com/eth_goerli',
  [SupportedChain.Polygon]: 'https://rpc.ankr.com/polygon_mumbai',
  [SupportedChain.Arbitrum]: 'https://goerli-rollup.arbitrum.io/rpc',
  [SupportedChain.Optimism]: 'https://goerli.optimism.io',
  [SupportedChain.Avalanche]: 'https://api.avax-test.network/ext/bc/C/rpc',
  [SupportedChain.BinanceSmartChain]: 'https://data-seed-prebsc-1-s1.binance.org:8545',
};

// Chain IDs for EVM-compatible chains
export const EVM_CHAIN_IDS = {
  [SupportedChain.Ethereum]: 5, // Goerli testnet
  [SupportedChain.Polygon]: 80001, // Mumbai testnet
  [SupportedChain.Arbitrum]: 421613, // Arbitrum Goerli testnet
  [SupportedChain.Optimism]: 420, // Optimism Goerli testnet
  [SupportedChain.Avalanche]: 43113, // Avalanche Fuji testnet
  [SupportedChain.BinanceSmartChain]: 97, // BSC testnet
};

// Block explorers by chain
export const BLOCK_EXPLORERS = {
  [SupportedChain.Solana]: 'https://explorer.solana.com/?cluster=devnet',
  [SupportedChain.Ethereum]: 'https://goerli.etherscan.io',
  [SupportedChain.Polygon]: 'https://mumbai.polygonscan.com',
  [SupportedChain.Arbitrum]: 'https://goerli.arbiscan.io',
  [SupportedChain.Optimism]: 'https://goerli-optimism.etherscan.io',
  [SupportedChain.Avalanche]: 'https://testnet.snowtrace.io',
  [SupportedChain.BinanceSmartChain]: 'https://testnet.bscscan.com',
};

// Native token symbols by chain
export const NATIVE_TOKEN_SYMBOLS = {
  [SupportedChain.Solana]: 'SOL',
  [SupportedChain.Ethereum]: 'ETH',
  [SupportedChain.Polygon]: 'MATIC',
  [SupportedChain.Arbitrum]: 'ETH',
  [SupportedChain.Optimism]: 'ETH',
  [SupportedChain.Avalanche]: 'AVAX',
  [SupportedChain.BinanceSmartChain]: 'BNB',
};

// Bridge fees by destination chain (in USD)
// These would normally be dynamically calculated based on gas prices
export const BRIDGE_FEES_USD = {
  [SupportedChain.Solana]: 0.01,
  [SupportedChain.Ethereum]: 5.00,
  [SupportedChain.Polygon]: 0.10,
  [SupportedChain.Arbitrum]: 0.50,
  [SupportedChain.Optimism]: 0.30,
  [SupportedChain.Avalanche]: 0.20,
  [SupportedChain.BinanceSmartChain]: 0.05,
};

// Chain configurations including name, logo, and color
export const CHAIN_CONFIGS = {
  [SupportedChain.Solana]: {
    name: 'Solana',
    logo: '/images/chains/solana.svg',
    color: '#9945FF',
    isEVM: false,
  },
  [SupportedChain.Ethereum]: {
    name: 'Ethereum',
    logo: '/images/chains/ethereum.svg',
    color: '#627EEA',
    isEVM: true,
  },
  [SupportedChain.Polygon]: {
    name: 'Polygon',
    logo: '/images/chains/polygon.svg',
    color: '#8247E5',
    isEVM: true,
  },
  [SupportedChain.Arbitrum]: {
    name: 'Arbitrum',
    logo: '/images/chains/arbitrum.svg',
    color: '#2D374B',
    isEVM: true,
  },
  [SupportedChain.Optimism]: {
    name: 'Optimism',
    logo: '/images/chains/optimism.svg',
    color: '#FF0420',
    isEVM: true,
  },
  [SupportedChain.Avalanche]: {
    name: 'Avalanche',
    logo: '/images/chains/avalanche.svg',
    color: '#E84142',
    isEVM: true,
  },
  [SupportedChain.BinanceSmartChain]: {
    name: 'BSC',
    logo: '/images/chains/bsc.svg',
    color: '#F0B90B',
    isEVM: true,
  },
};
