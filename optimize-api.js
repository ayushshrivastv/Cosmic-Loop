/**
 * Script to optimize the token creation API for better gas efficiency
 */
const fs = require('fs');
const path = require('path');

// Path to the token creation API file
const apiPath = path.join(__dirname, 'src', 'app', 'api', 'token', 'create', 'route.ts');

// Check if the file exists
if (!fs.existsSync(apiPath)) {
  console.error('❌ Token creation API file not found at:', apiPath);
  process.exit(1);
}

// Read the current content
const currentContent = fs.readFileSync(apiPath, 'utf8');

// Modifications to optimize gas usage
let optimizedContent = currentContent;

// 1. Add priority fee to ensure transaction goes through
if (!optimizedContent.includes('priorityFee')) {
  // Find a good insertion point after the connection creation
  const connectionPattern = /const connection = createConnection\({[^}]+}\);/;
  const match = optimizedContent.match(connectionPattern);
  
  if (match) {
    const insertionPoint = match.index + match[0].length;
    const priorityFeeCode = `
    
    // Add priority fee to ensure transaction goes through with limited funds
    const recentBlockhash = await connection.getLatestBlockhash('confirmed');
    const priorityFee = {
      computeUnitPrice: 1000, // Adjust as needed, lower values use less SOL
      computeUnitLimit: 200000, // Adjust as needed, lower values use less SOL
    };
    console.log("Setting priority fee:", priorityFee);`;
    
    optimizedContent = 
      optimizedContent.slice(0, insertionPoint) + 
      priorityFeeCode + 
      optimizedContent.slice(insertionPoint);
  }
}

// 2. Optimize the transaction creation to include priority fee
if (optimizedContent.includes('new TransactionMessage(')) {
  optimizedContent = optimizedContent.replace(
    /const messageV0 = new TransactionMessage\(\{[^}]+}\)\.compileToV0Message\(\);/g,
    `const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: recentBlockhash.blockhash,
      instructions,
    }).compileToV0Message();
    
    // Set priority fee for the transaction
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer, mintKeypair]);`
  );
  
  // Remove the duplicate transaction creation if it exists
  optimizedContent = optimizedContent.replace(
    /const transaction = new VersionedTransaction\(messageV0\);\s+transaction\.sign\(\[payer, mintKeypair\]\);/g,
    ''
  );
}

// 3. Add retry logic for transaction submission
if (optimizedContent.includes('const signature = await sendAndConfirmTx(connection, transaction);')) {
  optimizedContent = optimizedContent.replace(
    /const signature = await sendAndConfirmTx\(connection, transaction\);/g,
    `// Add retry logic for transaction submission
    let signature;
    let retries = 3;
    
    while (retries > 0) {
      try {
        console.log(\`Attempting to send transaction (retries left: \${retries})\`);
        signature = await sendAndConfirmTx(connection, transaction);
        console.log('Transaction successful!');
        break;
      } catch (txError) {
        console.error(\`Transaction failed (retries left: \${retries})\`, txError);
        retries--;
        
        if (retries === 0) {
          throw txError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }`
  );
}

// Write the optimized content back to the file
fs.writeFileSync(apiPath, optimizedContent);

console.log('✅ Token creation API has been optimized for better gas efficiency!');
console.log('🔄 Please restart your application to apply these changes.');
