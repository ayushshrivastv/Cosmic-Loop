/**
 * setup-dev-environment.js
 *
 * This script sets up the development environment for the application by:
 * 1. Generating a new admin keypair if one doesn't exist
 * 2. Writing the admin private key to the .env file
 * 3. Requesting multiple airdrops of SOL to the admin wallet (on devnet)
 * 4. Setting up the RPC endpoint with Helius for better Light Protocol support
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load existing environment variables
dotenv.config();

// Constants
const ENV_FILE_PATH = path.join(__dirname, '.env');
const DEFAULT_DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';
// Helius endpoint provides better support for Light Protocol methods
const HELIUS_DEVNET_RPC_ENDPOINT = 'https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff';

async function main() {
  console.log('🔧 Setting up development environment...');

  // Check if .env file exists
  let envFileExists = fs.existsSync(ENV_FILE_PATH);
  let envContents = '';

  if (envFileExists) {
    console.log('📄 Found existing .env file');
    envContents = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  } else {
    console.log('📄 Creating new .env file');
    // Use Helius endpoint by default for better Light Protocol support
    envContents = `NEXT_PUBLIC_CLUSTER=devnet\nNEXT_PUBLIC_RPC_ENDPOINT=${HELIUS_DEVNET_RPC_ENDPOINT}\n`;
  }

  // Check if admin private key exists in .env
  const adminKeyExists = envContents.includes('ADMIN_PRIVATE_KEY=') &&
                         !envContents.includes('ADMIN_PRIVATE_KEY=DUMMY_VALUE_WILL_BE_REPLACED_AT_RUNTIME');

  let adminKeypair;
  let publicKeyBase58;

  if (adminKeyExists) {
    console.log('🔑 Found existing admin keypair');
    // Extract existing private key
    const match = envContents.match(/ADMIN_PRIVATE_KEY=(.*)/);
    if (match && match[1]) {
      try {
        // Try parsing as base64
        const privateKeyBuffer = Buffer.from(match[1], 'base64');

        // Validate the key length
        if (privateKeyBuffer.length !== 64) {
          console.log(`⚠️ Warning: Decoded key length (${privateKeyBuffer.length}) is not the expected 64 bytes. Generating new keypair.`);
          adminKeypair = generateNewAdminKeypair();
        } else {
          adminKeypair = Keypair.fromSecretKey(privateKeyBuffer);
        }

        publicKeyBase58 = adminKeypair.publicKey.toBase58();
        // Only show a masked version of the public key for security
        const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
        console.log(`✅ Using existing admin keypair [masked key: ${maskedKey}]`);
      } catch (error) {
        console.log('❌ Error parsing existing admin private key, generating new one:', error.message);
        adminKeypair = generateNewAdminKeypair();
        publicKeyBase58 = adminKeypair.publicKey.toBase58();
      }
    }
  } else {
    console.log('🔑 Generating new admin keypair');
    adminKeypair = generateNewAdminKeypair();
    publicKeyBase58 = adminKeypair.publicKey.toBase58();
  }

  // Always update the admin keypair in .env to ensure it's in the correct format
  const privateKeyBase64 = Buffer.from(adminKeypair.secretKey).toString('base64');
  if (envContents.includes('ADMIN_PRIVATE_KEY=')) {
    envContents = envContents.replace(/ADMIN_PRIVATE_KEY=.*/, `ADMIN_PRIVATE_KEY=${privateKeyBase64}`);
  } else {
    envContents += `ADMIN_PRIVATE_KEY=${privateKeyBase64}\n`;
  }

  // Update RPC endpoint to Helius if needed
  if (envContents.includes('NEXT_PUBLIC_RPC_ENDPOINT=')) {
    // Check if already using Helius
    if (!envContents.includes('helius.xyz')) {
      console.log('🔄 Updating RPC endpoint to Helius for better Light Protocol support');
      envContents = envContents.replace(
        /NEXT_PUBLIC_RPC_ENDPOINT=.*/,
        `NEXT_PUBLIC_RPC_ENDPOINT=${HELIUS_DEVNET_RPC_ENDPOINT}`
      );
    }
  } else {
    envContents += `NEXT_PUBLIC_RPC_ENDPOINT=${HELIUS_DEVNET_RPC_ENDPOINT}\n`;
  }

  // Write updated content back to .env file
  fs.writeFileSync(ENV_FILE_PATH, envContents);
  console.log(`✅ Admin keypair and RPC endpoint updated in .env file`);

  // Only show a masked version of the public key for security
  const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
  console.log(`📝 Admin public key [masked key: ${maskedKey}]`);

  // Request SOL airdrop for the admin wallet on devnet
  console.log('💰 Requesting SOL airdrops for admin wallet on devnet...');
  try {
    // Use Helius endpoint for better reliability
    const connection = new Connection(HELIUS_DEVNET_RPC_ENDPOINT, 'confirmed');
    const publicKey = new PublicKey(publicKeyBase58);

    // Check current balance
    const balance = await connection.getBalance(publicKey);
    console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    // Target balance: 5 SOL should be sufficient for token operations
    const targetBalance = 5 * LAMPORTS_PER_SOL;

    if (balance < targetBalance) {
      console.log(`Balance below target of 5 SOL, requesting airdrops...`);

      // Devnet allows up to 2 SOL per airdrop request
      const maxAirdropAmount = 2 * LAMPORTS_PER_SOL;
      const neededSol = targetBalance - balance;
      const numAirdrops = Math.ceil(neededSol / maxAirdropAmount);

      for (let i = 0; i < numAirdrops; i++) {
        const airdropAmount = Math.min(maxAirdropAmount, neededSol - (i * maxAirdropAmount));
        if (airdropAmount <= 0) break;

        console.log(`Requesting airdrop #${i+1} of ${numAirdrops}: ${airdropAmount / LAMPORTS_PER_SOL} SOL...`);

        const signature = await connection.requestAirdrop(publicKey, airdropAmount);
        console.log(`Airdrop requested with signature: ${signature}`);
        console.log('Waiting for airdrop confirmation...');

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');

        // Check balance after each airdrop
        const currentBalance = await connection.getBalance(publicKey);
        console.log(`✅ Balance after airdrop #${i+1}: ${currentBalance / LAMPORTS_PER_SOL} SOL`);

        // Add a small delay between airdrops to avoid rate limiting
        if (i < numAirdrops - 1) {
          console.log('Waiting 2 seconds before next airdrop...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Check final balance
      const newBalance = await connection.getBalance(publicKey);
      console.log(`✅ Airdrops completed! Final balance: ${newBalance / LAMPORTS_PER_SOL} SOL`);
    } else {
      console.log('✅ Wallet already has sufficient funds');
    }
  } catch (error) {
    console.error('❌ Error requesting airdrop:', error.message);
    console.log('⚠️ You may need to manually fund the admin wallet with SOL using one of these faucets:');
    console.log('- https://solfaucet.com/');
    console.log('- https://faucet.solana.com/');
    console.log('- https://faucet.quicknode.com/solana/devnet');
    console.log(`Admin wallet address: ${publicKeyBase58}`);
  }

  console.log('🚀 Development environment setup complete!');
}

function generateNewAdminKeypair() {
  // Generate a completely random keypair
  return Keypair.generate();
}

main().catch(err => {
  console.error('Error setting up development environment:', err);
  process.exit(1);
});
