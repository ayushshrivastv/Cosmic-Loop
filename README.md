# Solana OpenAPI - AI Powered Blockchain Data Interface

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Compatible-9945FF)](https://solana.com/)
[![LayerZero](https://img.shields.io/badge/LayerZero-V2-2D374B)](https://layerzero.network/)
[![The Graph](https://img.shields.io/badge/The%20Graph-Substreams-0C0A1C)](https://thegraph.com/docs/en/substreams/)
[![Perplexity Sonar](https://img.shields.io/badge/Perplexity-Sonar-blue)](https://www.perplexity.ai/)

## Overview
Solana OpenAPI is an innovative omnichain NFT solution designed to revolutionize event attendance verification and digital collectibles distribution. By seamlessly integrating Solana's high-performance blockchain with LayerZero-supported networks through V2 contracts and The Graph Substreams, Solana OpenAPI creates a unified experience across multiple blockchains.

The platform indexes Solana blockchain data for NFTs, marketplace activities, and cross-chain bridging events, providing real-time blockchain data through an AI-powered interface. Users can mint, bridge, and claim NFTs across multiple chains with a seamless experience.

The project integrates Perplexity's Sonar API to provide real-time, accurate blockchain information through an intuitive chat interface. This integration allows users to query blockchain data, get financial analysis, and receive concise responses about Solana and other supported chains without requiring technical blockchain knowledge. The enhanced AI service combines Perplexity's search capabilities with specialized blockchain data processing to deliver optimized responses for both simple factual queries and complex analytical questions.

For a detailed technical architecture and component flow diagrams, please refer to the [ARCHITECTURE.md](./architecture.md) document.

P.S. After 48 hours of coding, debugging, and more coffee than water—here’s the project. The backend isn’t quite where I want it yet—there’s still a lot of work ahead.

Web Page Link
**[Solana OpenAPI](https://openapi-lilac.vercel.app)**

![Screenshot 2025-05-17 at 9 52 16 AM](https://github.com/user-attachments/assets/3d38bdad-17fe-48c7-8b5d-57cd0492fbb9)

## LayerZero V2 Integration

Our platform leverages LayerZero V2 contracts to enable seamless cross-chain operations with enhanced security and efficiency. These contracts facilitate trustless message passing between Solana and other blockchains, allowing for interoperable NFT minting, token bridging, and multi-chain data synchronization. The V2 protocol's improved security model with decentralized verification, optimized gas efficiency, and enhanced message delivery guarantees robust cross-chain functionality while maintaining Solana's high performance standards.

![Screenshot 2025-05-17 at 9 56 24 AM](https://github.com/user-attachments/assets/21513163-affd-4f80-bd63-6758f9c61f64)

![Screenshot 2025-05-17 at 9 56 36 AM](https://github.com/user-attachments/assets/11a7e319-260e-4bd7-bde7-dcff1cfe4c92)

![Screenshot 2025-05-17 at 9 56 10 AM](https://github.com/user-attachments/assets/c54b3fab-9f69-4f30-9ee0-9602c2020e7c)


### Benefits of LayerZero V2 Integration

| Feature | Traditional Cross-Chain | With LayerZero V2 |
|---------|------------------------|-------------------|
| Security | Relies on centralized bridges | Decentralized verification with DVNs |
| Speed | Minutes to hours | Seconds to minutes |
| Cost | High gas fees | Optimized for efficiency |
| Reliability | Subject to bridge failures | Enhanced message delivery guarantees |
| Interoperability | Limited to specific chains | Connects to 30+ blockchains |
| Developer Experience | Complex integration | Simplified API and SDK |
| User Experience | Multiple transaction approvals | Seamless single-transaction flows |

### The Graph's Substreams

**Substreams Integration**: In what could be described as a breakthrough for blockchain data accessibility, the project harnesses The Graph's Substreams technology—a sophisticated system that transforms how developers interact with Solana's vast data landscape.

Behind the scenes, a meticulously crafted Rust-based package silently processes millions of on-chain events in real time. From the digital art economy's NFT transactions to the intricate web of marketplace activities, the system captures the pulse of Solana's ecosystem with remarkable precision. Perhaps most impressive is the platform's ability to track cross-chain asset movements, creating a comprehensive view of how value flows between Solana and dozens of other blockchain networks.

Deployed on substreams.dev and accessible through elegantly designed API endpoints, the implementation showcases how parallel data processing can tame even Solana's notoriously high-throughput blockchain, delivering insights in moments rather than hours—a testament to how far blockchain infrastructure has evolved since the early days of clunky block explorers and delayed data feeds.

Comprehensive documentation is available in the [docs](/substreams)

![Screenshot 2025-05-17 at 9 54 53 AM](https://github.com/user-attachments/assets/8ca9b285-8f59-4ee8-ab4e-d1392ef5a551)

### Key Features

- **Natural Language Queries**: AI-powered interface for querying blockchain data in plain English
- **Substreams Integration**: Parallel processing of blockchain data with minimal latency
- **Gemini AI Integration**: Context-aware responses using Google's advanced AI model
- **Real-time Data Access**: Immediate access to on-chain events and transactions
- **NFT Analytics**: Comprehensive data on NFT mints, transfers, and marketplace activities
- **Cross-chain Monitoring**: Track bridge transactions and cross-chain asset movements
- **Web Search Capabilities**: Access off-chain information to provide comprehensive answers
- **Developer API**: Easy integration for applications requiring blockchain data
- **Modern UI**: Responsive design with intuitive chat interface and typing indicators

## Documentation

Comprehensive documentation is available in the [Documentation](/Documentation) directory:

- [Architecture](/Documentation/architecture) - System design and components
- [API Reference](/Documentation/api-reference) - API documentation

Additional documentation is also available through the application's built-in docs section at [/app/docs](/app/docs) when running the application locally.

## Quick Start

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Rust toolchain (for Solana programs and Substreams development)
- Solana CLI tools
- Substreams CLI (for deploying and testing Substreams)
- PostgreSQL database
- Redis server
- Perplexity Sonar API key
- Gemini API key (get one from [Google AI Studio](https://ai.google.dev/))

### Project Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/Solana-OpenAPI.git
cd Solana-OpenAPI
```

2. Install dependencies for frontend and backend

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Add your API keys to the `.env.local` file

```
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

5. Start the development servers

```bash
# Start frontend
npm run dev

# In another terminal, start backend
cd backend
npm run dev
```

> **Note**: For Solana program and Substreams setup instructions, please refer to the respective README files in `/solana-program` and `/substreams` directories.

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

When deploying to Vercel or other hosting platforms:

1. **Never commit your API keys to the repository**
2. Set the `NEXT_PUBLIC_GEMINI_API_KEY` as an environment variable in your hosting platform's dashboard
3. For Vercel specifically:
   - Go to your project settings
   - Navigate to the "Environment Variables" section
   - Add `NEXT_PUBLIC_GEMINI_API_KEY` with your Gemini API key
   - Deploy your project

## Technology Stack

### Frontend
- Next.js 15.3.2 with App Router
- React 18.3.1
- Tailwind CSS and shadcn/ui
- TypeScript
- Wallet adapters for Solana and EVM chains
- Dynamic imports with SSR disabled for wallet components

### Backend
- Node.js with Express
- GraphQL API with Apollo Server
- PostgreSQL database with Knex.js
- Redis for caching and pub/sub
- WebSockets for real-time updates
- Serverless functions for scalability

### Blockchain
- Solana web3.js and @solana/wallet-adapter-react
- The Graph Substreams for Solana
- Rust-based Substreams package
- Ethers.js for EVM chains
- LayerZero v2 protocol for cross-chain operations
- Light Protocol for compressed tokens
- Custom Solana programs for on-chain logic

## Project Structure

```
├── src/                      # Frontend application
│   ├── api/                  # API services and integrations
│   │   ├── gemini/           # Gemini AI integration
│   │   ├── perplexity/       # Perplexity Sonar API integration
│   │   └── prompt-engineering/ # Enhanced prompts
│   ├── app/                  # Next.js pages and routes (App Router)
│   │   ├── api/              # API routes
│   │   ├── bridge/           # Cross-chain bridge interface
│   │   ├── claim/            # NFT claiming interface
│   │   ├── cross-chain/      # Cross-chain operations
│   │   ├── dashboard/        # User dashboard
│   │   ├── docs/             # Documentation pages
│   │   ├── mint/             # NFT minting interface
│   │   ├── openapi/          # OpenAPI chat interface
│   │   └── profile/          # User profile
│   ├── components/           # React components
│   │   ├── AISearch/         # AI search components
│   │   ├── bridge/           # Bridge components
│   │   ├── claim/            # Claim components
│   │   ├── cross-chain/      # Cross-chain components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── layouts/          # Layout components
│   │   ├── mint/             # Minting components
│   │   ├── profile/          # Profile components
│   │   ├── providers/        # Context providers
│   │   ├── shared/           # Shared components
│   │   ├── ui/               # UI components
│   │   └── wallet/           # Wallet components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── layerzero/        # LayerZero integration
│   │   ├── services/         # Service utilities
│   │   └── utils/            # General utilities
│   ├── pages/                # Legacy Pages Router (if any)
│   ├── services/             # Service layer
│   └── types/                # TypeScript type definitions
├── backend/                  # Backend services
│   ├── config/               # Configuration
│   ├── database/             # Database connections and models
│   ├── graphql/              # GraphQL schema and resolvers
│   ├── middleware/           # Express middleware
│   ├── serverless/           # Serverless functions
│   ├── services/             # Backend services
│   ├── utils/                # Utility functions
│   └── websockets/           # WebSocket handlers
├── gateway/                  # API Gateway
│   ├── dist/                 # Compiled gateway
│   └── src/                  # Gateway source code
├── solana-program/           # Solana on-chain programs
│   ├── instructions/         # Program instructions
│   ├── src/                  # Program source code
│   └── tests/                # Program tests
├── substreams/               # Rust-based Substreams package
│   ├── build/                # Compiled Substreams package
│   ├── proto/                # Protocol buffer definitions
│   ├── src/                  # Rust source code
│   └── substreams.yaml       # Substreams configuration
├── Documentation/            # Comprehensive documentation
│   ├── api-reference/        # API documentation
│   └── architecture/         # System design and components
├── public/                   # Static assets
│   ├── images/               # Image assets
│   └── videos/               # Video assets
└── docs/                     # Legacy documentation
```

## Using Substreams with the AI Agent

The integration between Substreams and the AI agent works as follows:

1. The user submits a natural language query through the chat interface
2. The AI assistant service classifies the query type (NFT, marketplace, wallet, bridge, general)
3. Based on the query type, the system fetches relevant blockchain data using Substreams
4. The Substreams data is formatted and provided as context to the Gemini AI model
5. The AI generates a comprehensive response that incorporates the blockchain data
6. The response is streamed back to the user with real-time updates

This architecture allows for efficient, real-time analysis of blockchain data while providing a natural language interface that makes the data accessible to users without technical blockchain knowledge.


### Perplexity Sonar API

Perplexity's Sonar API serves as the project's primary information retrieval system, enabling:

- **Real-time Blockchain Data Access**: The API connects directly to multiple blockchain networks, including Solana, Ethereum, Polygon, and other LayerZero-supported chains, providing up-to-the-minute transaction data, token metrics, and network statistics.

- **Natural Language Processing**: Users can query blockchain data using everyday language rather than technical commands or complex query syntax. The system interprets questions like "What's the current SOL price?" or "Show me the top NFT collections on Solana this week" and translates them into appropriate data retrieval operations.

- **Contextual Understanding**: Perplexity's advanced language models maintain conversation context, allowing for follow-up questions and clarifications without repeating previously established parameters.

- **Multi-source Information Synthesis**: Beyond on-chain data, the API aggregates information from cryptocurrency exchanges, NFT marketplaces, developer documentation, and relevant news sources to provide comprehensive responses.

### Enhanced AI Processing Pipeline

The Solana OpenAPI platform extends Perplexity's capabilities through a sophisticated processing pipeline:

1. **Query Classification**: Incoming user queries are classified by type (price inquiry, transaction lookup, NFT data, etc.) to optimize the information retrieval strategy.

2. **Parallel Data Retrieval**: The system simultaneously queries multiple data sources, including Substreams-indexed Solana data, cross-chain bridge information, and external market data.

3. **Response Optimization**: Raw data is transformed into human-readable formats with appropriate context, technical explanations, and visual elements when applicable.

4. **Accuracy Verification**: Critical information (especially financial data) undergoes verification against multiple sources before being presented to users.

This integration allows users to query blockchain data, get financial analysis, and receive concise responses about Solana and other supported chains without requiring technical blockchain knowledge. The enhanced AI service combines Perplexity's search capabilities with specialized blockchain data processing to deliver optimized responses for both simple factual queries and complex analytical questions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.
