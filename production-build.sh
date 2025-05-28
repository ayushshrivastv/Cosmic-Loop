#!/bin/bash
# Production build script for Solana-OpenAPI

# Display header
echo "====================================="
echo "Solana-OpenAPI Production Build Tool"
echo "====================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "❌ ERROR: .env.production file not found!"
  echo "Please create a .env.production file with your production environment variables."
  echo "You can use the PRODUCTION_ENV_TEMPLATE.md file as a reference."
  exit 1
fi

# Check for required environment variables
source .env.production
if [ -z "$PERPLEXITY_API_KEY" ] || [ "$PERPLEXITY_API_KEY" = "your_actual_perplexity_api_key_here" ]; then
  echo "❌ ERROR: PERPLEXITY_API_KEY is not properly set in .env.production"
  echo "Please add your actual Perplexity API key to the .env.production file."
  exit 1
fi

echo "✅ Environment variables validated"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building for production..."
npm run build

# Test the build
echo "🧪 Testing the production build..."
npm run start -- --port 3001 &
START_PID=$!

# Wait for the server to start
echo "⏳ Waiting for the server to start..."
sleep 5

# Check if the server is running
if curl -s http://localhost:3001 > /dev/null; then
  echo "✅ Production build is running successfully!"
  echo "Press Ctrl+C to stop the test server"
  
  # Wait for user to press Ctrl+C
  wait $START_PID
else
  echo "❌ Failed to start the production server for testing"
  kill $START_PID 2>/dev/null
  exit 1
fi

echo ""
echo "====================================="
echo "🚀 Production build completed successfully!"
echo "====================================="
echo ""
echo "To deploy your application:"
echo "1. Make sure your .env.production file is properly configured"
echo "2. Upload the build to your hosting provider"
echo "3. Set the environment variables on your hosting platform"
echo ""
echo "For Vercel deployment:"
echo "$ vercel --prod"
echo ""
echo "For Netlify deployment:"
echo "$ netlify deploy --prod"
echo ""
