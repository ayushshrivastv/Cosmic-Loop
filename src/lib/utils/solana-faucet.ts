/**
 * @file solana-faucet.ts
 * @description Utility functions for requesting SOL from faucets to fund test wallets
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

// Different faucet services for requesting test SOL
const FAUCET_URLS = {
  // Solana Labs faucet
  solanaLabs: 'https://api.devnet.solana.com',
  // Helius faucet
  helius: 'https://api.devnet.solana.com', // The actual endpoint is the same, we use RPC for direct airdrops
  // QuickNode faucet (alternative)
  quicknode: 'https://faucet.quicknode.com/solana/devnet',
};

/**
 * Request SOL airdrop for a wallet from multiple sources for higher success rate
 *
 * @param walletAddress The wallet address to fund with SOL
 * @param amount Amount of SOL to request (note: most faucets have limits, typically 1-2 SOL)
 * @returns Object containing success status and transaction details or error message
 */
export async function requestTestSol(walletAddress: string, amount: number = 2): Promise<{
  success: boolean;
  message: string;
  txSignature?: string;
  solAmount?: number;
}> {
  if (!walletAddress) {
    return {
      success: false,
      message: 'No wallet address provided',
    };
  }

  try {
    // Validate the public key
    const publicKey = new PublicKey(walletAddress);

    // Try to get SOL using on-chain RPC airdrop (most reliable method on devnet)
    try {
      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // Check current balance
      const currentBalance = await connection.getBalance(publicKey);
      const currentBalanceInSol = currentBalance / LAMPORTS_PER_SOL;

      // If user already has more than 5 SOL, don't request more
      if (currentBalanceInSol > 5) {
        return {
          success: true,
          message: `Your wallet already has ${currentBalanceInSol.toFixed(2)} SOL, which is sufficient for testing.`,
          solAmount: currentBalanceInSol,
        };
      }

      // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.min(amount, 2) * LAMPORTS_PER_SOL; // Cap at 2 SOL for devnet limits

      // Request airdrop
      const signature = await connection.requestAirdrop(publicKey, lamports);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Check new balance
      const newBalance = await connection.getBalance(publicKey);
      const newBalanceInSol = newBalance / LAMPORTS_PER_SOL;

      return {
        success: true,
        message: `Successfully funded your wallet with ${amount} SOL! New balance: ${newBalanceInSol.toFixed(2)} SOL`,
        txSignature: signature,
        solAmount: newBalanceInSol,
      };
    } catch (rpcError) {
      console.error('RPC airdrop failed, trying direct faucet API:', rpcError);

      // If RPC airdrop fails, try using external faucet APIs
      // This is a fallback and would require implementing API calls to external faucets
      // Many faucets require CORS and other accommodations so we provide instructions instead

      return {
        success: false,
        message: `Automatic airdrop failed. Please visit one of these faucets manually:\n` +
                 `• https://solfaucet.com\n` +
                 `• https://faucet.solana.com\n` +
                 `• https://faucet.quicknode.com/solana/devnet\n` +
                 `And enter your wallet address: ${walletAddress}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error requesting test SOL: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Client-side function to request test SOL via the server
 * This function calls our API endpoint which handles the actual airdrop
 *
 * @param walletAddress The wallet address to fund
 * @returns Response from the server with airdrop results
 */
export async function requestTestSolClient(walletAddress: string): Promise<{
  success: boolean;
  message: string;
  txSignature?: string;
  solAmount?: number;
}> {
  try {
    const response = await fetch('/api/token/faucet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Error requesting test SOL: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
