/**
 * Enhanced AI Service
 * 
 * Integrates prompt engineering with Gemini and Perplexity
 * to provide faster, more concise, and on-point responses
 */

import { perplexityService } from '../../services/perplexity-service';
import { geminiService } from '../../services/gemini-service';
import { GeminiClient, GeminiMessage } from '../../api/gemini/client';
import { BlockchainData } from '../../api/perplexity/types';
import { 
  FAST_RESPONSE_CONFIG, 
  createSearchChain, 
  createSummaryChain, 
  createIntegrationChain,
  measureResponseTime
} from './index';
import { formatResponseWithSources, formatFinancialData, formatSimpleQA } from './templates';

/**
 * Response interface for the enhanced AI service
 */
export interface EnhancedAIResponse {
  text: string;
  sources?: {
    search?: { text: string; model?: string };
    summary?: { text: string; model?: string };
  };
  metadata?: {
    latency: {
      search?: number;
      summary?: number;
      total: number;
    };
    tokens?: {
      search?: number;
      summary?: number;
      total: number;
    };
    error?: {
      message: string;
      code?: string;
    };
  };
}

/**
 * Options for the enhanced AI service
 */
export interface EnhancedAIOptions {
  includeSourceData?: boolean;
  streamResponse?: boolean;
  onUpdate?: (partialResponse: string) => void;
  additionalContext?: string;
  maxResponseLength?: number;
}

/**
 * Interfaces and type guards for LangChain invoke() result shapes
 */
interface LangChainTextResult { text: string; }
interface LangChainOutputResult { output: string; }
interface LangChainContentResult { content: string; }

function isLangChainTextResult(obj: unknown): obj is LangChainTextResult {
  return typeof obj === 'object' && obj !== null && 
         Object.prototype.hasOwnProperty.call(obj, 'text') && 
         typeof (obj as { text: unknown }).text === 'string';
}

function isLangChainOutputResult(obj: unknown): obj is LangChainOutputResult {
  return typeof obj === 'object' && obj !== null && 
         Object.prototype.hasOwnProperty.call(obj, 'output') && 
         typeof (obj as { output: unknown }).output === 'string';
}

function isLangChainContentResult(obj: unknown): obj is LangChainContentResult {
  return typeof obj === 'object' && obj !== null && 
         Object.prototype.hasOwnProperty.call(obj, 'content') && 
         typeof (obj as { content: unknown }).content === 'string';
}

type LangChainInvokeResult = 
  string | 
  LangChainTextResult |
  LangChainOutputResult |
  LangChainContentResult |
  Record<string, unknown>; // Fallback for other object shapes

/**
 * Enhanced AI Service class
 * Uses prompt engineering to optimize responses
 */
export class EnhancedAIService {
  private geminiClient: GeminiClient;
  
  constructor() {
    // Initialize with default client from gemini service
    this.geminiClient = new GeminiClient(
      process.env.GEMINI_API_KEY,
      'gemini-1.5-flash'
    );
  }
  
  /**
   * Generate an optimized, concise response using both Perplexity and Gemini
   */
  async generateConciseResponse(
    query: string,
    options: EnhancedAIOptions = {}
  ): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Get search results from Perplexity with timing
      const [searchResponse, searchLatency] = await measureResponseTime(async () => {
        // Use the available generateFinancialAnalysis method
        let blockchainData: BlockchainData | undefined;
        if (options.additionalContext) {
          blockchainData = {
            type: 'context',
            events: [{ context: options.additionalContext } as Record<string, unknown>]
          };
        }
          
        const text = await perplexityService.generateFinancialAnalysis(
          query,
          blockchainData
        );
        
        return {
          text,
          model: 'sonar-medium-online',
          usage: {
            total_tokens: Math.round(text.length / 4) // Rough estimate of tokens
          }
        };
      });
      
      // Step 2: Process through prompt engineering for concise integration
      const [summaryResponse, summaryLatency] = await measureResponseTime(async () => {
        // Create integration chain
        const chain = createIntegrationChain();
        
        // Run the chain with our search results
        const invokeResult: unknown = await chain.invoke({
          searchResults: searchResponse.text,
          additionalContext: options.additionalContext || ''
        });

        // Ensure result.text is a string, checking common LangChain output formats
        let resultText = '';
        if (typeof invokeResult === 'string') {
          resultText = invokeResult;
        } else if (isLangChainTextResult(invokeResult)) {
          const guardedResult: LangChainTextResult = invokeResult;
          resultText = guardedResult.text;
        } else if (isLangChainOutputResult(invokeResult)) {
          const guardedResult: LangChainOutputResult = invokeResult;
          resultText = guardedResult.output;
        } else if (isLangChainContentResult(invokeResult)) {
          const guardedResult: LangChainContentResult = invokeResult;
          resultText = guardedResult.content;
        } else if (typeof invokeResult === 'object' && invokeResult !== null) {
          console.warn('Unexpected invokeResult structure in generateConciseResponse:', invokeResult);
        } else {
          console.warn('invokeResult is not a string or known object type in generateConciseResponse:', invokeResult);
        }
        
        return {
          text: resultText,
          model: 'gemini-1.5-flash'
        };
      });
      
      const endTime = Date.now();
      const totalLatency = endTime - startTime;
      
      // Extract potential sources from the response text
      const sourcesRegex = /\[(\d+)\]\s*([^\[\]]+)/g;
      const sources: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = sourcesRegex.exec(searchResponse.text)) !== null) {
        if (match[2]) {
          sources.push(match[2].trim());
        }
      }
      
      // Format the response using our template
      const formattedText = formatResponseWithSources(summaryResponse.text, sources);
      
      // Return optimized response
      return {
        text: formattedText,
        sources: options.includeSourceData ? {
          search: {
            text: searchResponse.text,
            model: searchResponse.model
          },
          summary: {
            text: summaryResponse.text,
            model: 'gemini-1.5-flash'
          }
        } : undefined,
        metadata: {
          latency: {
            search: searchLatency,
            summary: summaryLatency,
            total: totalLatency
          },
          tokens: searchResponse.usage ? {
            search: searchResponse.usage.total_tokens,
            total: searchResponse.usage.total_tokens
          } : undefined
        }
      };
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }
  
  /**
   * Generate a streaming concise response
   */
  async generateStreamingConciseResponse(
    query: string,
    options: EnhancedAIOptions
  ): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    
    try {
      if (!options.onUpdate) {
        throw new Error('onUpdate callback is required for streaming responses');
      }
      
      // Step 1: Get search results from Perplexity
      const [searchResponse, searchLatency] = await measureResponseTime(async () => {
        // Use the available generateFinancialAnalysis method
        let blockchainData: BlockchainData | undefined;
        if (options.additionalContext) {
          blockchainData = {
            type: 'context',
            events: [{ context: options.additionalContext } as Record<string, unknown>]
          };
        }
          
        const text = await perplexityService.generateFinancialAnalysis(
          query,
          blockchainData
        );
        
        return {
          text,
          model: 'sonar-medium-online',
          usage: {
            total_tokens: Math.round(text.length / 4) // Rough estimate of tokens
          }
        };
      });
      
      // Notify that search is complete
      options.onUpdate('');
      
      // Step 2: Create a concise prompt for Gemini
      const prompt = `
You are an AI assistant that provides brief, direct answers based on search results.

SEARCH RESULTS:
${searchResponse.text}

ADDITIONAL CONTEXT:
${options.additionalContext || ''}

INSTRUCTIONS:
1. Respond in 5 sentences or less
2. Focus only on directly answering the query
3. Use simple language and short sentences
4. Skip unnecessary context or explanations
5. If the search results don't contain a clear answer, say so briefly
6. For technical topics, prioritize accuracy over simplicity
7. If you reference sources, use numbered citations like [1], [2], etc.
8. Make sure to include the source citations in your response

YOUR CONCISE RESPONSE:`;
      
      // Step 3: Stream the response from Gemini
      const messages: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];
      
      let fullResponse = '';
      
      const summaryStartTime = Date.now();
      
      // Use streaming API with the optimized prompt
      fullResponse = await this.geminiClient.createStreamingCompletion(
        messages,
        options.onUpdate
      );
      
      const summaryLatency = Date.now() - summaryStartTime;
      const totalLatency = Date.now() - startTime;
      
      // Extract potential sources from the response text
      const sourcesRegex = /\[(\d+)\]\s*([^\[\]]+)/g;
      const sources: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = sourcesRegex.exec(searchResponse.text)) !== null) {
        if (match[2]) {
          sources.push(match[2].trim());
        }
      }
      
      // Format the response using our template
      const formattedText = formatSimpleQA(fullResponse, sources);
      
      return {
        text: formattedText,
        sources: options.includeSourceData ? {
          search: {
            text: searchResponse.text,
            model: searchResponse.model
          },
          summary: {
            text: fullResponse,
            model: 'gemini-1.5-flash'
          }
        } : undefined,
        metadata: {
          latency: {
            search: searchLatency,
            summary: summaryLatency,
            total: totalLatency
          },
          tokens: searchResponse.usage ? {
            search: searchResponse.usage.total_tokens,
            total: searchResponse.usage.total_tokens
          } : undefined
        }
      };
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }
  
  /**
   * Generate a search-only response with concise formatting
   */
  async generateConciseSearchResponse(
    query: string,
    options: EnhancedAIOptions = {}
  ): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    
    try {
      // Get search results from Perplexity
      const [searchResponse, searchLatency] = await measureResponseTime(async () => {
        // Use the available generateFinancialAnalysis method
        let blockchainData: BlockchainData | undefined;
        if (options.additionalContext) {
          blockchainData = {
            type: 'context',
            events: [{ context: options.additionalContext } as Record<string, unknown>]
          };
        }
          
        const text = await perplexityService.generateFinancialAnalysis(
          query,
          blockchainData
        );
        
        return {
          text,
          model: 'sonar-medium-online',
          usage: {
            total_tokens: Math.round(text.length / 4) // Rough estimate of tokens
          }
        };
      });
      
      // Process through prompt engineering for concise formatting
      const [formattedResponse, formattingLatency] = await measureResponseTime(async () => {
        // Create search chain
        const chain = createSearchChain();
        
        // Run the chain with our search results
        const invokeResult: unknown = await chain.invoke({
          context: searchResponse.text,
          query: query
        });

        // Ensure result.text is a string, checking common LangChain output formats
        let resultText = '';
        if (typeof invokeResult === 'string') {
          resultText = invokeResult;
        } else if (isLangChainTextResult(invokeResult)) {
          const guardedResult: LangChainTextResult = invokeResult;
          resultText = guardedResult.text;
        } else if (isLangChainOutputResult(invokeResult)) {
          const guardedResult: LangChainOutputResult = invokeResult;
          resultText = guardedResult.output;
        } else if (isLangChainContentResult(invokeResult)) {
          const guardedResult: LangChainContentResult = invokeResult;
          resultText = guardedResult.content;
        } else if (typeof invokeResult === 'object' && invokeResult !== null) {
          console.warn('Unexpected invokeResult structure in generateConciseSearchResponse:', invokeResult);
        } else {
          console.warn('invokeResult is not a string or known object type in generateConciseSearchResponse:', invokeResult);
        }
        
        return {
          text: resultText,
          model: searchResponse.model
        };
      });
      
      const totalLatency = Date.now() - startTime;
      
      // Extract potential sources from the response text
      const sourcesRegex = /\[(\d+)\]\s*([^\[\]]+)/g;
      const sources: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = sourcesRegex.exec(searchResponse.text)) !== null) {
        if (match[2]) {
          sources.push(match[2].trim());
        }
      }
      
      // Format the response using our template
      const formattedText = formatSimpleQA(formattedResponse.text, sources);
      
      return {
        text: formattedText,
        sources: options.includeSourceData ? {
          search: {
            text: searchResponse.text,
            model: searchResponse.model
          }
        } : undefined,
        metadata: {
          latency: {
            search: searchLatency,
            summary: formattingLatency,
            total: totalLatency
          },
          tokens: searchResponse.usage ? {
            search: searchResponse.usage.total_tokens,
            total: searchResponse.usage.total_tokens
          } : undefined
        }
      };
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }

  async handleStreamingResponse(URL: string, query: string, options: EnhancedAIOptions = {}): Promise<string> {
    try {
      // Implementation of streaming functionality
      // This is a placeholder for the actual implementation
      return "Streaming response not yet implemented";
    } catch (error) {
      return this.handleError(error, Date.now()).text;
    }
  }

  /**
   * Centralized error handler for the service
   */
  private handleError(error: unknown, startTime: number): EnhancedAIResponse {
    const typedError = error as Error & { code?: string; response?: { status?: number } };
    console.error('EnhancedAIService Error:', {
      message: typedError.message,
      code: typedError.code,
      status: typedError.response?.status,
      stack: typedError.stack
    });

    let errorMessage = 'I encountered an error. Please try again.';
    if (typedError.code === 'ECONNABORTED' || typedError.message.includes('timeout')) {
      errorMessage = 'The request timed out. Please try again with a simpler question.';
    } else if (typedError.response?.status === 429) {
      errorMessage = 'API rate limit reached. Please wait and try again.';
    } else if (typedError.message.includes('Network Error')) {
      errorMessage = 'Network issue. Please check your connection and try again.';
    }

    return {
      text: errorMessage,
      metadata: {
        latency: { total: Date.now() - startTime },
        error: { message: typedError.message, code: typedError.code },
      },
    };
  }
  
  /**
   * Integrates with the existing OpenAPI chatbot interface
   * Returns results in the exact format expected by the current UI
   */
  async processOpenAPIChatQuery(query: string): Promise<string> {
    try {
      const result = await this.generateConciseResponse(query, {
        includeSourceData: true,
        maxResponseLength: 350
      });
      return result.text;
    } catch (error) {
      console.error('Error in enhanced service integration:', error);
      const errorResponse = this.handleError(error, Date.now());
      return errorResponse.text;
    }
  }
}

// Export a singleton instance
export const enhancedAIService = new EnhancedAIService();
