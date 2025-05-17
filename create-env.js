/**
 * Script to create a .env file with the necessary configuration
 * for the Scalable cToken project
 */
const fs = require('fs');
const path = require('path');

// Define the content for the .env file
const envContent = `NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
# Generate a private key using setup-admin-wallet.js or Solana CLI
# NEVER commit actual keys to version control
ADMIN_PRIVATE_KEY=your_private_key_here
`;

// Define the path to the .env file
const envPath = path.join(__dirname, '.env');

// Check if the .env file already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️ .env file already exists. To avoid overwriting your configuration, please:');
  console.log('1. Manually edit your .env file');
  console.log('2. Add the ADMIN_PRIVATE_KEY if it\'s missing');
  console.log('3. Make sure NEXT_PUBLIC_CLUSTER and NEXT_PUBLIC_RPC_ENDPOINT are set correctly');
} else {
  // Create the .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Configuration:');
    console.log('- NEXT_PUBLIC_CLUSTER: devnet');
    console.log('- NEXT_PUBLIC_RPC_ENDPOINT: https://api.devnet.solana.com');
    console.log('⚠️ IMPORTANT: You need to set your ADMIN_PRIVATE_KEY in the .env file');
    console.log('\n📋 To generate a new admin keypair, run:');
    console.log('node setup-admin-wallet.js');
    console.log('\n⚠️ Important: This admin keypair needs SOL to pay for transaction fees.');
    console.log('You can fund it using a devnet faucet or the Solana CLI:');
    console.log('solana airdrop 1 <ADMIN_PUBLIC_KEY> --url https://api.devnet.solana.com');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}
