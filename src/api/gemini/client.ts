/**
 * Google Gemini API Client
 * Low-level client for interacting with the Google Gemini API using the official SDK
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Gemini message structure
 */
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: {
    text: string;
  }[];
}

/**
 * Gemini API response structure
 */
export interface GeminiApiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    safetyRatings: Array<{
    category: string;
    probability: string;
  }>;
  }[];
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Gemini API Client using the official Google Generative AI SDK
 */
export class GeminiClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly genAI: GoogleGenerativeAI;
  private readonly generativeModel: GenerativeModel;

  /**
   * Create a new Gemini client
   * @param apiKey API key (defaults to environment variable)
   * @param model Model to use (defaults to gemini-1.5-flash)
   */
  constructor(
    apiKey: string = GEMINI_API_KEY,
    model: string = 'gemini-1.5-flash'
  ) {
    this.apiKey = apiKey;
    this.model = model;

    if (!this.apiKey) {
      console.warn('No Gemini API key provided. API calls will fail.');
    }
    
    // Initialize the Google Generative AI client
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.generativeModel = this.genAI.getGenerativeModel({ model: this.model });
  }

  /**
   * Generate a completion from the Gemini API
   * @param messages Messages to send to the API
   * @returns Gemini API response
   */
  async createCompletion(messages: GeminiMessage[]): Promise<GeminiApiResponse> {
    try {
      // Convert messages to the format expected by the SDK
      const formattedMessages = this.formatMessages(messages);
      
      // Generate content using the SDK
      const result = await this.generativeModel.generateContent({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      });
      
      const response = result.response;
      
      // Format response to match the GeminiApiResponse interface
      return {
        candidates: [{
          content: {
            parts: response.text() ? [{ text: response.text() }] : [],
            role: 'model'
          },
          finishReason: 'STOP',
          safetyRatings: response.promptFeedback?.safetyRatings || []
        }],
        promptFeedback: response.promptFeedback,
        usageMetadata: response.usageMetadata ? {
          promptTokenCount: response.usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata.totalTokenCount || 0
        } : undefined
      };
    } catch (error) {
      console.error('Error in Gemini API request:', error);
      throw error;
    }
  }

  /**
   * Generate a streaming completion from the Gemini API
   * @param messages Messages to send to the API
   * @param onUpdate Callback function for streaming updates
   * @returns The final complete response
   */
  private formatMessages(messages: GeminiMessage[]) {
    return messages.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(part => ({ text: part.text }))
    }));
  }
  /**
   * Generate a streaming completion from the Gemini API
   * @param messages Messages to send to the API
   * @param onUpdate Callback function for streaming updates
   * @returns The final complete response
   */
  async createStreamingCompletion(
    messages: GeminiMessage[],
    onUpdate: (partialResponse: string) => void
  ): Promise<string> {
    try {
      // Convert messages to the format expected by the SDK
      const formattedMessages = this.formatMessages(messages);
      
      // Generate streaming content using the SDK
      const streamResult = await this.generativeModel.generateContentStream({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      });

      let fullResponse = '';
      
      // Process the stream
      for await (const chunk of streamResult.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          onUpdate(chunkText);
          fullResponse += chunkText;
        }
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error in Gemini streaming API request:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const geminiClient = new GeminiClient();
