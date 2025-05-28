#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Gateway Server${NC}"

# Extract API key from .env.local
API_KEY=$(grep PERPLEXITY_API_KEY ../\.env.local | cut -d '=' -f2)

if [ -z "$API_KEY" ]; then
  echo -e "${RED}Error: Could not find PERPLEXITY_API_KEY in ../.env.local${NC}"
  exit 1
fi

echo -e "${GREEN}Found Perplexity API key${NC}"

# Create temporary .env file for the gateway
cat > .env << EOL
# Perplexity API Key
PERPLEXITY_API_KEY=${API_KEY}

# Gateway Configuration
GATEWAY_PORT=3001
API_KEYS=test-api-key-1,test-api-key-2

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# JWT Secret for authentication (if using JWT)
JWT_SECRET=your-jwt-secret-here
EOL

echo -e "${GREEN}Created .env file for the gateway${NC}"
echo -e "${YELLOW}Starting gateway server...${NC}"

# Start the gateway server
npm run start
