/**
 * @file route.ts
 * @description API route for cross-chain statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { CrossChainService } from '../../../../services/cross-chain-service';
import { SupportedChain } from '../../../../lib/utils/layer-zero';

// Initialize CrossChainService
const getCrossChainService = () => {
  // For API routes, we can use a mock Connection since we're not actually connecting to a blockchain
  const mockConnection = {
    commitment: 'confirmed',
    rpcEndpoint: 'https://api.devnet.solana.com',
    getMinimumBalanceForRentExemption: async () => 1000000, // Mock value
    // Add other required methods as needed
  } as unknown as Connection;
  
  return new CrossChainService(mockConnection);
};

/**
 * Handle GET requests to fetch cross-chain statistics
 */
export async function GET(request: NextRequest) {
  try {
    const crossChainService = getCrossChainService();
    
    // In a production environment, these stats would be fetched from a database
    // For now, we'll use mock data
    const stats = {
      totalMessages: 12,
      pendingMessages: 3,
      completedMessages: 8,
      failedMessages: 1,
      supportedChains: Object.keys(SupportedChain).filter(key => isNaN(Number(key))).length / 2,
      messagesByChain: {
        'Ethereum': 5,
        'Solana': 4,
        'Arbitrum': 2,
        'Optimism': 1
      },
      recentMessages: [
        {
          id: 'msg-' + Date.now() + '-1',
          type: 'NFT_DATA',
          sourceChain: 'Ethereum',
          destinationChain: 'Solana',
          status: 'COMPLETED',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg-' + Date.now() + '-2',
          type: 'WALLET_HISTORY',
          sourceChain: 'Solana',
          destinationChain: 'Arbitrum',
          status: 'PENDING',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'msg-' + Date.now() + '-3',
          type: 'MARKET_ACTIVITY',
          sourceChain: 'Optimism',
          destinationChain: 'Solana',
          status: 'FAILED',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
