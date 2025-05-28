/**
 * Perplexity API Service
 * Provides high-level methods for interacting with the Perplexity Sonar API
 */

import { perplexityClient, PerplexityMessage } from './client';
import { 
  FINANCIAL_ANALYSIS_PROMPT, 
  BLOCKCHAIN_FINANCIAL_PROMPT 
} from '@/config/perplexity.config';

/**
 * Response structure for the Perplexity API service
 */
export interface PerplexityServiceResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

/**
 * Perplexity API Service class
 */
export class PerplexityService {
  /**
   * Generate a financial analysis response based on a user query
   * @param query The user's query
   * @param additionalContext Optional additional context to provide to the model
   * @returns The generated response
   */
  async generateFinancialAnalysis(
    query: string,
    additionalContext?: string
  ): Promise<PerplexityServiceResponse> {
    try {
      // Construct the messages array with system prompt and user query
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: FINANCIAL_ANALYSIS_PROMPT
        },
        {
          role: 'user',
          content: additionalContext 
            ? `${additionalContext}\n\nUser query: ${query}`
            : query
        }
      ];

      // Make the API request
      const response = await perplexityClient.createCompletion(messages);
      
      // Return the generated text and usage statistics
      return {
        text: response.choices[0].message.content,
        usage: response.usage,
        model: response.model
      };
    } catch (error) {
      console.error('Error generating financial analysis:', error);
      return {
        text: 'I encountered an error while analyzing financial data. Please try again later.'
      };
    }
  }

  /**
   * Generate a blockchain financial analysis response
   * @param query The user's query
   * @param blockchainData JSON string or object containing blockchain data
   * @returns The generated response
   */
  async generateBlockchainAnalysis(
    query: string,
    blockchainData: Record<string, unknown> | string
  ): Promise<PerplexityServiceResponse> {
    try {
      // Convert blockchain data to string if it's an object
      const blockchainDataString = typeof blockchainData === 'string' 
        ? blockchainData 
        : JSON.stringify(blockchainData, null, 2);

      // Construct the messages array with system prompt, blockchain data, and user query
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: BLOCKCHAIN_FINANCIAL_PROMPT
        },
        {
          role: 'user',
          content: `Blockchain data:\n${blockchainDataString}\n\nUser query: ${query}`
        }
      ];

      // Make the API request
      const response = await perplexityClient.createCompletion(messages);
      
      // Return the generated text and usage statistics
      return {
        text: response.choices[0].message.content,
        usage: response.usage,
        model: response.model
      };
    } catch (error) {
      console.error('Error generating blockchain financial analysis:', error);
      return {
        text: 'I encountered an error while analyzing blockchain financial data. Please try again later.'
      };
    }
  }

  /**
   * Generate a streaming financial analysis response
   * @param query The user's query
   * @param onUpdate Callback function for streaming updates
   * @param additionalContext Optional additional context to provide to the model
   * @returns The final complete response
   */
  async streamFinancialAnalysis(
    query: string,
    onUpdate: (partialResponse: string) => void,
    additionalContext?: string
  ): Promise<string> {
    try {
      // Construct the messages array with system prompt and user query
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: FINANCIAL_ANALYSIS_PROMPT
        },
        {
          role: 'user',
          content: additionalContext 
            ? `${additionalContext}\n\nUser query: ${query}`
            : query
        }
      ];

      // Make the streaming API request
      return await perplexityClient.createStreamingCompletion(messages, onUpdate);
    } catch (error) {
      console.error('Error in streaming financial analysis:', error);
      throw error;
    }
  }

  /**
   * Generate a response with a custom system prompt
   * @param query User query
   * @param systemPrompt Custom system prompt to use
   * @param additionalContext Optional additional context
   * @returns Perplexity service response
   */
  async generateCustomResponse(
    query: string,
    systemPrompt: string,
    additionalContext?: string
  ): Promise<PerplexityServiceResponse> {
    try {
      // Create messages array with custom system prompt
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: additionalContext
            ? `${additionalContext}\n\nUser query: ${query}`
            : query
        }
      ];

      // Make the API request
      const response = await perplexityClient.createCompletion(messages);
      
      // Return the generated text and usage statistics
      return {
        text: response.choices[0].message.content,
        usage: response.usage,
        model: response.model
      };
    } catch (error) {
      console.error('Error in generating custom response:', error);
      return {
        text: 'I encountered an error while processing your question. Please try again.'
      };
    }
  }

  /**
   * Generate a streaming blockchain financial analysis response
   * @param query The user's query
   * @param blockchainData JSON string or object containing blockchain data
   * @param onUpdate Callback function for streaming updates
   * @returns The final complete response
   */
  async streamBlockchainAnalysis(
    query: string,
    blockchainData: Record<string, unknown> | string,
    onUpdate: (partialResponse: string) => void
  ): Promise<string> {
    try {
      // Convert blockchain data to string if it's an object
      const blockchainDataString = typeof blockchainData === 'string' 
        ? blockchainData 
        : JSON.stringify(blockchainData, null, 2);

      // Construct the messages array with system prompt, blockchain data, and user query
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: BLOCKCHAIN_FINANCIAL_PROMPT
        },
        {
          role: 'user',
          content: `Blockchain data:\n${blockchainDataString}\n\nUser query: ${query}`
        }
      ];

      // Make the streaming API request
      return await perplexityClient.createStreamingCompletion(
        messages,
        onUpdate
      );
    } catch (error) {
      console.error('Error in streaming blockchain analysis:', error);
      throw error;
    }
  }

  // The generateCustomResponse method has been moved above
}

// Export a singleton instance
export const perplexityService = new PerplexityService();
