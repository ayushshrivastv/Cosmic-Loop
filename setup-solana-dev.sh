#!/bin/bash

# Setup script for Solana development environment
echo "Setting up Solana development environment for LayerZero V2 integration..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "Solana CLI not found. Please install it using:"
    echo "  brew install solana"
    echo "or"
    echo "  sh -c \"\$(curl -sSfL https://release.solana.com/v1.16.0/install)\""
    exit 1
fi

# Create keypair directory
KEYPAIR_DIR="$PWD/solana-program/keypair"
mkdir -p "$KEYPAIR_DIR"

# Generate a new keypair
echo "Generating a new Solana keypair..."
solana-keygen new --no-bip39-passphrase --outfile "$KEYPAIR_DIR/devnet.json"

# Configure Solana CLI to use devnet
echo "Configuring Solana CLI to use devnet..."
solana config set --url https://api.devnet.solana.com
solana config set --keypair "$KEYPAIR_DIR/devnet.json"

# Get public key
PUBKEY=$(solana address)
echo "Your Solana public key is: $PUBKEY"

# Request airdrop
echo "Requesting airdrop of 2 SOL to your account..."
solana airdrop 2

# Check balance
echo "Checking your balance..."
solana balance

# Build the Solana program
echo "Building the Solana program..."
cd solana-program
cargo build-bpf || solana-build-bpf

# Deploy the program
echo "Deploying the program to devnet..."
PROGRAM_ID=$(solana program deploy target/deploy/solana_openapi.so | grep "Program Id" | awk '{print $3}')

# Update .env.local file
cd ..
if [ -f ".env.local" ]; then
    # Update existing .env.local file
    sed -i '' "s/^SOLANA_PROGRAM_ID=.*/SOLANA_PROGRAM_ID=$PROGRAM_ID/" .env.local
else
    # Create new .env.local file from .env.example
    cp .env.example .env.local
    sed -i '' "s/^SOLANA_PROGRAM_ID=.*/SOLANA_PROGRAM_ID=$PROGRAM_ID/" .env.local
fi

echo "Deployment complete!"
echo "Program ID: $PROGRAM_ID"
echo "Updated .env.local file with the new program ID."
echo ""
echo "Next steps:"
echo "1. Start your Next.js development server: npm run dev"
echo "2. Navigate to http://localhost:3000/openapi to test cross-chain queries"
