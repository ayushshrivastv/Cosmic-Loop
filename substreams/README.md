# Solana OpenAPI Substreams Package

This Substreams package indexes Solana blockchain data for NFTs, marketplace activities, and cross-chain bridging events. It's designed to work with the Solana OpenAPI project to provide real-time blockchain data through an AI-powered interface.

## Overview

The Substreams package processes Solana blockchain data in parallel, extracting and indexing:

- **NFT Events**: Mints, transfers, burns, and metadata updates
- **Marketplace Activities**: Listings, sales, offers, and cancellations across platforms like Magic Eden and Tensor
- **Cross-chain Bridging**: Asset transfers between Solana and other blockchains via protocols like LayerZero and Wormhole

## Architecture

The package consists of three main modules:

1. **NFT Module**: Processes NFT-related transactions by monitoring Metaplex program invocations
2. **Marketplace Module**: Tracks marketplace activities across major Solana NFT marketplaces
3. **Bridge Module**: Monitors cross-chain bridge transactions for asset transfers

Each module implements:
- A mapper function that extracts events from Solana blocks
- A store function that indexes the events for efficient retrieval
- A query function that returns filtered events based on specific criteria

## Building and Deploying

### Prerequisites

- Rust toolchain
- Substreams CLI

### Build the Package

```bash
# Install the Substreams CLI
curl https://raw.githubusercontent.com/streamingfast/substreams/stable/install.sh | bash

# Build the package
substreams pack
```

This will create a `.spkg` file that can be deployed to substreams.dev.

### Deploy the Package

```bash
# Authenticate with substreams.dev
substreams auth login

# Deploy the package
substreams deploy ./solana_openapi_substreams-v0.1.0.spkg
```

### Running the Substreams

```bash
# Run the NFT events module
substreams run substreams.yaml map_nft_events -e mainnet.sol.streamingfast.io:443

# Run the marketplace events module
substreams run substreams.yaml map_marketplace_events -e mainnet.sol.streamingfast.io:443

# Run the bridge events module
substreams run substreams.yaml map_bridge_events -e mainnet.sol.streamingfast.io:443
```

## Integration with AI Agent

This Substreams package is designed to be integrated with the Solana OpenAPI AI agent. The integration works as follows:

1. The AI agent receives a natural language query from the user
2. The query is classified by type (NFT, marketplace, wallet, bridge, general)
3. Based on the query type, the system executes the appropriate Substreams module
4. The Substreams data is formatted and provided as context to the Gemini AI model
5. The AI generates a comprehensive response incorporating the blockchain data

This architecture allows for efficient, real-time analysis of blockchain data while providing a natural language interface that makes the data accessible to users without technical blockchain knowledge.

## Extending the Package

To add support for additional Solana programs or event types:

1. Define new protobuf message types in the proto directory
2. Create a new Rust module in the src directory
3. Implement the necessary mapper, store, and query functions
4. Update the substreams.yaml file to include the new modules

## License

MIT
