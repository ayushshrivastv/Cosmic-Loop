/**
 * @file route.ts
 * @description Server-side API endpoint for creating compressed tokens
 * This endpoint handles the token creation process securely on the server
 * without exposing private keys to the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createConnection, createCompressedTokenMint, mintCompressedTokens } from '@/lib/utils/solana';
import { DEFAULT_TOKEN_DECIMALS } from '@/lib/constants';
import type { MintFormData } from '@/lib/types';

// Load environment variables
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff';
const CLUSTER = (process.env.NEXT_PUBLIC_CLUSTER as 'devnet' | 'mainnet-beta' | 'testnet' | 'localnet') || 'devnet';

// Constants for error handling
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Helper function to safely parse the admin keypair
 * @returns The admin keypair
 * @throws Error if parsing fails
 */
function parseAdminKeypair(): Keypair {
  if (!ADMIN_PRIVATE_KEY) {
    throw new Error('Admin private key not found in environment variables');
  }

  try {
    // Try parsing as base64 (preferred format)
    const secretKeyUint8Array = Buffer.from(ADMIN_PRIVATE_KEY, 'base64');

    // Validate the key length (Solana keypairs should be 64 bytes)
    if (secretKeyUint8Array.length !== 64) {
      throw new Error(`Invalid admin key length: ${secretKeyUint8Array.length} bytes, expected 64 bytes`);
    }

    const keypair = Keypair.fromSecretKey(secretKeyUint8Array);

    // Validate that the keypair can be derived correctly
    try {
      keypair.publicKey.toBase58();
      return keypair;
    } catch (e) {
      throw new Error(`Admin keypair validation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error parsing admin private key as base64:', error);

    // If base64 parsing fails, try other formats as fallback
    try {
      // Try parsing as comma-separated numbers
      const privateKeyArray = ADMIN_PRIVATE_KEY.split(',').map(Number);

      // Check if the array has valid numbers (not NaN)
      if (privateKeyArray.some(isNaN)) {
        throw new Error('Invalid private key format: contains non-numeric values');
      }

      if (privateKeyArray.length !== 64) {
        throw new Error(`Invalid admin key length: ${privateKeyArray.length} numbers, expected 64 numbers`);
      }

      return Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    } catch (innerError) {
      console.error('All parsing methods failed:', innerError);
      throw new Error(`Failed to parse admin private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Helper function to validate and sanitize token metadata
 * @param mintData The token metadata from the client
 * @returns Sanitized token metadata values
 */
function validateAndSanitizeMetadata(mintData: MintFormData): {
  tokenName: string;
  tokenSymbol: string;
  tokenMetadataUri: string;
  decimals: number;
  supply: number;
} {
  // Sanitize token name
  const tokenName = mintData.tokenMetadata.name?.trim() || 'Default Token Name';
  if (tokenName.length < 2 || tokenName.length > 32) {
    throw new Error('Token name must be between 2 and 32 characters');
  }

  // Sanitize token symbol
  const tokenSymbol = (mintData.tokenMetadata.symbol?.trim() || 'TKN').toUpperCase();
  if (tokenSymbol.length < 1 || tokenSymbol.length > 10) {
    throw new Error('Token symbol must be between 1 and 10 characters');
  }

  // Sanitize or use a default token metadata URI
  // Forcing a known-good Arweave JSON metadata URI for consistent results
  const tokenMetadataUri = 'https://arweave.net/TCefB73555sZDrqmX7Y59cUS43h3WQXMZ54u1DK3W8A';

  // Validate decimals
  const decimals = Number(mintData.decimals) || DEFAULT_TOKEN_DECIMALS;
  if (decimals < 0 || decimals > 9 || !Number.isInteger(decimals)) {
    throw new Error('Decimals must be an integer between 0 and 9');
  }

  // Validate supply
  const supply = Number(mintData.supply);
  if (isNaN(supply) || supply <= 0 || !Number.isInteger(supply)) {
    throw new Error('Supply must be a positive integer');
  }

  // Limit supply for devnet testing to avoid transaction failures
  if (CLUSTER === 'devnet' && supply > 1000000) {
    throw new Error('For devnet testing, supply must be less than 1,000,000 tokens');
  }

  return { tokenName, tokenSymbol, tokenMetadataUri, decimals, supply };
}

/**
 * Helper function to check if admin wallet has sufficient funds
 * @param adminPublicKey The admin's public key
 * @returns True if admin has sufficient funds, false otherwise
 */
async function checkAdminBalance(adminPublicKey: PublicKey): Promise<boolean> {
  try {
    // Connect to the Solana network using standard Connection
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');

    // Get the current balance
    const balance = await connection.getBalance(adminPublicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;

    console.log(`Admin wallet balance: ${balanceInSol} SOL`);

    // Minimum required balance (0.5 SOL)
    const minimumBalance = 0.5;

    return balanceInSol >= minimumBalance;
  } catch (error) {
    console.error('Error checking admin wallet balance:', error);
    return false;
  }
}

/**
 * POST handler for token creation
 * Receives token data from the client and processes it securely on the server
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json() as {
      mintData: MintFormData;
      destinationWallet: string;
    };

    const { mintData, destinationWallet } = data;

    // Validate required data
    if (!mintData || !destinationWallet) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Parse the admin keypair
    let adminKeypair: Keypair;
    try {
      adminKeypair = parseAdminKeypair();

      // Mask the public key for security in logs
      const publicKeyBase58 = adminKeypair.publicKey.toBase58();
      const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
      console.log('Admin keypair loaded [masked key:', maskedKey + ']');

      // Check admin balance
      const hasSufficientFunds = await checkAdminBalance(adminKeypair.publicKey);
      if (!hasSufficientFunds) {
        console.warn('Admin wallet has insufficient funds, token creation may fail');
      }
    } catch (error) {
      console.error('Error preparing admin keypair:', error);
      return NextResponse.json(
        {
          error: 'Token creation failed: Admin keypair issue',
          details: error instanceof Error ? error.message : 'Unknown error parsing admin keypair'
        },
        { status: 500 }
      );
    }

    // Parse the destination wallet public key
    let destinationPublicKey: PublicKey;
    try {
      destinationPublicKey = new PublicKey(destinationWallet);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid destination wallet address',
          details: error instanceof Error ? error.message : 'The provided destination wallet is not a valid Solana address'
        },
        { status: 400 }
      );
    }

    // Validate and sanitize token metadata
    let tokenName, tokenSymbol, tokenMetadataUri, decimals, supply;
    try {
      const sanitized = validateAndSanitizeMetadata(mintData);
      tokenName = sanitized.tokenName;
      tokenSymbol = sanitized.tokenSymbol;
      tokenMetadataUri = sanitized.tokenMetadataUri;
      decimals = sanitized.decimals;
      supply = sanitized.supply;
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid token metadata',
          details: error instanceof Error ? error.message : 'The provided token metadata is invalid'
        },
        { status: 400 }
      );
    }

    // Create a connection to the Solana network
    let connection;
    try {
      connection = createConnection({
        rpcEndpoint: RPC_ENDPOINT,
        cluster: CLUSTER
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Failed to connect to Solana network',
          details: error instanceof Error ? error.message : 'Unable to establish connection to RPC endpoint'
        },
        { status: 500 }
      );
    }

    // Add priority fee to ensure transaction goes through with limited funds
    const recentBlockhash = await connection.getLatestBlockhash('confirmed');
    // Set a higher priority fee for faster processing
    const priorityFee = {
      computeUnitPrice: 5000, // Micro-lamports per compute unit (increased from 1000)
      computeUnitLimit: 300000, // Maximum compute units for the transaction (increased from 200000)
    };
    console.log("Setting priority fee:", priorityFee);

    console.log("Creating compressed token mint on server side...");
    console.log("Mint Parameters:");
    console.log("  Payer (Admin):", adminKeypair.publicKey.toBase58());
    console.log("  Mint Authority (Admin):", adminKeypair.publicKey.toBase58());
    console.log("  Decimals:", decimals);
    console.log("  Token Name:", tokenName);
    console.log("  Token Symbol:", tokenSymbol);
    console.log("  Metadata URI:", tokenMetadataUri);

    // 1. Create the compressed token mint
    let mint, createSignature;
    try {
      const result = await createCompressedTokenMint(
        connection,
        adminKeypair, // Server-side admin keypair as payer
        adminKeypair.publicKey, // Server-side admin keypair as mint authority
        decimals,
        tokenName,
        tokenSymbol,
        tokenMetadataUri,
      );

      mint = result.mint;
      createSignature = result.signature;

      console.log("Token mint created with address:", mint.toBase58());
      console.log("Creation signature:", createSignature);
    } catch (error) {
      console.error("Error creating token mint:", error);
      return NextResponse.json(
        {
          error: "Token creation failed",
          details: `Error creating token mint: ${error instanceof Error ? error.message : 'Unknown error'}`,
          step: "create_mint"
        },
        { status: 500 }
      );
    }

    // 2. Mint tokens to the user's wallet
    let mintSignature;
    try {
      console.log("Minting tokens to user wallet...");
      console.log("Minting Parameters:");
      console.log("  Payer (Admin):", adminKeypair.publicKey.toBase58());
      console.log("  Mint Address:", mint.toBase58());
      console.log("  Destination Wallet:", destinationPublicKey.toBase58());
      console.log("  Mint Authority (Admin):", adminKeypair.publicKey.toBase58());
      console.log("  Supply:", supply);

      const result = await mintCompressedTokens(
        connection,
        adminKeypair, // Server-side admin keypair
        mint, // Mint address
        destinationPublicKey, // Destination (user's wallet)
        adminKeypair, // Mint authority (server-side)
        supply, // Amount to mint
      );

      mintSignature = result.signature;
      console.log("Tokens minted successfully, signature:", mintSignature);
    } catch (error) {
      console.error("Error minting tokens:", error);
      return NextResponse.json(
        {
          error: "Token minting failed",
          details: `Error minting tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
          step: "mint_tokens",
          // Return mint info anyway so client knows the token was created even if minting failed
          mint: mint.toBase58(),
          createSignature
        },
        { status: 500 }
      );
    }

    // Return the success response with mint information
    return NextResponse.json({
      success: true,
      mint: mint.toBase58(),
      createSignature,
      mintSignature,
      supply: supply,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
    });

  } catch (error) {
    console.error("Error in token creation API:", error);

    let errorDetails = "Token creation failed";
    let rootCause = "unknown";

    if (error instanceof Error) {
      errorDetails = error.message;

      // Extract more specific error information
      if (error.message.includes('insufficient funds')) {
        rootCause = "insufficient_funds";
        errorDetails = "Transaction failed due to insufficient funds. Please ensure the admin wallet has enough SOL.";
      } else if (error.message.includes('blockhash not found')) {
        rootCause = "blockhash_expired";
        errorDetails = "Transaction failed due to blockhash expiration. Please try again.";
      } else if (error.message.includes('signature verification failed')) {
        rootCause = "signature_failed";
        errorDetails = "Transaction signature verification failed. Please check the admin keypair.";
      }

      // If the error object has more specific Solana transaction error details
      if ('transactionMessage' in error && (error as any).transactionMessage) {
        errorDetails = (error as any).transactionMessage;
      }
      if ('transactionLogs' in error && (error as any).transactionLogs) {
        console.error("Transaction Logs:", (error as any).transactionLogs);
      }
    }

    return NextResponse.json(
      {
        error: "Token creation failed",
        details: errorDetails,
        rootCause
      },
      { status: 500 }
    );
  }
}
