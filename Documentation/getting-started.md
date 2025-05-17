# Getting Started with Solana OpenAPI

This guide will help you set up and run Solana OpenAPI on your local development environment, and prepare it for production deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or later
- **npm** or **yarn**: Latest stable version
- **PostgreSQL**: Version 14.x or later
- **Redis**: Version 6.x or later (optional for development)
- **Git**: For version control

You'll also need:

- Access to Solana RPC endpoints
- Access to EVM RPC endpoints for supported chains
- Basic understanding of React, Node.js, and blockchain concepts

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/cosmic-loop.git
cd cosmic-loop
```

### Install Dependencies

```bash
# Install frontend and shared dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Environment Configuration

1. Create environment files by copying the examples:

```bash
# Frontend environment
cp .env.example .env.local

# Backend environment
cp backend/.env.example backend/.env
```

2. Configure the environment variables:

#### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/subscriptions
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SUPPORTED_CHAINS=SOLANA,ETHEREUM,POLYGON,ARBITRUM,OPTIMISM,AVALANCHE,BSC
```

#### Backend (.env)

```
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/cosmic_loop
REDIS_URL=redis://localhost:6379
SOLANA_RPC_URL=https://api.devnet.solana.com
JWT_SECRET=your_jwt_secret_key
```

### Database Setup

1. Create a PostgreSQL database:

```bash
createdb cosmic_loop
```

2. Run migrations to set up the database schema:

```bash
cd backend
npm run migrate
```

3. (Optional) Seed the database with sample data:

```bash
npm run seed
```

## Running the Application

### Development Mode

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend development server:

```bash
# From the project root
npm run dev
```

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - GraphQL Playground: [http://localhost:4000/graphql](http://localhost:4000/graphql)

### Production Build

1. Build the frontend:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Verifying the Installation

### Health Check

1. Verify the backend is running:
   - Visit [http://localhost:4000/health](http://localhost:4000/health)
   - You should see a JSON response with `{"status":"ok"}`

2. Verify the frontend is running:
   - Visit [http://localhost:3000](http://localhost:3000)
   - You should see the Solana OpenAPI homepage

### Wallet Connection

1. Test Solana wallet connection:
   - Click "Connect Wallet" in the navigation bar
   - Select a Solana wallet (e.g., Phantom)
   - Authorize the connection

2. Test EVM wallet connection:
   - Click "Connect Wallet" in the navigation bar
   - Select an EVM wallet (e.g., MetaMask)
   - Authorize the connection

## Configuration Options

### Frontend Configuration

The frontend can be configured through environment variables and the `next.config.js` file:

- **API Endpoints**: Set custom API and WebSocket URLs
- **Supported Chains**: Specify which blockchains to enable
- **Feature Flags**: Enable/disable experimental features
- **Theme Settings**: Customize appearance and branding

### Backend Configuration

The backend can be configured through environment variables and configuration files in the `backend/config` directory:

- **Server Settings**: Port, host, CORS options
- **Database Connection**: Connection string, pool size
- **Blockchain Connections**: RPC endpoints, network IDs
- **Security Options**: Rate limiting, JWT settings

## Next Steps

Now that you have Solana OpenAPI up and running, you can:

1. [Create your first event](./guides/event-setup.md)
2. [Set up NFT distribution](./guides/nft-distribution.md)
3. [Configure cross-chain bridging](./guides/bridging-nfts.md)
4. [Customize the user interface](./frontend/customization.md)

## Troubleshooting

If you encounter issues during installation or setup:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the console output for error messages
3. Ensure all prerequisites are correctly installed
4. Verify environment variables are properly configured

For additional help, refer to the [GitHub Issues](https://github.com/yourusername/cosmic-loop/issues) or join our [Discord community](https://discord.gg/cosmic-loop).
