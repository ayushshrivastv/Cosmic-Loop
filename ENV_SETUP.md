# Environment Variables Setup Guide

This document provides instructions for setting up the necessary environment variables for the Solana-OpenAPI project.

## Required Environment Variables

The application requires several environment variables to function properly. The most critical ones are:

- `PERPLEXITY_API_KEY`: Required for AI-powered financial analysis
- `SOLANA_RPC_ENDPOINT`: For connecting to the Solana blockchain
- `LAYERZERO_API_KEY`: For cross-chain functionality (if applicable)

## Setup Instructions

1. **Create a local environment file**:
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```

2. **Edit your `.env.local` file**:
   - Open the `.env.local` file in your text editor
   - Replace the placeholder values with your actual API keys
   - At minimum, set the following variables:
     ```
     # Perplexity API
     PERPLEXITY_API_KEY=your_perplexity_api_key_here
     
     # Solana Configuration
     SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com  # For development
     ```

3. **Restart your development server**:
   - After setting up your environment variables, restart your development server:
     ```bash
     npm run dev
     ```

## Getting API Keys

- **Perplexity API Key**: Sign up at [Perplexity AI](https://www.perplexity.ai/) and obtain an API key from their developer dashboard.
- **Solana RPC Endpoint**: You can use public endpoints for development, but for production, consider services like [Helius](https://helius.xyz/) or [QuickNode](https://www.quicknode.com/).

## Development Mode

For development purposes, the application now includes a placeholder value for the `PERPLEXITY_API_KEY` when running in development mode. However, for full functionality, it's recommended to set up your actual API keys.

## Notes

- The `.env.local` file is excluded from version control for security reasons.
- Never commit your API keys to the repository.
- For production deployments, set environment variables through your hosting platform's configuration.
