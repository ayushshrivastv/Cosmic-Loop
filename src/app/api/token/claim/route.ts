/**
 * @file route.ts
 * @description Server-side API endpoint for claiming compressed tokens
 * This endpoint handles the token claiming process securely on the server
 * without exposing private keys to the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { Keypair, PublicKey } from '@solana/web3.js';
import { createConnection, transferCompressedTokens } from '@/lib/utils/solana';

// Load environment variables
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
const CLUSTER = (process.env.NEXT_PUBLIC_CLUSTER as 'devnet' | 'mainnet-beta' | 'testnet' | 'localnet') || 'devnet';

/**
 * POST handler for token claiming
 * Receives token data from the client and processes it securely on the server
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json() as {
      mint: string;
      destination: string;
    };

    const { mint, destination } = data;

    // Validate required data
    if (!mint || !destination) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    console.log(`Attempting to claim token with mint ${mint} for destination ${destination}`);

    // Parse the admin keypair for signing
    let adminKeypair: Keypair;

    try {
      if (ADMIN_PRIVATE_KEY) {
        // Try parsing as comma-separated numbers first
        try {
          const privateKeyArray = ADMIN_PRIVATE_KEY.split(',').map(Number);
          // Check if the array has valid numbers (not NaN)
          if (privateKeyArray.some(isNaN)) throw new Error('Invalid private key format');
          adminKeypair = Keypair.fromSecretKey(Buffer.from(privateKeyArray));
        } catch (e) {
          // If that fails, try parsing as a base64 encoded string
          console.log('Trying alternative private key format...');
          adminKeypair = Keypair.fromSecretKey(Buffer.from(ADMIN_PRIVATE_KEY, 'base64'));
        }
      } else {
        // Fallback for demo - generate a new keypair
        console.log('No admin private key found, generating a new keypair for demo purposes');
        adminKeypair = Keypair.generate();
      }

      console.log('Admin public key:', adminKeypair.publicKey.toBase58());
    } catch (error) {
      console.error('Error parsing admin private key:', error);
      // Generate a new keypair as fallback
      console.log('Falling back to generated keypair');
      adminKeypair = Keypair.generate();
    }

    // Parse the mint and destination public keys
    const mintPublicKey = new PublicKey(mint);
    const destinationPublicKey = new PublicKey(destination);

    // Create a connection to the Solana network
    const connection = createConnection({
      rpcEndpoint: RPC_ENDPOINT,
      cluster: CLUSTER
    });

    console.log("Transferring token from admin to destination wallet...");

    // Token amount to transfer (typically 1 for NFTs or compressed tokens)
    const amountToTransfer = 1;

    // Execute the token transfer
    const { signature } = await transferCompressedTokens(
      connection,
      adminKeypair, // Server-side admin keypair as fee payer
      mintPublicKey, // The token mint
      amountToTransfer, // Amount to transfer (usually 1 for NFTs)
      adminKeypair, // Owner keypair (in this case, the admin is the token owner)
      destinationPublicKey // Destination (user's wallet)
    );

    console.log("Token transferred successfully, signature:", signature);

    // Return the success response with transfer information
    return NextResponse.json({
      success: true,
      mint: mintPublicKey.toBase58(),
      destination: destinationPublicKey.toBase58(),
      signature,
      amount: amountToTransfer,
    });

  } catch (error) {
    console.error("Error in token claim API:", error);

    // Extract detailed error information
    let errorMessage = 'Token claim failed';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific Solana transaction errors
      if (error.message.includes('Transaction signature verification failure')) {
        errorDetails = 'This may be due to an invalid admin keypair or insufficient funds. Please check your environment variables and wallet balance.';
      } else if (error.message.includes('Simulation failed')) {
        errorDetails = 'The transaction simulation failed. This could be due to program constraints or invalid parameters.';
      } else if (error.message.includes('blockhash')) {
        errorDetails = 'Recent blockhash error. The transaction may have expired. Please try again.';
      } else if (error.message.includes('0x1')) {
        errorDetails = 'Insufficient funds to pay for transaction fees. Please add SOL to the admin wallet.';
      }

      // Include stack trace in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', error.stack);
      }
    } else {
      errorDetails = String(error);
    }

    // Return a detailed error response
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails || String(error),
        success: false
      },
      { status: 500 }
    );
  }
}
