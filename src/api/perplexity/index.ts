/**
 * Perplexity API Implementation
 * 
 * This module provides a comprehensive implementation for interacting with
 * Perplexity's Sonar API for enhanced financial and blockchain analysis.
 * 
 * Includes prompt engineering capabilities for optimizing responses to a wide range of questions.
 */

// Export client implementation
export { perplexityClient, PerplexityClient } from './client';
export type { 
  PerplexityMessage,
  PerplexityRequestParams,
  PerplexityResponse
} from './client';

// Export service implementation
export { perplexityService, PerplexityService } from './service';
export type { PerplexityServiceResponse } from './service';

// Export Substreams integration
export { 
  substreamsPerplexityIntegration,
  SubstreamsPerplexityIntegration
} from './substreams-integration';
export type { SubstreamsPerplexityResponse } from './substreams-integration';

// Export utility functions
export {
  isPerplexityConfigured,
  createSystemMessage,
  createUserMessage,
  createAssistantMessage,
  classifyFinancialQuery,
  extractFinancialEntities,
  truncateToTokenLimit,
  formatBlockchainData
} from './utils';

// Export prompt engineering components
export {
  promptEngineeringService,
  PromptEngineeringService
} from './prompt-engineering';
export type {
  QueryCategory,
  EnhancedResponse
} from './prompt-engineering';

// Export prompt templates
export {
  BASE_PROMPT,
  SOLANA_DEVELOPMENT_PROMPT,
  BLOCKCHAIN_DATA_PROMPT,
  CROSS_CHAIN_PROMPT,
  BLOCKCHAIN_EDUCATION_PROMPT,
  ECOSYSTEM_PROMPT,
  selectPromptTemplate
} from './prompts';

// Export types
export type {
  PerplexityModel,
  PerplexityErrorType,
  PerplexityError,
  PerplexityUsage,
  PerplexityRole,
  PerplexityRequestOptions,
  PerplexityChoice,
  PerplexityDelta,
  PerplexityStreamingChoice,
  PerplexityStreamingResponse,
  PerplexityCompletionResponse,
  FinancialQueryCategory,
  FinancialAnalysisResponse
} from './types';
