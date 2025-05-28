#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Gateway Environment${NC}"

# Create .env file for the gateway
cat > .env << EOL
# Perplexity API Key
PERPLEXITY_API_KEY=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

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

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Please run 'npm install' manually.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Dependencies installed successfully${NC}"
else
  echo -e "${GREEN}Dependencies already installed${NC}"
fi

echo -e "${GREEN}Gateway environment setup complete!${NC}"
echo -e "${YELLOW}To start the gateway, run:${NC}"
echo -e "  npm run build"
echo -e "  npm run start"
echo -e "${YELLOW}To test the gateway, run:${NC}"
echo -e "  npx ts-node src/test-gateway.ts"
