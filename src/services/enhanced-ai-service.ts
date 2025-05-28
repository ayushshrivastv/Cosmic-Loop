/**
 * Enhanced AI Service Integration
 * 
 * This service integrates the prompt engineering module with the existing OpenAPI
 * chatbot while maintaining the current UI and UX
 */

import { 
  createSearchChain, 
  createSummaryChain, 
  createIntegrationChain,
  FAST_RESPONSE_CONFIG
} from '../api/prompt-engineering';
import { formatResponseWithSources } from '../api/prompt-engineering/templates';
import { perplexityService } from './perplexity-service';
import { geminiService } from './gemini-service';
import { BlockchainData } from '../api/perplexity/types';

/**
 * Enhanced AI Service
 * Provides optimized AI responses with better formatting and conciseness
 * without requiring UI changes to the OpenAPI page
 */
class EnhancedAIService {
  /**
   * Generate an optimized response using the enhanced service
   * Returns results in a format compatible with the existing OpenAPI chatbot
   */
  /**
   * Detect if a query is asking for simple factual information like prices
   * @param query The user query
   * @returns True if the query is asking for simple factual information
   */
  private isSimpleFactQuery(query: string): boolean {
    // Convert to lowercase for case-insensitive matching
    const lowerQuery = query.toLowerCase();
    
    // Check for price queries
    const isPriceQuery = (
      lowerQuery.includes('price') && 
      (lowerQuery.includes('today') || lowerQuery.includes('now') || lowerQuery.includes('current'))
    );
    
    // Check for other simple factual queries (can be expanded)
    const isSimpleFactual = (
      lowerQuery.match(/^(what|when|where|who|how much|how many)\s+(is|are|was|were)\s+/i) !== null &&
      lowerQuery.split(' ').length < 8 // Simple queries are usually short
    );
    
    return isPriceQuery || isSimpleFactual;
  }
  
  async generateResponse(
    query: string,
    conciseMode: boolean = true,
    blockchainData?: BlockchainData
  ): Promise<string> {
    try {
      // Start measuring response time
      const startTime = Date.now();

      // Step 1: Get search results from Perplexity
      const searchResults = await perplexityService.generateFinancialAnalysis(query);
      
      // Check if this is a simple factual query that needs a direct answer
      const isSimpleQuery = this.isSimpleFactQuery(query);
      
      // Step 2: Try to generate a summary with Gemini, but fall back to using just Perplexity if needed
      const maxTokens = conciseMode ? 150 : 500;
      
      // Adjust the prompt based on query type
      let geminiPrompt = isSimpleQuery
        ? `The user asked: "${query}". Extract ONLY the most direct answer from this information, in 1-2 sentences maximum. Be extremely concise and direct. If this is a price query, ALWAYS provide the current price information - do not say you don't have access to real-time prices:\n${searchResults}`
        : `Summarize this information concisely in ${maxTokens} tokens or less. If this is a price query, ALWAYS provide the current price information - do not say you don't have access to real-time prices:\n${searchResults}`;
      
      if (blockchainData) {
        geminiPrompt += `\n\nConsider this blockchain data in your response:\n${JSON.stringify(blockchainData)}`;
      }
      
      // Try to get a summary from Gemini, but handle the case where the API key is missing
      let summary = '';
      try {
        summary = await geminiService.generateResponse(geminiPrompt);
        
        // Check if we got the API key error message
        if (summary.includes('API key') && summary.includes('environment variable')) {
          console.warn('Gemini API key not available, using Perplexity response directly');
          summary = searchResults; // Fall back to using just the Perplexity response
        }
      } catch (error) {
        console.warn('Error using Gemini service, falling back to Perplexity response:', error);
        summary = searchResults; // Fall back to using just the Perplexity response
      }
      
      // Step 3: Format the response with sources (if available)
      const sourceMatches = searchResults.match(/Source: (.*?)(?:\n|$)/g);
      const sources = sourceMatches 
        ? sourceMatches.map(match => match.replace('Source: ', '').trim()) 
        : [];

      // Format the response in a way that works well with ChatAIResponseFormatter
      let formattedResponse = '';
      
      // For simple queries, provide a direct answer without sources
      if (isSimpleQuery) {
        formattedResponse = summary !== searchResults 
          ? summary.trim() // Use the summarized response for simple queries
          : searchResults.trim(); // Or fall back to the Perplexity response
          
        // Remove any numbered references like [1] from the text for simple queries
        formattedResponse = formattedResponse.replace(/\[\d+\]/g, '').trim();
      } else {
        // For complex queries, include sources in a format that ChatAIResponseFormatter can parse
        if (sources.length > 0 && summary !== searchResults) {
          // Format the main content and clean up reference numbers
          formattedResponse = summary.trim().replace(/\[\d+\]/g, '');
          
          // Add sources section if there are sources
          if (sources.length > 0) {
            formattedResponse += '\n\nSources:\n';
            sources.forEach((source, index) => {
              formattedResponse += `${index + 1}. ${source}\n`;
            });
          }
        } else {
          // If we're using the raw Perplexity response or there are no sources
          // Still clean up the reference numbers
          formattedResponse = searchResults.trim().replace(/\[\d+\]/g, '');
        }
      }
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      console.log(`Enhanced AI response generated in ${responseTime}ms`);
      
      return formattedResponse;
    } catch (error) {
      console.error('Error in enhanced AI service:', error);
      return 'I encountered an error processing your request. Please try again or try a different query.';
    }
  }
}

// Export a singleton instance
export const enhancedAIService = new EnhancedAIService();
