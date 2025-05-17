# Solana OpenAPI AI Assistant

Solana OpenAPI AI Assistant is an intelligent chatbot powered by The Graph Substreams on Solana that provides real-time, data-driven insights about NFTs, cross-chain bridging, and blockchain activities.

## Features

- **Real-time blockchain data access** - Get up-to-date information about Solana NFTs, marketplace activities, and cross-chain bridging operations
- **Conversational interface** - Natural language interaction for easier access to complex blockchain data
- **Rich response formatting** - Responses include formatted data tables, code examples, and visual components
- **Historical context** - Save and reference past conversations

## Architecture

The AI Assistant is built on a combination of:

1. **Solana Substreams** - Custom Rust modules that index on-chain data for:
   - NFT minting, transfers, and burning events
   - LayerZero cross-chain bridging transactions
   - Marketplace activities (listings, sales, bids)
   - Compressed token operations using Light Protocol

2. **Vector Database** - Pinecone vector database for semantic search of blockchain data

3. **LLM Integration** - Integration with OpenAI's GPT models for natural language understanding and generation

4. **Backend API** - GraphQL API endpoints for querying the AI Assistant

5. **Frontend UI** - Enhanced chat interface in the Solana OpenAPI application

## Implementation Details

### Substreams Indexing

The Solana Substreams package processes three main categories of data:

1. **NFT Events**: Captures all NFT-related activities on Solana
2. **Bridge Events**: Indexes cross-chain bridging operations with LayerZero and other protocols
3. **Marketplace Events**: Tracks marketplace listings, sales, bids, and cancellations

The custom Substreams package efficiently processes Solana blocks and transforms the data into structured entities optimized for AI consumption.

### Backend Services

The AI Agent backend provides:

- Vector database integration for semantic search
- Context management for maintaining conversation history
- API endpoints for frontend interaction
- Data transformation for optimized LLM input

### Frontend Integration

The frontend implements:

- Enhanced chat interface with the "Ask Anything" button
- Support for rich responses including tables, code blocks, and data visualizations
- Conversation history management
- Input suggestions for common queries

## Usage Examples

Here are some examples of questions you can ask the AI Assistant:

- "What are the recent sales for Collection X on Magic Eden?"
- "How much volume has been bridged from Solana to Ethereum in the last week?"
- "Which NFT collections have the most minting activity today?"
- "Explain how compressed NFTs work on Solana"
- "What's the floor price trend for Collection Y over the last month?"
- "Show me statistics for cross-chain NFT movements"

## Setting Up

To use the AI Assistant feature, you'll need to set up:

1. **Environment Variables** - Configure the required API keys and endpoints in your `.env` file based on the `.env.example` template

2. **Substreams Deployment** - Deploy the Solana Substreams package to The Graph hosted service or your own Substreams provider

3. **Vector Database** - Set up a Pinecone vector database for semantic search

4. **LLM API Access** - Obtain an API key for OpenAI or another compatible LLM provider

See the main project README for full setup instructions.

## Future Enhancements

Planned enhancements for the AI Assistant include:

- Support for additional blockchains beyond Solana
- Enhanced visualization capabilities for NFT and market data
- User-specific personalization based on wallet holdings and activity
- Integration with additional data sources for more comprehensive insights
