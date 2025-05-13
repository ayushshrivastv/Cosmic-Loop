# Backend Architecture

The Cosmic Loop backend is designed as a scalable, microservices-based architecture that handles the complex requirements of cross-chain NFT operations. This document provides a comprehensive overview of the backend components and how they interact.

## Architecture Overview

![Backend Architecture](../../public/images/documentation/backend-architecture.png)

The backend architecture follows a domain-driven design approach with clear boundaries between services. Each service is responsible for a specific domain and exposes its functionality through well-defined APIs.

## Core Components

### GraphQL API Layer

The GraphQL API serves as the unified entry point for all frontend interactions, providing a flexible and efficient way to query and mutate data.

**Key Features:**
- Schema-first design with strong typing
- Resolver-based implementation
- Authentication and authorization middleware
- Rate limiting and abuse prevention
- Efficient query batching and caching

**Implementation:**
```typescript
// Example GraphQL schema definition
const typeDefs = gql`
  type NFT {
    id: ID!
    name: String!
    description: String
    image: String
    chain: Chain!
    owner: String!
    metadata: JSONObject
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    nft(id: ID!): NFT
    nftsByOwner(owner: String!, chain: Chain): [NFT!]!
  }
`;
```

### Microservices

The backend is divided into several microservices, each responsible for a specific domain:

#### NFT Service

Manages NFT metadata, ownership, and operations.

**Responsibilities:**
- NFT creation and minting
- Metadata management
- Ownership tracking
- Collection management

**API Endpoints:**
- `GET /nfts/:id` - Get NFT details
- `POST /nfts` - Create new NFT
- `GET /nfts/owner/:address` - Get NFTs by owner
- `PUT /nfts/:id/metadata` - Update NFT metadata

#### Bridge Service

Handles cross-chain NFT transfers using LayerZero.

**Responsibilities:**
- Initiate bridge operations
- Monitor bridge status
- Fee estimation
- Cross-chain verification

**API Endpoints:**
- `POST /bridge` - Initiate bridge operation
- `GET /bridge/:operationId` - Get bridge operation status
- `GET /bridge/estimate` - Estimate bridge fees
- `GET /bridge/history/:address` - Get user's bridge history

#### Auth Service

Manages authentication, authorization, and user accounts.

**Responsibilities:**
- User registration and login
- JWT token management
- Role-based access control
- Wallet address verification

**API Endpoints:**
- `POST /auth/login` - Login with wallet
- `POST /auth/verify` - Verify wallet signature
- `GET /auth/nonce/:address` - Get nonce for wallet signing
- `POST /auth/refresh` - Refresh JWT token

#### Event Service

Manages event creation, registration, and attendance tracking.

**Responsibilities:**
- Event creation and management
- Attendee registration
- QR code generation
- Attendance verification

**API Endpoints:**
- `POST /events` - Create new event
- `GET /events/:id` - Get event details
- `POST /events/:id/register` - Register for event
- `POST /events/:id/verify` - Verify attendance

#### Listener Service

Monitors blockchain events across multiple chains.

**Responsibilities:**
- Block monitoring
- Event filtering
- Transaction confirmation
- State synchronization

**Implementation:**
```typescript
// Example chain listener implementation
class ChainListener {
  constructor(chain, rpcUrl, startBlock) {
    this.chain = chain;
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.currentBlock = startBlock;
    this.filters = new Map();
  }

  async start() {
    this.running = true;
    while (this.running) {
      await this.processNewBlocks();
      await sleep(5000); // Poll every 5 seconds
    }
  }

  async processNewBlocks() {
    const latestBlock = await this.provider.getBlockNumber();
    if (latestBlock <= this.currentBlock) return;
    
    for (let i = this.currentBlock + 1; i <= latestBlock; i++) {
      const block = await this.provider.getBlockWithTransactions(i);
      await this.processBlock(block);
    }
    
    this.currentBlock = latestBlock;
  }
}
```

### Database System

PostgreSQL serves as the primary database, with a carefully designed schema to handle cross-chain data.

**Key Tables:**
- `nft_collections` - NFT collection metadata
- `nfts` - Individual NFT data
- `bridge_operations` - Cross-chain transfer operations
- `events` - Event information
- `event_participants` - Event registration and attendance
- `users` - User accounts and preferences
- `chain_listeners` - Chain monitoring configuration

**Schema Example:**
```sql
CREATE TABLE nfts (
  id SERIAL PRIMARY KEY,
  token_id VARCHAR(255) NOT NULL,
  collection_id INTEGER REFERENCES nft_collections(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  chain VARCHAR(50) NOT NULL,
  owner_address VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(token_id, chain)
);

CREATE INDEX nfts_owner_chain_idx ON nfts(owner_address, chain);
```

### Caching Layer

Redis provides fast in-memory caching and pub/sub messaging.

**Use Cases:**
- API response caching
- Rate limiting
- Session storage
- Real-time event distribution
- Task queuing

**Implementation:**
```typescript
// Example Redis caching middleware
const cacheMiddleware = (ttl = 60) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        redis.set(key, JSON.stringify(body), 'EX', ttl);
        return res.sendResponse(body);
      };
      next();
    } catch (error) {
      next();
    }
  };
};
```

### WebSockets

Real-time communication for blockchain events and updates.

**Event Types:**
- `nft:minted` - New NFT minted
- `nft:transferred` - NFT ownership changed
- `bridge:initiated` - Bridge operation started
- `bridge:completed` - Bridge operation completed
- `event:registered` - User registered for event
- `event:attended` - User attended event

**Implementation:**
```typescript
// Example WebSocket server setup
const setupWebSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.address}`);
    
    // Subscribe to user-specific events
    socket.join(`user:${socket.user.address}`);
    
    socket.on('subscribe:event', (eventId) => {
      socket.join(`event:${eventId}`);
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.address}`);
    });
  });
  
  return io;
};
```

### Serverless Functions

Serverless functions handle computation-intensive or infrequent tasks.

**Functions:**
- `distribute-nfts` - Batch NFT distribution for events
- `verify-bridge-transaction` - Cryptographic verification of cross-chain transfers
- `generate-event-report` - Create analytics reports for events
- `process-image` - Optimize and store NFT images

## Communication Patterns

### Service-to-Service Communication

Services communicate through:
1. **Direct API calls** - Synchronous REST or GraphQL requests
2. **Message queue** - Asynchronous task processing
3. **Event bus** - Publish/subscribe pattern for events
4. **Shared database** - For tightly coupled services

### Client-Server Communication

The frontend communicates with the backend through:
1. **GraphQL API** - For data queries and mutations
2. **WebSockets** - For real-time updates
3. **Direct blockchain interactions** - For transaction signing

## Security Measures

### Authentication and Authorization

- **JWT-based authentication** - Secure, stateless authentication
- **Wallet signature verification** - Cryptographic proof of ownership
- **Role-based access control** - Granular permission management
- **API key authentication** - For service-to-service communication

### Data Protection

- **Input validation** - Prevent injection attacks
- **Rate limiting** - Protect against DoS attacks
- **CORS configuration** - Prevent unauthorized access
- **Data encryption** - Protect sensitive information

### Blockchain Security

- **Transaction verification** - Validate transaction parameters
- **Gas limit protection** - Prevent excessive gas consumption
- **Nonce management** - Prevent transaction replay
- **Private key security** - Secure storage of private keys

## Deployment and Scaling

### Deployment Options

1. **Monolithic deployment** - Single application deployment
2. **Microservices deployment** - Independent service deployment
3. **Serverless deployment** - Function-as-a-Service deployment
4. **Hybrid deployment** - Combination of approaches

### Scaling Strategies

1. **Horizontal scaling** - Add more instances of services
2. **Vertical scaling** - Increase resources for existing instances
3. **Database sharding** - Partition data across multiple databases
4. **Caching** - Reduce database load with caching
5. **Load balancing** - Distribute traffic across instances

## Monitoring and Observability

### Metrics Collection

- **Service health** - Uptime, response time, error rate
- **Resource utilization** - CPU, memory, disk, network
- **Business metrics** - NFTs minted, bridges completed, events created

### Logging

- **Structured logging** - JSON-formatted logs with context
- **Log aggregation** - Centralized log collection and analysis
- **Log retention** - Historical log data for troubleshooting

### Alerting

- **Service health alerts** - Notify on service degradation
- **Error rate alerts** - Notify on increased error rates
- **Resource alerts** - Notify on resource exhaustion
- **Business alerts** - Notify on business metric anomalies

## Next Steps

- Explore the [Database Schema](./database-schema.md) in detail
- Learn about the [API Design](./api-design.md)
- Understand the [Blockchain Integration](./blockchain-integration.md)
- Review the [Security Architecture](./security-architecture.md)
