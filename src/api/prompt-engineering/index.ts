/**
 * Prompt Engineering Module
 * 
 * Uses Langchain to create optimized prompts for AI agents
 * that produce faster, more concise, and on-point responses
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

// Type definitions
export interface PromptConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface AgentResponse {
  content: string;
  metadata?: {
    tokens: number;
    latency: number;
  };
}

// Base prompt templates with optimized instructions for conciseness
export const CONCISE_SEARCH_TEMPLATE = `You are an AI assistant that provides brief, direct answers.

CONTEXT INFORMATION:
{context}

USER QUERY: {query}

INSTRUCTIONS:
1. Respond in 3 sentences or less
2. Focus only on the most relevant facts
3. Use simple language and short sentences
4. Skip unnecessary context or explanations
5. If uncertain, say so briefly instead of speculating
6. For technical topics, prioritize accuracy over simplicity

YOUR CONCISE RESPONSE:`;

export const CONCISE_SUMMARY_TEMPLATE = `You are an AI assistant that summarizes information concisely.

CONTENT TO SUMMARIZE:
{content}

INSTRUCTIONS:
1. Summarize in 3-5 bullet points maximum
2. Each bullet should be one sentence
3. Focus only on the most important information
4. Use simple language and short sentences
5. Omit all background information and context
6. For technical topics, preserve key terminology

YOUR CONCISE SUMMARY:`;

export const CONCISE_INTEGRATION_TEMPLATE = `You are an AI assistant that provides brief, direct answers based on search results.

SEARCH RESULTS:
{searchResults}

ADDITIONAL CONTEXT (if any):
{additionalContext}

INSTRUCTIONS:
1. Respond in 5 sentences or less
2. Focus only on directly answering the query
3. Use simple language and short sentences
4. Skip unnecessary context or explanations
5. If the search results don't contain a clear answer, say so briefly
6. For technical topics, prioritize accuracy over simplicity

YOUR CONCISE RESPONSE:`;

// Create prompt templates using Langchain
export const createConciseSearchPrompt = () => {
  return PromptTemplate.fromTemplate(CONCISE_SEARCH_TEMPLATE);
};

export const createConciseSummaryPrompt = () => {
  return PromptTemplate.fromTemplate(CONCISE_SUMMARY_TEMPLATE);
};

export const createConciseIntegrationPrompt = () => {
  return PromptTemplate.fromTemplate(CONCISE_INTEGRATION_TEMPLATE);
};

// Create a chain for processing search queries with optimized settings
export const createSearchChain = () => {
  const prompt = createConciseSearchPrompt();
  const outputParser = new StringOutputParser();
  
  return RunnableSequence.from([
    prompt,
    outputParser
  ]);
};

// Create a chain for summarization with optimized settings
export const createSummaryChain = () => {
  const prompt = createConciseSummaryPrompt();
  const outputParser = new StringOutputParser();
  
  return RunnableSequence.from([
    prompt,
    outputParser
  ]);
};

// Create a chain for integrated responses with optimized settings
export const createIntegrationChain = () => {
  const prompt = createConciseIntegrationPrompt();
  const outputParser = new StringOutputParser();
  
  return RunnableSequence.from([
    prompt,
    outputParser
  ]);
};

// Default configuration for fast, concise responses
export const FAST_RESPONSE_CONFIG: PromptConfig = {
  temperature: 0.3,       // Lower temperature for more deterministic responses
  maxTokens: 150,         // Limit token count for brevity
  topP: 0.5,              // More focused sampling
  presencePenalty: 0.5,   // Discourage repetition
  frequencyPenalty: 0.5   // Discourage repetitive language patterns
};

// Utility function to measure response time
export const measureResponseTime = async <T>(fn: () => Promise<T>): Promise<[T, number]> => {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  return [result, endTime - startTime];
};
