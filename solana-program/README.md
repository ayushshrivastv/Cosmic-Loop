# Solana OpenAPI LayerZero V2 Integration

This Solana program implements the LayerZero V2 integration for cross-chain messaging and data access in the Solana OpenAPI project.

## Features

- Cross-chain message sending and receiving
- Support for NFT data queries across chains
- Wallet history and market activity queries
- Message status tracking and verification

## Directory Structure

```
solana-program/
├── src/
│   ├── lib.rs              # Main program entry point
│   ├── layerzero.rs        # LayerZero V2 integration module
│   ├── state.rs            # State management for the program
│   ├── error.rs            # Error handling
│   └── instructions/       # Instruction handlers
│       ├── mod.rs
│       ├── send_message.rs
│       ├── receive_message.rs
│       ├── query_data.rs
│       └── process_response.rs
└── Cargo.toml              # Rust dependencies
```

## Building the Program

To build the Solana program:

```bash
# Navigate to the program directory
cd solana-program

# Build the program
cargo build-bpf
```

## Deploying to Solana

To deploy the program to Solana devnet:

```bash
# Deploy the program
solana program deploy target/deploy/solana_openapi.so --keypair <PATH_TO_KEYPAIR> --url https://api.devnet.solana.com
```

After deployment, update the `SOLANA_PROGRAM_ID` in your `.env` file with the deployed program ID.

## Configuration

The program requires the following configuration:

1. LayerZero endpoint account
2. Fee account for LayerZero operations
3. Program configuration account (created during initialization)

## Usage

This program is designed to be used with the Solana OpenAPI frontend. The frontend communicates with this program through the cross-chain service and API endpoints.

See the main project documentation for more details on how to use the LayerZero V2 integration.
