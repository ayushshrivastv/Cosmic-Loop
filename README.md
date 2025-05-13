# Cosmic Loop - Omnichain NFT Solution

## About Cosmic Loop

Cosmic Loop is an innovative omnichain NFT solution designed to revolutionize event attendance verification and digital collectibles distribution. By seamlessly integrating Solana's high-performance blockchain with LayerZero-supported networks through V2 contracts, Cosmic Loop creates a unified experience across multiple blockchains. The platform leverages compressed tokens via Light Protocol to achieve unprecedented scalability, making it ideal for events of any size—from intimate gatherings to large-scale conferences with thousands of attendees.

At its core, Cosmic Loop addresses the fragmentation in the blockchain ecosystem by enabling NFT-based attendance tokens that can move freely between Solana and various EVM chains. This cross-chain interoperability ensures that event organizers can reach audiences regardless of their preferred blockchain, while attendees maintain ownership of their digital proof of attendance across different networks. The platform's architecture is built with scalability in mind, capable of handling high-volume events with 10,000+ attendees without compromising on performance or user experience.

Cosmic Loop goes beyond simple NFT distribution by offering a comprehensive suite of tools for event organizers. The platform provides detailed analytics dashboards for tracking attendance patterns, engagement metrics, and cross-chain token movements. For attendees, the claiming process is streamlined through intuitive QR code scanning and user-friendly wallet connections, eliminating the technical barriers often associated with blockchain interactions. This focus on accessibility makes Cosmic Loop suitable for both crypto-native users and newcomers to the space.

The technology stack powering Cosmic Loop combines cutting-edge web development frameworks with sophisticated blockchain integrations. On the frontend, Next.js with React provides a responsive and performant user interface, while the backend leverages GraphQL for efficient data operations and WebSockets for real-time updates. The blockchain layer integrates Solana web3.js, Ethers.js for EVM chains, and LayerZero's protocol for secure cross-chain messaging, creating a robust foundation for omnichain functionality.

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
