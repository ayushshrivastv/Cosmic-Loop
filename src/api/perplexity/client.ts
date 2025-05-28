/**
 * Perplexity API Client
 * Handles direct communication with the Perplexity Sonar API
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  PERPLEXITY_API_KEY, 
  PERPLEXITY_BASE_URL,
  PERPLEXITY_MODEL,
  PERPLEXITY_MAX_TOKENS,
  PERPLEXITY_TEMPERATURE,
  PERPLEXITY_TOP_P,
  PERPLEXITY_PRESENCE_PENALTY
} from '@/config/perplexity.config';

/**
 * Perplexity API request parameters
 */
export interface PerplexityRequestParams {
  model: string;
  messages: PerplexityMessage[];
  max_tokens: number;
  temperature: number;
  top_p?: number;
  presence_penalty?: number;
  stream?: boolean;
}

/**
 * Perplexity message format
 */
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Perplexity API response format
 */
export interface PerplexityResponse {
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
 * Perplexity API Client class
 */
export class PerplexityClient {
  private readonly client: AxiosInstance;
  private readonly defaultParams: Partial<PerplexityRequestParams>;

  constructor() {
    // Handle missing API key gracefully
    if (!PERPLEXITY_API_KEY && process.env.NODE_ENV !== 'test') {
      console.warn("WARNING: PERPLEXITY_API_KEY is not set. Some AI features may be limited.");
    }

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: `${PERPLEXITY_BASE_URL}/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        // Only add Authorization header if API key is available
        ...(PERPLEXITY_API_KEY ? { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}` } : {})
      }
    });

    // Set default parameters for all requests
    this.defaultParams = {
      model: PERPLEXITY_MODEL,
      max_tokens: PERPLEXITY_MAX_TOKENS,
      temperature: PERPLEXITY_TEMPERATURE,
      top_p: PERPLEXITY_TOP_P,
      presence_penalty: PERPLEXITY_PRESENCE_PENALTY
    };
  }

  /**
   * Send a completion request to the Perplexity API
   * @param messages Array of messages to send to the API
   * @param options Optional request parameters to override defaults
   * @returns The API response
   */
  async createCompletion(
    messages: PerplexityMessage[],
    options: Partial<PerplexityRequestParams> = {}
  ): Promise<PerplexityResponse> {
    try {
      // Combine default parameters with provided options
      const requestData: PerplexityRequestParams = {
        ...this.defaultParams,
        ...options,
        messages,
      } as PerplexityRequestParams;

      const response = await this.client.post<PerplexityResponse>(
        '',
        requestData
      );

      return response.data;
    } catch (error) {
      console.error('Error in Perplexity API request:', error);
      throw error;
    }
  }

  /**
   * Send a streaming completion request to the Perplexity API
   * @param messages Array of messages to send to the API
   * @param onUpdate Callback function for streaming updates
   * @param options Optional request parameters to override defaults
   * @returns The final complete response
   */
  async createStreamingCompletion(
    messages: PerplexityMessage[],
    onUpdate: (partialResponse: string) => void,
    options: Partial<PerplexityRequestParams> = {}
  ): Promise<string> {
    try {
      // Combine default parameters with provided options and set stream to true
      const requestData: PerplexityRequestParams = {
        ...this.defaultParams,
        ...options,
        messages,
        stream: true
      } as PerplexityRequestParams;

      // For streaming, we need to handle the response differently
      const response = await this.client.post(
        '',
        requestData,
        { responseType: 'stream' }
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
      console.error('Error in Perplexity streaming request:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const perplexityClient = new PerplexityClient();
