/**
 * Service for handling chat interactions and optimizing Perplexity Sonar API usage
 * This service connects the chat input component with the enhanced Perplexity services
 */

import { enhancedPerplexityService } from './enhanced-perplexity-service';
import { enhancedSubstreamsPerplexityService } from './enhanced-substreams-perplexity-service';
import { AIQueryType } from './ai-assistant-service';

// Message interface
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  conversationId?: string;
  queryType?: AIQueryType;
  processingTime?: number;
  tokenUsage?: number;
}

// Chat handler service options
export interface ChatHandlerOptions {
  enableStreaming?: boolean;
  enableWebSearch?: boolean;
  enableBlockchainData?: boolean;
  preferredModel?: 'perplexity' | 'gemini';
  maxMessagesInContext?: number;
  debugMode?: boolean;
}

/**
 * Service for handling chat interactions
 */
export class ChatHandlerService {
  private conversations: Map<string, ChatMessage[]> = new Map();
  private options: ChatHandlerOptions;
  
  constructor(options: ChatHandlerOptions = {}) {
    // Set default options
    this.options = {
      enableStreaming: true,
      enableWebSearch: true,
      enableBlockchainData: true,
      preferredModel: 'perplexity',
      maxMessagesInContext: 10,
      debugMode: false,
      ...options
    };
    
    if (this.options.debugMode) {
      console.log('ChatHandlerService initialized with options:', this.options);
    }
  }
  
  /**
   * Process a user message and generate a response
   * @param message The user's message text
   * @param conversationId Optional conversation ID for context management
   * @param onUpdate Optional callback for streaming updates
   * @returns The generated response message
   */
  async processMessage(
    message: string,
    conversationId?: string,
    onUpdate?: (partialMessage: ChatMessage) => void
  ): Promise<ChatMessage> {
    const startTime = Date.now();
    
    try {
      // Generate a unique message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a user message
      const userMessage: ChatMessage = {
        id: messageId,
        text: message,
        sender: 'user',
        timestamp: new Date(),
        conversationId
      };
      
      // Add the user message to the conversation
      this.addMessageToConversation(conversationId, userMessage);
      
      // Create a placeholder assistant message
      const assistantMessageId = `msg_${Date.now() + 1}_${Math.random().toString(36).substring(2, 9)}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        text: 'Thinking...',
        sender: 'assistant',
        timestamp: new Date(),
        conversationId
      };
      
      // If streaming is enabled and we have an update callback, send the initial message
      if (this.options.enableStreaming && onUpdate) {
        onUpdate(assistantMessage);
      }
      
      // Detect the query type
      const queryType = await enhancedSubstreamsPerplexityService.detectQueryType(message);
      
      // Process the message based on query type and preferred model
      let response: string;
      let responseData: Record<string, unknown> = {};
      
      if (this.options.preferredModel === 'perplexity') {
        if (queryType === 'market_analysis' || queryType === 'general') {
          // For financial or general queries, use the financial analysis service
          const result = await enhancedSubstreamsPerplexityService.processFinancialQuery(
            message,
            conversationId
          );
          response = result.text;
          responseData = {
            queryType: result.queryType,
            conversationId: result.conversationId,
            tokenUsage: result.tokenUsage,
            processingTime: result.processingTime
          };
        } else if (this.options.enableBlockchainData) {
          // For blockchain-related queries, use the blockchain service
          const result = await enhancedSubstreamsPerplexityService.processBlockchainQuery(
            message,
            queryType,
            conversationId
          );
          response = result.text;
          responseData = {
            queryType: result.queryType,
            conversationId: result.conversationId,
            tokenUsage: result.tokenUsage,
            processingTime: result.processingTime
          };
        } else {
          // Fallback to general query processing
          const result = await enhancedSubstreamsPerplexityService.processGeneralQuery(
            message,
            conversationId
          );
          response = result.text;
          responseData = {
            queryType: result.queryType,
            conversationId: result.conversationId,
            tokenUsage: result.tokenUsage,
            processingTime: result.processingTime
          };
        }
      } else {
        // For other models (e.g., gemini), use a different service
        // This is a placeholder for future model support
        response = "I'm currently using the Perplexity model for optimal financial and blockchain analysis.";
        responseData = {
          queryType: 'general',
          processingTime: Date.now() - startTime
        };
      }
      
      // Create the final assistant message
      const finalAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
        conversationId: responseData.conversationId as string || conversationId,
        queryType: responseData.queryType as AIQueryType || queryType,
        processingTime: responseData.processingTime as number || (Date.now() - startTime),
        tokenUsage: responseData.tokenUsage as number | undefined
      };
      
      // Add the assistant message to the conversation
      this.addMessageToConversation(finalAssistantMessage.conversationId, finalAssistantMessage);
      
      // Log performance metrics in debug mode
      if (this.options.debugMode) {
        console.log(`Query processed in ${finalAssistantMessage.processingTime}ms, used ${finalAssistantMessage.tokenUsage || 'unknown'} tokens`);
      }
      
      return finalAssistantMessage;
    } catch (error) {
      console.error('Error in ChatHandlerService:', error);
      
      // Create an error message
      return {
        id: `error_${Date.now()}`,
        text: 'I encountered an error while processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        conversationId,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Process a user message with streaming updates
   * @param message The user's message text
   * @param conversationId Optional conversation ID for context management
   * @param onUpdate Callback for streaming updates
   * @returns The final generated response message
   */
  async processMessageWithStreaming(
    message: string,
    conversationId: string | undefined,
    onUpdate: (partialMessage: ChatMessage) => void
  ): Promise<ChatMessage> {
    const startTime = Date.now();
    
    try {
      // Generate a unique message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a user message
      const userMessage: ChatMessage = {
        id: messageId,
        text: message,
        sender: 'user',
        timestamp: new Date(),
        conversationId
      };
      
      // Add the user message to the conversation
      this.addMessageToConversation(conversationId, userMessage);
      
      // Create a placeholder assistant message
      const assistantMessageId = `msg_${Date.now() + 1}_${Math.random().toString(36).substring(2, 9)}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        text: 'Thinking...',
        sender: 'assistant',
        timestamp: new Date(),
        conversationId
      };
      
      // Send the initial message
      onUpdate(assistantMessage);
      
      // Detect the query type
      const queryType = await enhancedSubstreamsPerplexityService.detectQueryType(message);
      assistantMessage.queryType = queryType;
      
      // Update the message to show we're processing
      if (queryType === 'market_analysis') {
        assistantMessage.text = 'Analyzing financial data...';
      } else if (queryType !== 'general') {
        assistantMessage.text = `Processing ${queryType} data...`;
      } else {
        assistantMessage.text = 'Generating response...';
      }
      onUpdate(assistantMessage);
      
      // Get conversation messages for context
      const conversationMessages = this.getConversationMessages(conversationId);
      
      // Create a streaming callback
      const streamingCallback = (partialResponse: string) => {
        assistantMessage.text = partialResponse;
        assistantMessage.timestamp = new Date();
        onUpdate(assistantMessage);
      };
      
      // Process the message with streaming
      const finalResponse = await enhancedPerplexityService.makeStreamingRequest(
        [
          {
            role: 'system' as const,
            content: queryType === 'market_analysis' 
              ? 'You are a financial analysis assistant specialized in blockchain data.'
              : 'You are a helpful assistant specialized in blockchain technology.'
          },
          ...conversationMessages
            .slice(-this.options.maxMessagesInContext!)
            .map(msg => ({
              role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
              content: msg.text
            })),
          {
            role: 'user' as const,
            content: message
          }
        ],
        streamingCallback
      );
      
      // Create the final message
      const finalAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        text: finalResponse,
        sender: 'assistant',
        timestamp: new Date(),
        conversationId,
        queryType,
        processingTime: Date.now() - startTime
      };
      
      // Add the final message to the conversation
      this.addMessageToConversation(conversationId, finalAssistantMessage);
      
      return finalAssistantMessage;
    } catch (error) {
      console.error('Error in streaming message processing:', error);
      
      // Create an error message
      return {
        id: `error_${Date.now()}`,
        text: 'I encountered an error while processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        conversationId,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Get messages from a conversation
   * @param conversationId The conversation ID
   * @returns Array of messages in the conversation
   */
  getConversationMessages(conversationId?: string): ChatMessage[] {
    if (!conversationId) return [];
    return this.conversations.get(conversationId) || [];
  }
  
  /**
   * Add a message to a conversation
   * @param conversationId The conversation ID
   * @param message The message to add
   */
  private addMessageToConversation(conversationId: string | undefined, message: ChatMessage): void {
    if (!conversationId) return;
    
    const conversation = this.conversations.get(conversationId) || [];
    conversation.push(message);
    this.conversations.set(conversationId, conversation);
  }
  
  /**
   * Create a new conversation
   * @returns The new conversation ID
   */
  createNewConversation(): string {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.conversations.set(conversationId, []);
    return conversationId;
  }
  
  /**
   * Clear a conversation
   * @param conversationId The conversation ID to clear
   */
  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
    enhancedPerplexityService.clearConversation(conversationId);
  }
  
  /**
   * Update service options
   * @param options New options to apply
   */
  updateOptions(options: Partial<ChatHandlerOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
    
    if (this.options.debugMode) {
      console.log('ChatHandlerService options updated:', this.options);
    }
  }
  
  /**
   * Get service options
   * @returns Current service options
   */
  getOptions(): ChatHandlerOptions {
    return { ...this.options };
  }
}

// Export a singleton instance
export const chatHandlerService = new ChatHandlerService();
