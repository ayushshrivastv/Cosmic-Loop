# API Reference

This section provides comprehensive documentation for the Solana OpenAPI API, including GraphQL schemas, REST endpoints, and WebSocket events.

## API Overview

Solana OpenAPI offers multiple API interfaces to accommodate different integration needs:

1. **GraphQL API** - Primary API for frontend and third-party integrations
2. **REST API** - Alternative API for specific microservices
3. **WebSocket API** - Real-time event notifications

## GraphQL API

The GraphQL API is the recommended way to interact with Solana OpenAPI, offering flexible queries, mutations, and subscriptions.

### Base URL

```
https://api.solana-openapi.com/graphql
```

For local development:

```
http://localhost:4000/graphql
```

### Authentication

The GraphQL API uses JWT-based authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a JWT token, use the `authenticate` mutation with a wallet signature.

### GraphQL Schema

The complete GraphQL schema is available in the [GraphQL Schema Reference](./graphql-schema.md).

### Example Queries

#### Get NFT Details

```graphql
query GetNFT($id: ID!) {
  nft(id: $id) {
    id
    name
    description
    image
    chain
    owner
    metadata
    createdAt
    updatedAt
  }
}
```

#### Get NFTs by Owner

```graphql
query GetNFTsByOwner($owner: String!, $chain: Chain) {
  nftsByOwner(owner: $owner, chain: $chain) {
    id
    name
    description
    image
    chain
    createdAt
  }
}
```

### Example Mutations

#### Initiate Bridge Operation

```graphql
mutation InitiateBridge($input: BridgeInput!) {
  initiateBridge(input: $input) {
    id
    sourceChain
    destinationChain
    nftId
    status
    txHash
    estimatedCompletionTime
  }
}
```

#### Create Event

```graphql
mutation CreateEvent($input: EventInput!) {
  createEvent(input: $input) {
    id
    name
    description
    startDate
    endDate
    location
    maxAttendees
    nftCollectionId
  }
}
```

### Example Subscriptions

#### Bridge Operation Updates

```graphql
subscription BridgeUpdates($operationId: ID!) {
  bridgeOperationUpdated(operationId: $operationId) {
    id
    status
    progress
    message
    completedAt
  }
}
```

#### NFT Transfer Events

```graphql
subscription NFTTransfers($owner: String!) {
  nftTransferred(owner: $owner) {
    id
    nftId
    fromAddress
    toAddress
    chain
    txHash
    timestamp
  }
}
```

## REST API

While GraphQL is the preferred API, some microservices also expose REST endpoints for specific use cases.

### Base URL

```
https://api.solana-openapi.com
```

For local development:

```
http://localhost:4000
```

### Authentication

REST endpoints use the same JWT-based authentication as GraphQL. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Available Endpoints

#### NFT Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nfts/:id` | Get NFT details |
| POST | `/nfts` | Create new NFT |
| GET | `/nfts/owner/:address` | Get NFTs by owner |
| PUT | `/nfts/:id/metadata` | Update NFT metadata |

#### Bridge Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bridge` | Initiate bridge operation |
| GET | `/bridge/:operationId` | Get bridge operation status |
| GET | `/bridge/estimate` | Estimate bridge fees |
| GET | `/bridge/history/:address` | Get user's bridge history |

#### Auth Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with wallet |
| POST | `/auth/verify` | Verify wallet signature |
| GET | `/auth/nonce/:address` | Get nonce for wallet signing |
| POST | `/auth/refresh` | Refresh JWT token |

#### Event Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events` | Create new event |
| GET | `/events/:id` | Get event details |
| POST | `/events/:id/register` | Register for event |
| POST | `/events/:id/verify` | Verify attendance |

### Example Requests and Responses

Detailed examples for each endpoint are available in the respective service documentation:

- [NFT Service API](./nft-service-api.md)
- [Bridge Service API](./bridge-service-api.md)
- [Auth Service API](./auth-service-api.md)
- [Event Service API](./event-service-api.md)

## WebSocket API

The WebSocket API provides real-time updates for blockchain events, bridge operations, and other system events.

### Connection URL

```
wss://api.solana-openapi.com/websocket
```

For local development:

```
ws://localhost:4000/websocket
```

### Authentication

Include the JWT token in the connection handshake:

```javascript
const socket = new WebSocket('wss://api.solana-openapi.com/websocket', {
  headers: {
    Authorization: `Bearer ${jwtToken}`
  }
});
```

### Event Types

#### NFT Events

| Event | Description |
|-------|-------------|
| `nft:minted` | New NFT minted |
| `nft:transferred` | NFT ownership changed |
| `nft:metadata_updated` | NFT metadata updated |

#### Bridge Events

| Event | Description |
|-------|-------------|
| `bridge:initiated` | Bridge operation started |
| `bridge:in_progress` | Bridge operation in progress |
| `bridge:completed` | Bridge operation completed |
| `bridge:failed` | Bridge operation failed |

#### Event Management Events

| Event | Description |
|-------|-------------|
| `event:created` | New event created |
| `event:updated` | Event details updated |
| `event:registered` | User registered for event |
| `event:attended` | User attended event |

### Example Usage

```javascript
// Connect to WebSocket
const socket = new WebSocket('wss://api.solana-openapi.com/websocket', {
  headers: {
    Authorization: `Bearer ${jwtToken}`
  }
});

// Listen for connection open
socket.onopen = () => {
  console.log('Connected to WebSocket');
  
  // Subscribe to specific events
  socket.send(JSON.stringify({
    type: 'subscribe',
    channel: 'nft:transferred',
    filter: {
      owner: '0x1234...'
    }
  }));
};

// Listen for messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received event:', data);
  
  // Handle different event types
  switch (data.type) {
    case 'nft:transferred':
      handleNftTransfer(data.payload);
      break;
    case 'bridge:completed':
      handleBridgeComplete(data.payload);
      break;
    // Handle other event types
  }
};

// Handle connection close
socket.onclose = () => {
  console.log('Disconnected from WebSocket');
};
```

## Rate Limiting

To ensure fair usage and system stability, API requests are subject to rate limiting:

- **GraphQL API**: 100 requests per minute per IP address
- **REST API**: 60 requests per minute per IP address
- **WebSocket API**: 10 connections per minute per IP address

Rate limit headers are included in API responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## Error Handling

### GraphQL Errors

GraphQL errors are returned in the `errors` array of the response:

```json
{
  "errors": [
    {
      "message": "Not authorized to access this resource",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "nft"
      ],
      "extensions": {
        "code": "FORBIDDEN",
        "exception": {
          "stacktrace": [
            "Error: Not authorized to access this resource",
            "    at resolveNft (/app/src/resolvers/nft.js:42:11)"
          ]
        }
      }
    }
  ],
  "data": null
}
```

### REST Errors

REST errors use standard HTTP status codes with JSON error responses:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Not authorized to access this resource",
    "details": {
      "resource": "nft",
      "id": "123"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid request parameters |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Not authorized to access resource |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `VALIDATION_ERROR` | Input validation failed |
| `BLOCKCHAIN_ERROR` | Blockchain operation failed |

## API Versioning

The Solana OpenAPI API uses versioning to ensure backward compatibility:

- **GraphQL API**: Versioned through schema changes with deprecation notices
- **REST API**: Versioned through URL path (e.g., `/v1/nfts`)
- **WebSocket API**: Versioned through connection URL (e.g., `/v1/websocket`)

## API Clients

Official API clients are available for various programming languages:

- [JavaScript/TypeScript](./clients/javascript.md)
- [Python](./clients/python.md)
- [Java](./clients/java.md)
- [Go](./clients/go.md)

## Next Steps

- Explore the [GraphQL Schema Reference](./graphql-schema.md)
- Learn about [API Authentication](./authentication.md)
- Understand [Rate Limiting](./rate-limiting.md)
- Review [Best Practices](./best-practices.md)
