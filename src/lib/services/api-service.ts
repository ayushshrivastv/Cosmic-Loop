/**
 * @file api-service.ts
 * @description Base API service for making requests to the backend
 */

import { toast } from 'sonner';

/**
 * Base API endpoint configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001/graphql',
  WS_URL: process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:3001/ws',
};

/**
 * API error with additional metadata
 */
export class ApiError extends Error {
  status?: number;
  graphqlErrors?: any[];
  code?: string;

  constructor(message: string, status?: number, graphqlErrors?: any[], code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.graphqlErrors = graphqlErrors;
    this.code = code;
  }
}

/**
 * Cache entry interface for API responses
 */
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

/**
 * Cache management class for API responses
 */
export class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL_MS = 30000; // 30 seconds default TTL

  /**
   * Get a cached value by key
   * @param key - Cache key
   * @param ttl - Time to live in milliseconds
   * @returns Cached value or null if not found or expired
   */
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

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param data - Data to cache
   */
  public set<T>(key: string, data: T): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  /**
   * Invalidate a specific cache entry
   * @param key - Cache key to invalidate
   */
  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries
   */
  public invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries that match a pattern
   * @param pattern - Regular expression pattern to match keys
   */
  public invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  useCache?: boolean;
  cacheTtl?: number;
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  showErrorToast?: boolean;
}

/**
 * Base API service class
 */
export class ApiService {
  protected baseUrl: string;
  protected cache: ApiCache;

  /**
   * Create a new API service
   * @param baseUrl - API base URL (defaults to configured endpoint)
   */
  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.cache = new ApiCache();
  }

  /**
   * Create a cache key for GraphQL queries
   * @param query - GraphQL query
   * @param variables - Query variables
   * @returns Cache key string
   */
  protected createCacheKey(query: string, variables?: Record<string, any>): string {
    return JSON.stringify({ query, variables });
  }

  /**
   * Execute a GraphQL query
   * @param query - GraphQL query
   * @param variables - Query variables
   * @param token - Authentication token
   * @param options - Request options
   * @returns Query result
   */
  protected async executeQuery<T = any>(
    query: string,
    variables?: Record<string, any>,
    token?: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    // Default options
    const {
      useCache = true,
      cacheTtl = 30000,
      retry = true,
      maxRetries = 3,
      retryDelay = 1000,
      headers = {},
      showErrorToast = true
    } = options || {};

    // Check cache if enabled
    if (useCache) {
      const cacheKey = this.createCacheKey(query, variables);
      const cachedData = this.cache.get<T>(cacheKey, cacheTtl);
      if (cachedData) {
        return cachedData;
      }
    }

    // Retry logic
    let lastError: any;
    for (let attempt = 0; attempt <= (retry ? maxRetries : 0); attempt++) {
      try {
        const requestHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          ...headers
        };

        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: requestHeaders,
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
          const cacheKey = this.createCacheKey(query, variables);
          this.cache.set(cacheKey, result.data as T);
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
    if (showErrorToast) {
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
    }

    throw lastError;
  }

  /**
   * Execute a GraphQL mutation
   * @param mutation - GraphQL mutation
   * @param variables - Mutation variables
   * @param token - Authentication token
   * @param options - Request options
   * @returns Mutation result
   */
  protected async executeMutation<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    token?: string,
    options?: ApiRequestOptions & {
      invalidateCache?: boolean | string[] | RegExp;
    }
  ): Promise<T> {
    // Default options
    const {
      invalidateCache = false,
      retry = true,
      maxRetries = 2,
      retryDelay = 500,
      showErrorToast = true,
      headers = {}
    } = options || {};

    try {
      // Mutations don't use cache for the request, but set useCache to false explicitly
      const result = await this.executeQuery<T>(mutation, variables, token, {
        useCache: false,
        retry,
        maxRetries,
        retryDelay,
        headers,
        showErrorToast
      });

      // Invalidate cache based on the option
      if (invalidateCache === true) {
        // Invalidate entire cache
        this.cache.invalidateAll();
      } else if (Array.isArray(invalidateCache)) {
        // Invalidate specific cache entries
        invalidateCache.forEach(key => this.cache.invalidate(key));
      } else if (invalidateCache instanceof RegExp) {
        // Invalidate cache entries by pattern
        this.cache.invalidatePattern(invalidateCache);
      }

      return result;
    } catch (error) {
      // Rethrow the error after logging
      console.error('Mutation error:', error);
      throw error;
    }
  }

  /**
   * WebSocket message handler type
   */
  type WebSocketMessageHandler<T> = (data: T) => void;

  /**
   * Create a WebSocket subscription for real-time updates
   * @param subscriptionQuery - GraphQL subscription query
   * @param variables - Subscription variables
   * @param onMessage - Callback for received messages
   * @param token - Authentication token
   * @returns Subscription with unsubscribe method
   */
  protected createSubscription<T = any>(
    subscriptionQuery: string,
    variables: Record<string, any>,
    onMessage: WebSocketMessageHandler<T>,
    token?: string
  ): { unsubscribe: () => void } {
    const url = new URL(API_CONFIG.WS_URL);

    if (token) {
      url.searchParams.append('token', token);
    }

    let socket: WebSocket | null = null;
    let subscriptionId: string | null = null;
    let reconnectAttempts = 0;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let pingInterval: NodeJS.Timeout | null = null;
    let isUnsubscribed = false;

    // Connect to WebSocket server
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
              channel: this.parseSubscriptionName(subscriptionQuery),
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
          const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // Exponential backoff

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
   * Parse subscription name from GraphQL query
   * @param query - GraphQL subscription query
   * @returns Subscription channel name
   */
  private parseSubscriptionName(query: string): string {
    // Simple parser to extract subscription name
    const match = query.match(/subscription\\s+(?:\\w+\\s*)?{?\\s*(\\w+)/) ||
                  query.match(/subscription\s+(?:\w+\s*)?\{\s*(\w+)/);
    return match ? match[1] : 'subscription';
  }
}
