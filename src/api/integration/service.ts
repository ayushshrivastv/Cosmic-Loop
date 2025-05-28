/**
 * API Integration Service
 * Coordinates between Perplexity (search) and Gemini (summarization) APIs
 * to provide synthesized, up-to-date responses
 */

import { perplexityService, PerplexityServiceResponse } from '../perplexity/service';
import { geminiService, GeminiServiceResponse } from '../gemini/service';
import { SYNTHESIZED_RESPONSE_PROMPT } from '../gemini/prompts';

/**
 * Structure for the integrated response
 */
export interface IntegratedResponse {
  text: string;
  sources?: {
    search: PerplexityServiceResponse;
    summary: GeminiServiceResponse;
  };
  usage?: {
    search_tokens: number;
    summary_tokens: number;
    total_tokens: number;
  };
}

/**
 * Options for generating an integrated response
 */
export interface IntegrationOptions {
  includeSourceData?: boolean;
  streamResponse?: boolean;
  onUpdate?: (partialResponse: string) => void;
  additionalContext?: string;
}

/**
 * Integration Service class
 * Coordinates between multiple API services
 */
export class IntegrationService {
  /**
   * Generate an integrated response using Perplexity for search and Gemini for summarization
   * @param query The user's query
   * @param options Integration options
   * @returns The integrated response
   */
  async generateIntegratedResponse(
    query: string,
    options: IntegrationOptions = {}
  ): Promise<IntegratedResponse> {
    try {
      // Step 1: Get search results from Perplexity
      const searchResponse = await perplexityService.generateCustomResponse(
        query,
        options.additionalContext
      );

      // If streaming is requested, handle differently
      if (options.streamResponse && options.onUpdate) {
        return this.generateStreamingIntegratedResponse(
          query,
          searchResponse,
          options
        );
      }

      // Step 2: Summarize and synthesize with Gemini
      const summaryResponse = await geminiService.generateCustomResponse(
        SYNTHESIZED_RESPONSE_PROMPT,
        searchResponse.text
      );

      // Step 3: Combine the results
      return {
        text: summaryResponse.text,
        sources: options.includeSourceData ? {
          search: searchResponse,
          summary: summaryResponse
        } : undefined,
        usage: (searchResponse.usage && summaryResponse.usage) ? {
          search_tokens: searchResponse.usage.total_tokens,
          summary_tokens: summaryResponse.usage.total_tokens,
          total_tokens: searchResponse.usage.total_tokens + summaryResponse.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error generating integrated response:', error);
      return {
        text: 'I encountered an error while processing your request. Please try again later.'
      };
    }
  }

  /**
   * Generate a streaming integrated response
   * @param query The user's query
   * @param searchResponse The search response from Perplexity
   * @param options Integration options
   * @returns The integrated response
   */
  private async generateStreamingIntegratedResponse(
    query: string,
    searchResponse: PerplexityServiceResponse,
    options: IntegrationOptions
  ): Promise<IntegratedResponse> {
    try {
      // Use Gemini to generate a streaming summary based on the search results
      const summaryText = await geminiService.streamSummary(
        searchResponse.text,
        options.onUpdate!,
        options.additionalContext
      );

      return {
        text: summaryText,
        sources: options.includeSourceData ? {
          search: searchResponse,
          summary: {
            text: summaryText,
            model: 'gemini-1.5-flash'
          }
        } : undefined,
        usage: searchResponse.usage ? {
          search_tokens: searchResponse.usage.total_tokens,
          summary_tokens: 0, // Not available for streaming responses
          total_tokens: searchResponse.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error generating streaming integrated response:', error);
      return {
        text: 'I encountered an error while processing your streaming request. Please try again later.'
      };
    }
  }

  /**
   * Generate a response with only search results from Perplexity
   * @param query The user's query
   * @param options Integration options
   * @returns The search response
   */
  async generateSearchOnlyResponse(
    query: string,
    options: IntegrationOptions = {}
  ): Promise<IntegratedResponse> {
    try {
      // Get search results from Perplexity
      const searchResponse = await perplexityService.generateCustomResponse(
        query,
        options.additionalContext
      );

      return {
        text: searchResponse.text,
        sources: options.includeSourceData ? {
          search: searchResponse,
          summary: { text: '' }
        } : undefined,
        usage: searchResponse.usage ? {
          search_tokens: searchResponse.usage.total_tokens,
          summary_tokens: 0,
          total_tokens: searchResponse.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error generating search-only response:', error);
      return {
        text: 'I encountered an error while processing your search request. Please try again later.'
      };
    }
  }

  /**
   * Generate a response with only summarization from Gemini
   * @param content The content to summarize
   * @param options Integration options
   * @returns The summary response
   */
  async generateSummaryOnlyResponse(
    content: string,
    options: IntegrationOptions = {}
  ): Promise<IntegratedResponse> {
    try {
      // Generate summary with Gemini
      const summaryResponse = await geminiService.generateSummary(
        content,
        options.additionalContext
      );

      return {
        text: summaryResponse.text,
        sources: options.includeSourceData ? {
          search: { text: content },
          summary: summaryResponse
        } : undefined,
        usage: summaryResponse.usage ? {
          search_tokens: 0,
          summary_tokens: summaryResponse.usage.total_tokens,
          total_tokens: summaryResponse.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Error generating summary-only response:', error);
      return {
        text: 'I encountered an error while processing your summarization request. Please try again later.'
      };
    }
  }
}

// Export a singleton instance
export const integrationService = new IntegrationService();
