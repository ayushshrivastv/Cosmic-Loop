# Solana OpenAPI - Realtime Blockchain Data Access

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Compatible-9945FF)](https://solana.com/)
[![LayerZero](https://img.shields.io/badge/LayerZero-V2-2D374B)](https://layerzero.network/)

## Overview

Solana OpenAPI is an innovative blockchain data interface that provides real-time access to Solana's on-chain data through The Graph's Substreams technology. The platform enables developers, analysts, and users to query blockchain data using natural language, receiving structured responses about NFTs, marketplace activities, wallet histories, and cross-chain operations.

### Key Features

- **Natural Language Queries**: AI-powered interface for querying blockchain data in plain English
- **Substreams Integration**: Parallel processing of blockchain data with minimal latency
- **Real-time Data Access**: Immediate access to on-chain events and transactions
- **NFT Analytics**: Comprehensive data on NFT mints, transfers, and marketplace activities
- **Cross-chain Monitoring**: Track bridge transactions and cross-chain asset movements
- **Developer API**: Easy integration for applications requiring blockchain data
- **Modern UI**: Responsive design with dark/light mode using Tailwind CSS

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
- PostgreSQL database
- Redis server (optional for development)
- Gemini API key (get one from [Google AI Studio](https://ai.google.dev/))

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
- Ethers.js for EVM chains
- LayerZero v2 protocol
- Light Protocol for compressed tokens

## Project Structure

```
├── src/                 # Frontend application
│   ├── app/             # Next.js pages and routes
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and services
│   └── types/           # TypeScript type definitions
├── backend/             # Backend services
│   ├── config/          # Configuration files
│   ├── services/        # Microservices
│   ├── graphql/         # GraphQL API
│   ├── database/        # Database models and migrations
│   └── websockets/      # WebSocket implementation
├── public/              # Static assets
└── docs/                # Documentation
```

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
