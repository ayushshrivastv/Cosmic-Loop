import axios, { AxiosError } from 'axios';
import logger from '../utils/logger';
import {
  PERPLEXITY_API_KEY,
  PERPLEXITY_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  DEFAULT_PRESENCE_PENALTY
} from '../config';

// Define types for the Perplexity API
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  object: string;
  choices: {
    index: number;
    finish_reason: string;
    message: PerplexityMessage;
    delta?: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    search_context_size?: string;
  };
  citations?: string[];
}

export interface PerplexityError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

class PerplexityService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = PERPLEXITY_API_KEY as string;
    this.baseUrl = PERPLEXITY_BASE_URL;
    
    // Validate API key
    if (!this.apiKey) {
      throw new Error('Perplexity API key is not set');
    }
  }

  /**
   * Send a request to the Perplexity Sonar API
   * @param messages Array of messages to send to the API
   * @param options Optional parameters for the request
   * @returns The API response
   */
  async sendRequest(
    messages: PerplexityMessage[],
    options: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      presence_penalty?: number;
      stream?: boolean;
    } = {}
  ): Promise<PerplexityResponse> {
    try {
      // Use the exact same format that worked in our debug script
      const requestData = {
        model: options.model || DEFAULT_MODEL,
        messages,
        max_tokens: options.max_tokens || DEFAULT_MAX_TOKENS,
        temperature: options.temperature || DEFAULT_TEMPERATURE
      };
      
      // Log the request for debugging
      logger.debug('Sending request to Perplexity API', { 
        model: requestData.model,
        messageCount: messages.length,
        maxTokens: requestData.max_tokens
      });

      // Send the request using the exact same format as our debug script
      const startTime = Date.now();
      const response = await axios.post<PerplexityResponse>(
        `${this.baseUrl}/chat/completions`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      const duration = Date.now() - startTime;
      logger.debug('Received response from Perplexity API', { 
        duration,
        status: response.status,
        statusText: response.statusText,
        responseId: response.data.id,
        model: response.data.model,
        choicesLength: response.data.choices?.length
      });

      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (axios.isAxiosError(error) && error.response) {
        logger.error('Perplexity API error response', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          requestData: error.config?.data
        });
      } else {
        logger.error('Unknown error with Perplexity API', {
          error: (error as Error).message,
          stack: (error as Error).stack
        });
      }
      throw error;
    }
  }

  /**
   * Handle errors from the Perplexity API
   * @param error The error from the API
   */
  private handleApiError(error: AxiosError<PerplexityError>): void {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error('Perplexity API error', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('No response received from Perplexity API', {
        request: error.request
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error('Error setting up Perplexity API request', {
        message: error.message
      });
    }
  }

  /**
   * Get available models from the Perplexity API
   * @returns List of available models
   */
  async getModels(): Promise<string[]> {
    try {
      // This is a placeholder - Perplexity may not have a models endpoint
      // In a real implementation, you might fetch this from Perplexity's API
      // or maintain a list of supported models
      return [
        'llama-3.1-sonar-small-32k-online',
        'llama-3.1-sonar-small-32k',
        'llama-3.1-sonar-large-32k-online',
        'llama-3.1-sonar-large-32k',
        'sonar-small-online',
        'sonar-small-chat',
        'sonar-medium-online',
        'sonar-medium-chat',
        'sonar-large-online',
        'sonar-large-chat',
        'mistral-7b-instruct',
        'mixtral-8x7b-instruct'
      ];
    } catch (error) {
      logger.error('Error fetching models from Perplexity API', { error });
      throw error;
    }
  }
}

export default new PerplexityService();
