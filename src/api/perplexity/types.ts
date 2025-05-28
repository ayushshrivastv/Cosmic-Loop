/**
 * Types and interfaces for the Perplexity API
 */

/**
 * Supported Perplexity models
 */
export enum PerplexityModel {
  SONAR_SMALL_ONLINE = 'llama-3.1-sonar-small-32k-online',
  SONAR_MEDIUM_ONLINE = 'llama-3.1-sonar-medium-32k-online',
  SONAR_LARGE_ONLINE = 'llama-3.1-sonar-large-32k-online',
  SONAR_SMALL_CHAT = 'llama-3.1-sonar-small-32k-chat',
  SONAR_MEDIUM_CHAT = 'llama-3.1-sonar-medium-32k-chat',
  SONAR_LARGE_CHAT = 'llama-3.1-sonar-large-32k-chat',
}

/**
 * Perplexity API error types
 */
export enum PerplexityErrorType {
  AUTHENTICATION_ERROR = 'authentication_error',
  INVALID_REQUEST_ERROR = 'invalid_request_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  SERVER_ERROR = 'server_error',
  TIMEOUT_ERROR = 'timeout_error',
}

/**
 * Perplexity API error
 */
export interface PerplexityError {
  type: PerplexityErrorType;
  message: string;
  param?: string;
  code?: string;
}

/**
 * Perplexity API usage statistics
 */
export interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Perplexity API message role
 */
export type PerplexityRole = 'system' | 'user' | 'assistant';

/**
 * Perplexity API message
 */
export interface PerplexityMessage {
  role: PerplexityRole;
  content: string;
}

/**
 * Perplexity API request options
 */
export interface PerplexityRequestOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stop?: string[];
  stream?: boolean;
  user?: string;
}

/**
 * Perplexity API choice in a response
 */
export interface PerplexityChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

/**
 * Perplexity API delta in a streaming response
 */
export interface PerplexityDelta {
  role?: string;
  content?: string;
}

/**
 * Perplexity API streaming choice
 */
export interface PerplexityStreamingChoice {
  index: number;
  delta: PerplexityDelta;
  finish_reason: string | null;
}

/**
 * Perplexity API streaming response chunk
 */
export interface PerplexityStreamingResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: PerplexityStreamingChoice[];
}

/**
 * Perplexity API completion response
 */
export interface PerplexityCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: PerplexityChoice[];
  usage: PerplexityUsage;
}

/**
 * Financial analysis query categories
 */
export enum FinancialQueryCategory {
  MARKET_ANALYSIS = 'market_analysis',
  ASSET_PERFORMANCE = 'asset_performance',
  INVESTMENT_STRATEGY = 'investment_strategy',
  RISK_ASSESSMENT = 'risk_assessment',
  ECONOMIC_TRENDS = 'economic_trends',
  BLOCKCHAIN_METRICS = 'blockchain_metrics',
  DEFI_ANALYSIS = 'defi_analysis',
  NFT_MARKET = 'nft_market',
  GENERAL = 'general',
}

/**
 * Financial analysis response
 */
/**
 * Blockchain data structure for financial analysis
 */
export interface BlockchainData {
  type?: string;
  events?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface FinancialAnalysisResponse {
  text: string;
  category: FinancialQueryCategory;
  usage?: PerplexityUsage;
  model?: string;
  data?: BlockchainData;
}
