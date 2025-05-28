/**
 * Client service for interacting with the Perplexity Gateway
 */
import axios from 'axios';
import { AIQueryType } from './ai-assistant-service';

// Gateway configuration
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001/api/v1';
const GATEWAY_API_KEY = process.env.GATEWAY_API_KEY || 'test-api-key-1';

// Define types for the gateway API
export interface GatewayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GatewayCompletionRequest {
  messages: GatewayMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface GatewayTextRequest {
  prompt: string;
  system_prompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface GatewayResponse {
  id: string;
  text: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GatewayError {
  error: string;
  message: string;
  details?: Array<{ message: string; path?: string[] }>;
}

class GatewayClientService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = GATEWAY_URL;
    this.apiKey = GATEWAY_API_KEY;
  }

  /**
   * Send a chat completion request to the gateway
   * @param messages Array of messages for the conversation
   * @param options Additional options for the request
   * @returns The gateway response
   */
  async sendChatCompletion(
    messages: GatewayMessage[],
    options: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      presence_penalty?: number;
    } = {}
  ): Promise<string> {
    try {
      const response = await axios.post<GatewayResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          messages,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );

      return response.data.text;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Send a text completion request to the gateway
   * @param prompt The user's prompt
   * @param systemPrompt Optional system prompt for context
   * @param options Additional options for the request
   * @returns The gateway response
   */
  /**
   * Send a streaming chat completion request to the gateway
   * @param messages Array of messages for the conversation
   * @param options Additional options for the request
   * @param onUpdate Callback for streaming updates
   * @returns The final response text
   */
  async sendStreamingChatCompletion(
    messages: GatewayMessage[],
    options: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      presence_penalty?: number;
      stream?: boolean;
    } = {},
    onUpdate: (partialResponse: string) => void
  ): Promise<string> {
    try {
      // Set stream to true
      const streamOptions = { ...options, stream: true };
      
      // Use EventSource for streaming
      const response = await new Promise<string>((resolve, reject) => {
        let fullResponse = '';
        
        // Use axios to make a POST request with the appropriate headers
        axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            messages,
            ...streamOptions
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.apiKey,
              'Accept': 'text/event-stream'
            },
            responseType: 'stream'
          }
        ).then(response => {
          response.data.on('data', (chunk: Buffer) => {
            const chunkStr = chunk.toString();
            if (chunkStr.includes('data:')) {
              try {
                // Parse the SSE data
                const dataStr = chunkStr.split('data:')[1].trim();
                if (dataStr === '[DONE]') {
                  resolve(fullResponse);
                  return;
                }
                
                const data = JSON.parse(dataStr);
                if (data.text) {
                  fullResponse = data.text;
                  onUpdate(fullResponse);
                }
              } catch (e) {
                console.error('Error parsing streaming response:', e);
              }
            }
          });
          
          response.data.on('end', () => {
            resolve(fullResponse);
          });
          
          response.data.on('error', (err: Error) => {
            reject(err);
          });
        }).catch(error => {
          reject(error);
        });
      });
      
      return response;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }
  
  async sendTextCompletion(
    prompt: string,
    systemPrompt?: string,
    options: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      presence_penalty?: number;
    } = {}
  ): Promise<string> {
    try {
      const response = await axios.post<GatewayResponse>(
        `${this.baseUrl}/completions`,
        {
          prompt,
          system_prompt: systemPrompt,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );

      return response.data.text;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Use a prompt template from the gateway
   * @param templateId The ID of the template to use
   * @param parameters Parameters for the template
   * @returns The filled template
   */
  async useTemplate(
    templateId: string,
    parameters: Record<string, string | number | boolean>
  ): Promise<{ systemPrompt: string; userPrompt: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/templates/${templateId}/use`,
        parameters,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );

      return {
        systemPrompt: response.data.systemPrompt,
        userPrompt: response.data.userPrompt
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get available prompt templates from the gateway
   * @returns Array of available templates
   */
  async getTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      description: string;
      required: boolean;
      type: string;
      default?: string | number | boolean;
    }>;
  }>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/templates`,
        {
          headers: {
            'X-API-Key': this.apiKey
          }
        }
      );

      return response.data.templates;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Process a query using the appropriate template based on query type
   * @param query The user's query
   * @param queryType The type of query
   * @returns The gateway response
   */
  async processQuery(query: string, queryType: AIQueryType): Promise<string> {
    try {
      let response: string;

      // Use different templates based on query type
      switch (queryType) {
        case 'financial_analysis':
          // Use the financial analysis template
          const financialTemplate = await this.useTemplate('financial-analysis', {
            data: query,
            aspects: 'market trends, financial metrics, investment considerations'
          });
          
          response = await this.sendChatCompletion([
            { role: 'system', content: financialTemplate.systemPrompt },
            { role: 'user', content: financialTemplate.userPrompt }
          ]);
          break;

        case 'nft_info':
        case 'wallet_activity':
        case 'market_analysis':
        case 'bridge_status':
          // Use the blockchain analysis template
          const blockchainTemplate = await this.useTemplate('blockchain-analysis', {
            data: query,
            aspects: this.getAspectsForQueryType(queryType)
          });
          
          response = await this.sendChatCompletion([
            { role: 'system', content: blockchainTemplate.systemPrompt },
            { role: 'user', content: blockchainTemplate.userPrompt }
          ]);
          break;

        default:
          // For general queries, use a simple text completion
          response = await this.sendTextCompletion(
            query,
            'You are a helpful assistant that provides accurate and concise information.'
          );
          break;
      }

      return response;
    } catch (error: unknown) {
      console.error('Error processing query through gateway:', error);
      // Fallback message if the gateway is unavailable
      return 'I apologize, but I encountered an issue connecting to the AI service. Please try again later.';
    }
  }

  /**
   * Get relevant aspects to focus on based on query type
   * @param queryType The type of query
   * @returns Aspects string for the template
   */
  private getAspectsForQueryType(queryType: AIQueryType): string {
    switch (queryType) {
      case 'nft_info':
        return 'NFT metadata, ownership history, collection statistics, floor prices';
      case 'wallet_activity':
        return 'transaction history, token balances, wallet interactions, recent activity';
      case 'market_analysis':
        return 'trading volume, price trends, liquidity metrics, market sentiment';
      case 'bridge_status':
        return 'cross-chain transactions, bridge status, transaction fees, confirmation times';
      default:
        return 'transaction volume, active addresses, network activity';
    }
  }

  /**
   * Handle errors from the gateway
   * @param error The error from the gateway
   */
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error) && error.response) {
      const gatewayError = error.response.data as GatewayError;
      console.error('Gateway API error:', {
        status: error.response.status,
        error: gatewayError.error,
        message: gatewayError.message,
        details: gatewayError.details
      });
    } else if (error instanceof Error) {
      console.error('Error connecting to gateway:', error.message);
    } else {
      console.error('Unknown error connecting to gateway');
    }
  }
  
  /**
   * Make a GET request to the gateway
   * @param endpoint The API endpoint
   * @returns The response data
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await axios.get<T>(
        `${this.baseUrl}${endpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Make a POST request to the gateway
   * @param endpoint The API endpoint
   * @param data The request data
   * @returns The response data
   */
  async post<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    try {
      const response = await axios.post<T>(
        `${this.baseUrl}${endpoint}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          }
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }
}

// Export a singleton instance
export const gatewayClientService = new GatewayClientService();
