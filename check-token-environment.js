/**
 * check-token-environment.js
 *
 * This script performs a comprehensive check of the token creation environment
 * It verifies:
 * 1. Admin keypair is correctly set up
 * 2. RPC endpoint is configured and supports Light Protocol
 * 3. Admin wallet has sufficient funds
 * 4. Light Protocol dependencies are correctly installed
 * 5. Environment variables are properly set
 */

const fs = require('fs');
const path = require('path');
const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Constants
const ENV_FILE_PATH = path.join(__dirname, '.env');
const REQUIRED_SOL_BALANCE = 3; // Recommended SOL balance for token operations
const REQUIRED_LIGHT_PROTOCOL_VERSION = '0.21.0'; // Minimum version required

async function main() {
  console.log('🔍 Starting token creation environment check...');
  console.log('------------------------------------------------');

  let allChecksPassed = true;

  // 1. Check if .env file exists
  console.log('\n📋 Checking environment configuration...');
  if (!fs.existsSync(ENV_FILE_PATH)) {
    console.error('❌ .env file not found! Please run setup-dev-environment.js first.');
    allChecksPassed = false;
    return;
  }
  console.log('✅ .env file exists');

  // Read .env file content
  const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');

  // 2. Check if required env variables are set
  const envVars = {
    'ADMIN_PRIVATE_KEY': envContent.includes('ADMIN_PRIVATE_KEY=') && !envContent.includes('ADMIN_PRIVATE_KEY=DUMMY'),
    'NEXT_PUBLIC_CLUSTER': envContent.includes('NEXT_PUBLIC_CLUSTER='),
    'NEXT_PUBLIC_RPC_ENDPOINT': envContent.includes('NEXT_PUBLIC_RPC_ENDPOINT=')
  };

  Object.entries(envVars).forEach(([varName, exists]) => {
    if (exists) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.error(`❌ ${varName} is missing or invalid`);
      allChecksPassed = false;
    }
  });

  // 3. Validate admin keypair
  console.log('\n🔑 Validating admin keypair...');
  let adminKeypair;
  try {
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) {
      throw new Error('ADMIN_PRIVATE_KEY environment variable is empty');
    }

    // Try parsing as base64
    const secretKeyUint8Array = Buffer.from(adminPrivateKey, 'base64');

    // Validate the key length
    if (secretKeyUint8Array.length !== 64) {
      throw new Error(`Invalid key length: ${secretKeyUint8Array.length} bytes (expected 64)`);
    }

    adminKeypair = Keypair.fromSecretKey(secretKeyUint8Array);
    const publicKeyBase58 = adminKeypair.publicKey.toBase58();
    const maskedKey = publicKeyBase58.substring(0, 4) + '...' + publicKeyBase58.substring(publicKeyBase58.length - 4);
    console.log(`✅ Admin keypair is valid [masked key: ${maskedKey}]`);
  } catch (error) {
    console.error(`❌ Admin keypair is invalid: ${error.message}`);
    console.log('   Try running setup-dev-environment.js to generate a new keypair');
    allChecksPassed = false;
    return;
  }

  // 4. Check RPC endpoint
  console.log('\n🌐 Checking RPC endpoint...');
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
  console.log(`Using RPC endpoint: ${rpcEndpoint}`);

  // Check if using recommended Helius endpoint
  if (!rpcEndpoint.includes('helius.xyz')) {
    console.warn('⚠️ Not using recommended Helius RPC endpoint, which may cause issues with Light Protocol');
    console.log('   Run update-rpc-endpoint.js to switch to the recommended endpoint');
  } else {
    console.log('✅ Using recommended Helius RPC endpoint');
  }

  // 5. Check connection to Solana network
  let connection;
  try {
    console.log('Attempting to connect to Solana network...');
    connection = new Connection(rpcEndpoint, {
      commitment: 'confirmed',
      httpMethod: 'GET',
      timeout: 10000 // 10 second timeout
    });

    // Use a Promise with timeout to handle potential hanging connections
    const versionPromise = Promise.race([
      connection.getVersion(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);

    try {
      const version = await versionPromise;
      console.log(`✅ Successfully connected to Solana network (${version['solana-core']})`);
    } catch (timeoutError) {
      console.error(`❌ Failed to connect to Solana network: ${timeoutError.message}`);
      console.log('   This may be due to network restrictions or RPC endpoint limitations');
      console.log('   You may ignore this error if you\'re able to connect to Solana in your production environment');
      // Continue with checks instead of returning
    }
  } catch (error) {
    console.error(`❌ Failed to connect to Solana network: ${error.message}`);
    console.log('   Check your internet connection or try another RPC endpoint');
    console.log('   You may proceed with other checks');
    // Continue with checks instead of returning
  }

  // 6. Check admin wallet balance
  console.log('\n💰 Checking admin wallet balance...');
  try {
    const balance = await connection.getBalance(adminKeypair.publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log(`Current balance: ${balanceInSol.toFixed(4)} SOL`);

    if (balanceInSol < 0.5) {
      console.error(`❌ Admin wallet has insufficient funds (${balanceInSol.toFixed(4)} SOL)`);
      console.log('   Run fund-admin-wallet.js or add-more-sol.js to fund your admin wallet');
      allChecksPassed = false;
    } else if (balanceInSol < REQUIRED_SOL_BALANCE) {
      console.warn(`⚠️ Admin wallet has low funds (${balanceInSol.toFixed(4)} SOL). Recommended: ${REQUIRED_SOL_BALANCE} SOL`);
      console.log('   Consider running add-more-sol.js to add more SOL to your admin wallet');
    } else {
      console.log(`✅ Admin wallet has sufficient funds (${balanceInSol.toFixed(4)} SOL)`);
    }
  } catch (error) {
    console.error(`❌ Failed to check admin wallet balance: ${error.message}`);
    allChecksPassed = false;
  }

  // 7. Check Light Protocol package versions
  console.log('\n📦 Checking Light Protocol dependencies...');
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const compressedTokenVersion = packageJson.dependencies['@lightprotocol/compressed-token'] || '';
    const statelessJsVersion = packageJson.dependencies['@lightprotocol/stateless.js'] || '';

    console.log(`@lightprotocol/compressed-token version: ${compressedTokenVersion}`);
    console.log(`@lightprotocol/stateless.js version: ${statelessJsVersion}`);

    const versionRegex = /^[\^~]?(\d+\.\d+\.\d+)/;
    const compressedMatch = compressedTokenVersion.match(versionRegex);
    const statelessMatch = statelessJsVersion.match(versionRegex);

    if (!compressedMatch || !statelessMatch) {
      console.warn('⚠️ Could not verify Light Protocol package versions');
      allChecksPassed = false;
    } else {
      const compressedVersion = compressedMatch[1];
      const statelessVersion = statelessMatch[1];

      if (compressedVersion !== statelessVersion) {
        console.warn(`⚠️ Light Protocol package versions do not match. This may cause compatibility issues.`);
      }

      if (compressedVersion < REQUIRED_LIGHT_PROTOCOL_VERSION || statelessVersion < REQUIRED_LIGHT_PROTOCOL_VERSION) {
        console.warn(`⚠️ Light Protocol packages are older than the recommended version (${REQUIRED_LIGHT_PROTOCOL_VERSION})`);
        console.log('   Consider updating the packages by editing package.json and running npm install');
      } else {
        console.log('✅ Light Protocol packages are up-to-date');
      }
    }
  } catch (error) {
    console.error(`❌ Failed to check Light Protocol dependencies: ${error.message}`);
    allChecksPassed = false;
  }

  // 8. Check file permissions
  console.log('\n📁 Checking file permissions...');
  try {
    // Check if the API route file exists and is readable
    const apiRoutePath = path.join(__dirname, 'src', 'app', 'api', 'token', 'create', 'route.ts');
    if (fs.existsSync(apiRoutePath)) {
      // Check if the file is readable
      fs.accessSync(apiRoutePath, fs.constants.R_OK);
      console.log('✅ Token creation API route file exists and is readable');
    } else {
      console.error('❌ Token creation API route file not found');
      allChecksPassed = false;
    }

    // Check if utils file exists and is readable
    const solanaUtilsPath = path.join(__dirname, 'src', 'lib', 'utils', 'solana.ts');
    if (fs.existsSync(solanaUtilsPath)) {
      fs.accessSync(solanaUtilsPath, fs.constants.R_OK);
      console.log('✅ Solana utility file exists and is readable');
    } else {
      console.error('❌ Solana utility file not found');
      allChecksPassed = false;
    }
  } catch (error) {
    console.error(`❌ File permission check failed: ${error.message}`);
    allChecksPassed = false;
  }

  // 9. Summary
  console.log('\n------------------------------------------------');
  if (allChecksPassed) {
    console.log('✅ All environment checks passed! Your token creation environment is properly set up.');
    console.log('   You should be able to create tokens successfully.');
  } else {
    console.error('❌ Some environment checks failed. Please fix the issues above before attempting to create tokens.');
    console.log('   Use the indicated scripts to resolve the issues, or refer to the error messages for guidance.');
  }

  // 10. Troubleshooting recommendations
  console.log('\n🔧 Troubleshooting recommendations:');
  console.log('1. If you encounter "insufficient funds" errors:');
  console.log('   - Run add-more-sol.js to increase admin wallet balance');
  console.log('   - Try reducing the token supply in your creation form');

  console.log('2. If you encounter "method not found" errors:');
  console.log('   - Run update-rpc-endpoint.js to use the Helius RPC endpoint');

  console.log('3. If you encounter "invalid admin keypair" errors:');
  console.log('   - Run setup-dev-environment.js to generate a new keypair');

  console.log('4. If you encounter transaction simulation failures:');
  console.log('   - Check that your metadata URI is valid');
  console.log('   - Ensure token name and symbol are of appropriate length');
  console.log('   - Try optimizing token creation with optimize-token-creation.js');

  console.log('\nFor persistent issues, check server logs and the Light Protocol documentation.');
}

main().catch(error => {
  console.error('Error running environment check:', error);
  process.exit(1);
});
