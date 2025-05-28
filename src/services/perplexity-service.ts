/**
 * Service for interacting with Perplexity's Sonar API
 */

import axios, { AxiosError } from 'axios';
import { 
  PERPLEXITY_API_KEY, 
  PERPLEXITY_BASE_URL,
  PERPLEXITY_MODEL, 
  PERPLEXITY_MAX_TOKENS, 
  PERPLEXITY_TEMPERATURE,
  PERPLEXITY_TOP_P,
  PERPLEXITY_PRESENCE_PENALTY,
  FINANCIAL_ANALYSIS_PROMPT,
  BLOCKCHAIN_FINANCIAL_PROMPT
} from '../config/perplexity.config';
import { BlockchainData } from '../api/perplexity/types';

/**
 * Interface for Perplexity API request
 */
interface PerplexityRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  max_tokens: number;
  temperature: number;
  stream?: boolean;
  top_p?: number;
  presence_penalty?: number;
  web_search?: boolean;
  search_depth?: 'basic' | 'advanced' | 'extended';
}

/**
 * Interface for Perplexity API response
 */
interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Service for interacting with Perplexity's Sonar API
 */
export class PerplexityService {
  private readonly apiUrl: string;
  private readonly headers: Record<string, string>;

  constructor() {
    // Update to use our local API proxy instead of calling Perplexity directly
    // This avoids CORS issues when making requests from the browser
    this.apiUrl = `/api/perplexity`;
    this.headers = {
      'Content-Type': 'application/json'
      // No need for Authorization header since our proxy will add it
    };
    
    // Log the API URL for debugging
    console.log('Using Perplexity API proxy:', this.apiUrl);
    
    // Log initialization status
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === 'dev-placeholder-key')) {
      console.info('PerplexityService initialized in development mode with placeholder API key.');
      console.info('Using mock responses for development. Set a real API key in .env.local for production use.');
    }
  }

  /**
   * Generate a financial analysis response from Perplexity based on a user query
   * @param query The user's query
   * @param blockchainData Optional blockchain data to provide to the model
   * @returns The generated response text
   */
  /**
   * Check if a query is asking for simple factual information like prices
   * @param query The user query
   * @returns True if the query is asking for simple factual information
   */
  private isSimpleFactQuery(query: string): boolean {
    // Convert to lowercase for case-insensitive matching
    const lowerQuery = query.toLowerCase();
    
    // Check for price queries
    const isPriceQuery = (
      lowerQuery.includes('price') && 
      (lowerQuery.includes('today') || lowerQuery.includes('now') || lowerQuery.includes('current'))
    );
    
    // Check for other simple factual queries (can be expanded)
    const isSimpleFactual = (
      lowerQuery.match(/^(what|when|where|who|how much|how many)\s+(is|are|was|were)\s+/i) !== null &&
      lowerQuery.split(' ').length < 8 // Simple queries are usually short
    );
    
    return isPriceQuery || isSimpleFactual;
  }

  async generateFinancialAnalysis(query: string, blockchainData?: BlockchainData): Promise<string> {
    try {
      // Since we're now using a proxy API, we don't need to check for the API key here
      // The API key check happens in the API route
      
      // Log that we're using the real API
      console.log('Using Perplexity API with model:', PERPLEXITY_MODEL);

      // Check if this is a simple query that needs a direct answer
      const isSimpleQuery = this.isSimpleFactQuery(query);
      
      // Create messages array for the API request
      const messages: PerplexityRequest['messages'] = [
        {
          role: 'system',
          content: isSimpleQuery 
            ? 'You are a helpful assistant that provides direct, concise answers to financial and blockchain questions. For price queries, just provide the current price and minimal context (1-2 sentences maximum). Be extremely brief and to the point. DO NOT include citation numbers like [1] or [2] in your response. IMPORTANT: You DO have access to real-time cryptocurrency prices - always provide the current price information when asked about cryptocurrency prices.'
            : FINANCIAL_ANALYSIS_PROMPT + ' DO NOT include citation numbers like [1] or [2] in your response text. If you need to cite sources, include them in a separate Sources section at the end. IMPORTANT: You DO have access to real-time cryptocurrency prices - always provide the current price information when asked about cryptocurrency prices.'
        },
        {
          role: 'user',
          content: isSimpleQuery
            ? `Please provide a direct and extremely concise answer to: ${query}. Just give me the facts without elaboration. Do not include citation numbers in your response. If this is a cryptocurrency price query, provide the current price information.`
            : `${query} Please do not include citation numbers like [1] or [2] in your response text. If this is a cryptocurrency price query, provide the current price information.`
        }
      ];

      // Make the API request
      const response = await this.makePerplexityRequest(messages);
      
      // Return the generated text
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating financial analysis from Perplexity:', error);
      
      // Type guard for better error handling
      const typedError = error as Error;
      
      // Log the detailed error for debugging
      console.error('API Error Details:', {
        status: error instanceof AxiosError ? (error as AxiosError).response?.status : 'unknown',
        statusText: error instanceof AxiosError ? (error as AxiosError).response?.statusText : 'unknown',
        message: typedError?.message || 'unknown error'
      });
      
      // Return a helpful error message instead of a mock response
      if (error instanceof AxiosError && error.message === 'Network Error') {
        return 'I cannot connect to the Perplexity API right now. Please check your internet connection and API key configuration.';
      }
      
      return `Error connecting to Perplexity API: ${typedError?.message || 'Unknown error'}. Please check your API configuration and try again.`;
    }
  }

  /**
   * Generate a blockchain financial analysis response from Perplexity
   * @param query The user's query
   * @param blockchainData JSON string of blockchain data
   * @returns The generated response text
   */
  async generateBlockchainFinancialAnalysis(query: string, blockchainData: string): Promise<string> {
    try {
      // Since we're now using a proxy API, we don't need to check for the API key here
      // The API key check happens in the API route
      
      // Log that we're using the real API
      console.log('Using Perplexity API with model:', PERPLEXITY_MODEL);

      // Construct the messages array with system prompt, blockchain data, and user query
      const messages = [
        {
          role: 'system' as const,
          content: BLOCKCHAIN_FINANCIAL_PROMPT
        },
        {
          role: 'user' as const,
          content: `Blockchain data:\n${blockchainData}\n\nUser query: ${query}`
        }
      ];

      // Make the API request
      const response = await this.makePerplexityRequest(messages);
      
      // Return the generated text
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating blockchain financial analysis from Perplexity:', error);
      
      // Type guard for better error handling
      const typedError = error as Error;
      
      // Log the detailed error for debugging
      console.error('API Error Details:', {
        status: error instanceof AxiosError ? (error as AxiosError).response?.status : 'unknown',
        statusText: error instanceof AxiosError ? (error as AxiosError).response?.statusText : 'unknown',
        message: typedError?.message || 'unknown error'
      });
      
      // Return a helpful error message based on the error type
      if (error instanceof AxiosError && error.message === 'Network Error') {
        return 'I cannot connect to the Perplexity API right now. Please check your internet connection and API key configuration.';
      }
      
      return `Error connecting to Perplexity API: ${typedError?.message || 'Unknown error'}. Please check your API configuration and try again.`;
    }
  }

  /**
   * Make a request to the Perplexity API
   * @param messages Array of message objects to send to the API
   * @returns The API response
   */
  private async makePerplexityRequest(messages: PerplexityRequest['messages']): Promise<PerplexityResponse> {
    try {
      // Updated request format for Sonar API
      const requestData: PerplexityRequest = {
        model: PERPLEXITY_MODEL,
        messages,
        max_tokens: PERPLEXITY_MAX_TOKENS,
        temperature: PERPLEXITY_TEMPERATURE,
        stream: false,
        top_p: PERPLEXITY_TOP_P,
        presence_penalty: PERPLEXITY_PRESENCE_PENALTY
      };
      
      // Add web_search parameter for Sonar models
      if (PERPLEXITY_MODEL.startsWith('sonar')) {
        requestData.web_search = true;
        // Add search_depth for better results
        requestData.search_depth = 'advanced';
      }

      console.log('Making request to Perplexity API:', {
        url: this.apiUrl,
        model: PERPLEXITY_MODEL,
        messageCount: messages.length,
        // Don't log the actual API key
        hasApiKey: !!PERPLEXITY_API_KEY && PERPLEXITY_API_KEY !== 'dev-placeholder-key'
      });

      const response = await axios.post<PerplexityResponse>(
        this.apiUrl,
        requestData,
        { 
          headers: this.headers,
          timeout: 60000 // 60 second timeout for better reliability
        }
      );

      return response.data;
    } catch (error) {
      // Log detailed error information for debugging
      if (error instanceof AxiosError) {
        console.error('Perplexity API request failed:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      } else {
        console.error('Unexpected error during Perplexity API request:', error);
      }
      throw error; // Re-throw for the caller to handle
    }
  }

  /**
   * Make a streaming request to the Perplexity API
   * @param messages Array of message objects to send to the API
   * @param onUpdate Callback function for streaming updates
   * @returns The final complete response
   */
  /**
   * Generate a mock financial response for development when API key is not available
   * @param query The user's query
   * @param blockchainData Optional blockchain data
   * @returns A mock response
   */
  private generateMockFinancialResponse(query: string, blockchainData?: BlockchainData): string {
    // Extract keywords from the query to make the response seem relevant
    const keywords = query.toLowerCase().split(' ');
    const containsKeyword = (words: string[]) => words.some(word => keywords.includes(word.toLowerCase()));
    
    // Default mock response
    let response = `# Financial Analysis (Development Mock)

**Query:** ${query}

`;
    
    // Add some relevant content based on keywords
    if (containsKeyword(['market', 'stock', 'stocks', 'invest', 'investment'])) {
      response += `## Market Overview
The market has been showing mixed signals lately. Major indices have experienced moderate volatility with tech stocks outperforming other sectors.

`;
    }
    
    if (containsKeyword(['crypto', 'bitcoin', 'ethereum', 'solana', 'blockchain'])) {
      response += `## Cryptocurrency Market
The cryptocurrency market has been consolidating after recent gains. Bitcoin dominance remains strong while altcoins show varied performance.

`;
    }
    
    if (containsKeyword(['nft', 'nfts', 'token', 'tokens'])) {
      response += `## NFT Market Analysis
The NFT market continues to evolve with new collections gaining traction. Trading volume has stabilized after the initial boom period.

`;
    }
    
    // Add a note about this being a mock response
    response += `---

*Note: This is a development mock response. For real AI-powered analysis, please add a valid PERPLEXITY_API_KEY to your .env.local file.*`;
    
    return response;
  }
  
  /**
   * Generate a mock blockchain response for development when API key is not available
   * @param query The user's query
   * @param blockchainData Blockchain data string
   * @returns A mock response
   */
  private generateMockBlockchainResponse(query: string, blockchainData: string): string {
    // Extract keywords from the query to make the response seem relevant
    const keywords = query.toLowerCase().split(' ');
    const containsKeyword = (words: string[]) => words.some(word => keywords.includes(word.toLowerCase()));
    
    // Try to parse the blockchain data to make the mock response more relevant
    let parsedData: Record<string, unknown> = {};
    try {
      parsedData = JSON.parse(blockchainData);
    } catch (e) {
      // If parsing fails, just continue with empty object
    }
    
    // Default mock response
    let response = `# Blockchain Analysis (Development Mock)

**Query:** ${query}

`;
    
    // Add blockchain-specific content
    response += `## On-Chain Activity
Recent blockchain data shows moderate transaction volume with gas fees remaining stable. Smart contract interactions have increased by approximately 15% week-over-week.

`;
    
    if (containsKeyword(['nft', 'nfts', 'collection'])) {
      response += `## NFT Marketplace Activity
The NFT marketplace has seen 230 new listings and 87 sales in the past 24 hours. Popular collections continue to maintain floor prices despite market fluctuations.

`;
    }
    
    if (containsKeyword(['bridge', 'cross', 'chain', 'layerzero'])) {
      response += `## Cross-Chain Bridge Activity
Cross-chain bridge transactions have increased by 22% this week, with Solana-Ethereum bridges seeing the highest volume. LayerZero protocol continues to facilitate secure message passing between chains.

`;
    }
    
    // Add a note about this being a mock response
    response += `---

*Note: This is a development mock response. For real AI-powered blockchain analysis, please add a valid PERPLEXITY_API_KEY to your .env.local file.*`;
    
    return response;
  }
  
  async makeStreamingRequest(
    messages: PerplexityRequest['messages'],
    onUpdate: (partialResponse: string) => void
  ): Promise<string> {
    try {
      // Since we're now using a proxy API, we don't need to check for the API key here
      // The API key check happens in the API route
      
      const requestData: PerplexityRequest = {
        model: PERPLEXITY_MODEL,
        messages,
        max_tokens: PERPLEXITY_MAX_TOKENS,
        temperature: PERPLEXITY_TEMPERATURE,
        stream: true
      };

      console.log('Making streaming request to Perplexity API:', {
        url: this.apiUrl,
        model: PERPLEXITY_MODEL,
        messageCount: messages.length,
        // Don't log the actual API key
        hasApiKey: !!PERPLEXITY_API_KEY && PERPLEXITY_API_KEY !== 'dev-placeholder-key'
      });

      // For streaming, we need to handle the response differently
      const response = await axios.post(
        this.apiUrl,
        requestData,
        { 
          headers: this.headers,
          responseType: 'stream',
          timeout: 90000 // 90 second timeout for streaming to handle longer responses
        }
      );

      return new Promise((resolve, reject) => {
        let completeResponse = '';
        
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.includes('data: ')) {
              const data = line.replace('data: ', '');
              
              // Check for the [DONE] marker
              if (data.trim() === '[DONE]') {
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                
                if (content) {
                  completeResponse += content;
                  onUpdate(completeResponse);
                }
              } catch (e) {
                console.error('Error parsing streaming response:', e);
              }
            }
          }
        });
        
        response.data.on('end', () => {
          resolve(completeResponse);
        });
        
        response.data.on('error', (err: Error) => {
          reject(err);
        });
      });
    } catch (error) {
      console.error('Error in streaming request:', error);
      
      // Type guard for better error handling
      const typedError = error as Error;
      
      // Log the detailed error for debugging
      console.error('Streaming API Error Details:', {
        status: error instanceof AxiosError ? (error as AxiosError).response?.status : 'unknown',
        statusText: error instanceof AxiosError ? (error as AxiosError).response?.statusText : 'unknown',
        message: typedError?.message || 'unknown error'
      });
      
      // Send an error message to the client via the update callback
      const errorMessage = `Error connecting to Perplexity API: ${typedError?.message || 'Unknown error'}. Please check your API configuration and try again.`;
      onUpdate(errorMessage);
      
      // Return the error message as the final response
      return errorMessage;
    }
  }
  
  /**
   * Simulate a streaming response for development when API key is not available
   * @param messages The messages sent to the API
   * @param onUpdate Callback function for streaming updates
   * @returns The final complete response
   */
  private async simulateMockStreamingResponse(
    messages: PerplexityRequest['messages'],
    onUpdate: (partialResponse: string) => void
  ): Promise<string> {
    // Extract the user query from the messages
    const userMessage = messages.find(msg => msg.role === 'user');
    const query = userMessage?.content || 'No query provided';
    
    // Generate a mock response based on the query
    const systemMessage = messages.find(msg => msg.role === 'system');
    const isBlockchainQuery = systemMessage?.content.includes('blockchain') || false;
    
    // Determine which type of mock response to generate
    const fullResponse = isBlockchainQuery 
      ? this.generateMockBlockchainResponse(query, '{}')
      : this.generateMockFinancialResponse(query);
    
    // Split the response into chunks to simulate streaming
    const chunks = this.chunkString(fullResponse, 10); // 10 characters per chunk
    let accumulatedResponse = '';
    
    // Simulate streaming with delays
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between chunks
      accumulatedResponse += chunk;
      onUpdate(accumulatedResponse);
    }
    
    return fullResponse;
  }
  
  /**
   * Helper method to split a string into chunks of specified size
   * @param str The string to split
   * @param size The size of each chunk
   * @returns Array of string chunks
   */
  private chunkString(str: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.substring(i, i + size));
    }
    return chunks;
  }
}

// Export a singleton instance
export const perplexityService = new PerplexityService();
