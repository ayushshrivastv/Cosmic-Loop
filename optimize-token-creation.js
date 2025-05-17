/**
 * Script to optimize token creation gas usage
 * This script helps identify and fix potential issues with token creation
 * when operating with limited SOL funds
 */
const fs = require('fs');
const path = require('path');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Admin wallet public key from our setup
const ADMIN_PUBLIC_KEY = '2WkWeph5TcKJcdEojHU6esXvycSaDDCQJeK56YdWB4Wf';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

async function checkAndOptimize() {
  try {
    console.log('🔍 Analyzing token creation configuration...');
    
    // 1. Check admin wallet balance
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const publicKey = new PublicKey(ADMIN_PUBLIC_KEY);
    const balance = await connection.getBalance(publicKey);
    console.log(`💰 Current admin wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    if (balance < 0.5 * LAMPORTS_PER_SOL) {
      console.log('⚠️ Warning: Balance is below 0.5 SOL, which may be insufficient for token creation');
      console.log('Please use one of the faucets mentioned at the end of this output to get more SOL');
    } else {
      console.log('✅ Balance should be sufficient for basic token operations');
    }
    
    // 2. Check for common configuration issues
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env file exists');
      
      // Read .env file to check configuration
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check for required environment variables
      if (!envContent.includes('ADMIN_PRIVATE_KEY=')) {
        console.log('❌ ADMIN_PRIVATE_KEY is missing in .env file');
      } else {
        console.log('✅ ADMIN_PRIVATE_KEY is configured');
      }
      
      if (!envContent.includes('NEXT_PUBLIC_CLUSTER=')) {
        console.log('❌ NEXT_PUBLIC_CLUSTER is missing in .env file');
      } else {
        const clusterMatch = envContent.match(/NEXT_PUBLIC_CLUSTER=(\w+)/);
        if (clusterMatch && clusterMatch[1]) {
          console.log(`✅ NEXT_PUBLIC_CLUSTER is set to: ${clusterMatch[1]}`);
        }
      }
      
      if (!envContent.includes('NEXT_PUBLIC_RPC_ENDPOINT=')) {
        console.log('❌ NEXT_PUBLIC_RPC_ENDPOINT is missing in .env file');
      } else {
        console.log('✅ NEXT_PUBLIC_RPC_ENDPOINT is configured');
      }
    } else {
      console.log('❌ .env file is missing. Please create it with the required configuration.');
    }
    
    // 3. Provide optimization suggestions
    console.log('\n🔧 Optimization Suggestions:');
    console.log('1. Reduce token supply in your mint form to minimize gas costs');
    console.log('2. Simplify token metadata (shorter name, symbol, etc.)');
    console.log('3. Ensure you\'re using the latest Light Protocol version (0.21.0)');
    console.log('4. Consider batching operations if creating multiple tokens');
    
    // 4. Check for common code issues
    const tokenCreatePath = path.join(__dirname, 'src', 'app', 'api', 'token', 'create', 'route.ts');
    if (fs.existsSync(tokenCreatePath)) {
      console.log('\n✅ Token creation API route exists');
      
      // Read the token creation API file
      const tokenCreateContent = fs.readFileSync(tokenCreatePath, 'utf8');
      
      // Check for potential issues
      if (tokenCreateContent.includes('console.error')) {
        console.log('ℹ️ Error handling is implemented in the token creation API');
      }
      
      if (tokenCreateContent.includes('catch (error)')) {
        console.log('✅ Exception handling is implemented');
      }
      
      // Check for Light Protocol imports
      if (tokenCreateContent.includes('@lightprotocol/compressed-token')) {
        console.log('✅ Light Protocol compressed token package is imported');
      }
      
      if (tokenCreateContent.includes('@lightprotocol/stateless.js')) {
        console.log('✅ Light Protocol stateless.js package is imported');
      }
    } else {
      console.log('❌ Token creation API route is missing or in a different location');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Restart your application to ensure all configuration changes are applied');
    console.log('2. Try creating a token with minimal supply (e.g., 100 tokens)');
    console.log('3. If token creation still fails, check the server logs for detailed error messages');
    
    console.log('\n🌐 Alternative Funding Options:');
    console.log('1. Visit https://solfaucet.com/ and enter your admin wallet address:');
    console.log(`   ${ADMIN_PUBLIC_KEY}`);
    console.log('2. Use other Solana devnet faucets:');
    console.log('   - https://faucet.solana.com/');
    console.log('   - https://faucet.quicknode.com/solana/devnet');
    
  } catch (error) {
    console.error('❌ Error during optimization check:', error.message);
  }
}

checkAndOptimize();
