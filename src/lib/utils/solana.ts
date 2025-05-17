/**
 * @file solana.ts
 * @description Utility functions for interacting with Solana blockchain and Light Protocol
 * This file contains all the necessary functions to create and manage compressed tokens
 * using Light Protocol's state compression technology.
 */

import { Connection, PublicKey, Keypair, TransactionMessage, VersionedTransaction, SendTransactionError } from '@solana/web3.js';
import { createRpc, type Rpc, sendAndConfirmTx, type ActiveTreeBundle } from '@lightprotocol/stateless.js';
import type { AppConfig } from '../types';
import {
  TOKEN_2022_PROGRAM_ID, // Use Token-2022 program for extended functionality
  createInitializeMetadataPointerInstruction,
  ExtensionType,
  getMintLen,
} from '@solana/spl-token';
import {
  createInitializeInstruction as createSplTokenMetadataInitializeInstruction,
  pack as packTokenMetadata,
  TokenMetadata,
} from '@solana/spl-token-metadata';
import { CompressedTokenProgram, TokenData } from '@lightprotocol/compressed-token';

// Maximum number of retries for transactions
const MAX_TRANSACTION_RETRIES = 3;
// Delay between retry attempts in milliseconds
const RETRY_DELAY_MS = 2000;
// Safety multiplier for rent calculation (200% to be safe)
const RENT_SAFETY_MULTIPLIER = 2.0;

/**
 * Create a Solana RPC connection using Light Protocol's createRpc
 *
 * @param config - Application configuration containing RPC endpoint and cluster information
 * @returns A Light Protocol RPC connection instance that supports compressed token operations
 *
 * This function establishes the connection to the Solana blockchain with Light Protocol's
 * RPC wrapper that adds support for state compression operations. It's a foundational
 * function used by all other blockchain interaction methods in this application.
 */
export const createConnection = (config: AppConfig): Rpc => {
  const { rpcEndpoint } = config;

  // Create a Light Protocol RPC connection
  // Use rpcEndpoint for both standard Solana and compression API endpoint
  try {
    const rpc = createRpc(rpcEndpoint, rpcEndpoint);
    console.log(`Connection established to: ${rpcEndpoint}`);

    return rpc;
  } catch (error) {
    console.error('Error creating Light Protocol RPC connection:', error);
    // If the connection fails with the provided endpoint, try the default
    if (rpcEndpoint !== 'https://api.devnet.solana.com') {
      console.log('Attempting to connect with default devnet endpoint');
      const fallbackRpc = createRpc('https://api.devnet.solana.com', 'https://api.devnet.solana.com');
      return fallbackRpc;
    }
    throw error;
  }
};

/**
 * Create a compressed token mint using Light Protocol's compression technology
 *
 * @param connection - Light Protocol RPC connection instance
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mintAuthority - Public key of the account that will have authority to mint tokens
 * @param decimals - Number of decimal places for the token (e.g., 9 for most tokens)
 * @param tokenName - Name of the token (e.g., "Event Name Token")
 * @param tokenSymbol - Symbol of the token (e.g., "POP")
 * @param tokenUri - URI to the token's metadata JSON (typically hosted on IPFS or Arweave)
 * @returns Object containing the mint public key and transaction signature
 *
 * This function performs several operations:
 * 1. Generates a new keypair for the token mint account
 * 2. Creates token metadata with name, symbol, and URI
 * 3. Calculates rent-exempt storage space for mint and metadata
 * 4. Initializes the mint with the Token-2022 program
 * 5. Sets up metadata for the token
 * 6. Creates the token pool for compression
 */
export const createCompressedTokenMint = async (
  connection: Rpc,
  payer: Keypair,
  mintAuthority: PublicKey,
  decimals: number,
  tokenName: string,
  tokenSymbol: string,
  tokenUri: string
): Promise<{ mint: PublicKey; signature: string }> => {
  console.log('Attempting to create compressed token mint...');
  console.log(`Token Name: ${tokenName}`);
  console.log(`Token Symbol: ${tokenSymbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Metadata URI: ${tokenUri}`);

  // Generate a new keypair for the mint account
  const mintKeypair = Keypair.generate();
  console.log(`Mint Address: ${mintKeypair.publicKey.toBase58()}`);

  // Prepare token metadata
  const metadata: TokenMetadata = {
    mint: mintKeypair.publicKey,
    name: tokenName.trim(), // Trim whitespace
    symbol: tokenSymbol.trim().toUpperCase(), // Standardize symbol
    uri: tokenUri.trim(), // Trim whitespace
    additionalMetadata: [], // Or allow passing this in
  };

  // Calculate rent sizes
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = packTokenMetadata(metadata).length; // TYPE_SIZE + LENGTH_SIZE is handled by pack

  // Calculate rent with a safety margin to ensure sufficient funds
  // Using a multiplier of 2.0 (200%) to be absolutely safe
  const calculatedRentLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );
  const rentLamports = Math.ceil(calculatedRentLamports * RENT_SAFETY_MULTIPLIER);
  console.log(`Calculated rent: ${calculatedRentLamports} lamports, Using rent with safety margin: ${rentLamports} lamports`);

  // Check if payer has sufficient balance
  const payerBalance = await connection.getBalance(payer.publicKey);
  console.log(`Payer balance: ${payerBalance} lamports`);

  if (payerBalance < rentLamports * 1.5) {
    throw new Error(`Insufficient funds for transaction. Required: ${rentLamports * 1.5} lamports, Available: ${payerBalance} lamports`);
  }

  // Create the instructions for the transaction
  const [createMintAccountIx, initializeMintIx, createTokenPoolIx] =
    await CompressedTokenProgram.createMint({
      feePayer: payer.publicKey,
      authority: mintAuthority, // Use the provided mintAuthority
      mint: mintKeypair.publicKey,
      decimals,
      freezeAuthority: null, // Or provide an option
      rentExemptBalance: rentLamports,
      tokenProgramId: TOKEN_2022_PROGRAM_ID,
      mintSize: mintLen,
    });

  const instructions = [
    createMintAccountIx,
    createInitializeMetadataPointerInstruction(
      mintKeypair.publicKey,
      payer.publicKey, // Authority for pointer? Usually mint authority.
      mintKeypair.publicKey, // The mint itself is the metadata account for pointer
      TOKEN_2022_PROGRAM_ID
    ),
    initializeMintIx,
    createSplTokenMetadataInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token program hosting metadata
      mint: mintKeypair.publicKey,
      metadata: mintKeypair.publicKey, // Mint account is also metadata account here
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: mintAuthority,
      updateAuthority: mintAuthority, // Or provide an option
    }),
    createTokenPoolIx,
  ];

  // Get latest blockhash with retry on failure
  let recentBlockhash;
  let retries = 3;
  while (retries > 0) {
    try {
      recentBlockhash = await connection.getLatestBlockhash();
      break;
    } catch (error) {
      console.warn(`Failed to get recent blockhash (retries left: ${retries}):`, error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Set compute budget for the transaction
  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: recentBlockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([payer, mintKeypair]); // Sign with payer and the new mint's keypair

  // Send transaction with retry logic
  return await sendTransactionWithRetry(
    connection,
    transaction,
    'create compressed token mint',
    { mint: mintKeypair.publicKey }
  );
};

/**
 * Mint compressed tokens to a destination account using Light Protocol
 *
 * @param connection - Light Protocol RPC connection instance
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mint - Public key of the token mint to issue tokens from
 * @param destination - Public key of the recipient account
 * @param authority - Keypair with mint authority permission
 * @param amount - Number of tokens to mint (in base units)
 * @returns Object containing the transaction signature
 *
 * This function mints new compressed tokens from a previously created mint:
 * 1. Prepares the token data structure required by Light Protocol
 * 2. Fetches active state tree information from the chain
 * 3. Creates a compression instruction to mint tokens directly into the compressed state
 * 4. Assembles and sends the transaction to the blockchain
 */
export const mintCompressedTokens = async (
  connection: Rpc,
  payer: Keypair,
  mint: PublicKey,
  destination: PublicKey, // This is the recipient's *Solana* public key
  authority: Keypair, // Mint authority Keypair
  amount: number // Amount in smallest unit (e.g., lamports for SOL, or base units for token)
): Promise<{ signature: string }> => {
  console.log(`Attempting to mint ${amount} of ${mint.toBase58()} to ${destination.toBase58()}`);

  // Check if authority and payer are the same
  const isAuthoritySameAsPayer = authority.publicKey.equals(payer.publicKey);
  console.log(`Authority is ${isAuthoritySameAsPayer ? 'same as' : 'different from'} payer`);

  // Check if payer has sufficient balance
  const payerBalance = await connection.getBalance(payer.publicKey);
  console.log(`Payer balance: ${payerBalance} lamports`);

  if (payerBalance < 0.01 * 10**9) { // 0.01 SOL in lamports
    throw new Error(`Insufficient funds for transaction. Required: at least 0.01 SOL, Available: ${payerBalance / 10**9} SOL`);
  }

  // 1. Prepare the TokenData for compression
  // The owner of the compressed tokens will be the 'destination' PublicKey.
  // Light Protocol handles creating the necessary leaf in the Merkle tree.
  const tokenData: TokenData = {
    amount: BigInt(amount),
    owner: destination, // The actual owner of the tokens
    delegate: null, // Optional delegate
    state: 0, // Token state (0 for standard token)
    mint: mint, // The mint of the token being compressed
    tlv: Buffer.from([]), // Empty buffer for tlv (Tag-Length-Value) data
  };

  // 2. Get active state tree info with retry logic
  let activeStateTreeInfos: ActiveTreeBundle[] = [];
  let retries = MAX_TRANSACTION_RETRIES;

  while (retries > 0) {
    try {
      // Use type assertion to bypass type checking since implementation may differ
      activeStateTreeInfos = await connection.getCachedActiveStateTreeInfos() as unknown as ActiveTreeBundle[];
      if (!activeStateTreeInfos || activeStateTreeInfos.length === 0) {
        throw new Error('No active state trees found');
      }
      break;
    } catch (error) {
      console.warn(`Failed to get active state trees (retries left: ${retries}):`, error);
      retries--;
      if (retries === 0) {
        throw new Error('Failed to get active state trees after multiple attempts. Cannot mint compressed tokens.');
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // Use the first available active tree's public key
  const treePublicKey = activeStateTreeInfos[0].tree;
  console.log(`Using state tree: ${treePublicKey.toBase58()}`);

  // 3. Create the compress instruction.
  // CompressedTokenProgram.compress handles the interaction with the SPL token program.
  // Use type assertion to bypass property checks since API may have changed
  const compressIx = await CompressedTokenProgram.compress({
    owner: tokenData.owner,
    amount: tokenData.amount,
    mint: tokenData.mint,
    minter: authority.publicKey,
    feePayer: payer.publicKey,
    tree: treePublicKey.toBase58(),
  } as any);

  const instructions = [compressIx];

  // Get latest blockhash with retry on failure
  let recentBlockhash;
  retries = 3;
  while (retries > 0) {
    try {
      recentBlockhash = await connection.getLatestBlockhash();
      break;
    } catch (error) {
      console.warn(`Failed to get recent blockhash (retries left: ${retries}):`, error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: recentBlockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);
  // The `compress` method likely requires the minter (authority) to sign, and payer signs for fees.
  if (isAuthoritySameAsPayer) {
    // If authority and payer are the same, sign once
    transaction.sign([payer]);
  } else {
    // If different, both need to sign
    transaction.sign([payer, authority]);
  }

  // Send transaction with retry logic
  return await sendTransactionWithRetry(
    connection,
    transaction,
    'mint compressed tokens'
  );
};

/**
 * Helper function to send a transaction with retry logic
 *
 * @param connection - Light Protocol RPC connection
 * @param transaction - Versioned transaction to send
 * @param operationName - Name of the operation for logging
 * @param additionalData - Additional data to include in the return object
 * @returns Object containing the transaction signature and any additional data
 */
async function sendTransactionWithRetry(
  connection: Rpc,
  transaction: VersionedTransaction,
  operationName: string,
  additionalData: Record<string, any> = {}
): Promise<{ signature: string } & Record<string, any>> {
  let retries = MAX_TRANSACTION_RETRIES;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      console.log(`Attempting to send ${operationName} transaction (retries left: ${retries})...`);
      const signature = await sendAndConfirmTx(connection, transaction);
      console.log(`${operationName} transaction successful, signature: ${signature}`);
      return { signature, ...additionalData };
    } catch (error) {
      lastError = error as Error;
      console.error(`Error in ${operationName} transaction (retries left: ${retries}):`, error);

      // Check for specific errors that shouldn't be retried
      if (error instanceof SendTransactionError) {
        if (error.message.includes('insufficient funds')) {
          throw new Error(`Insufficient funds for transaction: ${error.message}`);
        }

        if (error.message.includes('blockhash not found')) {
          // Get a new blockhash and rebuild transaction
          try {
            console.log('Updating transaction with a new blockhash...');
            const newBlockhash = await connection.getLatestBlockhash();
            const messageData = transaction.message.serialize();
            const newMessage = TransactionMessage.decompile(messageData);
            newMessage.recentBlockhash = newBlockhash.blockhash;

            // Create a new transaction with the updated blockhash
            const newTransaction = new VersionedTransaction(newMessage.compileToV0Message());
            // Copy the signatures from the original transaction
            transaction.signatures.forEach((signature, index) => {
              newTransaction.signatures[index] = signature;
            });

            transaction = newTransaction;
          } catch (blockHashError) {
            console.error('Error updating blockhash:', blockHashError);
          }
        }
      }

      retries--;
      if (retries === 0) {
        break;
      }

      // Wait before retrying
      console.log(`Waiting ${RETRY_DELAY_MS/1000} seconds before retrying...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // If we've exhausted all retries, throw the last error
  if (lastError) {
    if (lastError instanceof Error) {
      // Check if there are logs in the error
      if (lastError && typeof lastError === 'object' && 'logs' in lastError) {
        console.error('Solana Transaction Logs from error object:', (lastError as any).logs);
      }
    }
    throw new Error(`${operationName} transaction failed after ${MAX_TRANSACTION_RETRIES} attempts: ${lastError.message}`);
  }

  throw new Error(`${operationName} transaction failed for unknown reasons`);
}

/**
 * Transfer compressed tokens between accounts using Light Protocol
 *
 * @param connection - Light Protocol RPC connection instance
 * @param payer - Keypair of the account paying for the transaction fees
 * @param mint - Public key of the token mint
 * @param amount - Number of tokens to transfer (in base units)
 * @param owner - Keypair of the current token owner (source)
 * @param destination - Public key of the recipient account
 * @returns Object containing the transaction signature
 *
 * This function transfers compressed tokens from one account to another:
 * 1. Prepares the token data structure required by Light Protocol
 * 2. Fetches active state tree information from the chain
 * 3. Creates decompress instruction to temporarily decompress the token
 * 4. Creates transfer instruction to move tokens to the new owner
 * 5. Assembles and submits the transaction to the blockchain
 */
export const transferCompressedTokens = async (
  connection: Rpc,
  payer: Keypair,
  mint: PublicKey,
  amount: number,
  owner: Keypair,
  destination: PublicKey
): Promise<{ signature: string }> => {
  console.log(`Transferring ${amount} tokens of mint ${mint.toBase58()} to ${destination.toBase58()}`);

  try {
    // 1. Prepare token data for the transfer
    const tokenData: TokenData = {
      amount: BigInt(amount),
      owner: owner.publicKey, // The current owner
      delegate: null,
      mint: mint,
      state: 0, // Token state (0 for standard token)
      tlv: Buffer.from([]), // Empty buffer for tlv (Tag-Length-Value) data
    };

    // 2. Get active state tree info
    const activeStateTreeInfos = await connection.getCachedActiveStateTreeInfos() as unknown as ActiveTreeBundle[];
    if (!activeStateTreeInfos || activeStateTreeInfos.length === 0) {
      throw new Error('No active state trees found. Cannot transfer compressed tokens.');
    }

    // Use the first available active tree
    const treePublicKey = activeStateTreeInfos[0].tree;

    // 3. Create the transfer instruction
    // We need to decompress the token first and then transfer it
    const decompressIx = await CompressedTokenProgram.decompress({
      owner: owner.publicKey,
      amount: tokenData.amount,
      mint: tokenData.mint,
      treeId: treePublicKey.toBase58(),
      decompressor: owner.publicKey,
      feePayer: payer.publicKey,
    } as any);

    // 4. Create transfer instruction
    const transferIx = await CompressedTokenProgram.transfer({
      source: owner.publicKey,
      destination: destination,
      owner: owner.publicKey,
      amount: tokenData.amount,
      mint: mint,
      feePayer: payer.publicKey,
    } as any);

    // 5. Combine instructions into a transaction
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      instructions: [decompressIx, transferIx],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer, owner]); // Both payer and owner need to sign

    // 6. Send and confirm the transaction with retry logic
    return await sendTransactionWithRetry(
      connection,
      transaction,
      'transfer compressed tokens'
    );
  } catch (error) {
    console.error('Error transferring compressed tokens:', error);
    if (error && typeof error === 'object' && 'logs' in error) {
      console.error('Solana Transaction Logs from error object:', (error as any).logs);
    }
    throw error;
  }
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
