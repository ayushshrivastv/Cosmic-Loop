import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { MessageStatus } from '@/services/websocket-service';

// Define message type
type CrossChainMessage = {
  id: string;
  sourceChain: string;
  destinationChain: string;
  messageType: string;
  status: MessageStatus;
  timestamp: string;
  data?: any;
};

export async function GET(request: Request) {
  try {
    // Check if this is a new user request
    const { searchParams } = new URL(request.url);
    const isNewUser = searchParams.get('new_user') === 'true';
    
    // In a production environment, we would connect to Solana and fetch real data
    // const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    // const programId = new PublicKey('YOUR_ACTUAL_PROGRAM_ID');
    
    // For now, we'll skip the Solana connection to avoid errors
    
    // In a real implementation, you would:
    // 1. Fetch program accounts to get message records
    // 2. Deserialize the account data to get message details
    // 3. Format the data for the frontend
    
    // For new users, return an empty array of messages
    if (isNewUser) {
      return NextResponse.json({ messages: [] });
    }
    
    // For existing users, return sample data that mimics what would come from the blockchain
    // Generate a consistent set of message IDs based on the current date
    // This ensures we don't create new messages on every API call
    const today = new Date().toISOString().split('T')[0];
    const baseId = `lz-${today.replace(/-/g, '')}`;
    
    const messages: CrossChainMessage[] = [
      {
        id: `${baseId}-1`,
        sourceChain: 'Solana',
        destinationChain: 'Ethereum',
        messageType: 'NFT Data Query',
        status: MessageStatus.COMPLETED,
        timestamp: new Date().toISOString(),
        data: {
          sourceChain: 'Solana',
          destinationChain: 'Ethereum',
          messageType: 'NFT Data Query',
          result: "Query completed successfully",
          details: {
            tokenId: "12345",
            owner: "0x123...abc",
            metadata: {
              name: "Solana NFT #123",
              collection: "SolanaVerse"
            }
          }
        }
      },
      {
        id: `${baseId}-2`,
        sourceChain: 'Ethereum',
        destinationChain: 'Solana',
        messageType: 'Wallet History Query',
        status: MessageStatus.INFLIGHT,
        timestamp: new Date().toISOString(),
        data: {
          sourceChain: 'Ethereum',
          destinationChain: 'Solana',
          messageType: 'Wallet History Query'
        }
      },
      {
        id: `${baseId}-3`,
        sourceChain: 'Avalanche',
        destinationChain: 'Solana',
        messageType: 'Market Activity Query',
        status: MessageStatus.CREATED,
        timestamp: new Date().toISOString(),
        data: {
          sourceChain: 'Avalanche',
          destinationChain: 'Solana',
          messageType: 'Market Activity Query'
        }
      }
    ];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching cross-chain messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cross-chain messages' },
      { status: 500 }
    );
  }
}
