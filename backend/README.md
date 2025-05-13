# Cosmic Loop Backend Architecture

This document outlines the backend architecture for the Cosmic Loop omnichain NFT solution that seamlessly integrates Solana with LayerZero-supported networks using V2 contracts.

## Architecture Overview

![Backend Architecture](https://mermaid.ink/img/pako:eNqVVMtu2zAQ_BXC5zrIS7ZbNIZ76KFFijRIDMOHFVlKBPRYkpQdw9C_d0nKduoHkPYgibvDmZ0ZUecgdY0QwXOjcm5xsGUdm6xsW7QWv-sGrSm4lRgRV6XYYPCgFyexlGWzmTBdClU3sXg5CVNToJxP4G8sjNJmK3FZ6qo2EYmUKJV96M95a2gAcXgSYD_eU5M1jd7CnXRLzGYFn7fwU6J_pPbxdtbpVD9l0Wbx5NMRWltU9w0JsYrIGt7RNTnKXGIJHynGC09kzWPcauJc1xRbbbHNdSnKOiNYMpNlCjNWgdKz5F2iJGuoGFXHQlLhxlGYx-3adKrq1ipTGHHXkfCEzCpxuBM5_gOZSTfdnJQkuUqvWa4TmqRJOsmvL88vJkmS_1kVdL3Ck4gXdLudEojjXSyHLqZTk8HcaC6NDXG52J2-aPZTLXfcfDqbJmmSMBYYjaI5jZD2WaYf_0GxQTpWg-sDKZF73ueVVONHKHZoXa3l1o3mj-G8E1a67HaA8xNMNvNu6Pu-Fw2Pw-FwRCZxDJFTshY6Qkg8hJmOoalKiGIXwdZ6jX44K9Bg52_Dg9DQ02Fh-OVGWgofImfXVWnGmwvzxlm8bU3zW2rLfg2jDtMj2xPlYdiE0PsDP7O9bQ?type=png)

The Cosmic Loop backend is a microservices architecture designed for scalability, security, and real-time functionality. It consists of the following components:

1. **GraphQL API Layer**: A unified API interface for frontend interaction
2. **Microservices**: Independent services for specific domains
3. **WebSockets**: Real-time event notifications for blockchain events
4. **Serverless Functions**: Scalable computation for high-volume event handling
5. **Database System**: PostgreSQL for relational data with cross-chain NFT tracking
6. **Redis Cache**: Fast in-memory caching and pub/sub messaging
7. **Chain Listeners**: Services monitoring various blockchains for events
8. **Verification System**: Cryptographic proof validation for cross-chain operations

## Technology Stack

- **Language**: Node.js (JavaScript/TypeScript)
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Knex.js
- **Caching**: Redis
- **Real-time**: WebSockets
- **Serverless**: AWS Lambda (deployable to Netlify Functions)
- **Blockchain Integrations**:
  - Solana (web3.js)
  - EVM chains (ethers.js)
  - LayerZero v2 protocol

## Directory Structure

```
backend/
├── config/             # Configuration files
├── services/           # Microservices
│   ├── nft-service/    # NFT management
│   ├── auth-service/   # Authentication
│   ├── bridge-service/ # Cross-chain bridging
│   ├── event-service/  # Event management
│   └── listener-service/ # Chain listeners
├── graphql/            # GraphQL API
│   ├── schema/         # GraphQL schemas
│   ├── resolvers/      # GraphQL resolvers
│   └── directives/     # GraphQL custom directives
├── websockets/         # WebSocket implementation
├── serverless/         # Serverless functions
│   ├── distribution/   # Token distribution functions
│   └── verification/   # Verification functions
├── database/           # Database models and migrations
│   ├── models/         # Database models
│   ├── migrations/     # Database migrations
│   └── seeders/        # Database seeders
├── middleware/         # Middleware implementations
│   ├── rate-limiting/  # Rate limiting middleware
│   └── auth/           # Authentication middleware
└── utils/              # Utility functions
```

## Key Components

### 1. GraphQL API

The GraphQL API layer provides a unified interface for the frontend to interact with all backend services. It offers efficient querying of data across chains and acts as the entry point for all frontend requests.

Key files:
- `graphql/schema/` - Contains GraphQL type definitions
- `graphql/resolvers/` - Contains resolver functions

### 2. Database Schema

The PostgreSQL database stores information about NFTs, bridge operations, verification proofs, and events across multiple chains.

Key tables:
- `nft_collections` - NFT collection metadata
- `nfts` - Individual NFT data
- `bridge_operations` - Cross-chain transfer operations
- `verification_proofs` - Cryptographic verification proofs
- `events` - NFT distribution events
- `event_participants` - Event participation tracking
- `chain_listeners` - Chain monitoring configuration
- `transaction_queue` - Asynchronous transaction processing

### 3. WebSockets

The WebSocket server provides real-time updates about blockchain events, bridge operations, and NFT transfers. It uses Redis pub/sub to coordinate between services.

### 4. Serverless Functions

Serverless functions handle computation-intensive or infrequent tasks:
- `distribute-nfts.js` - Handles high-volume NFT distribution during events
- `verify-bridge-transaction.js` - Performs cryptographic verification of cross-chain transfers

### 5. Chain Listeners

Chain listeners monitor blockchain events across various networks, including Solana and EVM-compatible chains. When relevant events occur, they update the database and notify clients via WebSockets.

### 6. Bridge Verification

The bridge verification system validates the authenticity of cross-chain transfers using LayerZero's messaging protocol and cryptographic proofs.

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure the environment variables
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Development Environment Setup

1. **Database Setup**:
   ```bash
   npm run migrate
   npm run seed
   ```

2. **Running Locally**:
   ```bash
   npm run dev
   ```

3. **Running Tests**:
   ```bash
   npm test
   ```

## Deployment

The backend can be deployed in several ways:

1. **Monolithic Deployment**: Deploy as a single Node.js application
2. **Microservices Deployment**: Deploy each service individually
3. **Serverless Deployment**: Deploy as serverless functions to AWS Lambda or Netlify Functions

For more information on deployment, see the deployment documentation.

## Security Considerations

- JWT-based authentication
- Rate limiting to prevent abuse
- Input validation with Zod
- Secure storage of private keys (use environment variables or secret management services)
- CORS configuration to prevent unauthorized access

## Integration with Frontend

The frontend interacts with the backend primarily through:
1. GraphQL API for data queries and mutations
2. WebSocket connections for real-time updates
3. Direct blockchain interactions for transaction signing

The API client in `src/lib/api-client.ts` provides a convenient interface for the frontend to interact with the backend.

## Scalability Considerations

- Horizontal scaling of services
- Redis caching for frequently accessed data
- Rate limiting to prevent abuse
- Database indexing for efficient queries
- Serverless functions for handling spikes in demand
