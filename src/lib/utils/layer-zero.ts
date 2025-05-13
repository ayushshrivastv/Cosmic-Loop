/**
 * @file layer-zero.ts
 * @description Utilities for working with LayerZero cross-chain functionality
 * Enhanced with better error handling and chain validation
 */

/**
 * Supported blockchain networks for LayerZero operations
 */
export enum SupportedChain {
  Solana = 'SOLANA',
  Ethereum = 'ETHEREUM',
  Polygon = 'POLYGON',
  Avalanche = 'AVALANCHE',
  Arbitrum = 'ARBITRUM',
  Optimism = 'OPTIMISM',
  BSC = 'BSC',
}

/**
 * Chain information including logo URLs and display names
 */
export interface ChainInfo {
  id: SupportedChain;
  name: string;
  logo: string;
  testnet: boolean;
  isEvm: boolean;
  lzChainId: number;
  rpcEndpoint: string;
  explorerUrl: string;
}

/**
 * Error class for Layer Zero operations
 */
export class LayerZeroError extends Error {
  code: string;

  constructor(message: string, code: string = 'LZ_ERROR') {
    super(message);
    this.name = 'LayerZeroError';
    this.code = code;
  }
}

/**
 * Chain configuration information for supported networks
 */
export const CHAIN_CONFIG: Record<SupportedChain, ChainInfo> = {
  [SupportedChain.Solana]: {
    id: SupportedChain.Solana,
    name: 'Solana',
    logo: '/images/chains/solana.svg',
    testnet: true,
    isEvm: false,
    lzChainId: 168,
    rpcEndpoint: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
  },
  [SupportedChain.Ethereum]: {
    id: SupportedChain.Ethereum,
    name: 'Ethereum',
    logo: '/images/chains/ethereum.svg',
    testnet: true,
    isEvm: true,
    lzChainId: 10121,
    rpcEndpoint: 'https://eth-goerli.public.blastapi.io',
    explorerUrl: 'https://goerli.etherscan.io',
  },
  [SupportedChain.Polygon]: {
    id: SupportedChain.Polygon,
    name: 'Polygon',
    logo: '/images/chains/polygon.svg',
    testnet: true,
    isEvm: true,
    lzChainId: 10109,
    rpcEndpoint: 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
  },
  [SupportedChain.Avalanche]: {
    id: SupportedChain.Avalanche,
    name: 'Avalanche',
    logo: '/images/chains/avalanche.svg',
    testnet: true,
    isEvm: true,
    lzChainId: 10106,
    rpcEndpoint: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
  },
  [SupportedChain.Arbitrum]: {
    id: SupportedChain.Arbitrum,
    name: 'Arbitrum',
    logo: '/images/chains/arbitrum.svg',
    testnet: true,
    isEvm: true,
    lzChainId: 10143,
    rpcEndpoint: 'https://goerli-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://goerli.arbiscan.io',
  },
  [SupportedChain.Optimism]: {
    id: SupportedChain.Optimism,
    name: 'Optimism',
    logo: '/images/chains/optimism.svg',
    testnet: true,
    isEvm: true,
    lzChainId: 10132,
    rpcEndpoint: 'https://goerli.optimism.io',
    explorerUrl: 'https://goerli-optimism.etherscan.io',
  },
  [SupportedChain.BSC]: {
    id: SupportedChain.BSC,
    name: 'BNB Chain',
    logo: '/images/chains/bsc.svg',
    testnet: true,
    isEvm: true,
    lzChainId: 10102,
    rpcEndpoint: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
  },
};

/**
 * Get chain information by chain ID
 * @param chainId - The chain ID to look up
 * @returns Chain information or null if not found
 */
export function getChainInfo(chainId: SupportedChain): ChainInfo | null {
  try {
    return CHAIN_CONFIG[chainId] || null;
  } catch (error) {
    console.error(`Error getting chain info for ${chainId}:`, error);
    return null;
  }
}

/**
 * Get LayerZero chain ID for a supported chain
 * @param chainId - The supported chain
 * @returns LayerZero chain ID
 * @throws {LayerZeroError} If chain is not supported
 */
export function getLzChainId(chainId: SupportedChain): number {
  const chainInfo = getChainInfo(chainId);
  if (!chainInfo) {
    throw new LayerZeroError(
      `Chain ${chainId} is not supported for LayerZero operations`,
      'LZ_UNSUPPORTED_CHAIN'
    );
  }
  return chainInfo.lzChainId;
}

/**
 * Get a formatted chain name for display
 * @param chainId - The chain ID to format
 * @returns Formatted chain name
 */
export function formatChainName(chainId: SupportedChain): string {
  const chainInfo = getChainInfo(chainId);
  return chainInfo ? chainInfo.name : chainId.toString();
}

/**
 * Get chain logo URL
 * @param chainId - The chain ID to get logo for
 * @returns Logo URL or default image if not found
 */
export function getChainLogoUrl(chainId: SupportedChain): string {
  const chainInfo = getChainInfo(chainId);
  if (!chainInfo || !chainInfo.logo) {
    // Return a default image if chain not found or no logo specified
    return '/images/chains/default.svg';
  }
  return chainInfo.logo;
}

/**
 * Check if a chain is EVM-compatible
 * @param chainId - The chain ID to check
 * @returns Boolean indicating if chain is EVM-compatible
 */
export function isEvmChain(chainId: SupportedChain): boolean {
  const chainInfo = getChainInfo(chainId);
  return chainInfo ? chainInfo.isEvm : false;
}

/**
 * Get explorer URL for a transaction on a specific chain
 * @param chainId - The chain ID
 * @param txHash - Transaction hash
 * @returns Explorer URL or null if not supported
 */
export function getExplorerUrl(chainId: SupportedChain, txHash: string): string | null {
  try {
    const chainInfo = getChainInfo(chainId);
    if (!chainInfo || !chainInfo.explorerUrl) {
      return null;
    }

    // Format differs between EVM and non-EVM chains
    if (chainInfo.isEvm) {
      return `${chainInfo.explorerUrl}/tx/${txHash}`;
    } else if (chainId === SupportedChain.Solana) {
      return `${chainInfo.explorerUrl}/tx/${txHash}`;
    }
    return null;
  } catch (error) {
    console.error(`Error generating explorer URL:`, error);
    return null;
  }
}

/**
 * Calculate gas fee for a cross-chain operation
 * @param sourceChain - Source chain
 * @param destinationChain - Destination chain
 * @param dataSize - Size of data to be sent in bytes
 * @returns Estimated gas fee in native token
 */
export function estimateCrossChainGas(
  sourceChain: SupportedChain,
  destinationChain: SupportedChain,
  dataSize: number = 1024
): { fee: number; token: string } {
  try {
    // Base fee in USD
    const baseFeeUsd = 0.05;

    // Adjust fee based on data size
    const dataSizeFactor = Math.max(1, dataSize / 1024);

    // Chain-specific multipliers
    let chainMultiplier = 1;
    if (sourceChain === SupportedChain.Ethereum || destinationChain === SupportedChain.Ethereum) {
      chainMultiplier = 3; // Higher gas on Ethereum
    } else if (sourceChain === SupportedChain.Solana || destinationChain === SupportedChain.Solana) {
      chainMultiplier = 0.5; // Lower fees on Solana
    }

    // Calculate fee in USD
    const feeUsd = baseFeeUsd * dataSizeFactor * chainMultiplier;

    // Convert to native token (simplified)
    // In a real implementation, this would use real-time price feeds
    let feeInNative: number;
    let token: string;

    if (sourceChain === SupportedChain.Ethereum) {
      // Convert USD to ETH (simplified)
      feeInNative = feeUsd / 1800; // Assuming 1 ETH = $1800
      token = 'ETH';
    } else if (sourceChain === SupportedChain.Polygon) {
      // Convert USD to MATIC
      feeInNative = feeUsd / 0.8; // Assuming 1 MATIC = $0.80
      token = 'MATIC';
    } else if (sourceChain === SupportedChain.Solana) {
      // Convert USD to SOL
      feeInNative = feeUsd / 90; // Assuming 1 SOL = $90
      token = 'SOL';
    } else if (sourceChain === SupportedChain.Avalanche) {
      // Convert USD to AVAX
      feeInNative = feeUsd / 30; // Assuming 1 AVAX = $30
      token = 'AVAX';
    } else if (sourceChain === SupportedChain.BSC) {
      // Convert USD to BNB
      feeInNative = feeUsd / 250; // Assuming 1 BNB = $250
      token = 'BNB';
    } else {
      // Default
      feeInNative = feeUsd / 100; // Generic conversion
      token = 'TOKEN';
    }

    return {
      fee: parseFloat(feeInNative.toFixed(6)),
      token
    };
  } catch (error) {
    console.error('Error estimating cross-chain gas:', error);
    return {
      fee: 0.01,
      token: 'ETH'
    };
  }
}

/**
 * Get a list of all supported chains
 * @returns Array of supported chains with their info
 */
export function getAllSupportedChains(): ChainInfo[] {
  return Object.values(CHAIN_CONFIG);
}

/**
 * Check if direct bridging is supported between two chains
 * @param sourceChain - Source chain
 * @param destinationChain - Destination chain
 * @returns Whether direct bridging is supported
 */
export function isBridgingSupported(
  sourceChain: SupportedChain,
  destinationChain: SupportedChain
): boolean {
  // In this implementation, we're assuming all chains in our config can bridge to each other
  // In a real implementation, there would be more complex logic based on available bridge contracts
  try {
    const sourceChainInfo = getChainInfo(sourceChain);
    const destChainInfo = getChainInfo(destinationChain);

    if (!sourceChainInfo || !destChainInfo) {
      return false;
    }

    // Don't allow bridging to the same chain
    if (sourceChain === destinationChain) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking bridge support:', error);
    return false;
  }
}

/**
 * Estimate the time it would take to complete a bridge operation
 * @param sourceChain - Source chain
 * @param destinationChain - Destination chain
 * @returns Estimated time in seconds
 */
export function estimateBridgeTime(
  sourceChain: SupportedChain,
  destinationChain: SupportedChain
): number {
  try {
    // Base time in seconds
    const baseTime = 120; // 2 minutes base time

    // Chain-specific adjustments
    let timeMultiplier = 1;

    // Solana is generally faster
    if (sourceChain === SupportedChain.Solana) {
      timeMultiplier *= 0.7;
    }

    // Ethereum is generally slower
    if (sourceChain === SupportedChain.Ethereum || destinationChain === SupportedChain.Ethereum) {
      timeMultiplier *= 1.5;
    }

    // Calculate estimated time
    const estimatedSeconds = Math.floor(baseTime * timeMultiplier);

    return estimatedSeconds;
  } catch (error) {
    console.error('Error estimating bridge time:', error);
    // Default to 5 minutes if something goes wrong
    return 300;
  }
}
