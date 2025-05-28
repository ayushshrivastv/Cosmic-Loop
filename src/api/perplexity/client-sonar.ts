/**
 * Perplexity Sonar API Client
 * Low-level client for interacting with the Perplexity Sonar API
 */

import axios from 'axios';

// Use environment variable for API key
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

/**
 * Sonar message structure
 */
export interface SonarMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Search options for Sonar API
 */
export interface SonarSearchOptions {
  web_search: boolean;
  focus?: 'internet' | 'scholar';
  language?: string;
  timezone?: string;
  include_domains?: string[];
  exclude_domains?: string[];
  search_depth?: 'basic' | 'advanced' | 'extended';
  location?: string; // User location for geo-specific results
  date_filter?: string; // Date range filter for time-specific results
  image_filter?: { // Image filtering options
    exclude_domains?: string[];
    formats?: string[]; // e.g., ['gif', 'jpg']
  };
}

/**
 * Sonar API response structure
 */
export interface SonarApiResponse {
  id: string;
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
  references?: {
    domain: string;
    url: string;
    title: string;
    snippet: string;
  }[];
}

/**
 * Perplexity Sonar API Client
 */
export class PerplexitySonarClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  /**
   * Create a new Perplexity Sonar client
   * @param apiKey API key (defaults to environment variable)
   */
  constructor(apiKey: string = PERPLEXITY_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.perplexity.ai';
    this.model = 'sonar-medium-chat'; // This is a Sonar model for online search

    if (!this.apiKey) {
      console.warn('No Perplexity API key provided. API calls will fail.');
    }
  }

  /**
   * Generate a completion with web search from the Sonar API
   * @param messages Messages to send to the API
   * @param options Search options
   * @returns Sonar API response
   */
  async createSearchCompletion(
    messages: SonarMessage[],
    options: SonarSearchOptions = { web_search: true }
  ): Promise<SonarApiResponse> {
    try {
      const url = `${this.baseUrl}/chat/completions`;
      
      const response = await axios.post(
        url,
        {
          model: this.model,
          messages,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in Perplexity Sonar API request:', error);
      throw error;
    }
  }

  /**
   * Generate a streaming search completion from the Sonar API
   * @param messages Messages to send to the API
   * @param onUpdate Callback function for streaming updates
   * @param options Search options
   * @returns The final complete response
   */
  async createStreamingSearchCompletion(
    messages: SonarMessage[],
    onUpdate: (partialResponse: string, isComplete: boolean) => void,
    options: SonarSearchOptions = { web_search: true }
  ): Promise<string> {
    try {
      const url = `${this.baseUrl}/chat/completions`;
      
      const response = await axios.post(
        url,
        {
          model: this.model,
          messages,
          stream: true,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          responseType: 'stream'
        }
      );

      let fullResponse = '';
      
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer | string) => {
          try {
            const lines = chunk.toString().split('\n').filter(Boolean);
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                if (line.includes('[DONE]')) {
                  onUpdate('', true);
                  return;
                }
                
                const jsonData = JSON.parse(line.substring(6));
                if (jsonData.choices && jsonData.choices[0].delta) {
                  const content = jsonData.choices[0].delta.content || '';
                  if (content) {
                    onUpdate(content, false);
                    fullResponse += content;
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error parsing streaming response:', error);
          }
        });
        
        response.data.on('end', () => {
          resolve(fullResponse);
        });
        
        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error in Perplexity Sonar streaming API request:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const perplexitySonarClient = new PerplexitySonarClient();
