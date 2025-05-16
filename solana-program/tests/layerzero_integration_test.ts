/**
 * LayerZero V2 Integration Test
 * 
 * This script demonstrates how to interact with the Solana OpenAPI program
 * using the LayerZero V2 integration for cross-chain messaging and data access.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';

// Import the Solana clock sysvar
const SYSVAR_CLOCK_PUBKEY = new PublicKey('SysvarC1ock11111111111111111111111111111111');

// Configuration
const SOLANA_PROGRAM_ID = new PublicKey('YOUR_DEPLOYED_PROGRAM_ID');
const LAYERZERO_ENDPOINT = new PublicKey('LAYERZERO_ENDPOINT_ADDRESS');
const FEE_ACCOUNT = new PublicKey('FEE_ACCOUNT_ADDRESS');
const CONFIG_ACCOUNT = new PublicKey('CONFIG_ACCOUNT_ADDRESS');
const SOLANA_CHAIN_ID = 7; // Example chain ID for Solana in LayerZero

// Connect to Solana cluster
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load keypair from file
const loadKeypair = (filePath: string): Keypair => {
  const keypairData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
};

// Path to your keypair file
const keypairPath = path.resolve(process.env.HOME as string, '.config/solana/id.json');
const payer = loadKeypair(keypairPath);

console.log('Using payer address:', payer.publicKey.toBase58());

/**
 * Helper functions for binary serialization
 */
class BinaryWriter {
  private buffer: Buffer;
  private offset: number;

  constructor(size: number = 1024) {
    this.buffer = Buffer.alloc(size);
    this.offset = 0;
  }

  // Write a uint8 value
  writeUInt8(value: number): void {
    this.buffer.writeUInt8(value, this.offset);
    this.offset += 1;
  }

  // Write a uint32 value
  writeUInt32LE(value: number): void {
    this.buffer.writeUInt32LE(value, this.offset);
    this.offset += 4;
  }

  // Write a uint64 value (as bigint)
  writeUInt64LE(value: number): void {
    const bigintValue = BigInt(value);
    this.buffer.writeBigUInt64LE(bigintValue, this.offset);
    this.offset += 8;
  }

  // Write a byte array
  writeBytes(bytes: Uint8Array): void {
    // Write length as uint32
    this.writeUInt32LE(bytes.length);
    // Write bytes
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.writeUInt8(bytes[i], this.offset + i);
    }
    this.offset += bytes.length;
  }

  // Get the final buffer (trimmed to size)
  toBuffer(): Buffer {
    return this.buffer.slice(0, this.offset);
  }
}

/**
 * Function to serialize a SendMessage instruction
 */
function serializeSendMessage(
  destinationChainId: number,
  destinationAddress: Uint8Array,
  messageType: number,
  payload: Uint8Array,
  gasLimit: number
): Buffer {
  const writer = new BinaryWriter();
  
  // Instruction index (0 = send message)
  writer.writeUInt8(0);
  
  // Destination chain ID
  writer.writeUInt32LE(destinationChainId);
  
  // Destination address
  writer.writeBytes(destinationAddress);
  
  // Message type
  writer.writeUInt8(messageType);
  
  // Payload
  writer.writeBytes(payload);
  
  // Gas limit
  writer.writeUInt64LE(gasLimit);
  
  return writer.toBuffer();
}

/**
 * Function to serialize a QueryData instruction
 */
function serializeQueryData(
  destinationChainId: number,
  destinationAddress: Uint8Array,
  queryType: number,
  targetAddress: Uint8Array,
  gasLimit: number
): Buffer {
  const writer = new BinaryWriter();
  
  // Instruction index (2 = query data)
  writer.writeUInt8(2);
  
  // Destination chain ID
  writer.writeUInt32LE(destinationChainId);
  
  // Destination address
  writer.writeBytes(destinationAddress);
  
  // Query params
  writer.writeUInt8(queryType); // Query type
  writer.writeBytes(targetAddress); // Target address
  writer.writeUInt8(0); // No extra params (0 = None)
  
  // Gas limit
  writer.writeUInt64LE(gasLimit);
  
  return writer.toBuffer();
}

/**
 * Function to send a cross-chain message
 */
async function sendCrossChainMessage(
  destinationChainId: number,
  destinationAddress: Uint8Array,
  messageType: number,
  payload: Uint8Array,
  gasLimit: number
): Promise<string> {
  console.log(`Sending cross-chain message to chain ${destinationChainId}...`);

  // Create a new account for the message record
  const messageAccount = Keypair.generate();
  console.log('Message account:', messageAccount.publicKey.toBase58());

  // Serialize the instruction data
  const instructionData = serializeSendMessage(
    destinationChainId,
    destinationAddress,
    messageType,
    payload,
    gasLimit
  );

  // Create the instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: messageAccount.publicKey, isSigner: true, isWritable: true },
      { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: LAYERZERO_ENDPOINT, isSigner: false, isWritable: false },
      { pubkey: FEE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: SOLANA_PROGRAM_ID,
    data: instructionData
  });

  // Create a transaction with the instruction
  const transaction = new Transaction().add(
    // Create the message account
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: messageAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(1000), // Adjust size as needed
      space: 1000, // Adjust size as needed
      programId: SOLANA_PROGRAM_ID,
    }),
    instruction
  );

  // Sign and send the transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    payer,
    messageAccount,
  ]);

  console.log('Transaction signature:', signature);
  return signature;
}

/**
 * Function to query cross-chain data
 */
async function queryCrossChainData(
  destinationChainId: number,
  destinationAddress: Uint8Array,
  queryType: number,
  targetAddress: Uint8Array,
  gasLimit: number
): Promise<string> {
  console.log(`Querying data from chain ${destinationChainId}...`);

  // Create a new account for the query record
  const queryAccount = Keypair.generate();
  console.log('Query account:', queryAccount.publicKey.toBase58());

  // Serialize the instruction data
  const instructionData = serializeQueryData(
    destinationChainId,
    destinationAddress,
    queryType,
    targetAddress,
    gasLimit
  );

  // Create the instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: queryAccount.publicKey, isSigner: true, isWritable: true },
      { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: LAYERZERO_ENDPOINT, isSigner: false, isWritable: false },
      { pubkey: FEE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: SOLANA_PROGRAM_ID,
    data: instructionData
  });

  // Create a transaction with the instruction
  const transaction = new Transaction().add(
    // Create the query account
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: queryAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(1000), // Adjust size as needed
      space: 1000, // Adjust size as needed
      programId: SOLANA_PROGRAM_ID,
    }),
    instruction
  );

  // Sign and send the transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    payer,
    queryAccount,
  ]);

  console.log('Transaction signature:', signature);
  return signature;
}

/**
 * Main function to run the tests
 */
async function main() {
  try {
    console.log('Starting LayerZero V2 integration test...');

    // Example destination address (Ethereum contract address)
    const destinationAddress = Buffer.from(
      '0x1234567890123456789012345678901234567890'.replace('0x', ''),
      'hex'
    );

    // Example NFT contract address to query
    const nftContractAddress = Buffer.from(
      '0xabcdef0123456789abcdef0123456789abcdef01'.replace('0x', ''),
      'hex'
    );

    // Example message payload
    const messagePayload = Buffer.from('Hello from Solana!');

    // 1. Send a cross-chain message to Ethereum (chain ID 1)
    const messageTxSignature = await sendCrossChainMessage(
      1, // Ethereum
      destinationAddress,
      1, // NFTData message type
      messagePayload,
      300000 // Gas limit
    );
    console.log('Message sent successfully!');

    // 2. Query NFT data from Ethereum
    const queryTxSignature = await queryCrossChainData(
      1, // Ethereum
      destinationAddress,
      1, // NFTData query type
      nftContractAddress,
      500000 // Gas limit
    );
    console.log('Query sent successfully!');

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the main function
main();
