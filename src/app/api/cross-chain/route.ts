/**
 * @file route.ts
 * @description API routes for cross-chain operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { CrossChainService } from '../../../services/cross-chain-service';
import { SupportedChain } from '../../../lib/utils/layer-zero';
import { MessageType } from '../../../lib/layerzero/v2-config';

// Initialize Solana connection
const getRpcUrl = () => {
  return process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
};

const getConnection = () => {
  return new Connection(getRpcUrl());
};

// Initialize CrossChainService
const getCrossChainService = () => {
  return new CrossChainService(getConnection());
};

/**
 * Handle POST requests to the cross-chain API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    const crossChainService = getCrossChainService();

    switch (action) {
      case 'query-nft':
        return handleNftQuery(body, crossChainService);
      
      case 'query-wallet':
        return handleWalletQuery(body, crossChainService);
      
      case 'query-market':
        return handleMarketQuery(body, crossChainService);
      
      case 'message-status':
        return handleMessageStatus(body, crossChainService);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle NFT data query
 */
async function handleNftQuery(body: any, service: CrossChainService) {
  const { nftAddress, targetChain, walletAddress } = body;

  if (!nftAddress || !targetChain || !walletAddress) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const result = await service.queryNFTData(
      nftAddress,
      targetChain as SupportedChain,
      walletAddress
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('NFT query error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle wallet history query
 */
async function handleWalletQuery(body: any, service: CrossChainService) {
  const { walletAddress, targetChain, senderWalletAddress } = body;

  if (!walletAddress || !targetChain || !senderWalletAddress) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const result = await service.queryWalletHistory(
      walletAddress,
      targetChain as SupportedChain,
      senderWalletAddress
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Wallet query error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle market activity query
 */
async function handleMarketQuery(body: any, service: CrossChainService) {
  const { marketAddress, targetChain, walletAddress } = body;

  if (!marketAddress || !targetChain || !walletAddress) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const result = await service.queryMarketActivity(
      marketAddress,
      targetChain as SupportedChain,
      walletAddress
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Market query error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle message status query
 */
async function handleMessageStatus(body: any, service: CrossChainService) {
  const { messageId } = body;

  if (!messageId) {
    return NextResponse.json(
      { success: false, error: 'Missing messageId parameter' },
      { status: 400 }
    );
  }

  try {
    const status = await service.getMessageStatus(messageId);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('Message status error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
