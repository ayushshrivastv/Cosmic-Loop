# Solana OpenAPI - AI Powered Blockchain Data Interface 

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Compatible-9945FF)](https://solana.com/)
[![LayerZero](https://img.shields.io/badge/LayerZero-V2-2D374B)](https://layerzero.network/)
[![The Graph](https://img.shields.io/badge/The%20Graph-Substreams-0C0A1C)](https://thegraph.com/docs/en/substreams/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2)](https://ai.google.dev/)

## Overview
Solana OpenAPI is an innovative omnichain NFT solution designed to revolutionize event attendance verification and digital collectibles distribution. By seamlessly integrating Solana's high-performance blockchain with LayerZero supported networks through V2 contracts and The Graph's Substreams technology to process and index Solana blockchain data, Solana OpenAPI creates a unified experience across multiple blockchains.

For a detailed technical architecture and component flow diagrams, please refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) document or [YouTube](https://youtu.be/V40mvlS0EkA?feature=shared) 

P.S. After 48 hours of coding, debugging, and more coffee than water—here’s the project. The backend isn’t quite where I want it yet—there’s still a lot of work ahead. Initially, I considered creating a mock data interface for the hackathon, but I’ve decided to connect to a real blockchain network instead. Writing the smart contract is taking some time.

I came across this project on Superteam on March 10th, and this is my first ever submission on superteam—and also my first Solana project!

Web Page Link
**[Solana OpenAPI](https://openapi-lilac.vercel.app)**

![Screenshot 2025-05-17 at 9 52 16 AM](https://github.com/user-attachments/assets/3d38bdad-17fe-48c7-8b5d-57cd0492fbb9)

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

**Substreams Integration**: Our project leverages The Graph's Substreams technology to process and index Solana blockchain data with unprecedented speed and efficiency. The Rust-based Substreams package in the `/substreams` directory processes data for: **NFT Events** (mints, transfers, burns, and metadata updates), **Marketplace Activities** (listings, sales, offers, and cancellations), **Cross-chain Bridging** (asset transfers between Solana and other blockchains), and **Wallet Activities** (comprehensive transaction histories and account analysis). The Substreams package is deployed to substreams.dev and can be accessed via our API endpoints. Our implementation demonstrates the power of Substreams' parallel processing capabilities, allowing for real-time data access even on Solana's high-throughput blockchain.

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

Comprehensive documentation is available in the [docs](/docs) directory:

- [Overview](/docs/overview.md) - Introduction and key concepts
- [Getting Started](/docs/getting-started.md) - Installation and setup
- [Architecture](/docs/architecture/README.md) - System design and components
- [API Reference](/docs/api-reference/README.md) - API documentation

## Quick Start

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Rust toolchain (for Substreams development)
- Substreams CLI (for deploying and testing Substreams)
- PostgreSQL database
- Redis server (optional for development)
- Gemini API key (get one from [Google AI Studio](https://ai.google.dev/))
- Serper API key (optional, for web search capabilities)

### Substreams Setup

1. Install the Substreams CLI

```bash
cd substreams
curl https://raw.githubusercontent.com/streamingfast/substreams/stable/install.sh | bash
```

2. Get an authentication token from substreams.dev

3. Build the Substreams package

```bash
cd substreams
substreams pack
```

4. Deploy the Substreams package to substreams.dev

```bash
substreams deploy your-package.spkg
```

5. Test your Substreams

```bash
substreams run substreams.yaml nft_events -e mainnet.sol.streamingfast.io:443
```

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/cosmic-loop.git
cd cosmic-loop
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Add your Gemini API key to the `.env.local` file

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

5. Start the development server

```bash
npm run dev
```

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

### Backend
- Node.js with Express
- GraphQL API with Apollo Server
- PostgreSQL database with Knex.js
- Redis for caching and pub/sub
- WebSockets for real-time updates

### Blockchain
- Solana web3.js
- The Graph Substreams for Solana
- Rust-based Substreams package
- Ethers.js for EVM chains
- LayerZero v2 protocol
- Light Protocol for compressed tokens

## Project Structure

```
├── src/                      # Frontend application
│   ├── app/                  # Next.js pages and routes
│   │   └── openapi/          # OpenAPI chat interface
│   ├── components/           # React components
│   │   └── shared/           # Shared components including chat-popup
│   ├── hooks/                # Custom React hooks
│   │   └── use-ai-assistant.ts # AI assistant hook
│   ├── pages/                # API routes
│   │   └── api/              # Backend API endpoints
│   │       └── substreams/   # Substreams execution endpoints
│   ├── services/             # Service layer
│   │   ├── ai-assistant-service.ts    # AI assistant service
│   │   ├── gemini-service.ts          # Gemini AI integration
│   │   ├── prompt-engineering-service.ts # Enhanced prompts
│   │   ├── substreams-service.ts       # Substreams data service
│   │   ├── substreams-gemini-service.ts # Integration layer
│   │   └── web-search-service.ts       # Web search capabilities
│   └── types/                # TypeScript type definitions
├── substreams/               # Rust-based Substreams package
│   ├── src/                  # Rust source code
│   │   ├── lib.rs            # Library entry point
│   │   ├── nft.rs            # NFT event processing
│   │   ├── marketplace.rs    # Marketplace event processing
│   │   └── bridge.rs         # Cross-chain bridge processing
│   ├── build/                # Compiled Substreams package
│   └── substreams.yaml       # Substreams configuration
├── public/                   # Static assets
└── docs/                     # Documentation
```

## API Endpoints

### Substreams Execution

```
POST /api/substreams/execute
```

Executes specific modules in the Rust-based Substreams package and returns the results.

**Request Body:**

```json
{
  "module": "nft_events",
  "params": {
    "limit": 10
  }
}
```

**Available Modules:**

- `nft_events`: Get recent NFT events
- `nft_events_by_token`: Get NFT events for a specific token
- `nft_events_by_wallet`: Get NFT events for a specific wallet
- `bridge_events`: Get cross-chain bridge events
- `marketplace_events`: Get marketplace events
- `nft_collections`: Get NFT collection data
- `account_transactions`: Get account transaction history

### AI Assistant

```
POST /api/ai/ask
```

Sends a query to the AI assistant, which processes it using Gemini AI and relevant Substreams data.

**Request Body:**

```json
{
  "query": "Show me recent NFT sales on Solana",
  "conversationId": "optional-conversation-id"
}
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
