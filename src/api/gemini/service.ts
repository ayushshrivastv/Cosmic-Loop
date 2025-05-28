/**
 * Google Gemini API Service
 * Provides high-level methods for interacting with the Google Gemini API
 */

import { geminiClient, GeminiMessage } from './client';
import { SUMMARIZATION_PROMPT } from './prompts';

/**
 * Response structure for the Gemini API service
 */
export interface GeminiServiceResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

/**
 * Gemini API Service class
 */
export class GeminiService {
  /**
   * Generate a summarization response based on input content
   * @param content The content to summarize
   * @param additionalContext Optional additional context to provide to the model
   * @returns The generated summary
   */
  async generateSummary(
    content: string,
    additionalContext?: string
  ): Promise<GeminiServiceResponse> {
    try {
      // Construct the messages array with system prompt and content
      const messages: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ 
            text: `${SUMMARIZATION_PROMPT}\n\nContent to summarize:\n${content}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}` 
          }]
        }
      ];

      // Make the API request
      const response = await geminiClient.createCompletion(messages);
      
      // Return the generated text and usage statistics
      return {
        text: response.candidates[0].content.parts[0].text,
        usage: response.usageMetadata ? {
          prompt_tokens: response.usageMetadata.promptTokenCount,
          completion_tokens: response.usageMetadata.candidatesTokenCount,
          total_tokens: response.usageMetadata.totalTokenCount
        } : undefined,
        model: 'gemini-1.5-flash'
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        text: 'I encountered an error while generating a summary. Please try again later.'
      };
    }
  }

  /**
   * Generate a streaming summary response
   * @param content The content to summarize
   * @param onUpdate Callback function for streaming updates
   * @param additionalContext Optional additional context to provide to the model
   * @returns The final complete response
   */
  async streamSummary(
    content: string,
    onUpdate: (partialResponse: string) => void,
    additionalContext?: string
  ): Promise<string> {
    try {
      // Construct the messages array with prompt and content
      const messages: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ 
            text: `${SUMMARIZATION_PROMPT}\n\nContent to summarize:\n${content}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}` 
          }]
        }
      ];

      // Make the streaming API request
      return await geminiClient.createStreamingCompletion(messages, onUpdate);
    } catch (error) {
      console.error('Error in streaming summary:', error);
      throw error;
    }
  }

  /**
   * Generate a custom response with specific instructions
   * @param prompt The custom prompt/instructions
   * @param content The content to process
   * @returns The generated response
   */
  async generateCustomResponse(
    prompt: string,
    content: string
  ): Promise<GeminiServiceResponse> {
    try {
      // Create messages array with custom prompt and content
      const messages: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ 
            text: `${prompt}\n\nContent to process:\n${content}` 
          }]
        }
      ];

      // Make the API request
      const response = await geminiClient.createCompletion(messages);
      
      // Return the generated text and usage statistics
      return {
        text: response.candidates[0].content.parts[0].text,
        usage: response.usageMetadata ? {
          prompt_tokens: response.usageMetadata.promptTokenCount,
          completion_tokens: response.usageMetadata.candidatesTokenCount,
          total_tokens: response.usageMetadata.totalTokenCount
        } : undefined,
        model: 'gemini-1.5-flash'
      };
    } catch (error) {
      console.error('Error generating custom response:', error);
      return {
        text: 'I encountered an error while processing your request. Please try again.'
      };
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
