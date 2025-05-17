/**
 * API endpoint for executing specific modules in the Rust-based Substreams package
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

// Convert exec to Promise-based
const execPromise = util.promisify(exec);

// Path to the Substreams package directory
const SUBSTREAMS_PACKAGE_DIR = path.join(process.cwd(), 'substreams');

/**
 * Handler for executing specific Substreams modules
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { module, params } = req.body;

    if (!module) {
      return res.status(400).json({ error: 'Module parameter is required' });
    }

    // Validate module name to prevent command injection
    if (!/^[a-zA-Z0-9_]+$/.test(module)) {
      return res.status(400).json({ error: 'Invalid module name' });
    }

    // Serialize params to JSON for command line
    const paramsJson = JSON.stringify(params || {});

    // Check if the Substreams package directory exists
    if (!fs.existsSync(SUBSTREAMS_PACKAGE_DIR)) {
      console.warn('Substreams package directory not found, using mock data');
      return res.status(200).json(getMockDataForModule(module, params));
    }

    // Execute the Substreams package with the specified module and parameters
    const { stdout, stderr } = await execPromise(
      `cd ${SUBSTREAMS_PACKAGE_DIR} && ./substreams run ${module} --params='${paramsJson}'`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large outputs
    );

    if (stderr) {
      console.warn('Substreams package stderr:', stderr);
    }

    // Parse the output as JSON
    const result = JSON.parse(stdout);

    // Return the result
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error executing Substreams package:', error);

    // Fall back to mock data if execution fails
    console.warn('Falling back to mock data due to execution error');
    const { module, params } = req.body;
    return res.status(200).json(getMockDataForModule(module, params));
  }
}

/**
 * Generate mock data for a specific module
 * @param module The module name
 * @param params The module parameters
 * @returns Mock data for the module
 */
function getMockDataForModule(module: string, params: any): any {
  switch (module) {
    case 'nft_events':
      return getMockNFTEvents(params?.limit || 10);
    case 'nft_events_by_token':
      return getMockNFTEventsByToken(params?.tokenAddress, params?.limit || 10);
    case 'nft_events_by_wallet':
      return getMockNFTEventsByWallet(params?.walletAddress, params?.limit || 10);
    case 'bridge_events':
      return getMockBridgeEvents(params?.limit || 10);
    case 'marketplace_events':
      return getMockMarketplaceEvents(params?.limit || 10);
    case 'nft_collections':
      return getMockNFTCollections(params?.limit || 10);
    case 'account_transactions':
      return getMockAccountTransactions(params?.address, params?.limit || 10);
    default:
      return { error: 'Unknown module', module };
  }
}

/**
 * Generate mock NFT events
 */
function getMockNFTEvents(limit: number): any {
  const events = [];
  const eventTypes = ['mint', 'transfer', 'burn', 'compressed'];
  const walletAddresses = [
    'DYw8jMTrZqRbV3VgZH9HoQ8C9y7KdjcMiUQP5MWN2GQP',
    '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
    'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
    '3yFwqXBfZY4aVpoLbl722DV8hPJJRjGLoEfedDgYsXJP'
  ];
  
  for (let i = 0; i < limit; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const fromAddress = type === 'mint' ? undefined : walletAddresses[Math.floor(Math.random() * walletAddresses.length)];
    const toAddress = type === 'burn' ? undefined : walletAddresses[Math.floor(Math.random() * walletAddresses.length)];
    
    events.push({
      id: `nft-event-${i}-${Date.now()}`,
      type,
      tokenAddress: `SOL${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      fromAddress,
      toAddress,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      transactionHash: `tx${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      blockNumber: 100000000 + Math.floor(Math.random() * 1000000),
      metadata: Math.random() > 0.3 ? {
        name: `NFT #${Math.floor(Math.random() * 10000)}`,
        symbol: 'COSMIC',
        uri: `https://arweave.net/${Math.random().toString(36).substring(2, 10)}`,
        image: `https://arweave.net/${Math.random().toString(36).substring(2, 10)}/image.png`,
        description: 'A Solana OpenAPI NFT.',
        attributes: [
          {
            trait_type: 'Background',
            value: ['Blue', 'Red', 'Green', 'Yellow', 'Purple'][Math.floor(Math.random() * 5)]
          },
          {
            trait_type: 'Rarity',
            value: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 5)]
          }
        ]
      } : undefined
    });
  }
  
  return { events };
}

/**
 * Generate mock NFT events by token
 */
function getMockNFTEventsByToken(tokenAddress: string, limit: number): any {
  const allEvents = getMockNFTEvents(limit * 2).events;
  const filteredEvents = allEvents.map((event: any) => ({
    ...event,
    tokenAddress: tokenAddress || event.tokenAddress
  })).slice(0, limit);
  
  return { events: filteredEvents };
}

/**
 * Generate mock NFT events by wallet
 */
function getMockNFTEventsByWallet(walletAddress: string, limit: number): any {
  const allEvents = getMockNFTEvents(limit * 3).events;
  const filteredEvents = allEvents.map((event: any) => {
    // Ensure this wallet is either the sender or receiver
    if (Math.random() > 0.5) {
      return { ...event, fromAddress: walletAddress };
    } else {
      return { ...event, toAddress: walletAddress };
    }
  }).slice(0, limit);
  
  return { events: filteredEvents };
}

/**
 * Generate mock bridge events
 */
function getMockBridgeEvents(limit: number): any {
  const events = [];
  const eventTypes = ['send', 'receive'];
  const chains = ['Solana', 'Ethereum', 'Avalanche', 'Polygon', 'BNB Chain'];
  const walletAddresses = [
    'DYw8jMTrZqRbV3VgZH9HoQ8C9y7KdjcMiUQP5MWN2GQP',
    '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
    'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
    '3yFwqXBfZY4aVpoLbl722DV8hPJJRjGLoEfedDgYsXJP'
  ];
  const statuses = ['pending', 'completed', 'completed', 'completed', 'failed'];
  
  for (let i = 0; i < limit; i++) {
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
  
  return { events };
}

/**
 * Generate mock marketplace events
 */
function getMockMarketplaceEvents(limit: number): any {
  const events = [];
  const eventTypes = ['listing', 'sale', 'offer', 'cancel'];
  const walletAddresses = [
    'DYw8jMTrZqRbV3VgZH9HoQ8C9y7KdjcMiUQP5MWN2GQP',
    '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
    'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
    '3yFwqXBfZY4aVpoLbl722DV8hPJJRjGLoEfedDgYsXJP'
  ];
  const currencies = ['SOL', 'USDC', 'BONK'];
  
  for (let i = 0; i < limit; i++) {
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
  
  return { events };
}

/**
 * Generate mock NFT collections
 */
function getMockNFTCollections(limit: number): any {
  const collections = [];
  const collectionNames = ['Cosmic', 'Solana Monkeys', 'DeGods', 'Okay Bears', 'Claynosaurz'];
  const collectionSymbols = ['COSMIC', 'SMONK', 'DGOD', 'OKAY', 'CLAY'];
  
  for (let i = 0; i < Math.min(limit, collectionNames.length); i++) {
    collections.push({
      id: `collection-${i}`,
      name: collectionNames[i],
      symbol: collectionSymbols[i],
      totalSupply: 1000 + Math.floor(Math.random() * 9000),
      floorPrice: 1 + Math.random() * 10,
      volume24h: Math.random() * 1000,
      owners: 100 + Math.floor(Math.random() * 900),
      mintCount: 50 + Math.floor(Math.random() * 950),
      transferCount: 100 + Math.floor(Math.random() * 900),
      burnCount: Math.floor(Math.random() * 100)
    });
  }
  
  return { collections };
}

/**
 * Generate mock account transactions
 */
function getMockAccountTransactions(address: string, limit: number): any {
  const transactions = [];
  const types = ['transfer', 'swap', 'stake', 'unstake', 'mint', 'burn'];
  const programIds = [
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token program
    '11111111111111111111111111111111', // System program
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Account program
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', // Metaplex program
    'ComputeBudget111111111111111111111111111111' // Compute budget program
  ];
  
  for (let i = 0; i < limit; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const isOutgoing = Math.random() > 0.5;
    
    transactions.push({
      hash: `tx${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      blockNumber: 100000000 + Math.floor(Math.random() * 1000000),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      from: isOutgoing ? address : `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      to: isOutgoing ? `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}` : address,
      value: (Math.random() * 10).toFixed(9),
      fee: (Math.random() * 0.001).toFixed(9),
      status: Math.random() > 0.1 ? 'success' : 'failed',
      type,
      programId: programIds[Math.floor(Math.random() * programIds.length)]
    });
  }
  
  // Sort by timestamp (newest first)
  transactions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return { transactions };
}
