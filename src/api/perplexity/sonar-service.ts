/**
 * Perplexity Sonar API Service
 * Provides high-level methods for performing web searches with the Perplexity Sonar API
 */

import { perplexitySonarClient, SonarMessage, SonarSearchOptions, SonarApiResponse } from './client-sonar';

/**
 * Response structure for the Sonar API service
 */
export interface SonarServiceResponse {
  text: string;
  references?: {
    domain: string;
    url: string;
    title: string;
    snippet: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

/**
 * Perplexity Sonar API Service class
 */
export class PerplexitySonarService {
  /**
   * Perform a web search and generate a response
   * @param query The user's query
   * @param searchOptions Options for the web search
   * @returns The generated response with search results
   */
  async search(
    query: string,
    searchOptions: Partial<SonarSearchOptions> = {}
  ): Promise<SonarServiceResponse> {
    try {
      // Create the messages array with user query
      const messages: SonarMessage[] = [
        {
          role: 'user',
          content: query
        }
      ];

      // Set default search options if not provided
      const options: SonarSearchOptions = {
        web_search: true,
        search_depth: 'advanced',
        ...searchOptions
      };

      // Make the API request
      const response = await perplexitySonarClient.createSearchCompletion(messages, options);
      
      // Return the generated text, references, and usage statistics
      return {
        text: response.choices[0].message.content,
        references: response.references,
        usage: response.usage,
        model: 'sonar-medium-chat'
      };
    } catch (error) {
      console.error('Error performing Sonar search:', error);
      return {
        text: 'I encountered an error while searching for information. Please try again later.'
      };
    }
  }

  /**
   * Perform a web search with domain filtering
   * @param query The user's query
   * @param includeDomains Domains to include in the search
   * @param excludeDomains Domains to exclude from the search
   * @returns The generated response with filtered search results
   */
  async searchWithDomainFilter(
    query: string,
    includeDomains: string[] = [],
    excludeDomains: string[] = []
  ): Promise<SonarServiceResponse> {
    return this.search(query, {
      include_domains: includeDomains.length > 0 ? includeDomains : undefined,
      exclude_domains: excludeDomains.length > 0 ? excludeDomains : undefined
    });
  }

  /**
   * Perform an academic search using Sonar
   * @param query The user's academic query
   * @returns The generated response with academic search results
   */
  async academicSearch(query: string): Promise<SonarServiceResponse> {
    return this.search(query, {
      focus: 'scholar',
      search_depth: 'extended'
    });
  }

  /**
   * Stream search results from Sonar API
   * @param query The user's query
   * @param onUpdate Callback function for streaming updates
   * @param searchOptions Options for the web search
   * @returns The final complete response
   */
  async streamSearch(
    query: string,
    onUpdate: (partialResponse: string, isComplete: boolean) => void,
    searchOptions: Partial<SonarSearchOptions> = {}
  ): Promise<string> {
    try {
      // Create the messages array with user query
      const messages: SonarMessage[] = [
        {
          role: 'user',
          content: query
        }
      ];

      // Set default search options if not provided
      const options: SonarSearchOptions = {
        web_search: true,
        search_depth: 'advanced',
        ...searchOptions
      };

      // Make the streaming API request
      return await perplexitySonarClient.createStreamingSearchCompletion(
        messages,
        onUpdate,
        options
      );
    } catch (error) {
      console.error('Error in streaming Sonar search:', error);
      onUpdate('I encountered an error while streaming search results. Please try again later.', true);
      throw error;
    }
  }
}

// Export a singleton instance
export const perplexitySonarService = new PerplexitySonarService();
