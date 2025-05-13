/**
 * @file api-client.ts
 * @description GraphQL API client for the Cosmic Loop frontend
 * Enhanced with caching, improved error handling, and retry logic
 */

import { SupportedChain } from './utils/layer-zero';
import { toast } from 'sonner';

// Backend API endpoint
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/graphql';
const WS_ENDPOINT = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:3001/ws';

// Error classes for better error handling
export class ApiError extends Error {
  status?: number;
  graphqlErrors?: any[];

  constructor(message: string, status?: number, graphqlErrors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.graphqlErrors = graphqlErrors;
  }
}

// Cache implementation
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL_MS = 30000; // 30 seconds default TTL

  public get<T>(key: string, ttl: number = this.DEFAULT_TTL_MS): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public invalidateAll(): void {
    this.cache.clear();
  }
}

// Create a cache instance
const queryCache = new QueryCache();

// Function to create a cache key
function createCacheKey(query: string, variables?: Record<string, any>): string {
  return JSON.stringify({ query, variables });
}

/**
 * Execute a GraphQL query with retry logic and caching
 *
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @param token - Authentication token (optional)
 * @param options - Additional options
 * @returns Query result
 */
export async function executeQuery<T = any>(
  query: string,
  variables?: Record<string, any>,
  token?: string,
  options?: {
    useCache?: boolean;
    cacheTtl?: number;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> {
  // Default options
  const {
    useCache = true,
    cacheTtl = 30000,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000
  } = options || {};

  // Check cache if enabled
  if (useCache) {
    const cacheKey = createCacheKey(query, variables);
    const cachedData = queryCache.get<T>(cacheKey, cacheTtl);
    if (cachedData) {
      return cachedData;
    }
  }

  // Retry logic
  let lastError: any;
  for (let attempt = 0; attempt <= (retry ? maxRetries : 0); attempt++) {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new ApiError(
          `API error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const result = await response.json();

      if (result.errors) {
        throw new ApiError(
          `GraphQL error: ${result.errors.map((e: any) => e.message).join(', ')}`,
          response.status,
          result.errors
        );
      }

      // Cache successful response if caching is enabled
      if (useCache) {
        const cacheKey = createCacheKey(query, variables);
        queryCache.set(cacheKey, result.data as T);
      }

      return result.data as T;
    } catch (error) {
      lastError = error;

      // If this is the last retry attempt, don't wait
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  // All retries failed, show error toast and throw
  if (lastError instanceof ApiError) {
    toast.error('API Request Failed', {
      description: lastError.message,
      duration: 5000,
    });
  } else {
    toast.error('Network Error', {
      description: 'Failed to communicate with the server',
      duration: 5000,
    });
  }

  throw lastError;
}

/**
 * Execute a GraphQL mutation
 *
 * @param mutation - GraphQL mutation string
 * @param variables - Mutation variables
 * @param token - Authentication token (optional)
 * @param options - Additional options
 * @returns Mutation result
 */
export async function executeMutation<T = any>(
  mutation: string,
  variables?: Record<string, any>,
  token?: string,
  options?: {
    invalidateCache?: boolean | string[];
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> {
  // Default options
  const {
    invalidateCache = false,
    retry = true,
    maxRetries = 2,
    retryDelay = 500
  } = options || {};

  try {
    // Mutations don't use cache for the request, but set useCache to false
    const result = await executeQuery<T>(mutation, variables, token, {
      useCache: false,
      retry,
      maxRetries,
      retryDelay
    });

    // Invalidate cache based on the option
    if (invalidateCache === true) {
      // Invalidate entire cache
      queryCache.invalidateAll();
    } else if (Array.isArray(invalidateCache)) {
      // Invalidate specific cache entries
      invalidateCache.forEach(key => queryCache.invalidate(key));
    }

    return result;
  } catch (error) {
    // Rethrow the error after logging
    console.error('Mutation error:', error);
    throw error;
  }
}

/**
 * Debounce a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Create a WebSocket connection for GraphQL subscriptions
 * Enhanced with reconnect logic and better error handling
 *
 * @param subscriptionQuery - GraphQL subscription query
 * @param variables - Subscription variables
 * @param onMessage - Callback for received messages
 * @param token - Authentication token (optional)
 * @returns WebSocket client and unsubscribe function
 */
export function createSubscription<T = any>(
  subscriptionQuery: string,
  variables: Record<string, any>,
  onMessage: (data: T) => void,
  token?: string
): { unsubscribe: () => void } {
  const url = new URL(WS_ENDPOINT);

  if (token) {
    url.searchParams.append('token', token);
  }

  let socket: WebSocket | null = null;
  let subscriptionId: string | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let pingInterval: NodeJS.Timeout | null = null;
  let isUnsubscribed = false;

  // Function to connect the WebSocket
  const connect = () => {
    if (isUnsubscribed) return;

    socket = new WebSocket(url.toString());

    socket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0;

      // Send subscription request
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'subscribe',
          payload: {
            channel: parseSubscriptionName(subscriptionQuery),
            filters: variables,
          },
        }));
      }

      // Set up ping interval to keep connection alive
      pingInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'subscribed') {
          subscriptionId = message.data.channel;
        } else if (message.type === 'error') {
          console.error('Subscription error:', message.data.message);
          toast.error('Subscription Error', {
            description: message.data.message || 'Error receiving updates',
            duration: 5000,
          });
        } else if (message.type !== 'pong') {
          // Handle regular message
          onMessage(message.data as T);
        }
      } catch (error) {
        console.error('Error processing subscription message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection Error', {
        description: 'Error connecting to update service',
        duration: 5000,
      });
    };

    socket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);

      // Clean up ping interval
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }

      // Attempt to reconnect if not deliberately unsubscribed
      if (!isUnsubscribed && reconnectAttempts < 5) {
        reconnectAttempts++;
        const delay = Math.min(1000 * reconnectAttempts, 5000);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`);

        reconnectTimeout = setTimeout(() => {
          connect();
        }, delay);
      }
    };
  };

  // Initial connection
  connect();

  return {
    unsubscribe: () => {
      isUnsubscribed = true;

      // Clear any pending reconnect
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      // Clear ping interval
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }

      // Unsubscribe from channel if applicable
      if (subscriptionId && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'unsubscribe',
          payload: {
            channel: subscriptionId,
          },
        }));
      }

      // Close connection
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
        socket = null;
      }
    },
  };
}

/**
 * Extract subscription name from GraphQL query
 *
 * @param query - GraphQL subscription query
 * @returns Subscription name
 */
function parseSubscriptionName(query: string): string {
  // Simple parser to extract subscription name
  const match = query.match(/subscription\\s+(?:\\w+\\s*)?{?\\s*(\\w+)/) ||
                query.match(/subscription\s+(?:\w+\s*)?\{\s*(\w+)/);
  return match ? match[1] : 'subscription';
}

// NFT-related API functions

/**
 * Get NFTs owned by a specific address
 *
 * @param ownerAddress - Owner wallet address
 * @param chain - Blockchain (optional)
 * @param limit - Maximum number of NFTs to return (optional)
 * @param offset - Pagination offset (optional)
 * @returns Array of NFTs
 */
export async function getNFTsByOwner(
  ownerAddress: string,
  chain?: SupportedChain,
  limit = 10,
  offset = 0
) {
  const query = `
    query GetNFTsByOwner($ownerAddress: String!, $chain: Chain, $limit: Int, $offset: Int) {
      nftsByOwner(ownerAddress: $ownerAddress, chain: $chain, limit: $limit, offset: $offset) {
        id
        tokenId
        ownerAddress
        uri
        metadata
        chain
        contractAddress
        isCompressed
        createdAt
        collection {
          id
          name
          symbol
        }
      }
    }
  `;

  const variables = {
    ownerAddress,
    chain: chain ? chain.toUpperCase() : undefined,
    limit,
    offset,
  };

  const result = await executeQuery<{ nftsByOwner: any[] }>(query, variables, undefined, {
    // Cache NFTs for a shorter time, as they may change frequently
    cacheTtl: 15000
  });

  return result.nftsByOwner;
}

/**
 * Get bridge operations for a specific NFT
 *
 * @param nftId - NFT ID
 * @returns Array of bridge operations
 */
export async function getNFTBridgeHistory(nftId: string) {
  const query = `
    query GetNFTBridgeHistory($nftId: ID!) {
      bridgeOperations(nftId: $nftId) {
        id
        sourceChain
        sourceAddress
        destinationChain
        destinationAddress
        sourceTransactionHash
        destinationTransactionHash
        status
        completedAt
        createdAt
      }
    }
  `;

  const variables = {
    nftId,
  };

  try {
    const result = await executeQuery<{ bridgeOperations: any[] }>(query, variables);
    return result.bridgeOperations;
  } catch (error) {
    console.error('Error fetching bridge history:', error);
    // Return empty array instead of throwing, so UI can still render
    return [];
  }
}

/**
 * Bridge an NFT to another chain
 *
 * @param nftId - NFT ID
 * @param sourceChain - Source blockchain
 * @param sourceAddress - Source wallet address
 * @param destinationChain - Destination blockchain
 * @param destinationAddress - Destination wallet address
 * @returns Bridge operation details
 */
export async function bridgeNFT(
  nftId: string,
  sourceChain: SupportedChain,
  sourceAddress: string,
  destinationChain: SupportedChain,
  destinationAddress: string
) {
  const mutation = `
    mutation BridgeNFT(
      $nftId: ID!
      $sourceChain: Chain!
      $sourceAddress: String!
      $destinationChain: Chain!
      $destinationAddress: String!
    ) {
      bridgeNFT(
        nftId: $nftId
        sourceChain: $sourceChain
        sourceAddress: $sourceAddress
        destinationChain: $destinationChain
        destinationAddress: $destinationAddress
      ) {
        id
        sourceChain
        destinationChain
        status
        createdAt
      }
    }
  `;

  const variables = {
    nftId,
    sourceChain: sourceChain.toUpperCase(),
    sourceAddress,
    destinationChain: destinationChain.toUpperCase(),
    destinationAddress,
  };

  // This is a mutation that should invalidate the NFT cache
  const nftCacheKey = createCacheKey(`GetNFTsByOwner`, { ownerAddress: sourceAddress });
  const result = await executeMutation<{ bridgeNFT: any }>(mutation, variables, undefined, {
    invalidateCache: [nftCacheKey]
  });

  return result.bridgeNFT;
}

/**
 * Estimate bridge fee for NFT transfer
 *
 * @param sourceChain - Source blockchain
 * @param destinationChain - Destination blockchain
 * @param nftId - NFT ID
 * @returns Fee estimate details
 */
export async function estimateBridgeFee(
  sourceChain: SupportedChain,
  destinationChain: SupportedChain,
  nftId: string
) {
  const query = `
    query EstimateBridgeFee($sourceChain: Chain!, $destinationChain: Chain!, $nftId: ID!) {
      estimateBridgeFee(
        sourceChain: $sourceChain
        destinationChain: $destinationChain
        nftId: $nftId
      ) {
        sourceChain
        destinationChain
        estimatedFee
        feeToken
        estimatedTimeSeconds
      }
    }
  `;

  const variables = {
    sourceChain: sourceChain.toUpperCase(),
    destinationChain: destinationChain.toUpperCase(),
    nftId,
  };

  // Use short cache TTL for fee estimates
  const result = await executeQuery<{ estimateBridgeFee: any }>(query, variables, undefined, {
    cacheTtl: 20000
  });

  return result.estimateBridgeFee;
}

/**
 * Subscribe to bridge operation updates
 *
 * @param bridgeOperationId - Bridge operation ID to monitor
 * @param onUpdate - Callback for bridge updates
 * @returns Unsubscribe function
 */
export function subscribeToBridgeUpdates(
  bridgeOperationId: string,
  onUpdate: (data: any) => void
) {
  const subscription = `
    subscription BridgeOperationUpdated($bridgeOperationId: ID!) {
      bridgeOperationUpdated(bridgeOperationId: $bridgeOperationId) {
        id
        status
        sourceTransactionHash
        destinationTransactionHash
        errorMessage
        completedAt
        updatedAt
      }
    }
  `;

  const variables = {
    bridgeOperationId,
  };

  return createSubscription(subscription, variables, onUpdate);
}

/**
 * Get supported chains for bridging
 *
 * @returns Array of supported chain information
 */
export async function getSupportedChains() {
  const query = `
    query GetSupportedChains {
      supportedChains {
        chain
        name
        logo
        isEVM
        rpcEndpoint
        explorerUrl
        nativeToken
        isSupported
      }
    }
  `;

  // Cache supported chains for a longer time
  const result = await executeQuery<{ supportedChains: any[] }>(query, undefined, undefined, {
    cacheTtl: 600000 // 10 minutes
  });

  return result.supportedChains;
}

// Event-related API functions

/**
 * Get active events (e.g., NFT airdrops, distribution events)
 *
 * @param chain - Filter by blockchain (optional)
 * @param limit - Maximum number of events to return
 * @param offset - Pagination offset
 * @returns Array of active events
 */
export async function getActiveEvents(
  chain?: SupportedChain,
  limit = 10,
  offset = 0
) {
  const query = `
    query GetActiveEvents($chain: Chain, $limit: Int, $offset: Int) {
      activeEvents(chain: $chain, limit: $limit, offset: $offset) {
        id
        name
        description
        targetChains
        startDate
        endDate
        status
        maxParticipants
        nftCollection {
          id
          name
          symbol
        }
        createdAt
      }
    }
  `;

  const variables = {
    chain: chain ? chain.toUpperCase() : undefined,
    limit,
    offset,
  };

  const result = await executeQuery<{ activeEvents: any[] }>(query, variables);
  return result.activeEvents;
}

/**
 * Register for an event to receive an NFT
 *
 * @param eventId - Event ID
 * @param walletAddress - Participant wallet address
 * @returns Event participation details
 */
export async function registerForEvent(
  eventId: string,
  walletAddress: string
) {
  const mutation = `
    mutation RegisterForEvent($eventId: ID!, $walletAddress: String!) {
      registerForEvent(eventId: $eventId, walletAddress: $walletAddress) {
        id
        walletAddress
        hasClaimed
        createdAt
        event {
          id
          name
        }
      }
    }
  `;

  const variables = {
    eventId,
    walletAddress,
  };

  try {
    // Invalidate active events on successful registration
    const result = await executeMutation<{ registerForEvent: any }>(mutation, variables, undefined, {
      invalidateCache: true
    });

    // Show success toast
    toast.success('Successfully registered for event', {
      description: `You've been registered for ${result.registerForEvent.event.name}`,
      duration: 5000,
    });

    return result.registerForEvent;
  } catch (error) {
    // Error toast handled in executeQuery/executeMutation
    throw error;
  }
}

/**
 * Claim an NFT from an event
 *
 * @param eventId - Event ID
 * @param walletAddress - Participant wallet address
 * @param chain - Blockchain to receive the NFT
 * @returns Event participation details with claimed NFT
 */
export async function claimEventNFT(
  eventId: string,
  walletAddress: string,
  chain: SupportedChain
) {
  const mutation = `
    mutation ClaimEventNFT($eventId: ID!, $walletAddress: String!, $chain: Chain!) {
      claimEventNFT(eventId: $eventId, walletAddress: $walletAddress, chain: $chain) {
        id
        walletAddress
        hasClaimed
        claimedAt
        claimTransactionHash
        claimedNft {
          id
          tokenId
          chain
          contractAddress
        }
      }
    }
  `;

  const variables = {
    eventId,
    walletAddress,
    chain: chain.toUpperCase(),
  };

  try {
    // Invalidate NFTs cache for this wallet after claiming
    const nftCacheKey = createCacheKey(`GetNFTsByOwner`, { ownerAddress: walletAddress });
    const result = await executeMutation<{ claimEventNFT: any }>(mutation, variables, undefined, {
      invalidateCache: [nftCacheKey]
    });

    // Show success toast
    toast.success('Successfully claimed NFT', {
      description: 'Your NFT has been claimed and added to your wallet',
      duration: 5000,
    });

    return result.claimEventNFT;
  } catch (error) {
    // Error toast handled in executeQuery/executeMutation
    throw error;
  }
}

// Export interfaces for TypeScript
export interface NFT {
  id: string;
  tokenId: number;
  ownerAddress: string;
  uri: string;
  metadata: any;
  chain: SupportedChain;
  contractAddress: string;
  isCompressed: boolean;
  createdAt: string;
  collection: {
    id: string;
    name: string;
    symbol: string;
  };
}

export interface BridgeOperation {
  id: string;
  sourceChain: SupportedChain;
  sourceAddress: string;
  destinationChain: SupportedChain;
  destinationAddress: string;
  sourceTransactionHash?: string;
  destinationTransactionHash?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChainInfo {
  chain: SupportedChain;
  name: string;
  logo: string;
  isEVM: boolean;
  rpcEndpoint: string;
  explorerUrl: string;
  nativeToken: string;
  isSupported: boolean;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  targetChains: SupportedChain[];
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  maxParticipants?: number;
  nftCollection: {
    id: string;
    name: string;
    symbol: string;
  };
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  walletAddress: string;
  hasClaimed: boolean;
  claimedAt?: string;
  claimTransactionHash?: string;
  claimedNft?: NFT;
  event: Event;
  createdAt: string;
}

export interface BridgeFeeEstimate {
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
  estimatedFee: number;
  feeToken: string;
  estimatedTimeSeconds: number;
}
