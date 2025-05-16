# Cross-Chain API Reference

## Overview

This document provides detailed reference information for the Cross-Chain API endpoints in the Solana OpenAPI project. These endpoints enable interaction with the LayerZero V2 cross-chain messaging functionality.

## Base URL

All API endpoints are relative to the base URL of your deployment:

```
https://your-deployment-url.com/api
```

For local development:

```
http://localhost:3000/api
```

## Authentication

Some endpoints require authentication. Include a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Get Cross-Chain Messages

Retrieves cross-chain messages for the current user.

**URL**: `/cross-chain/messages`

**Method**: `GET`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| new_user | boolean | No | When set to "true", returns an empty array for new users |
| limit | number | No | Maximum number of messages to return (default: 50) |
| offset | number | No | Number of messages to skip (for pagination) |
| status | string | No | Filter by message status (CREATED, INFLIGHT, DELIVERED, COMPLETED, FAILED) |

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "messages": [
    {
      "id": "lz-20250517-1",
      "sourceChain": "Solana",
      "destinationChain": "Ethereum",
      "messageType": "NFT Data Query",
      "status": "COMPLETED",
      "timestamp": "2025-05-17T03:24:56.789Z",
      "data": {
        "sourceChain": "Solana",
        "destinationChain": "Ethereum",
        "messageType": "NFT Data Query",
        "result": "Query completed successfully",
        "details": {
          "tokenId": "12345",
          "owner": "0x123...abc",
          "metadata": {
            "name": "Solana NFT #123",
            "collection": "SolanaVerse"
          }
        }
      }
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Error Responses**:

- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch cross-chain messages" }`

### Send Cross-Chain Message

Sends a new cross-chain message.

**URL**: `/cross-chain/messages`

**Method**: `POST`

**Request Body**:

```json
{
  "destinationChain": "Ethereum",
  "messageType": "NFT Data Query",
  "payload": {
    "query": "getTokenOwner",
    "parameters": {
      "tokenId": "12345",
      "collection": "SolanaVerse"
    }
  }
}
```

**Success Response**:

- **Code**: 201 Created
- **Content**:

```json
{
  "messageId": "lz-20250517-3",
  "status": "CREATED",
  "timestamp": "2025-05-17T03:30:00.000Z"
}
```

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid request body" }`

- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to send cross-chain message" }`

### Get Message Status

Retrieves the status of a specific cross-chain message.

**URL**: `/cross-chain/messages/:messageId`

**Method**: `GET`

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| messageId | string | Yes | ID of the message to retrieve |

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "id": "lz-20250517-1",
  "sourceChain": "Solana",
  "destinationChain": "Ethereum",
  "messageType": "NFT Data Query",
  "status": "COMPLETED",
  "timestamp": "2025-05-17T03:24:56.789Z",
  "history": [
    {
      "status": "CREATED",
      "timestamp": "2025-05-17T03:24:50.000Z"
    },
    {
      "status": "INFLIGHT",
      "timestamp": "2025-05-17T03:24:52.000Z"
    },
    {
      "status": "DELIVERED",
      "timestamp": "2025-05-17T03:24:54.000Z"
    },
    {
      "status": "COMPLETED",
      "timestamp": "2025-05-17T03:24:56.789Z"
    }
  ],
  "data": {
    "sourceChain": "Solana",
    "destinationChain": "Ethereum",
    "messageType": "NFT Data Query",
    "result": "Query completed successfully",
    "details": {
      "tokenId": "12345",
      "owner": "0x123...abc",
      "metadata": {
        "name": "Solana NFT #123",
        "collection": "SolanaVerse"
      }
    }
  }
}
```

**Error Responses**:

- **Code**: 404 Not Found
  - **Content**: `{ "error": "Message not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch message status" }`

### Update Message Status

Updates the status of a cross-chain message (admin only).

**URL**: `/cross-chain/messages/:messageId/status`

**Method**: `PATCH`

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| messageId | string | Yes | ID of the message to update |

**Request Body**:

```json
{
  "status": "COMPLETED",
  "data": {
    "result": "Query completed successfully",
    "details": {
      "tokenId": "12345",
      "owner": "0x123...abc",
      "metadata": {
        "name": "Solana NFT #123",
        "collection": "SolanaVerse"
      }
    }
  }
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "id": "lz-20250517-1",
  "status": "COMPLETED",
  "timestamp": "2025-05-17T03:24:56.789Z"
}
```

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid status" }`

- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Unauthorized" }`

- **Code**: 403 Forbidden
  - **Content**: `{ "error": "Admin access required" }`

- **Code**: 404 Not Found
  - **Content**: `{ "error": "Message not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to update message status" }`

### Get Supported Chains

Retrieves the list of supported chains for cross-chain messaging.

**URL**: `/cross-chain/chains`

**Method**: `GET`

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "chains": [
    {
      "id": 1,
      "name": "Solana",
      "icon": "solana.svg",
      "enabled": true,
      "config": {
        "endpointAddress": "0x123...",
        "gasPrice": "0.000001",
        "gasLimit": 3000000
      }
    },
    {
      "id": 2,
      "name": "Ethereum",
      "icon": "ethereum.svg",
      "enabled": true,
      "config": {
        "endpointAddress": "0x456...",
        "gasPrice": "30",
        "gasLimit": 500000
      }
    },
    {
      "id": 3,
      "name": "Avalanche",
      "icon": "avalanche.svg",
      "enabled": true,
      "config": {
        "endpointAddress": "0x789...",
        "gasPrice": "25",
        "gasLimit": 1000000
      }
    }
  ]
}
```

**Error Responses**:

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch supported chains" }`

### Get Message Types

Retrieves the list of supported message types for cross-chain messaging.

**URL**: `/cross-chain/message-types`

**Method**: `GET`

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "messageTypes": [
    {
      "id": "NFT_DATA_QUERY",
      "name": "NFT Data Query",
      "description": "Query NFT data across chains",
      "schema": {
        "query": "string",
        "parameters": "object"
      }
    },
    {
      "id": "WALLET_HISTORY_QUERY",
      "name": "Wallet History Query",
      "description": "Query wallet transaction history across chains",
      "schema": {
        "walletAddress": "string",
        "startTime": "number",
        "endTime": "number"
      }
    },
    {
      "id": "MARKET_ACTIVITY_QUERY",
      "name": "Market Activity Query",
      "description": "Query market activity data across chains",
      "schema": {
        "market": "string",
        "timeframe": "string"
      }
    }
  ]
}
```

**Error Responses**:

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch message types" }`

## WebSocket API

The WebSocket API provides real-time updates for cross-chain messages.

### Connection

Connect to the WebSocket server:

```javascript
const socket = new WebSocket('wss://your-deployment-url.com/api/ws');
```

For local development:

```javascript
const socket = new WebSocket('ws://localhost:3000/api/ws');
```

### Authentication

Send an authentication message after connecting:

```javascript
socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'authenticate',
    token: 'your_jwt_token'
  }));
};
```

### Message Tracking

Start tracking a message:

```javascript
socket.send(JSON.stringify({
  type: 'track',
  messageId: 'lz-20250517-1'
}));
```

Stop tracking a message:

```javascript
socket.send(JSON.stringify({
  type: 'untrack',
  messageId: 'lz-20250517-1'
}));
```

### Message Updates

Listen for message updates:

```javascript
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'message_update') {
    console.log(`Message ${data.messageId} status: ${data.status}`);
    console.log('Message data:', data.data);
  }
};
```

Example message update:

```json
{
  "type": "message_update",
  "messageId": "lz-20250517-1",
  "status": "COMPLETED",
  "timestamp": "2025-05-17T03:24:56.789Z",
  "data": {
    "result": "Query completed successfully",
    "details": {
      "tokenId": "12345",
      "owner": "0x123...abc",
      "metadata": {
        "name": "Solana NFT #123",
        "collection": "SolanaVerse"
      }
    }
  }
}
```

### Connection Status

Listen for connection status updates:

```javascript
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'connection_status') {
    console.log(`Connection status: ${data.status}`);
  }
};
```

Example connection status:

```json
{
  "type": "connection_status",
  "status": "connected"
}
```

### Error Handling

Listen for error messages:

```javascript
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'error') {
    console.error(`Error: ${data.message}`);
  }
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = (event) => {
  console.log(`WebSocket closed: ${event.code} ${event.reason}`);
};
```

Example error message:

```json
{
  "type": "error",
  "message": "Failed to track message: Message not found"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. The current limits are:

- 100 requests per minute per IP address
- 1000 requests per day per user

When a rate limit is exceeded, the API will respond with:

- **Code**: 429 Too Many Requests
- **Content**: `{ "error": "Rate limit exceeded" }`
- **Headers**:
  - `X-RateLimit-Limit`: The rate limit ceiling for that given endpoint
  - `X-RateLimit-Remaining`: The number of requests left for the time window
  - `X-RateLimit-Reset`: The remaining window before the rate limit resets in UTC epoch seconds

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - The request was malformed |
| 401 | Unauthorized - Authentication is required |
| 403 | Forbidden - The user does not have permission |
| 404 | Not Found - The requested resource was not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong on the server |

## Examples

### Sending a Cross-Chain Message

**Request**:

```javascript
fetch('/api/cross-chain/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    destinationChain: 'Ethereum',
    messageType: 'NFT Data Query',
    payload: {
      query: 'getTokenOwner',
      parameters: {
        tokenId: '12345',
        collection: 'SolanaVerse'
      }
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

**Response**:

```json
{
  "messageId": "lz-20250517-3",
  "status": "CREATED",
  "timestamp": "2025-05-17T03:30:00.000Z"
}
```

### Tracking a Message with WebSocket

```javascript
const socket = new WebSocket('ws://localhost:3000/api/ws');

socket.onopen = () => {
  // Authenticate
  socket.send(JSON.stringify({
    type: 'authenticate',
    token: 'your_jwt_token'
  }));
  
  // Start tracking a message
  socket.send(JSON.stringify({
    type: 'track',
    messageId: 'lz-20250517-3'
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'message_update') {
    console.log(`Message ${data.messageId} status: ${data.status}`);
    
    if (data.status === 'COMPLETED') {
      console.log('Message completed:', data.data);
      
      // Stop tracking the message
      socket.send(JSON.stringify({
        type: 'untrack',
        messageId: data.messageId
      }));
    }
  }
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = (event) => {
  console.log(`WebSocket closed: ${event.code} ${event.reason}`);
};
```

## Conclusion

This API reference provides the information needed to interact with the Cross-Chain API in the Solana OpenAPI project. For additional support or questions, please contact the development team.
