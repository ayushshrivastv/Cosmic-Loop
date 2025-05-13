import type { Cluster } from './constants';
import type { PublicKey } from '@solana/web3.js';
import type { SupportedChain } from './utils/layer-zero';

export interface EventDetails {
  name: string;
  description: string;
  date: string; // ISO date string
  location?: string;
  organizerName: string;
  maxAttendees?: number;
  // New fields for cross-chain functionality
  enableCrossChain?: boolean;
  supportedChains?: SupportedChain[];
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  attributes?: TokenAttribute[];
  external_url?: string;
  // New field for cross-chain functionality
  originChain?: SupportedChain;
  crossChainEnabled?: boolean;
}

export interface TokenAttribute {
  trait_type: string;
  value: string | number;
}

export interface MintFormData {
  eventDetails: EventDetails;
  tokenMetadata: TokenMetadata;
  supply: number;
  decimals: number;
  // New field for cross-chain settings
  crossChainSettings?: CrossChainSettings;
}

export interface CrossChainSettings {
  enabled: boolean;
  supportedChains: SupportedChain[];
  bridgeFees?: Record<SupportedChain, number>;
}

export interface ClaimData {
  mint: PublicKey;
  eventId: string;
  claimUrl: string;
  qrCode: string;
  // New fields for cross-chain functionality
  originChain?: SupportedChain;
  destinationChain?: SupportedChain;
  crossChainClaimable?: boolean;
}

export interface AppConfig {
  cluster: Cluster;
  rpcEndpoint: string;
  heliusApiKey?: string;
}

export interface UserTokenBalance {
  mint: PublicKey;
  amount: number;
  decimals: number;
  tokenMetadata?: TokenMetadata;
}

// New interfaces for cross-chain functionality
export interface CrossChainBridgeParams {
  tokenMint: PublicKey;
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
  destinationAddress: string;
  amount: number;
}

export interface BridgeTransaction {
  id: string;
  tokenMint: string;
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
  sourceAddress: string;
  destinationAddress: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  timestamp: number;
  fee?: number;
}

export interface ChainInfo {
  name: string;
  logo: string;
  color: string;
  nativeToken: string;
  isEVM: boolean;
  chainId?: number;
  rpcEndpoint: string;
  blockExplorer: string;
}

export interface CrossChainEventInfo {
  eventId: string;
  originChain: SupportedChain;
  supportedChains: SupportedChain[];
  tokenMint: string;
  bridges: Record<SupportedChain, string>; // Maps destination chain to bridge contract address
}
