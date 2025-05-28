# Universal Backend Gateway for Perplexity Sonar API

A robust, scalable, and secure backend service that acts as a universal gateway to Perplexity's Sonar API. This gateway enables various client applications (web, mobile, desktop, other microservices) to leverage the capabilities of the Sonar API in a well-structured and manageable way.

## Features

- **Comprehensive Sonar API Feature Exposure**: Supports all major functionalities of the Perplexity Sonar API
- **Platform Agnostic API Endpoints**: Well-documented RESTful API endpoints for client applications
- **Secure API Key Management**: Securely manages the Perplexity Sonar API key
- **Client Authentication & Authorization**: Robust API key-based authentication for client applications
- **Request Validation & Transformation**: Validates incoming requests and transforms them for the Sonar API
- **Response Handling & Transformation**: Processes and adapts Sonar API responses for client applications
- **Rate Limiting & Quota Management**: Implements rate limiting to prevent abuse and ensure fair usage
- **Logging & Monitoring**: Comprehensive logging of requests, responses, and errors
- **Prompt Templating**: Simple mechanism for defining and using pre-set prompt templates

## Architecture

The gateway is built with a modular architecture:

- **Controllers**: Handle API endpoints and request/response logic
- **Services**: Core business logic for interacting with the Perplexity API
- **Middleware**: Authentication, validation, rate limiting, etc.
- **Routes**: API route definitions
- **Config**: Configuration management
- **Utils**: Helper functions and utilities

## API Endpoints

### Chat Completions

```
POST /api/v1/chat/completions
```

Generate a chat completion using the Perplexity Sonar API.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "model": "llama-3.1-sonar-large-32k-online",
  "max_tokens": 1000,
  "temperature": 0.7,
  "top_p": 0.9,
  "presence_penalty": 0.1,
  "stream": false
}
```

### Text Completions

```
POST /api/v1/completions
```

Generate a text completion using a simplified interface.

**Request Body:**
```json
{
  "prompt": "Hello, how are you?",
  "system_prompt": "You are a helpful assistant.",
  "model": "llama-3.1-sonar-large-32k-online",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

### Models

```
GET /api/v1/models
```

Get a list of available models.

### Prompt Templates

```
GET /api/v1/templates
```

Get a list of all prompt templates.

```
GET /api/v1/templates/:id
```

Get a specific prompt template by ID.

```
POST /api/v1/templates/:id/use
```

Use a prompt template to generate a completion.

**Request Body:**
```json
{
  "data": "AAPL stock data for the past 6 months",
  "aspects": "revenue growth, market trends, competitive position"
}
```

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to Perplexity Sonar API (API key)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd gateway
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file based on `.env.example`:
```
cp .env.example .env
```

4. Edit the `.env` file to add your Perplexity API key and other configuration options.

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm run build
npm start
```

## Security Considerations

- The Perplexity API key is stored securely in environment variables
- Client applications authenticate using API keys
- Rate limiting is implemented to prevent abuse
- Input validation is performed on all requests
- Security headers are applied using Helmet
- Error handling is designed to avoid leaking sensitive information

## Extending the Gateway

### Adding New Endpoints

1. Create a new controller in `src/controllers/`
2. Add validation schemas in `src/middleware/validation.middleware.ts`
3. Add new routes in `src/routes/api.routes.ts`

### Adding New Prompt Templates

Add new templates to the `promptTemplates` object in `src/controllers/templates.controller.ts`.

## License

[MIT](LICENSE)
