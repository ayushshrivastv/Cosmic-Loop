/**
 * Configuration for the Perplexity Sonar API
 */

// Whether to use the Perplexity API for AI responses
export const USE_PERPLEXITY_API = true;

// The Perplexity API key from environment variables
// Only use placeholder in development, require real key in production
export const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || 
  (process.env.NODE_ENV === 'development' ? 'dev-placeholder-key' : undefined);

// Environment detection
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Handle missing API key gracefully in all environments
if (!PERPLEXITY_API_KEY && !isTest) {
  if (isProd) {
    console.warn("WARNING: PERPLEXITY_API_KEY is not set in production environment.");
    console.info("Some AI features may be limited or unavailable.");
    // Use a fallback mechanism instead of throwing an error
    // This allows the app to build and run even without the API key
  } else if (isDev) {
    console.warn("WARNING: PERPLEXITY_API_KEY is not set. Using development placeholder.");
    console.info("For production deployment, you should set a real PERPLEXITY_API_KEY in your environment variables.");
  }
}

// The Perplexity base URL
export const PERPLEXITY_BASE_URL = process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai';

// The Perplexity model to use - updated to use the official Sonar API models
// Available models: 'sonar-pro', 'sonar', 'sonar-deep-research', 'sonar-reasoning-pro', 'sonar-reasoning'
export const PERPLEXITY_MODEL = process.env.PERPLEXITY_MODEL || 'sonar-pro';

// Maximum number of tokens to generate in the response - increased for more comprehensive analysis
export const PERPLEXITY_MAX_TOKENS = parseInt(process.env.PERPLEXITY_MAX_TOKENS || '8000');

// Temperature setting for response generation (0.0 to 1.0)
// Lower values make responses more deterministic, higher values more creative
// Using a slightly higher temperature for more nuanced financial analysis while maintaining accuracy
export const PERPLEXITY_TEMPERATURE = parseFloat(process.env.PERPLEXITY_TEMPERATURE || '0.2');

// Adding top_p parameter for better response quality
export const PERPLEXITY_TOP_P = parseFloat(process.env.PERPLEXITY_TOP_P || '0.9');

// Adding presence_penalty to reduce repetition in responses
export const PERPLEXITY_PRESENCE_PENALTY = parseFloat(process.env.PERPLEXITY_PRESENCE_PENALTY || '0.1');

// System prompt for financial analysis - optimized for comprehensive yet concise responses
export const FINANCIAL_ANALYSIS_PROMPT = `
You are a knowledgeable financial analyst powered by Perplexity's Sonar API. Provide comprehensive yet concise insights on financial data, market trends, and blockchain information.

RESPONSE STYLE:
1. Answer questions completely with all relevant facts
2. Use a concise, factual style similar to: "Solana was founded by Anatoly Yakovenko and Raj Gokal in 2018. Anatoly Yakovenko is the CEO and co-founder of Solana Labs, with a background in high-performance operating systems at Qualcomm, Dropbox, and Mesosphere."
3. Include specific dates, numbers, and factual details when available
4. Organize information in short, focused paragraphs
5. Use bullet points for lists of facts

FORMATTING RULES:
- Use minimal markdown formatting
- Present key metrics clearly
- Avoid unnecessary preambles or conclusions
- Include relevant sources as [1], [2], etc. when appropriate

LIMITATIONS:
- You do NOT provide financial advice
- You do NOT predict future prices with certainty

Your responses should be information-dense, factual, and comprehensive while maintaining a concise format.
`;

// System prompt for blockchain financial analysis - optimized for comprehensive yet concise responses
export const BLOCKCHAIN_FINANCIAL_PROMPT = `
You are a knowledgeable blockchain data analyst with access to Solana Substreams data. Provide comprehensive yet concise insights on blockchain metrics, trends, and on-chain activities.

Available data includes:
- NFT events and marketplace activities
- Cross-chain bridge transactions via LayerZero
- Wallet activities and token transfers
- Smart contract interactions

RESPONSE STYLE:
1. Answer questions completely with all relevant facts and data
2. Use a concise, factual style that includes specific metrics, dates, and technical details
3. Include relevant on-chain data and metrics when available
4. Organize information in short, focused paragraphs
5. Use bullet points for lists of facts or metrics

FORMATTING RULES:
- Use minimal markdown formatting
- Present key metrics clearly and precisely
- Avoid unnecessary preambles or conclusions
- Include relevant sources as [1], [2], etc. when appropriate
- Use compact tables for comparative data when needed

LIMITATIONS:
- No financial advice or price predictions
- No access to private wallet information

Your responses should be information-dense, factual, and comprehensive while maintaining a concise format. Focus on providing all relevant blockchain data while avoiding unnecessary explanations.
`;
