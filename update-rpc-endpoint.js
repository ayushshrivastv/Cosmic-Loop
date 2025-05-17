/**
 * Script to update the RPC endpoint in the .env file
 * This will help resolve the "Method not found" error
 */

const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.join(__dirname, '.env');

// New RPC endpoint with better support for Light Protocol methods
const newRpcEndpoint = 'https://rpc-devnet.helius.xyz/?api-key=1d8740dc-e5f4-421c-b823-e1bad1889eff';

async function updateRpcEndpoint() {
  try {
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\ud83d\udcc1 Reading .env file...');
    
    // Check if the file already contains the new endpoint
    if (envContent.includes(newRpcEndpoint)) {
      console.log('\u2705 RPC endpoint already updated to Helius endpoint.');
      return;
    }
    
    // Replace the RPC endpoint
    const updatedContent = envContent.replace(
      /NEXT_PUBLIC_RPC_ENDPOINT=.*/,
      `NEXT_PUBLIC_RPC_ENDPOINT=${newRpcEndpoint}`
    );
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, updatedContent, 'utf8');
    console.log('\u2705 Updated RPC endpoint in .env file to Helius endpoint.');
    console.log('\ud83d\udce2 Please restart your development server (npm run dev) for changes to take effect.');
    
  } catch (error) {
    console.error('\u274c Error updating RPC endpoint:', error);
    process.exit(1);
  }
}

updateRpcEndpoint();
