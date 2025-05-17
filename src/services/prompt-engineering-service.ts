/**
 * Service for advanced prompt engineering
 * This service enhances the AI responses with structured prompts and templates
 */

import { GEMINI_API_KEY } from '../config/gemini.config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define a set of reusable prompt templates
const PROMPT_TEMPLATES = {
  // Template for blockchain analysis with concise output
  blockchainAnalysis: `
    You are a Solana blockchain expert analyzing on-chain data.
    
    USER QUERY: {{query}}
    
    BLOCKCHAIN DATA:
    {{blockchainData}}
    
    INSTRUCTIONS:
    1. Provide ONLY a direct answer to the user's query.
    2. Be concise and to the point.
    3. Only include information that directly answers the question.
    4. Do not add any additional explanations, context, or information not specifically asked for.
    5. If the blockchain data contains relevant information, include only the specific data points that answer the query.
    6. Use code blocks for addresses or technical data if needed.
    
    Keep your response brief and focused.
  `,
  
  // Template for NFT-specific analysis
  nftAnalysis: `
    You are a Solana NFT expert analyzing NFT activity data.
    
    USER QUERY: {{query}}
    
    NFT DATA:
    {{blockchainData}}
    
    INSTRUCTIONS:
    1. Provide ONLY a direct answer to the user's query about NFTs.
    2. Be concise and to the point.
    3. Only include information that directly answers the question.
    4. Do not add any additional explanations, context, or information not specifically asked for.
    5. If the NFT data contains relevant information, include only the specific data points that answer the query.
    6. Use code blocks for addresses if needed.
    
    Keep your response brief and focused.
  `,
  
  // Template for wallet activity analysis
  walletAnalysis: `
    You are a Solana wallet expert analyzing wallet activity.
    
    USER QUERY: {{query}}
    
    WALLET DATA:
    {{blockchainData}}
    
    INSTRUCTIONS:
    1. Provide ONLY a direct answer to the user's query about wallets.
    2. Be concise and to the point.
    3. Only include information that directly answers the question.
    4. Do not add any additional explanations, context, or information not specifically asked for.
    5. If the wallet data contains relevant information, include only the specific data points that answer the query.
    6. Use code blocks for addresses if needed.
    
    Keep your response brief and focused.
  `,
  
  // Template for general Solana knowledge
  solanaKnowledge: `
    You are a Solana blockchain expert with comprehensive knowledge.
    
    USER QUERY: {{query}}
    
    INSTRUCTIONS:
    1. Provide ONLY a direct answer to the user's query about Solana.
    2. Be concise and to the point.
    3. Only include information that directly answers the question.
    4. Do not add any additional explanations, context, or information not specifically asked for.
    5. If the query is about Solana's founder, simply state: "Solana was founded by Anatoly Yakovenko in 2017."
    6. If the query is about Solana's technology, only provide the specific technical details requested.
    
    Keep your response brief and focused.
  `
};

/**
 * Service for advanced prompt engineering
 */
export class PromptEngineeringService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  
  /**
   * Generate a response using the appropriate prompt template
   * @param query The user's query
   * @param queryType The type of query
   * @param blockchainData Optional blockchain data
   * @returns Enhanced AI response
   */
  async generateResponse(query: string, queryType: string, blockchainData?: any): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        console.warn('API key not set. Using fallback response.');
        return 'I need an API key to provide intelligent responses. Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable.';
      }
      
      // Convert blockchain data to string if needed
      const blockchainDataStr = blockchainData 
        ? (typeof blockchainData === 'string' ? blockchainData : JSON.stringify(blockchainData, null, 2))
        : '';
      
      // Select the appropriate template based on query type
      let template;
      switch (queryType) {
        case 'nft_info':
          template = PROMPT_TEMPLATES.nftAnalysis;
          break;
        case 'wallet_activity':
          template = PROMPT_TEMPLATES.walletAnalysis;
          break;
        case 'blockchain':
        case 'market_analysis':
        case 'bridge_status':
          template = PROMPT_TEMPLATES.blockchainAnalysis;
          break;
        default:
          template = PROMPT_TEMPLATES.solanaKnowledge;
      }
      
      // Fill the template with the query and data
      const filledTemplate = template
        .replace('{{query}}', query)
        .replace('{{blockchainData}}', blockchainDataStr);
      
      // Generate content using the Gemini model
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(filledTemplate);
      
      return result.response.text();
    } catch (error) {
      console.error('Error in prompt engineering service:', error);
      return 'I encountered an error while processing your request. Please try again.';
    }
  }
  
  /**
   * Detect the query type based on keywords
   * @param query The user's query
   * @returns Detected query type
   */
  detectQueryType(query: string): string {
    const normalizedQuery = query.toLowerCase();
    
    // Check for NFT-related queries
    if (normalizedQuery.includes('nft') || 
        normalizedQuery.includes('token') || 
        normalizedQuery.includes('collectible')) {
      return 'nft_info';
    }
    
    // Check for wallet-related queries
    if (normalizedQuery.includes('wallet') || 
        normalizedQuery.includes('address') || 
        normalizedQuery.includes('account')) {
      return 'wallet_activity';
    }
    
    // Check for marketplace-related queries
    if (normalizedQuery.includes('market') || 
        normalizedQuery.includes('price') || 
        normalizedQuery.includes('trading')) {
      return 'market_analysis';
    }
    
    // Check for bridge-related queries
    if (normalizedQuery.includes('bridge') || 
        normalizedQuery.includes('cross-chain')) {
      return 'bridge_status';
    }
    
    // Default to general knowledge
    return 'general';
  }
}

// Export a singleton instance
export const promptEngineeringService = new PromptEngineeringService();
