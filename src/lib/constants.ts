export const APP_NAME = "Scalable cToken Issuance via Solana Pay";
export const APP_DESCRIPTION = "Demonstrating scalable compressed token (cToken) issuance and distribution on Solana using Solana Pay.";

// RPC endpoints - Replace with your actual endpoints when deploying
export const DEVNET_RPC_ENDPOINT = "https://api.devnet.solana.com";
export const MAINNET_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

// Helius endpoint (requires API key)
export const HELIUS_RPC_ENDPOINT = (apiKey: string) => `https://devnet.helius-rpc.com/?api-key=${apiKey}`;

// Cluster
export type Cluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";
export const DEFAULT_CLUSTER: Cluster = "devnet";

// Default token decimals
export const DEFAULT_TOKEN_DECIMALS = 9;

// Token metadata defaults
export const DEFAULT_METADATA = {
  name: "Proof of Participation Token",
  symbol: "POP",
  description: "This token verifies your attendance at an event",
  image: "https://example.com/placeholder.png",
};

// Routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  MINT: "/mint",
  CLAIM: "/claim",
  PROFILE: "/profile",
};
