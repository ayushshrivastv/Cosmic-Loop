/**
 * @file route.ts
 * @description API endpoint for requesting test SOL from the faucet
 * This endpoint handles SOL airdrop requests for testing purposes on devnet
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { requestTestSol } from '@/lib/utils/solana-faucet';

// Rate limiting to prevent abuse
const RATE_LIMIT = {
  WINDOW_MS: 1000 * 60 * 60, // 1 hour
  MAX_REQUESTS_PER_IP: 5, // 5 requests per hour per IP
};

// In-memory store for rate limiting (would use Redis in production)
const rateLimitStore: Record<string, { count: number; timestamp: number }> = {};

/**
 * Rate limiting middleware
 * @param req - The incoming request
 * @returns Boolean indicating if the request is allowed
 */
function isRateLimited(req: NextRequest): boolean {
  // Get client IP (or a fallback if not available)
  const clientIp = req.headers.get('x-forwarded-for') ||
                  req.headers.get('x-real-ip') ||
                  'unknown-ip';

  const now = Date.now();

  // If no record exists for this IP, create one
  if (!rateLimitStore[clientIp]) {
    rateLimitStore[clientIp] = { count: 1, timestamp: now };
    return false;
  }

  const record = rateLimitStore[clientIp];

  // If the window has passed, reset the counter
  if (now - record.timestamp > RATE_LIMIT.WINDOW_MS) {
    record.count = 1;
    record.timestamp = now;
    return false;
  }

  // If we're under the limit, increment the counter
  if (record.count < RATE_LIMIT.MAX_REQUESTS_PER_IP) {
    record.count++;
    return false;
  }

  // Otherwise, we're rate limited
  return true;
}

/**
 * POST handler for token faucet
 * Receives wallet address and processes SOL airdrop request
 */
export async function POST(request: NextRequest) {
  // Check rate limiting
  if (isRateLimited(request)) {
    return NextResponse.json(
      {
        success: false,
        message: `Rate limit exceeded. Please try again later. Maximum ${RATE_LIMIT.MAX_REQUESTS_PER_IP} requests per hour.`
      },
      { status: 429 }
    );
  }

  try {
    // Parse the request body
    const data = await request.json() as {
      walletAddress: string;
    };

    const { walletAddress } = data;

    // Validate wallet address
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate public key format
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Process the faucet request
    const result = await requestTestSol(walletAddress, 2); // Request 2 SOL

    if (result.success) {
      return NextResponse.json(result);
    } else {
      // If the built-in faucet failed, try an alternative approach
      // You could implement calls to external faucets here if needed

      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      try {
        // Try one more time with a smaller amount
        const signature = await connection.requestAirdrop(
          new PublicKey(walletAddress),
          LAMPORTS_PER_SOL // Request just 1 SOL this time
        );

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');

        // Check new balance
        const balance = await connection.getBalance(new PublicKey(walletAddress));
        const balanceInSol = balance / LAMPORTS_PER_SOL;

        return NextResponse.json({
          success: true,
          message: `Successfully funded your wallet with 1 SOL! Current balance: ${balanceInSol.toFixed(2)} SOL`,
          txSignature: signature,
          solAmount: balanceInSol,
        });
      } catch (finalError) {
        // If all attempts fail, return instructions for manual funding
        return NextResponse.json({
          success: false,
          message: `Automatic funding failed. Please visit:\n` +
                  `• https://solfaucet.com\n` +
                  `• https://faucet.solana.com\n` +
                  `Enter your wallet address: ${walletAddress}`,
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error in faucet endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}
