/**
 * Service for interacting with Google's Gemini AI models
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { 
  GEMINI_API_KEY, 
  GEMINI_MODEL, 
  GEMINI_MAX_TOKENS, 
  GEMINI_TEMPERATURE,
  GENERAL_SYSTEM_PROMPT,
  BLOCKCHAIN_SYSTEM_PROMPT
} from '../config/gemini.config';

/**
 * Service for interacting with Google's Gemini AI models
 */
export class GeminiService {
  private model!: GenerativeModel;

  constructor() {
    // Initialize the Gemini API client if API key is available
    if (GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          maxOutputTokens: GEMINI_MAX_TOKENS,
          temperature: GEMINI_TEMPERATURE
        }
      });
    }
  }

  /**
   * Generate a response from Gemini based on a user query and context
   * @param query The user's query
   * @param context Additional context to provide to the model
   * @param blockchainData Optional blockchain data to provide to the model
   * @returns The generated response text
   */
  async generateResponse(query: string, context?: string, blockchainData?: any): Promise<string> {
    try {
      // If API key is not set, return a fallback message
      if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not set. Using fallback response.');
        return 'I need an API key to provide intelligent responses. Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable.';
      }

      // Construct the prompt with the query and context
      let prompt = '';
      
      if (blockchainData) {
        // If we have blockchain data, include it in the prompt
        const blockchainDataStr = typeof blockchainData === 'string' 
          ? blockchainData 
          : JSON.stringify(blockchainData, null, 2);
          
        prompt = `${GENERAL_SYSTEM_PROMPT}

User query: ${query}

Context information: ${context || ''}

Blockchain data from Solana substreams:
${blockchainDataStr}

Please respond to the user's query using the provided blockchain data and context information when relevant. If the blockchain data is helpful for answering the query, incorporate insights from it.

Format your response using Markdown:
- Use **bold** for emphasis
- Use bullet points and numbered lists for steps
- Use headings (##) for sections
- Use code blocks for technical content
- Use > for important notes

Make your response visually structured and easy to read.`;
      } else if (context) {
        prompt = `${GENERAL_SYSTEM_PROMPT}

User query: ${query}

Context information: ${context}

Please respond to the user's query using the provided context information when relevant.

Format your response using Markdown:
- Use **bold** for emphasis
- Use bullet points and numbered lists for steps
- Use headings (##) for sections
- Use code blocks for technical content
- Use > for important notes

Make your response visually structured and easy to read.`;
      } else {
        prompt = `${GENERAL_SYSTEM_PROMPT}

User query: ${query}

Format your response using Markdown:
- Use **bold** for emphasis
- Use bullet points and numbered lists for steps
- Use headings (##) for sections
- Use code blocks for technical content
- Use > for important notes

Make your response visually structured and easy to read.`;
      }

      // Generate a response from Gemini
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      // Extract and return the text from the response
      return response.text();
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      return 'I encountered an error while processing your request. Please try again later.';
    }
  }

  /**
   * Generate a response from Gemini based on blockchain data
   * @param query The user's query
   * @param blockchainData JSON string of blockchain data
   * @returns The generated response text
   */
  async generateBlockchainResponse(query: string, blockchainData: string): Promise<string> {
    try {
      // If API key is not set, return a fallback message
      if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not set. Using fallback response.');
        return 'I need an API key to provide intelligent blockchain analysis. Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable.';
      }

      // Construct the prompt with the query and blockchain data
      const prompt = `${BLOCKCHAIN_SYSTEM_PROMPT}

User query: ${query}

Blockchain data:
${blockchainData}

Analyze the blockchain data and respond to the user's query.

Format your response using Markdown:
- Use **bold** for emphasis and important data points
- Use bullet points for listing information
- Use numbered lists for steps or sequences
- Use headings (##) to organize different sections of your response
- Use code blocks for addresses, transaction hashes, or technical data
- Use tables for structured data when appropriate
- Use > for highlighting important insights or warnings

Make your response visually structured and easy to read.`;

      // Generate a response from Gemini
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      // Extract and return the text from the response
      return response.text();
    } catch (error) {
      console.error('Error generating blockchain response from Gemini:', error);
      return 'I encountered an error while analyzing the blockchain data. Please try again later.';
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
