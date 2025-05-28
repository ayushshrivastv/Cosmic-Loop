/**
 * Perplexity API Prompt Engineering Service
 * 
 * This service enhances the Perplexity API integration by applying prompt engineering
 * techniques to optimize responses for different types of questions.
 */

import { perplexityService, PerplexityServiceResponse } from './service';
import { PerplexityMessage } from './client';
import { 
  BASE_PROMPT, 
  SOLANA_DEVELOPMENT_PROMPT, 
  BLOCKCHAIN_DATA_PROMPT,
  CROSS_CHAIN_PROMPT,
  BLOCKCHAIN_EDUCATION_PROMPT,
  ECOSYSTEM_PROMPT,
  selectPromptTemplate
} from './prompts';

/**
 * Query category for prompt engineering
 */
export type QueryCategory = 
  | 'development'
  | 'data_analysis'
  | 'cross_chain'
  | 'education'
  | 'ecosystem'
  | 'general';

/**
 * Enhanced response with query categorization
 */
export interface EnhancedResponse extends PerplexityServiceResponse {
  category: QueryCategory;
  enhancedWith?: string;
}

/**
 * Prompt Engineering Service for the Perplexity API
 */
export class PromptEngineeringService {
  /**
   * Classify a query into a category for prompt selection
   * @param query The user's query
   * @returns The query category
   */
  classifyQuery(query: string): QueryCategory {
    const normalizedQuery = query.toLowerCase();
    
    // Development-related queries
    if (normalizedQuery.match(/program|rust|anchor|transaction|account|instruction|spl|token|contract|code|develop|program|compile|error|bug|fix/)) {
      return 'development';
    }
    
    // Data analysis queries
    if (normalizedQuery.match(/data|metric|stat|volume|activity|analyze|track|monitor|measure|trend|graph|chart|history/)) {
      return 'data_analysis';
    }
    
    // Cross-chain queries
    if (normalizedQuery.match(/cross.?chain|bridge|layer.?zero|interoperability|messaging|wormhole|portal|transfer|multi.?chain/)) {
      return 'cross_chain';
    }
    
    // Educational queries
    if (normalizedQuery.match(/explain|what is|how does|concept|understand|learn|beginner|introduction|tutorial|guide/)) {
      return 'education';
    }
    
    // Ecosystem queries
    if (normalizedQuery.match(/ecosystem|project|protocol|dapp|community|comparison|versus|vs|adoption|market|team/)) {
      return 'ecosystem';
    }
    
    // Default to general category
    return 'general';
  }
  
  /**
   * Get the appropriate system prompt for a query
   * @param query The user's query
   * @param category Optional category override
   * @returns The optimized system prompt
   */
  getSystemPrompt(query: string, category?: QueryCategory): string {
    const queryCategory = category || this.classifyQuery(query);
    
    switch (queryCategory) {
      case 'development':
        return SOLANA_DEVELOPMENT_PROMPT;
      case 'data_analysis':
        return BLOCKCHAIN_DATA_PROMPT;
      case 'cross_chain':
        return CROSS_CHAIN_PROMPT;
      case 'education':
        return BLOCKCHAIN_EDUCATION_PROMPT;
      case 'ecosystem':
        return ECOSYSTEM_PROMPT;
      default:
        return BASE_PROMPT;
    }
  }
  
  /**
   * Apply prompt engineering techniques to enhance a query
   * @param query The original user query
   * @returns The enhanced query with additional context and instructions
   */
  enhanceQuery(query: string): string {
    const category = this.classifyQuery(query);
    let enhancedQuery = query;
    
    // Add specific enhancements based on query category
    switch (category) {
      case 'development':
        enhancedQuery += "\n\nPlease include code examples where appropriate and highlight best practices. If there are common pitfalls or security considerations, please mention them.";
        break;
      case 'data_analysis':
        enhancedQuery += "\n\nPlease provide data-driven insights and explain the significance of any metrics or trends you mention. Use tables or lists to organize information clearly.";
        break;
      case 'cross_chain':
        enhancedQuery += "\n\nPlease explain the underlying mechanisms and security considerations. Compare different approaches if relevant.";
        break;
      case 'education':
        enhancedQuery += "\n\nPlease explain this in a way that's accessible to someone new to blockchain technology. Start with simple analogies if helpful, then build to more technical details.";
        break;
      case 'ecosystem':
        enhancedQuery += "\n\nPlease provide factual, objective information about relevant projects and protocols. Include adoption metrics if available.";
        break;
    }
    
    return enhancedQuery;
  }
  
  /**
   * Process a query with prompt engineering techniques
   * @param query The user's query
   * @param additionalContext Optional additional context
   * @returns Enhanced response with category information
   */
  async processQuery(
    query: string,
    additionalContext?: string
  ): Promise<EnhancedResponse> {
    try {
      // Classify the query
      const category = this.classifyQuery(query);
      
      // Get the appropriate system prompt
      const systemPrompt = this.getSystemPrompt(query, category);
      
      // Enhance the query with additional instructions
      const enhancedQuery = this.enhanceQuery(query);
      
      // Create the messages array with system prompt and enhanced query
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: additionalContext 
            ? `${additionalContext}\n\nUser query: ${enhancedQuery}`
            : enhancedQuery
        }
      ];
      
      // Make the API request using the perplexityService
      const response = await perplexityService.generateCustomResponse(
        enhancedQuery,
        systemPrompt,
        additionalContext
      );
      
      // Return the enhanced response with category information
      return {
        ...response,
        category,
        enhancedWith: category !== 'general' ? category : undefined
      };
    } catch (error) {
      console.error('Error in prompt engineering processing:', error);
      return {
        text: 'I encountered an error while processing your question. Please try again.',
        category: 'general'
      };
    }
  }
  
  /**
   * Process a streaming query with prompt engineering techniques
   * @param query The user's query
   * @param onUpdate Callback function for streaming updates
   * @param additionalContext Optional additional context
   * @returns The final complete response
   */
  async processStreamingQuery(
    query: string,
    onUpdate: (partialResponse: string) => void,
    additionalContext?: string
  ): Promise<string> {
    try {
      // Get the appropriate system prompt
      const systemPrompt = this.getSystemPrompt(query);
      
      // Enhance the query with additional instructions
      const enhancedQuery = this.enhanceQuery(query);
      
      // Create the messages array with system prompt and enhanced query
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: additionalContext 
            ? `${additionalContext}\n\nUser query: ${enhancedQuery}`
            : enhancedQuery
        }
      ];
      
      // Make the streaming API request
      return await perplexityService.streamFinancialAnalysis(
        enhancedQuery,
        onUpdate,
        additionalContext
      );
    } catch (error) {
      console.error('Error in streaming prompt engineering:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const promptEngineeringService = new PromptEngineeringService();
