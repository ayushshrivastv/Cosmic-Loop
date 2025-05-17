/**
 * Script to fund the admin wallet on Solana devnet
 * This script requests multiple airdrops to ensure sufficient funds for token creation
 */
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Admin wallet public key from our setup
const ADMIN_PUBLIC_KEY = '2WkWeph5TcKJcdEojHU6esXvycSaDDCQJeK56YdWB4Wf';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

async function fundAdminWallet() {
  try {
    console.log('🚀 Connecting to Solana devnet...');
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    
    const publicKey = new PublicKey(ADMIN_PUBLIC_KEY);
    
    // Check current balance
    const initialBalance = await connection.getBalance(publicKey);
    console.log(`💰 Initial balance: ${initialBalance / LAMPORTS_PER_SOL} SOL`);
    
    // Request multiple airdrops to ensure sufficient funds
    // Devnet has a limit of 2 SOL per request, so we'll make multiple requests
    
    // First airdrop - 2 SOL
    console.log('💸 Requesting first airdrop of 2 SOL...');
    const signature1 = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
    
    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    await connection.confirmTransaction(signature1, 'confirmed');
    
    // Check intermediate balance
    const intermediateBalance = await connection.getBalance(publicKey);
    console.log(`✅ First airdrop successful!`);
    console.log(`💰 Current balance: ${intermediateBalance / LAMPORTS_PER_SOL} SOL`);
    
    // Second airdrop - 2 more SOL
    console.log('💸 Requesting second airdrop of 2 SOL...');
    const signature2 = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
    
    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    await connection.confirmTransaction(signature2, 'confirmed');
    
    // Check final balance
    const finalBalance = await connection.getBalance(publicKey);
    console.log(`✅ Second airdrop successful!`);
    console.log(`💰 Final balance: ${finalBalance / LAMPORTS_PER_SOL} SOL`);
    
    console.log('\n🎉 Your admin wallet now has sufficient funds for token creation!');
    console.log('🔄 Restart your application to apply the .env changes.');
    
  } catch (error) {
    console.error('❌ Error funding admin wallet:', error.message);
    console.log('\n💡 Alternative funding options:');
    console.log('1. Visit https://solfaucet.com/ and enter your admin wallet address:');
    console.log(`   ${ADMIN_PUBLIC_KEY}`);
    console.log('2. Use multiple faucets:');
    console.log(`   - https://faucet.solana.com/`);
    console.log(`   - https://solfaucet.com/`);
    console.log(`   - https://faucet.quicknode.com/solana/devnet`);
  }
}

fundAdminWallet();
