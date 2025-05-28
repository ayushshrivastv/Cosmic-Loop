/**
 * Sonar-Gemini Integration Service
 * Coordinates between Perplexity Sonar API (for search) and Google Gemini API (for summarization)
 * to provide synthesized, up-to-date responses
 */

import { perplexitySonarService, SonarServiceResponse } from '../perplexity/sonar-service';
import { geminiService, GeminiServiceResponse } from '../gemini/service';
import { SYNTHESIZED_RESPONSE_PROMPT } from '../gemini/prompts';

/**
 * Structure for the integrated response
 */
export interface IntegratedResponse {
  text: string;
  references?: {
    domain: string;
    url: string;
    title: string;
    snippet: string;
  }[];
  sources?: {
    search: SonarServiceResponse;
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
  includeReferences?: boolean;
  streamResponse?: boolean;
  onUpdate?: (partialResponse: string, status?: string) => void;
  additionalContext?: string;
  domainFilters?: {
    include?: string[];
    exclude?: string[];
  };
  academicSearch?: boolean;
}

/**
 * Sonar-Gemini Integration Service class
 */
export class SonarGeminiService {
  /**
   * Generate an integrated response using Perplexity Sonar for search and Gemini for summarization
   * @param query The user's query
   * @param options Integration options
   * @returns The integrated response
   */
  async generateIntegratedResponse(
    query: string,
    options: IntegrationOptions = {}
  ): Promise<IntegratedResponse> {
    try {
      // Step 1: Get search results from Perplexity Sonar API
      let searchResponse: SonarServiceResponse;
      
      if (options.academicSearch) {
        // Use academic search if specified
        searchResponse = await perplexitySonarService.academicSearch(query);
      } else if (options.domainFilters && (options.domainFilters.include?.length || options.domainFilters.exclude?.length)) {
        // Use domain filtering if specified
        searchResponse = await perplexitySonarService.searchWithDomainFilter(
          query, 
          options.domainFilters.include || [],
          options.domainFilters.exclude || []
        );
      } else {
        // Use standard search
        searchResponse = await perplexitySonarService.search(query);
      }

      // If streaming is requested, handle differently
      if (options.streamResponse && options.onUpdate) {
        return this.generateStreamingIntegratedResponse(
          query,
          searchResponse,
          options
        );
      }

      // Step 2: Summarize and synthesize with Gemini
      // Prepare context from references for better summarization
      let referencesContext = '';
      if (searchResponse.references && searchResponse.references.length > 0) {
        referencesContext = 'References:\n' + searchResponse.references.map((ref, index) => 
          `[${index + 1}] ${ref.title} (${ref.domain})\n${ref.snippet}\nURL: ${ref.url}`
        ).join('\n\n');
      }

      // Combine search results with references for complete context
      const fullContext = `${searchResponse.text}\n\n${referencesContext}`;
      
      // Generate a synthesized response with Gemini
      const summaryResponse = await geminiService.generateCustomResponse(
        SYNTHESIZED_RESPONSE_PROMPT,
        fullContext
      );

      // Step 3: Combine the results
      return {
        text: summaryResponse.text,
        references: options.includeReferences ? searchResponse.references : undefined,
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
   * @param searchResponse The search response from Perplexity Sonar
   * @param options Integration options
   * @returns The integrated response
   */
  private async generateStreamingIntegratedResponse(
    query: string,
    searchResponse: SonarServiceResponse,
    options: IntegrationOptions
  ): Promise<IntegratedResponse> {
    try {
      // Notify about completed search
      options.onUpdate?.('', 'search_complete');

      // Prepare context from references
      let referencesContext = '';
      if (searchResponse.references && searchResponse.references.length > 0) {
        referencesContext = 'References:\n' + searchResponse.references.map((ref, index) => 
          `[${index + 1}] ${ref.title} (${ref.domain})\n${ref.snippet}\nURL: ${ref.url}`
        ).join('\n\n');
      }

      // Combine search results with references
      const fullContext = `${searchResponse.text}\n\n${referencesContext}`;
      
      // Use Gemini to generate a streaming summary based on the search results
      const summaryText = await geminiService.streamSummary(
        fullContext,
        (chunk) => options.onUpdate?.(chunk, 'generating'),
        options.additionalContext
      );

      // Send completion signal
      options.onUpdate?.('', 'complete');

      return {
        text: summaryText,
        references: options.includeReferences ? searchResponse.references : undefined,
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
      options.onUpdate?.('An error occurred while generating the response.', 'error');
      return {
        text: 'I encountered an error while processing your streaming request. Please try again later.'
      };
    }
  }

  /**
   * Generate a response with only search results from Perplexity Sonar
   * @param query The user's query
   * @param options Integration options
   * @returns The search response
   */
  async generateSearchOnlyResponse(
    query: string,
    options: IntegrationOptions = {}
  ): Promise<IntegratedResponse> {
    try {
      // Choose the appropriate search method based on options
      let searchResponse: SonarServiceResponse;
      
      if (options.academicSearch) {
        searchResponse = await perplexitySonarService.academicSearch(query);
      } else if (options.domainFilters && (options.domainFilters.include?.length || options.domainFilters.exclude?.length)) {
        searchResponse = await perplexitySonarService.searchWithDomainFilter(
          query, 
          options.domainFilters.include || [],
          options.domainFilters.exclude || []
        );
      } else {
        searchResponse = await perplexitySonarService.search(query);
      }

      return {
        text: searchResponse.text,
        references: options.includeReferences ? searchResponse.references : undefined,
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
   * Stream search results only from Perplexity Sonar
   * @param query The user's query
   * @param onUpdate Callback function for streaming updates
   * @param options Integration options
   * @returns Final response text
   */
  async streamSearchOnly(
    query: string,
    onUpdate: (partialResponse: string, status?: string) => void,
    options: IntegrationOptions = {}
  ): Promise<string> {
    try {
      // Stream search results from Perplexity Sonar
      const responseText = await perplexitySonarService.streamSearch(
        query,
        (chunk, isComplete) => {
          onUpdate(chunk, isComplete ? 'complete' : 'generating');
        },
        {
          web_search: true,
          focus: options.academicSearch ? 'scholar' : 'internet',
          include_domains: options.domainFilters?.include,
          exclude_domains: options.domainFilters?.exclude,
          search_depth: 'advanced'
        }
      );
      
      return responseText;
    } catch (error) {
      console.error('Error streaming search results:', error);
      onUpdate('An error occurred while streaming search results.', 'error');
      return 'I encountered an error while streaming search results. Please try again later.';
    }
  }
}

// Export a singleton instance
export const sonarGeminiService = new SonarGeminiService();
