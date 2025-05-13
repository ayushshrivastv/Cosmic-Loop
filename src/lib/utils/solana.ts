/**
 * @file solana.ts
 * @description Mock utility functions for simulating Solana blockchain interactions
 * This file contains mock implementations of the functions that would normally interact
 * with the Solana blockchain and Light Protocol. These mock functions simulate the
 * behavior without actually connecting to the blockchain.
 */

import { PublicKey, Keypair } from '@solana/web3.js';
import type { AppConfig } from '../types';

/**
 * Create a mock Solana RPC connection
 * 
 * @param config - Application configuration containing RPC endpoint and cluster information
 * @returns A mock RPC connection object that simulates blockchain interactions
 * 
 * This function returns a mock object that simulates a connection to the Solana blockchain.
 * It provides mock implementations of the methods that would normally interact with the blockchain.
 */
export const createConnection = (config: AppConfig): any => {
  console.log('Creating mock connection with config:', config);
  
  // Return a mock connection object with the methods we need
  return {
    getLatestBlockhash: async () => ({
      blockhash: 'mock_blockhash_' + Date.now().toString(),
      lastValidBlockHeight: 999999
    }),
    getMinimumBalanceForRentExemption: async () => 10000000,
    getCachedActiveStateTreeInfos: async () => [{
      tree: {
        toBase58: () => 'mock_tree_pubkey_' + Date.now().toString()
      }
    }]
  };
};

/**
 * Create a mock compressed token mint
 * 
 * @param connection - Mock connection object
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mintAuthority - Public key of the account that will have authority to mint tokens
 * @param decimals - Number of decimal places for the token (e.g., 9 for most tokens)
 * @param tokenName - Name of the token (e.g., "Event Name Token")
 * @param tokenSymbol - Symbol of the token (e.g., "POP")
 * @param tokenUri - URI to the token's metadata JSON (typically hosted on IPFS or Arweave)
 * @returns Object containing the mint public key and transaction signature
 * 
 * This function simulates the creation of a compressed token mint without actually
 * interacting with the blockchain. It generates a new keypair to represent the mint
 * and returns a mock signature.
 */
export const createCompressedTokenMint = async (
  connection: any,
  payer: Keypair,
  mintAuthority: PublicKey,
  decimals: number,
  tokenName: string,
  tokenSymbol: string,
  tokenUri: string
): Promise<{ mint: PublicKey; signature: string }> => {
  console.log('Creating mock compressed token mint...');
  console.log('Token details:', { tokenName, tokenSymbol, decimals, tokenUri });

  // Generate a new keypair to represent the mint
  const mintKeypair = Keypair.generate();
  
  // Simulate a delay to mimic blockchain interaction
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a mock signature
  const signature = 'mock_create_signature_' + Date.now().toString();
  
  console.log('Mock token mint created with address:', mintKeypair.publicKey.toBase58());
  console.log('Mock creation signature:', signature);
  
  return {
    mint: mintKeypair.publicKey,
    signature,
  };
};

/**
 * Mint mock compressed tokens to a destination account
 * 
 * @param connection - Mock connection object
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mint - Public key of the token mint to issue tokens from
 * @param destination - Public key of the recipient account
 * @param authority - Keypair with mint authority permission
 * @param amount - Number of tokens to mint (in base units)
 * @returns Object containing the transaction signature
 * 
 * This function simulates minting compressed tokens without actually interacting with
 * the blockchain. It logs the mint operation details and returns a mock signature.
 */
export const mintCompressedTokens = async (
  connection: any,
  payer: Keypair,
  mint: PublicKey,
  destination: PublicKey,
  authority: Keypair,
  amount: number
): Promise<{ signature: string }> => {
  console.log(`Simulating minting ${amount} tokens of ${mint.toBase58()} to ${destination.toBase58()}`);
  
  // Simulate a delay to mimic blockchain interaction
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a mock signature
  const signature = 'mock_mint_signature_' + Date.now().toString();
  
  console.log('Mock mint transaction successful, signature:', signature);
  
  return { signature };
};

/**
 * Transfer mock compressed tokens between accounts
 * 
 * @param connection - Mock connection object
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mint - Public key of the token mint
 * @param amount - Number of tokens to transfer (in base units)
 * @param owner - Keypair of the current token owner (source)
 * @param destination - Public key of the recipient account
 * @returns Object containing the transaction signature
 * 
 * This function simulates transferring compressed tokens without actually interacting with
 * the blockchain. It logs the transfer operation details and returns a mock signature.
 */
export const transferCompressedTokens = async (
  connection: any,
  payer: Keypair,
  mint: PublicKey,
  amount: number,
  owner: Keypair,
  destination: PublicKey
): Promise<{ signature: string }> => {
  console.log(`Simulating transfer of ${amount} tokens of mint ${mint.toBase58()} from ${owner.publicKey.toBase58()} to ${destination.toBase58()}`);
  
  // Simulate a delay to mimic blockchain interaction
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a mock signature
  const signature = 'mock_transfer_signature_' + Date.now().toString();
  
  console.log('Mock token transfer successful, signature:', signature);
  
  return { signature };
};

/**
 * Format a public key for display with ellipsis in the middle
 * 
 * @param publicKey - Solana public key or base58 string to format
 * @param length - Number of characters to show at beginning and end (default: 4)
 * @returns Formatted string with beginning and end of the key with ellipsis in between
 * 
 * This utility function makes public keys more readable in the UI by truncating
 * the middle section and showing only the first and last few characters.
 * Example: "EPjFWdd5...F657PCh" instead of the full 44-character base58 string
 */
export const formatPublicKey = (publicKey: PublicKey | string, length = 4): string => {
  const key = typeof publicKey === 'string' ? publicKey : publicKey.toBase58();
  return `${key.slice(0, length)}...${key.slice(-length)}`;
};

/**
 * Format token amount with proper decimal places for display
 * 
 * @param amount - Raw token amount in base units (e.g., lamports for SOL)
 * @param decimals - Number of decimal places the token uses
 * @returns Formatted string with proper decimal representation and thousands separators
 * 
 * This utility function converts raw token amounts from base units (e.g., lamports)
 * to their human-readable form with the correct number of decimal places.
 * For example, 1000000000 lamports with 9 decimals would display as "1" SOL.
 */
export const formatTokenAmount = (amount: number, decimals: number): string => {
  return (amount / (10 ** decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
