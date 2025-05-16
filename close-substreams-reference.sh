#!/bin/bash

# This script helps close references to the deleted substreams directory
# and sets up the proper Solana program structure

echo "Cleaning up substreams references..."

# Check if the substreams directory still exists (it shouldn't)
if [ -d "./substreams" ]; then
  echo "Warning: substreams directory still exists. Removing it..."
  rm -rf ./substreams
fi

# Make sure the solana-program structure is correct
echo "Verifying solana-program structure..."

# Check if the src directory exists in solana-program
if [ ! -d "./solana-program/src" ]; then
  echo "Error: src directory missing in solana-program"
  exit 1
fi

# Check if the lib.rs file exists in solana-program/src
if [ ! -f "./solana-program/src/lib.rs" ]; then
  echo "Error: lib.rs missing in solana-program/src"
  exit 1
fi

echo "Solana program structure looks good!"
echo ""
echo "IMPORTANT: To fix the IDE error, please:"
echo "1. Close any open files from the deleted substreams directory"
echo "2. Open the new solana-program/src/lib.rs file instead"
echo ""
echo "The LayerZero V2 integration is now properly organized in the solana-program directory."
