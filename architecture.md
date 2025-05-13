# Cosmic Loop - Architecture Documentation

This document provides a detailed overview of the Cosmic Loop architecture, explaining how the system components interact to create a seamless omnichain NFT experience.

## System Overview

Cosmic Loop is an omnichain NFT solution that bridges Solana and EVM-compatible chains using LayerZero's cross-chain messaging protocol and Light Protocol's compressed token technology. The system enables efficient creation, distribution, and bridging of NFTs across multiple blockchains.

![System Architecture Diagram](https://mermaid.ink/img/pako:eNqVVMtu2zAQ_BXC5zrIS7ZbNIZ76KFFijRIDMOHFVlKBPRYkpQdw9C_d0nKduoHkPYgibvDmZ0ZUecgdY0QwXOjcm5xsGUdm6xsW7QWv-sGrSm4lRgRV6XYYPCgFyexlGWzmTBdClU3sXg5CVNToJxP4G8sjNJmK3FZ6qo2EYmUKJV96M95a2gAcXgSYD_eU5M1jd7CnXRLzGYFn7fwU6J_pPbxdtbpVD9l0Wbx5NMRWltU9w0JsYrIGt7RNTnKXGIJHynGC09kzWPcauJc1xRbbbHNdSnKOiNYMpNlCjNWgdKz5F2iJGuoGFXHQlLhxlGYx-3adKrq1ipTGHHXkfCEzCpxuBM5_gOZSTfdnJQkuUqvWa4TmqRJOsmvL88vJkmS_1kVdL3Ck4gXdLudEojjXSyHLqZTk8HcaC6NDXG52J2-aPZTLXfcfDqbJmmSMBYYjaI5jZD2WaYf_0GxQTpWg-sDKZF73ueVVONHKHZoXa3l1o3mj-G8E1a67HaA8xNMNvNu6Pu-Fw2Pw-FwRCZxDJFTshY6Qkg8hJmOoalKiGIXwdZ6jX44K9Bg52_Dg9DQ02Fh-OVGWgofImfXVWnGmwvzxlm8bU3zW2rLfg2jDtMj2xPlYdiE0PsDP7O9bQ)

## Architecture Components

### 1. Frontend Application

The frontend is built with Next.js 15 using the App Router architecture and React 18. It provides a modern, responsive user interface for interacting with the Cosmic Loop ecosystem.

#### Key Frontend Components:

- **Wallet Integration**: Supports multiple wallet providers for both Solana and EVM chains
- **NFT Creation Interface**: UI for creating compressed tokens using Light Protocol
- **Bridging Interface**: UI for transferring NFTs between chains
- **QR Code Generation**: Creates QR codes for token distribution
- **Real-time Updates**: WebSocket connections for live event updates

#### Frontend Technology Stack:

- Next.js 15.3.2 with App Router
- React 18.3.1
- TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- react-hook-form with zod validation
- Wallet adapters for blockchain interaction

### 2. Backend Services

The backend uses a microservices architecture to provide scalable, maintainable services that handle various aspects of the application.

#### Key Backend Services:

- **GraphQL API**: Central API gateway for frontend-backend communication
- **NFT Service**: Manages NFT creation, metadata, and transfers
- **Bridge Service**: Handles cross-chain NFT transfers via LayerZero
- **Event Service**: Manages event creation and participation
- **Auth Service**: Handles user authentication and authorization
- **Chain Listeners**: Monitors blockchain events across multiple chains

#### Backend Technology Stack:

- Node.js with Express
- GraphQL with Apollo Server
- PostgreSQL database with Knex.js ORM
- Redis for caching and pub/sub messaging
- WebSockets for real-time communication
- JWT for authentication
- Zod for validation

### 3. Blockchain Integration

Cosmic Loop integrates with multiple blockchains to provide a seamless omnichain experience.

#### Key Blockchain Components:

- **Solana Integration**: Uses web3.js and wallet adapters for Solana interaction
- **EVM Integration**: Uses ethers.js and wagmi for EVM chain interaction
- **LayerZero Protocol**: Enables cross-chain messaging and NFT transfers
- **Light Protocol**: Provides compressed token functionality on Solana

### 4. Database System

The system uses PostgreSQL for persistent data storage, with a schema designed to track NFTs and operations across multiple chains.

#### Key Database Tables:

- `nft_collections`: Stores collection metadata
- `nfts`: Stores individual NFT data
- `bridge_operations`: Tracks cross-chain transfer operations
- `verification_proofs`: Stores cryptographic verification proofs
- `events`: Stores event data for NFT distribution
- `event_participants`: Tracks participation in events
- `chain_listeners`: Configuration for blockchain event monitoring

### 5. Caching and Messaging

Redis is used for caching frequently accessed data and for pub/sub messaging between services.

#### Key Caching and Messaging Components:

- **Data Caching**: Reduces database load for frequently accessed data
- **Pub/Sub Messaging**: Enables communication between microservices
- **WebSocket Notifications**: Provides real-time updates to clients

## Data Flow

### NFT Creation Flow

1. User connects wallet on frontend
2. User submits NFT creation form
3. Frontend sends request to GraphQL API
4. NFT Service processes request
5. Light Protocol SDK creates compressed token on Solana
6. Database records NFT metadata
7. WebSocket notifies client of successful creation

### NFT Bridging Flow

1. User selects NFT to bridge
2. User selects destination chain
3. Frontend sends bridge request to GraphQL API
4. Bridge Service initiates LayerZero message
5. Source chain locks or burns NFT
6. LayerZero delivers message to destination chain
7. Destination chain mints or unlocks NFT
8. Database updates NFT status
9. WebSocket notifies client of successful bridge

### Event Token Distribution Flow

1. Event creator generates QR codes for tokens
2. Attendee scans QR code
3. Frontend sends claim request to GraphQL API
4. NFT Service verifies claim eligibility
5. Light Protocol SDK transfers token to attendee
6. Database updates token ownership
7. WebSocket notifies client of successful claim

## Scalability Considerations

Cosmic Loop is designed for high scalability, capable of handling events with 10,000+ attendees:

- **Microservices Architecture**: Allows independent scaling of services
- **Compressed Tokens**: Reduces on-chain storage by up to 1000x
- **Serverless Functions**: Handles computation-intensive tasks
- **Redis Caching**: Reduces database load
- **Database Indexing**: Optimizes query performance
- **Rate Limiting**: Prevents API abuse

## Security Considerations

Security is a top priority for Cosmic Loop:

- **JWT Authentication**: Secure user authentication
- **Input Validation**: Zod validation for all inputs
- **Rate Limiting**: Prevents brute force attacks
- **CORS Configuration**: Restricts API access
- **No Private Key Storage**: Keys remain in user wallets
- **Cryptographic Verification**: Ensures cross-chain transfer integrity

## Deployment Architecture

The system can be deployed in various configurations:

- **Frontend**: Deployed on Vercel or Netlify
- **Backend**: Can be deployed as:
  - Monolithic application
  - Microservices on Kubernetes
  - Serverless functions on AWS Lambda or Netlify Functions
- **Database**: Hosted PostgreSQL (AWS RDS, Digital Ocean, etc.)
- **Redis**: Managed Redis service (Redis Labs, AWS ElastiCache, etc.)

## Development Workflow

1. Local development with hot reloading
2. Testing with Jest and React Testing Library
3. CI/CD pipeline with GitHub Actions
4. Staging environment for testing
5. Production deployment with blue/green strategy

## Future Enhancements

Planned enhancements for the Cosmic Loop platform:

1. Support for additional blockchains
2. Enhanced analytics dashboard
3. Mobile application
4. Advanced token utilities (staking, voting, etc.)
5. Integration with existing NFT marketplaces
