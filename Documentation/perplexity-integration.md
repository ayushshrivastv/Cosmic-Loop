# Perplexity Integration

## Overview

The Solana OpenAPI project integrates Perplexity's Sonar API to provide real-time, accurate blockchain information through an intuitive chat interface. This integration allows users to query blockchain data, get financial analysis, and receive concise responses about Solana and other supported chains without requiring technical blockchain knowledge.

## Architecture

The Perplexity integration is built on a layered architecture that combines Perplexity's powerful search and AI capabilities with our specialized blockchain data processing:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User Interface │────▶│  API Gateway    │────▶│  Perplexity     │
│  (Chat UI)      │     │  (Request       │     │  Sonar API      │
│                 │◀────│  Processing)    │◀────│  Integration    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │                 │     │                 │
                        │  Blockchain     │     │  Response       │
                        │  Data Service   │     │  Enhancement    │
                        │                 │     │  Service        │
                        └─────────────────┘     └─────────────────┘
```

## Key Components

### 1. Perplexity API Client

The Perplexity API client is responsible for:
- Authenticating with the Perplexity Sonar API
- Formatting and sending queries
- Processing responses
- Handling rate limiting and error conditions

```typescript
// Located in src/api/perplexity/client.ts
export class PerplexityClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.perplexity.ai/sonar/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async query(prompt: string, options?: QueryOptions): Promise<PerplexityResponse> {
    // Implementation details
  }
  
  async streamQuery(prompt: string, options?: StreamQueryOptions): Promise<ReadableStream> {
    // Implementation for streaming responses
  }
}
```

### 2. Prompt Engineering Service

The prompt engineering service enhances queries with blockchain-specific context:

```typescript
// Located in src/api/prompt-engineering/blockchain-prompt-enhancer.ts
export class BlockchainPromptEnhancer {
  enhance(userQuery: string): string {
    // Add blockchain-specific context to the query
    return `${userQuery}\n\nConsider Solana blockchain specifics: high TPS, account model, etc.`;
  }
  
  enhanceWithChainContext(userQuery: string, chain: SupportedChain): string {
    // Add chain-specific context
    // Implementation details
  }
}
```

### 3. Response Processing

The response processing service formats and enhances Perplexity responses:

```typescript
// Located in src/api/perplexity/response-processor.ts
export class PerplexityResponseProcessor {
  process(response: PerplexityResponse): EnhancedResponse {
    // Extract relevant information
    // Format for display
    // Add additional context if needed
    // Implementation details
  }
}
```

## API Endpoints

### Query Endpoint

```
POST /api/perplexity/query
```

Sends a query to Perplexity Sonar and returns the response.

**Request Body:**

```json
{
  "query": "What are the recent NFT sales on Solana?",
  "options": {
    "temperature": 0.7,
    "max_tokens": 1024,
    "stream": false
  }
}
```

**Response:**

```json
{
  "id": "resp_01h9x7z3j8q5k2m6p4r9t2v5x8",
  "text": "In the past 24 hours, there have been 1,245 NFT sales on Solana totaling approximately 3,567 SOL (about $356,700 at current prices). The most active collections were:\n\n1. DeGods - 156 sales, floor price 35.5 SOL\n2. Okay Bears - 89 sales, floor price 28.2 SOL\n3. Solana Monkey Business - 67 sales, floor price 115 SOL\n\nThe highest single sale was a Solana Monkey Business NFT that sold for 450 SOL.",
  "sources": [
    {
      "title": "Solana NFT Marketplace Data",
      "url": "https://example.com/solana-nft-data"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 124,
    "total_tokens": 136
  }
}
```

### Streaming Query Endpoint

```
POST /api/perplexity/stream
```

Sends a query to Perplexity Sonar and returns a streaming response.

**Request Body:**

```json
{
  "query": "Explain how LayerZero works with Solana",
  "options": {
    "temperature": 0.7,
    "max_tokens": 2048
  }
}
```

**Response:**

Server-sent events stream with chunks of the response.

### History Endpoint

```
GET /api/perplexity/history
```

Returns the query history for the authenticated user.

**Response:**

```json
{
  "queries": [
    {
      "id": "query_01h9x7z3j8q5k2m6p4r9t2v5x8",
      "text": "What are the recent NFT sales on Solana?",
      "timestamp": "2025-05-28T14:32:45Z"
    },
    {
      "id": "query_02i0y8a4k9r6l3n7q5s0u3w6y9",
      "text": "Explain how LayerZero works with Solana",
      "timestamp": "2025-05-28T14:35:12Z"
    }
  ],
  "pagination": {
    "next_cursor": "cursor_03j1z9b5l0s7m4o8q6t2v4x8z0"
  }
}
```

## Integration with Blockchain Data

The Perplexity integration is enhanced with blockchain-specific data from our Substreams implementation:

1. **Pre-query Enhancement**: Before sending queries to Perplexity, we enhance them with relevant blockchain context
2. **Post-response Enrichment**: After receiving responses, we enrich them with up-to-date blockchain data
3. **Custom Knowledge Base**: We maintain a specialized knowledge base of blockchain terminology and concepts

### Example: NFT Query Enhancement

When a user asks about NFTs, the system:

1. Recognizes the NFT-related query
2. Fetches recent NFT data from our Substreams
3. Enhances the query with this context
4. Sends the enhanced query to Perplexity
5. Receives and processes the response
6. Adds real-time data from our blockchain indexer
7. Returns the comprehensive response to the user

## Error Handling

The Perplexity integration includes robust error handling:

- **Rate Limiting**: Graceful handling of API rate limits with exponential backoff
- **Service Unavailability**: Fallback to alternative data sources when Perplexity is unavailable
- **Query Timeout**: Handling of long-running queries with appropriate user feedback
- **Response Validation**: Validation of responses to ensure data quality

## Security Considerations

The Perplexity integration implements several security measures:

- **API Key Protection**: Secure storage and transmission of API keys
- **Query Sanitization**: Removal of sensitive information from queries
- **Response Filtering**: Filtering of potentially harmful content from responses
- **User Authentication**: Ensuring only authenticated users can access the service
- **Usage Monitoring**: Monitoring for unusual usage patterns

## Performance Optimization

To ensure optimal performance:

- **Response Caching**: Caching of common queries to reduce API calls
- **Parallel Processing**: Processing multiple data sources in parallel
- **Streaming Responses**: Using streaming responses for long-form content
- **Lazy Loading**: Loading additional data only when needed

## Configuration

The Perplexity integration is configured through environment variables:

```
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key
PERPLEXITY_BASE_URL=https://api.perplexity.ai/sonar/v1
PERPLEXITY_TIMEOUT_MS=30000
PERPLEXITY_MAX_RETRIES=3
PERPLEXITY_CACHE_TTL_SECONDS=300
```

## Usage Examples

### Basic Query

```typescript
import { perplexityClient } from '@/api/perplexity';

// Simple query
const response = await perplexityClient.query('What is the current Solana price?');
console.log(response.text);
```

### Enhanced Query with Blockchain Context

```typescript
import { perplexityClient } from '@/api/perplexity';
import { blockchainPromptEnhancer } from '@/api/prompt-engineering';

// Enhance query with blockchain context
const userQuery = 'Explain how NFT minting works';
const enhancedQuery = blockchainPromptEnhancer.enhance(userQuery);

// Send enhanced query
const response = await perplexityClient.query(enhancedQuery);
console.log(response.text);
```

### Streaming Response

```typescript
import { perplexityClient } from '@/api/perplexity';

// Stream response for better UX
const stream = await perplexityClient.streamQuery('Explain the Solana architecture');

// Process stream
const reader = stream.getReader();
let result = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  result += new TextDecoder().decode(value);
  // Update UI with partial result
}

console.log('Complete response:', result);
```

## Troubleshooting

Common issues and their solutions:

1. **API Key Issues**: Ensure the Perplexity API key is correctly set in environment variables
2. **Rate Limiting**: Implement caching and rate limiting strategies
3. **Timeout Errors**: Adjust timeout settings for complex queries
4. **Response Quality**: Fine-tune prompt engineering for better responses
5. **Integration Errors**: Check network connectivity and API endpoint configuration

## Future Enhancements

Planned enhancements to the Perplexity integration:

1. **Multi-modal Queries**: Support for image and chart-based queries and responses
2. **Advanced Caching**: Implementing more sophisticated caching strategies
3. **Personalized Responses**: Tailoring responses based on user preferences and history
4. **Expanded Knowledge Base**: Continuously updating the blockchain knowledge base
5. **Cross-chain Intelligence**: Enhancing the system with cross-chain data correlation
