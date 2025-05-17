/**
 * Script to derive the public key from the admin private key in .env
 */
require('dotenv').config();
const { Keypair } = require('@solana/web3.js');

try {
  // Get the admin private key from .env
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  
  if (!adminPrivateKey) {
    console.error('❌ ADMIN_PRIVATE_KEY not found in .env file');
    process.exit(1);
  }
  
  // Create a keypair from the private key
  let adminKeypair;
  
  try {
    // Try parsing as base64
    adminKeypair = Keypair.fromSecretKey(
      Buffer.from(adminPrivateKey, 'base64')
    );
  } catch (e) {
    console.error('❌ Error parsing admin private key:', e.message);
    process.exit(1);
  }
  
  // Get the public key
  const publicKey = adminKeypair.publicKey.toString();
  
  console.log('✅ Admin Public Key:', publicKey);
  console.log('\n📋 To fund this wallet on devnet, run:');
  console.log(`solana airdrop 1 ${publicKey} --url https://api.devnet.solana.com`);
  console.log('\nOr visit a Solana Devnet Faucet website and request an airdrop to this address.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
