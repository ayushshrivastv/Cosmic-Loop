import type { Cluster } from './constants';
import type { PublicKey } from '@solana/web3.js';

export interface EventDetails {
  name: string;
  description: string;
  date: string; // ISO date string
  location?: string;
  organizerName: string;
  maxAttendees?: number;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  attributes?: TokenAttribute[];
  external_url?: string;
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
}

export interface ClaimData {
  mint: PublicKey;
  eventId: string;
  claimUrl: string;
  qrCode: string;
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
