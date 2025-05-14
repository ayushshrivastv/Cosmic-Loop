import axios from 'axios';

// Define interfaces for the substreams data
export interface NFTEvent {
  id: string;
  type: 'mint' | 'transfer' | 'burn' | 'compressed';
  tokenAddress: string;
  fromAddress?: string;
  toAddress?: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: number;
  metadata?: {
    name?: string;
    symbol?: string;
    uri?: string;
    image?: string;
    description?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
}

export interface BridgeEvent {
  id: string;
  type: 'send' | 'receive';
  tokenAddress: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface MarketplaceEvent {
  id: string;
  type: 'listing' | 'sale' | 'offer' | 'cancel';
  tokenAddress: string;
  sellerAddress?: string;
  buyerAddress?: string;
  price?: string;
  currency?: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: number;
}

// Configuration for the substreams endpoint
const SUBSTREAMS_API_URL = process.env.NEXT_PUBLIC_SUBSTREAMS_API_URL || 'https://api.thegraph.com/substreams';
const SUBSTREAMS_API_KEY = process.env.NEXT_PUBLIC_SUBSTREAMS_API_KEY || '';

/**
 * Service for interacting with The Graph Substreams for Solana data
 */
export class SubstreamsService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string = SUBSTREAMS_API_URL, apiKey: string = SUBSTREAMS_API_KEY) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Fetch recent NFT events from Substreams
   * @param limit Maximum number of events to fetch
   * @returns Array of NFT events
   */
  async getNFTEvents(limit: number = 10): Promise<NFTEvent[]> {
    try {
      // In a real implementation, this would query the actual substreams endpoint
      // For now, we'll return mock data based on the substreams schema
      console.log(`Fetching ${limit} NFT events from Substreams`);
      
      // Mock data for development
      return this.getMockNFTEvents(limit);
    } catch (error) {
      console.error('Error fetching NFT events from Substreams:', error);
      throw error;
    }
  }

  /**
   * Fetch NFT events for a specific token
   * @param tokenAddress The token address to query
   * @param limit Maximum number of events to fetch
   * @returns Array of NFT events for the token
   */
  async getNFTEventsByToken(tokenAddress: string, limit: number = 10): Promise<NFTEvent[]> {
    try {
      console.log(`Fetching ${limit} NFT events for token ${tokenAddress} from Substreams`);
      
      // Mock data for development
      const events = this.getMockNFTEvents(limit * 2);
      return events.filter(event => event.tokenAddress === tokenAddress).slice(0, limit);
    } catch (error) {
      console.error(`Error fetching NFT events for token ${tokenAddress}:`, error);
      throw error;
    }
  }

  /**
   * Fetch NFT events for a specific wallet address
   * @param walletAddress The wallet address to query
   * @param limit Maximum number of events to fetch
   * @returns Array of NFT events for the wallet
   */
  async getNFTEventsByWallet(walletAddress: string, limit: number = 10): Promise<NFTEvent[]> {
    try {
      console.log(`Fetching ${limit} NFT events for wallet ${walletAddress} from Substreams`);
      
      // Mock data for development
      const events = this.getMockNFTEvents(limit * 3);
      return events
        .filter(event => 
          event.fromAddress === walletAddress || 
          event.toAddress === walletAddress
        )
        .slice(0, limit);
    } catch (error) {
      console.error(`Error fetching NFT events for wallet ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Fetch recent bridge events from Substreams
   * @param limit Maximum number of events to fetch
   * @returns Array of bridge events
   */
  async getBridgeEvents(limit: number = 10): Promise<BridgeEvent[]> {
    try {
      console.log(`Fetching ${limit} bridge events from Substreams`);
      
      // Mock data for development
      return this.getMockBridgeEvents(limit);
    } catch (error) {
      console.error('Error fetching bridge events from Substreams:', error);
      throw error;
    }
  }

  /**
   * Fetch recent marketplace events from Substreams
   * @param limit Maximum number of events to fetch
   * @returns Array of marketplace events
   */
  async getMarketplaceEvents(limit: number = 10): Promise<MarketplaceEvent[]> {
    try {
      console.log(`Fetching ${limit} marketplace events from Substreams`);
      
      // Mock data for development
      return this.getMockMarketplaceEvents(limit);
    } catch (error) {
      console.error('Error fetching marketplace events from Substreams:', error);
      throw error;
    }
  }

  /**
   * Generate mock NFT events for development
   * @param count Number of events to generate
   * @returns Array of mock NFT events
   */
  private getMockNFTEvents(count: number): NFTEvent[] {
    const events: NFTEvent[] = [];
    const eventTypes: Array<'mint' | 'transfer' | 'burn' | 'compressed'> = ['mint', 'transfer', 'burn', 'compressed'];
    const walletAddresses = [
      'DYw8jMTrZqRbV3VgZH9HoQ8C9y7KdjcMiUQP5MWN2GQP',
      '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
      'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
      '3yFwqXBfZY4aVpoLbl722DV8hPJJRjGLoEfedDgYsXJP'
    ];
    
    // Create a set of consistent token addresses for filtering
    const tokenAddresses = [];
    for (let i = 0; i < 20; i++) {
      tokenAddresses.push(`SOL${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`);
    }
    
    for (let i = 0; i < count; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      // Use a consistent token address from our pre-generated list
      const tokenAddress = tokenAddresses[i % tokenAddresses.length];
      const fromAddress = type !== 'mint' ? walletAddresses[Math.floor(Math.random() * walletAddresses.length)] : undefined;
      const toAddress = type !== 'burn' ? walletAddresses[Math.floor(Math.random() * walletAddresses.length)] : undefined;
      
      events.push({
        id: `nft-event-${i}-${Date.now()}`,
        type,
        tokenAddress,
        fromAddress,
        toAddress,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        transactionHash: `tx${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
        blockNumber: 100000000 + Math.floor(Math.random() * 1000000),
        metadata: type === 'mint' || type === 'compressed' ? {
          name: `NFT #${Math.floor(Math.random() * 10000)}`,
          symbol: 'COSMIC',
          uri: `https://arweave.net/${Math.random().toString(36).substring(2, 10)}`,
          image: `https://picsum.photos/seed/${Math.random()}/200/200`,
          description: 'A Cosmic Loop NFT',
          attributes: [
            { trait_type: 'Background', value: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'][Math.floor(Math.random() * 5)] },
            { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 5)] }
          ]
        } : undefined
      });
    }
    
    return events;
  }

  /**
   * Generate mock bridge events for development
   * @param count Number of events to generate
   * @returns Array of mock bridge events
   */
  private getMockBridgeEvents(count: number): BridgeEvent[] {
    const events: BridgeEvent[] = [];
    const eventTypes: Array<'send' | 'receive'> = ['send', 'receive'];
    const chains = ['Solana', 'Ethereum', 'Avalanche', 'Polygon', 'BNB Chain'];
    const walletAddresses = [
      'DYw8jMTrZqRbV3VgZH9HoQ8C9y7KdjcMiUQP5MWN2GQP',
      '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
      'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
      '3yFwqXBfZY4aVpoLbl722DV8hPJJRjGLoEfedDgYsXJP'
    ];
    const statuses: Array<'pending' | 'completed' | 'failed'> = ['pending', 'completed', 'completed', 'completed', 'failed'];
    
    for (let i = 0; i < count; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const fromChain = chains[Math.floor(Math.random() * chains.length)];
      let toChain;
      do {
        toChain = chains[Math.floor(Math.random() * chains.length)];
      } while (toChain === fromChain);
      
      events.push({
        id: `bridge-event-${i}-${Date.now()}`,
        type,
        tokenAddress: `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
        fromChain,
        toChain,
        fromAddress: walletAddresses[Math.floor(Math.random() * walletAddresses.length)],
        toAddress: walletAddresses[Math.floor(Math.random() * walletAddresses.length)],
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        transactionHash: `tx${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
        blockNumber: 100000000 + Math.floor(Math.random() * 1000000),
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
    
    return events;
  }

  /**
   * Generate mock marketplace events for development
   * @param count Number of events to generate
   * @returns Array of mock marketplace events
   */
  private getMockMarketplaceEvents(count: number): MarketplaceEvent[] {
    const events: MarketplaceEvent[] = [];
    const eventTypes: Array<'listing' | 'sale' | 'offer' | 'cancel'> = ['listing', 'sale', 'offer', 'cancel'];
    const walletAddresses = [
      'DYw8jMTrZqRbV3VgZH9HoQ8C9y7KdjcMiUQP5MWN2GQP',
      '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
      'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
      '3yFwqXBfZY4aVpoLbl722DV8hPJJRjGLoEfedDgYsXJP'
    ];
    const currencies = ['SOL', 'USDC', 'BONK'];
    
    for (let i = 0; i < count; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const sellerAddress = type !== 'offer' ? walletAddresses[Math.floor(Math.random() * walletAddresses.length)] : undefined;
      const buyerAddress = type === 'sale' || type === 'offer' ? walletAddresses[Math.floor(Math.random() * walletAddresses.length)] : undefined;
      
      events.push({
        id: `marketplace-event-${i}-${Date.now()}`,
        type,
        tokenAddress: `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
        sellerAddress,
        buyerAddress,
        price: type !== 'cancel' ? (Math.random() * 100).toFixed(4) : undefined,
        currency: type !== 'cancel' ? currencies[Math.floor(Math.random() * currencies.length)] : undefined,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        transactionHash: `tx${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
        blockNumber: 100000000 + Math.floor(Math.random() * 1000000)
      });
    }
    
    return events;
  }
}

// Export a singleton instance
export const substreamsService = new SubstreamsService();
