# Production Environment Setup Guide

This document provides instructions for setting up your production environment variables for deploying the Solana-OpenAPI project.

## Required Environment Variables for Production

Copy the following template to your `.env.production` file and fill in the actual values:

```
# General
NODE_ENV=production

# Perplexity API (REQUIRED)
PERPLEXITY_API_KEY=your_actual_perplexity_api_key_here
PERPLEXITY_BASE_URL=https://api.perplexity.ai
PERPLEXITY_MODEL=llama-3.1-sonar-large-32k-online
PERPLEXITY_MAX_TOKENS=8000
PERPLEXITY_TEMPERATURE=0.2
PERPLEXITY_TOP_P=0.9
PERPLEXITY_PRESENCE_PENALTY=0.1

# Solana Configuration (REQUIRED)
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
# Or use a dedicated RPC provider like:
# SOLANA_RPC_ENDPOINT=https://solana-mainnet.helius.xyz/your-api-key-here

# LayerZero Configuration (if applicable)
LAYERZERO_API_KEY=your_layerzero_api_key_here
SOLANA_PROGRAM_ID=your_deployed_program_id_here
LAYERZERO_ENDPOINT=your_layerzero_endpoint_pubkey_here
FEE_ACCOUNT=your_fee_account_pubkey_here

# Cross-Chain RPC Endpoints (if applicable)
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-api-key
OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your-api-key
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
BSC_RPC_URL=https://bsc-dataseed.binance.org
```

## Deployment Instructions

1. **Create the environment file**:
   - Create a `.env.production` file in the root of your project
   - Copy the template above and replace placeholder values with your actual API keys

2. **Build the application for production**:
   ```bash
   npm run build
   ```

3. **Test the production build locally**:
   ```bash
   npm run start
   ```

4. **Deploy to your hosting provider**:
   - For Vercel: Make sure to add all environment variables in the Vercel dashboard
   - For Netlify: Add environment variables in the Netlify site settings
   - For other providers: Follow their specific instructions for environment variable configuration

## Obtaining API Keys for Production

- **Perplexity API Key**: Sign up for a production plan at [Perplexity AI](https://www.perplexity.ai/)
- **Solana RPC Endpoint**: For production, use a dedicated RPC provider like:
  - [Helius](https://helius.xyz/)
  - [QuickNode](https://www.quicknode.com/)
  - [Alchemy](https://www.alchemy.com/)

## Important Security Notes

- Never commit your `.env.production` file to version control
- Use environment variable management in your hosting platform
- Consider using a secrets manager for highly sensitive keys
- Implement rate limiting and monitoring for your API usage
