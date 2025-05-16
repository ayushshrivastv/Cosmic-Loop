# Solana OpenAPI LayerZero V2 Integration

This Solana program implements the LayerZero V2 integration for cross-chain messaging and data access in the Solana OpenAPI project. It enables seamless communication between Solana and other blockchain networks supported by LayerZero.

## Features

- Cross-chain message sending and receiving via LayerZero V2 protocol
- Support for NFT data queries across chains with structured responses
- Wallet history and market activity queries with cross-chain data aggregation
- Message status tracking and verification with guaranteed delivery
- Gas optimization for cross-chain operations
- Secure message verification with LayerZero's Decentralized Verifier Network (DVN)

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

1. **LayerZero V2 Endpoint Account**: The Solana address of the LayerZero V2 endpoint contract
2. **Fee Account**: Account that collects fees for LayerZero operations
3. **Program Configuration Account**: Created during initialization, stores admin keys and chain IDs
4. **Message Accounts**: PDA accounts that store cross-chain message records and their status

### Initialization

Before using the program, you need to initialize it with the LayerZero V2 endpoint:

```bash
# Initialize the program with LayerZero endpoint
solana program call <PROGRAM_ID> initialize \
  --keypair <ADMIN_KEYPAIR> \
  --account <LAYERZERO_ENDPOINT> \
  --account <FEE_ACCOUNT> \
  --data <SOLANA_CHAIN_ID>
```

## Usage

### Sending Cross-Chain Messages

To send a message to another chain:

```typescript
// Client-side code example
const messageData = {
  destination_chain_id: 2, // Ethereum = 1, Arbitrum = 2, etc.
  destination_address: destinationAddressBytes,
  message_type: 1, // NFTData = 1, TokenTransfer = 2, etc.
  payload: Buffer.from("Your message data here"),
  gas_limit: 300000
};

const messageAccount = Keypair.generate();
const instruction = new TransactionInstruction({
  keys: [
    { pubkey: sender.publicKey, isSigner: true, isWritable: true },
    { pubkey: messageAccount.publicKey, isSigner: true, isWritable: true },
    { pubkey: configAccount, isSigner: false, isWritable: false },
    { pubkey: layerzeroEndpoint, isSigner: false, isWritable: false },
    { pubkey: feeAccount, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
  ],
  programId: programId,
  data: Buffer.from(serialize(messageData))
});
```

### Querying Cross-Chain Data

To query data from another chain:

```typescript
// Client-side code example
const queryData = {
  destination_chain_id: 1, // Ethereum
  destination_address: destinationAddressBytes,
  query_params: {
    query_type: 3, // MarketActivity
    target_address: nftContractAddressBytes,
    extra_params: null
  },
  gas_limit: 500000
};

// Similar transaction construction as above
```

### Integration with Frontend

This program is designed to be used with the Solana OpenAPI frontend. The frontend communicates with this program through the cross-chain service and API endpoints.

The LayerZero V2 integration provides:

- **Unified Data Access**: Query NFT, token, and market data across multiple chains
- **Cross-Chain Messaging**: Send and receive messages between Solana and other chains
- **Message Verification**: Secure verification of cross-chain messages using LayerZero's DVN
- **Status Tracking**: Monitor the status of cross-chain operations in real-time

See the main project documentation for more details on how to use the LayerZero V2 integration.
