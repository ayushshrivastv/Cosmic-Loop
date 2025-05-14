# Cosmic Loop Solana Substreams

This Substreams package indexes Solana blockchain data for NFTs, cross-chain bridging, and marketplace activities to power the Cosmic Loop AI assistant.

## Components

The Substreams processes three main categories of data:

1. **NFT Events**: Minting, transfers, burns, and compressed token operations
2. **Bridge Events**: LayerZero and other cross-chain bridging activities
3. **Marketplace Events**: Listings, sales, bids, and cancellations on major Solana marketplaces

## Building

To build the Substreams package:

```bash
# Install Rust and required dependencies
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install Substreams CLI
brew install streamingfast/tap/substreams

# Build the package
cargo build --target wasm32-unknown-unknown --release
substreams pack
```

## Usage

Once built, you can run the Substreams using:

```bash
substreams run -e mainnet.solana.streamingfast.io:443 \
  substreams.yaml \
  graph_out \
  --start-block 150000000 \
  --stop-block +1000
```

To print out NFT events:

```bash
substreams run -e mainnet.solana.streamingfast.io:443 \
  substreams.yaml \
  map_nft_events \
  --start-block 150000000 \
  --stop-block +1000
```

## Deploying to Substreams.dev

To deploy the package to [Substreams.dev](https://substreams.dev):

```bash
# Authenticate to Substreams.dev
substreams login

# Deploy the package
substreams deploy cosmic-loop-solana-substreams.spkg
```

## Integration with Cosmic Loop AI Assistant

The data indexed by this Substreams powers the Cosmic Loop AI assistant by providing real-time, data-driven insights about NFTs, cross-chain bridging, and blockchain activities on Solana.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
