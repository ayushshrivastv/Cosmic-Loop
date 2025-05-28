#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Gateway Test Script${NC}"

# Check if .env file exists
if [ ! -f ../.env ]; then
  echo -e "${RED}Error: .env file not found in parent directory.${NC}"
  echo -e "Creating a sample .env file. Please update it with your actual API key."
  
  # Create a sample .env file
  cat > ../.env << EOL
# Perplexity API Key - Replace with your actual key
PERPLEXITY_API_KEY=your-api-key-here

# Gateway Configuration
GATEWAY_PORT=3001
API_KEYS=test-api-key-1,test-api-key-2

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# JWT Secret for authentication (if using JWT)
JWT_SECRET=your-jwt-secret-here
EOL

  echo -e "${YELLOW}Sample .env file created. Please edit it with your actual API key before continuing.${NC}"
  echo -e "Press Enter to continue or Ctrl+C to exit and update the .env file..."
  read
fi

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Exiting.${NC}"
    exit 1
  fi
fi

# Build the gateway
echo -e "${YELLOW}Building the gateway...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Exiting.${NC}"
  exit 1
fi

# Start the gateway in the background
echo -e "${YELLOW}Starting the gateway...${NC}"
npm run start &
GATEWAY_PID=$!

# Wait for the gateway to start
echo -e "${YELLOW}Waiting for the gateway to start...${NC}"
sleep 5

# Run the tests
echo -e "${YELLOW}Running tests...${NC}"
npx ts-node src/test-gateway.ts

# Cleanup
echo -e "${YELLOW}Stopping the gateway...${NC}"
kill $GATEWAY_PID

echo -e "${GREEN}Test script completed.${NC}"
