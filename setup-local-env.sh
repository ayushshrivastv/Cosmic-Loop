#!/bin/bash
# Script to set up local environment with Perplexity API key

# Display header
echo "====================================="
echo "Solana-OpenAPI Local Environment Setup"
echo "====================================="
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
  echo "⚠️ .env.local file already exists"
  read -p "Do you want to overwrite it? (y/n): " overwrite
  if [ "$overwrite" != "y" ]; then
    echo "Operation cancelled. Your existing .env.local file was not modified."
    exit 0
  fi
fi

# Copy the example file
echo "📝 Creating .env.local file from template..."
cp .env.example .env.local

# Prompt for Perplexity API key
echo ""
echo "🔑 Please enter your Perplexity API key:"
read api_key

# Update the file with the provided API key
if [ -n "$api_key" ]; then
  # Use sed to replace the placeholder with the actual API key
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS requires an empty string for -i
    sed -i '' "s/PERPLEXITY_API_KEY=your_perplexity_api_key_here/PERPLEXITY_API_KEY=$api_key/" .env.local
  else
    # Linux version
    sed -i "s/PERPLEXITY_API_KEY=your_perplexity_api_key_here/PERPLEXITY_API_KEY=$api_key/" .env.local
  fi
  echo "✅ API key has been set in .env.local"
else
  echo "⚠️ No API key provided. You'll need to manually edit .env.local"
fi

echo ""
echo "====================================="
echo "🚀 Setup completed!"
echo "====================================="
echo ""
echo "To start using the real Perplexity API:"
echo "1. Make sure your .env.local file has the correct API key"
echo "2. Restart your development server:"
echo "   $ npm run dev"
echo ""
echo "You should now see real AI-powered responses instead of mock data."
echo ""
