/**
 * Script to add more SOL to the admin wallet
 * This will request multiple airdrops to ensure sufficient funds for token creation
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
require('dotenv').config();

// Read admin private key from .env file and derive public key
const adminPrivateKeyBase64 = process.env.ADMIN_PRIVATE_KEY || '';
if (!adminPrivateKeyBase64) {
  console.error('❌ ADMIN_PRIVATE_KEY not found in .env file');
  process.exit(1);
}

// Convert base64 private key to Keypair and get public key
const { Keypair } = require('@solana/web3.js');
let adminPublicKey;
try {
  const privateKeyBuffer = Buffer.from(adminPrivateKeyBase64, 'base64');
  const adminKeypair = Keypair.fromSecretKey(privateKeyBuffer);
  adminPublicKey = adminKeypair.publicKey;
  console.log(`🔑 Using admin public key: ${adminPublicKey.toBase58().slice(0, 4)}...${adminPublicKey.toBase58().slice(-4)}`);
} catch (error) {
  console.error('❌ Error parsing admin private key:', error);
  process.exit(1);
}

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function addMoreSol() {
  try {
    // Check current balance
    const initialBalance = await connection.getBalance(adminPublicKey);
    const initialBalanceInSol = initialBalance / LAMPORTS_PER_SOL;
    console.log(`💰 Current admin wallet balance: ${initialBalanceInSol} SOL`);

    // Target balance: 5 SOL should be more than enough for token operations
    const targetBalance = 5 * LAMPORTS_PER_SOL;
    
    if (initialBalance >= targetBalance) {
      console.log(`✅ Admin wallet already has sufficient funds (${initialBalanceInSol} SOL)`);
      return;
    }

    // Request multiple airdrops to reach target balance
    const neededSol = targetBalance - initialBalance;
    console.log(`🚀 Requesting additional ${neededSol / LAMPORTS_PER_SOL} SOL...`);

    // Devnet allows up to 2 SOL per airdrop request
    const maxAirdropAmount = 2 * LAMPORTS_PER_SOL;
    const numAirdrops = Math.ceil(neededSol / maxAirdropAmount);

    for (let i = 0; i < numAirdrops; i++) {
      const airdropAmount = Math.min(maxAirdropAmount, neededSol - (i * maxAirdropAmount));
      if (airdropAmount <= 0) break;

      console.log(`📡 Requesting airdrop #${i+1} of ${numAirdrops}: ${airdropAmount / LAMPORTS_PER_SOL} SOL...`);
      
      // Request airdrop and wait for confirmation
      const signature = await connection.requestAirdrop(adminPublicKey, airdropAmount);
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`✅ Airdrop #${i+1} successful: ${signature}`);
      
      // Add a small delay between airdrops to avoid rate limiting
      if (i < numAirdrops - 1) {
        console.log('⏳ Waiting 2 seconds before next airdrop...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Check final balance
    const finalBalance = await connection.getBalance(adminPublicKey);
    const finalBalanceInSol = finalBalance / LAMPORTS_PER_SOL;
    console.log(`💰 Final admin wallet balance: ${finalBalanceInSol} SOL`);
    console.log(`✅ Added ${(finalBalance - initialBalance) / LAMPORTS_PER_SOL} SOL to admin wallet`);

  } catch (error) {
    console.error('❌ Error adding SOL to admin wallet:', error);
    process.exit(1);
  }
}

addMoreSol();
