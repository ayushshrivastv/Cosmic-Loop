/**
 * Utility functions for the Perplexity API implementation
 */

import { PerplexityMessage, FinancialQueryCategory, BlockchainData } from './types';
import { PERPLEXITY_API_KEY } from '@/config/perplexity.config';

/**
 * Check if the Perplexity API key is configured
 * @returns True if the API key is set, false otherwise
 */
export function isPerplexityConfigured(): boolean {
  return !!PERPLEXITY_API_KEY;
}

/**
 * Create a system message with the given content
 * @param content The system message content
 * @returns A system message object
 */
export function createSystemMessage(content: string): PerplexityMessage {
  return {
    role: 'system',
    content
  };
}

/**
 * Create a user message with the given content
 * @param content The user message content
 * @returns A user message object
 */
export function createUserMessage(content: string): PerplexityMessage {
  return {
    role: 'user',
    content
  };
}

/**
 * Create an assistant message with the given content
 * @param content The assistant message content
 * @returns An assistant message object
 */
export function createAssistantMessage(content: string): PerplexityMessage {
  return {
    role: 'assistant',
    content
  };
}

/**
 * Classify a financial query into a category
 * @param query The user's query text
 * @returns The classified category
 */
export function classifyFinancialQuery(query: string): FinancialQueryCategory {
  const lowerQuery = query.toLowerCase();
  
  // Define keyword patterns for each category
  const patterns = {
    [FinancialQueryCategory.MARKET_ANALYSIS]: /market|trend|analysis|overview|outlook|forecast|prediction/,
    [FinancialQueryCategory.ASSET_PERFORMANCE]: /performance|return|growth|price|value|appreciation|depreciation/,
    [FinancialQueryCategory.INVESTMENT_STRATEGY]: /strategy|invest|allocation|portfolio|diversif|risk|reward/,
    [FinancialQueryCategory.RISK_ASSESSMENT]: /risk|volatility|exposure|downside|hedge|protect|secure/,
    [FinancialQueryCategory.ECONOMIC_TRENDS]: /econom|inflation|interest rate|gdp|unemployment|fiscal|monetary/,
    [FinancialQueryCategory.BLOCKCHAIN_METRICS]: /blockchain|on-chain|metrics|transaction|volume|gas|fee/,
    [FinancialQueryCategory.DEFI_ANALYSIS]: /defi|yield|lending|borrowing|liquidity|pool|swap|stake/,
    [FinancialQueryCategory.NFT_MARKET]: /nft|collect|floor price|mint|rare|trait|attribute/,
  };
  
  // Check each pattern against the query
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(lowerQuery)) {
      return category as FinancialQueryCategory;
    }
  }
  
  // Default to general if no specific category matches
  return FinancialQueryCategory.GENERAL;
}

/**
 * Extract potential financial entities from a query
 * @param query The user's query text
 * @returns Object containing extracted entities
 */
export function extractFinancialEntities(query: string): {
  cryptoSymbols: string[];
  stockSymbols: string[];
  companies: string[];
  amounts: string[];
} {
  // Simple regex patterns for common financial entities
  const cryptoSymbolPattern = /\b(BTC|ETH|SOL|USDC|USDT|BNB|XRP|ADA|DOT|AVAX|MATIC|LINK|UNI|AAVE|SNX)\b/gi;
  const stockSymbolPattern = /\b[A-Z]{1,5}\b/g;
  const companyPattern = /(Apple|Google|Microsoft|Amazon|Facebook|Tesla|Netflix|Disney|Uber|Airbnb|Coinbase|Binance|FTX|Solana|Ethereum)/gi;
  const amountPattern = /\$\d+(\.\d+)?(k|m|b|t)?|\d+(\.\d+)? (dollars|usd|eth|btc|sol)/gi;
  
  // Extract matches
  const cryptoMatches = query.match(cryptoSymbolPattern) || [];
  const stockMatches = query.match(stockSymbolPattern) || [];
  const companyMatches = query.match(companyPattern) || [];
  const amounts = query.match(amountPattern) || [];
  
  // Convert to arrays with unique values
  const cryptoSymbols = Array.from(new Set(cryptoMatches.map(s => s.toUpperCase())));
  const stockSymbols = Array.from(new Set(stockMatches));
  const companies = Array.from(new Set(companyMatches.map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())));
  
  return {
    cryptoSymbols,
    stockSymbols,
    companies,
    amounts
  };
}

/**
 * Truncate a string to a maximum token count (approximate)
 * @param text The text to truncate
 * @param maxTokens The maximum number of tokens
 * @returns The truncated text
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  // Rough approximation: 1 token ≈ 4 characters for English text
  const avgCharsPerToken = 4;
  const maxChars = maxTokens * avgCharsPerToken;
  
  if (text.length <= maxChars) {
    return text;
  }
  
  // Truncate and add ellipsis
  return text.substring(0, maxChars - 3) + '...';
}

/**
 * Format blockchain data for better readability in prompts
 * @param data The blockchain data object
 * @returns Formatted string representation
 */
export function formatBlockchainData(data: BlockchainData | null | undefined): string {
  if (!data) return '';
  
  try {
    // Handle different types of blockchain data
    switch (data.type) {
      case 'nft_data':
        return formatNFTData(data);
      case 'wallet_data':
        return formatWalletData(data);
      case 'marketplace_data':
        return formatMarketplaceData(data);
      case 'bridge_data':
        return formatBridgeData(data);
      default:
        // Default to JSON stringification with indentation
        return JSON.stringify(data, null, 2);
    }
  } catch (error) {
    console.error('Error formatting blockchain data:', error);
    return JSON.stringify(data, null, 2);
  }
}

/**
 * Format NFT data for better readability
 * @param data The NFT data object
 * @returns Formatted string representation
 */
function formatNFTData(data: BlockchainData): string {
  const events = Array.isArray(data.events) ? data.events : [];
  if (events.length === 0) {
    return 'No NFT events found.';
  }
  
  let result = `NFT Data (${events.length} events):\n\n`;
  
  // Group events by type (e.g., mint, transfer, sale)
  const eventsByType: Record<string, Array<Record<string, unknown>>> = {};
  for (const event of events) {
    const type = typeof event['type'] === 'string' ? event['type'] as string : 'unknown';
    if (!eventsByType[type]) {
      eventsByType[type] = [];
    }
    eventsByType[type].push(event);
  }
  
  // Format each type's events
  for (const [type, events] of Object.entries(eventsByType)) {
    result += `${type.toUpperCase()} Events (${events.length}):\n`;
    
    // Show details for up to 5 events per type
    const samplesToShow = Math.min(events.length, 5);
    for (let i = 0; i < samplesToShow; i++) {
      const event = events[i];
      result += `- Token: ${typeof event['tokenAddress'] === 'string' ? event['tokenAddress'] : 'N/A'}\n`;
      result += `  Collection: ${typeof event['collectionName'] === 'string' ? event['collectionName'] : 'N/A'}\n`;
      if (typeof event['fromAddress'] === 'string') result += `  From: ${event['fromAddress']}\n`;
      if (typeof event['toAddress'] === 'string') result += `  To: ${event['toAddress']}\n`;
      if (event['price']) result += `  Price: ${event['price']} ${typeof event['currency'] === 'string' ? event['currency'] : 'SOL'}\n`;
      if (event['timestamp'] && (typeof event['timestamp'] === 'string' || typeof event['timestamp'] === 'number')) {
        result += `  Time: ${new Date(event['timestamp'] as string | number).toISOString()}\n`;
      }
      result += '\n';
    }
    
    if (events.length > samplesToShow) {
      result += `... and ${events.length - samplesToShow} more ${type} events\n\n`;
    }
  }
  
  return result;
}

/**
 * Format wallet data for better readability
 * @param data The wallet data object
 * @returns Formatted string representation
 */
function formatWalletData(data: BlockchainData): string {
  // Assuming wallet data might have 'transactions' or 'history' instead of 'events'
  const transactions = Array.isArray(data.transactions) ? data.transactions :
                       Array.isArray(data.history) ? data.history :
                       Array.isArray(data.events) ? data.events : [];
  
  if (transactions.length === 0) {
    return 'No wallet transactions found.';
  }
  
  let result = `Wallet Data (${transactions.length} transactions):\n\n`;
  
  // Group transactions by type (e.g., send, receive, swap)
  const transactionsByType: Record<string, Array<Record<string, unknown>>> = {};
  for (const tx of transactions) {
    const type = typeof tx['type'] === 'string' ? tx['type'] as string : 'unknown_transaction';
    if (!transactionsByType[type]) {
      transactionsByType[type] = [];
    }
    transactionsByType[type].push(tx);
  }
  
  // Format each type's transactions
  for (const [type, txs] of Object.entries(transactionsByType)) {
    result += `${type.toUpperCase().replace(/_/g, ' ')} (${txs.length}):\n`;
    
    // Show details for up to 5 transactions per type
    const samplesToShow = Math.min(txs.length, 5);
    for (let i = 0; i < samplesToShow; i++) {
      const tx = txs[i];
      if (typeof tx['source'] === 'string') result += `  From: ${tx['source']}\n`;
      if (typeof tx['destination'] === 'string') result += `  To: ${tx['destination']}\n`;
      if (tx['amount']) result += `  Amount: ${tx['amount']} ${typeof tx['currency'] === 'string' ? tx['currency'] : (typeof tx['token'] === 'string' ? tx['token'] : 'N/A')}\n`;
      if (typeof tx['status'] === 'string') result += `  Status: ${tx['status']}\n`;
      if (tx['timestamp'] && (typeof tx['timestamp'] === 'string' || typeof tx['timestamp'] === 'number')) { result += `  Time: ${new Date(tx['timestamp'] as string | number).toISOString()}\n`; }
      result += '\n';
    }
    
    if (txs.length > samplesToShow) {
      result += `... and ${txs.length - samplesToShow} more ${type.toLowerCase().replace(/_/g, ' ')} transactions\n\n`;
    }
  }
  
  return result;
}

/**
 * Format marketplace data for better readability
 * @param data The marketplace data object
 * @returns Formatted string representation
 */
function formatMarketplaceData(data: BlockchainData): string {
  const events = Array.isArray(data.events) ? data.events : [];
  
  if (events.length === 0) {
    return 'No marketplace events found.';
  }
  
  let result = `Marketplace Data (${events.length} events):\n\n`;
  
  // Group events by marketplace
  const eventsByMarketplace: Record<string, Array<Record<string, unknown>>> = {};
  for (const event of events) {
    const marketplace = typeof event['marketplace'] === 'string' ? event['marketplace'] as string : 'unknown';
    if (!eventsByMarketplace[marketplace]) {
      eventsByMarketplace[marketplace] = [];
    }
    eventsByMarketplace[marketplace].push(event);
  }
  
  // Format each marketplace's events
  for (const [marketplace, events] of Object.entries(eventsByMarketplace)) {
    result += `${marketplace.toUpperCase()} Events (${events.length}):\n`;
    
    // Show details for up to 5 events per marketplace
    const samplesToShow = Math.min(events.length, 5);
    for (let i = 0; i < samplesToShow; i++) {
      const event = events[i];
      result += `- Type: ${typeof event['type'] === 'string' ? event['type'] : 'N/A'}\n`;
      result += `  Token: ${typeof event['tokenAddress'] === 'string' ? event['tokenAddress'] : 'N/A'}\n`;
      result += `  Collection: ${typeof event['collectionName'] === 'string' ? event['collectionName'] : 'N/A'}\n`;
      if (typeof event['seller'] === 'string') result += `  Seller: ${event['seller']}\n`;
      if (typeof event['buyer'] === 'string') result += `  Buyer: ${event['buyer']}\n`;
      if (event['price']) result += `  Price: ${event['price']} ${typeof event['currency'] === 'string' ? event['currency'] : 'SOL'}\n`;
      if (event['timestamp'] && (typeof event['timestamp'] === 'string' || typeof event['timestamp'] === 'number')) {
        result += `  Time: ${new Date(event['timestamp']).toISOString()}\n`;
      }
      result += '\n';
    }
    
    if (events.length > samplesToShow) {
      result += `... and ${events.length - samplesToShow} more ${marketplace} events\n\n`;
    }
  }
  
  return result;
}

/**
 * Format bridge data for better readability
 * @param data The bridge data object
 * @returns Formatted string representation
 */
function formatBridgeData(data: BlockchainData): string {
  const events = Array.isArray(data.events) ? data.events : [];
  
  if (events.length === 0) {
    return 'No bridge events found.';
  }
  
  let result = `Bridge Data (${events.length} events):\n\n`;
  
  // Group events by source chain
  const eventsByChain: Record<string, Array<Record<string, unknown>>> = {};
  for (const event of events) {
    const sourceChain = typeof event['sourceChain'] === 'string' ? event['sourceChain'] as string : 'unknown';
    if (!eventsByChain[sourceChain]) {
      eventsByChain[sourceChain] = [];
    }
    eventsByChain[sourceChain].push(event);
  }
  
  // Format each chain's events
  for (const [chain, events] of Object.entries(eventsByChain)) {
    result += `${chain.toUpperCase()} to Solana Bridge Events (${events.length}):\n`;
    
    // Show details for up to 5 events per chain
    const samplesToShow = Math.min(events.length, 5);
    for (let i = 0; i < samplesToShow; i++) {
      const event = events[i];
      result += `- Type: ${typeof event.type === 'string' ? event.type : 'N/A'}\n`;
      if (typeof event.sourceAddress === 'string') result += `  Source Address: ${event.sourceAddress}\n`;
      if (typeof event.destinationAddress === 'string') result += `  Destination Address: ${event.destinationAddress}\n`;
      if (event.amount) result += `  Amount: ${event.amount} ${typeof event.token === 'string' ? event.token : 'Unknown Token'}\n`;
      if (typeof event.status === 'string') result += `  Status: ${event.status}\n`;
      if (event.timestamp && (typeof event.timestamp === 'string' || typeof event.timestamp === 'number')) {
        result += `  Time: ${new Date(event.timestamp).toISOString()}\n`;
      }
      result += '\n';
    }
    
    if (events.length > samplesToShow) {
      result += `... and ${events.length - samplesToShow} more ${chain} events\n\n`;
    }
  }
  
  return result;
}
