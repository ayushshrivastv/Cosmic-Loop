// Type declarations for LayerZero V2 modules
declare module '@/lib/utils/layer-zero' {
  export enum SupportedChain {
    ETHEREUM = 1,
    OPTIMISM = 10,
    BSC = 56,
    ARBITRUM = 42161,
    AVALANCHE = 43114,
    POLYGON = 109,
    FANTOM = 112,
    SOLANA = 168
  }
  
  export function getChainName(chainId: SupportedChain): string;
  export function getChainId(chainName: string): SupportedChain;
  export function isValidChain(chainId: number): boolean;
}

declare module '@/lib/layerzero/v2-config' {
  export enum MessageType {
    NFT_QUERY = 1,
    WALLET_HISTORY_QUERY = 2,
    MARKET_ACTIVITY_QUERY = 3,
    QUERY_RESPONSE = 4
  }
  
  export interface LayerZeroConfig {
    endpoint: string;
    programId: string;
    feeAccount: string;
  }
  
  export function getLayerZeroConfig(): LayerZeroConfig;
  export function getMessageTypeString(type: MessageType): string;
}
