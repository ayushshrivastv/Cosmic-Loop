// Type declarations for Node.js environment
declare namespace NodeJS {
  interface ProcessEnv {
    SOLANA_RPC_URL?: string;
    SOLANA_PROGRAM_ID?: string;
    LAYERZERO_ENDPOINT?: string;
    FEE_ACCOUNT?: string;
    [key: string]: string | undefined;
  }
}
