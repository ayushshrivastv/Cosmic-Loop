/**
 * Script to set up admin wallet for Scalable cToken project
 * This script:
 * 1. Generates a new Solana keypair
 * 2. Creates a .env file with the necessary configuration
 * 3. Displays the public key for funding
 */
const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');

// Generate a new keypair
const adminKeypair = Keypair.generate();
const publicKey = adminKeypair.publicKey.toString();
const privateKeyArray = Array.from(adminKeypair.secretKey);

// Create .env file content
const envContent = `NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
ADMIN_PRIVATE_KEY=${privateKeyArray.toString()}
`;

// Define the path to the .env file
const envPath = path.join(__dirname, '.env');

// Create the .env file
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully with admin keypair!');
  console.log('📝 Configuration:');
  console.log('- NEXT_PUBLIC_CLUSTER: devnet');
  console.log('- NEXT_PUBLIC_RPC_ENDPOINT: https://api.devnet.solana.com');
  console.log('- ADMIN_PRIVATE_KEY: [Securely stored in .env file]');
  console.log('\n🔑 Admin Public Key:', publicKey);
  console.log('\n⚠️ Important: This admin wallet needs SOL to pay for transaction fees.');
  console.log('You can fund it using a devnet faucet or the Solana CLI:');
  console.log(`solana airdrop 1 ${publicKey} --url https://api.devnet.solana.com`);
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
