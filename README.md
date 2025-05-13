# Cosmic Loop - Omnichain NFT Solution

Cosmic Loop is an innovative omnichain NFT solution that seamlessly integrates Solana with LayerZero-supported networks using V2 contracts, featuring compressed tokens via Light Protocol for maximum scalability.

## 🌟 Features

- **Omnichain NFT Bridging**: Seamlessly transfer NFTs between Solana and EVM chains via LayerZero
- **Compressed Tokens**: Ultra-efficient token creation using Light Protocol's compression technology
- **QR Code Distribution**: Easy token distribution through QR codes and claim codes
- **Real-time Updates**: WebSocket integration for live blockchain event notifications
- **Scalable Architecture**: Support for high-volume events with 10,000+ attendees
- **Multi-wallet Support**: Integration with popular Solana and EVM wallets
- **Modern UI**: Responsive design with dark/light mode using Tailwind CSS and shadcn/ui

## 🚀 Technology Stack

### Frontend
- Next.js 15.3.2 with App Router
- React 18.3.1
- Tailwind CSS
- shadcn/ui components
- TypeScript
- Wallet adapters for Solana and EVM chains

### Backend
- Node.js with Express
- GraphQL API with Apollo Server
- PostgreSQL database with Knex.js
- Redis for caching and pub/sub
- WebSockets for real-time updates
- Serverless functions for high-volume operations

### Blockchain
- Solana web3.js
- Ethers.js for EVM chains
- LayerZero v2 protocol integration
- Light Protocol for compressed tokens

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- PostgreSQL database
- Redis server (optional for development)

### Frontend Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy `.env.example` to `.env` and configure environment variables
4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npm run migrate
npm run seed
```

4. Start the backend server:

```bash
npm run dev
```

## 📂 Project Structure

- `/src` - Frontend application
  - `/app` - Next.js pages and routes
  - `/components` - React components
  - `/hooks` - Custom React hooks
  - `/lib` - Utilities and constants
  - `/types` - TypeScript type definitions
- `/backend` - Backend services
  - `/config` - Configuration files
  - `/database` - Database models and migrations
  - `/graphql` - GraphQL API
  - `/services` - Microservices
  - `/websockets` - WebSocket implementation
  - `/serverless` - Serverless functions
- `/public` - Static assets

## 📚 Documentation

For more detailed information about the project architecture and implementation, see the [Architecture Documentation](./architecture.md).

## 📄 License

MIT
