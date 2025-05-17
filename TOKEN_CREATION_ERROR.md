# Troubleshooting Token Creation Issues

This guide helps you troubleshoot common issues when creating and distributing compressed tokens on Solana using Light Protocol.

## Common Error Messages and Solutions

### 1. "Token creation failed: This may be due to an invalid admin keypair or insufficient funds."

**Potential Causes:**
- Admin private key is not correctly parsed or formatted
- Admin wallet doesn't have enough SOL

**Solutions:**
- Run `node setup-dev-environment.js` to regenerate the admin keypair
- Run `node add-more-sol.js` to add more SOL to the admin wallet
- Check your `.env` file to ensure `ADMIN_PRIVATE_KEY` is correctly set
- Use `node check-token-environment.js` to diagnose issues

### 2. "Transaction simulation failed: Transaction results in an account (1) with insufficient funds for rent."

**Potential Causes:**
- The admin wallet doesn't have enough SOL to cover the rent for creating a new token account
- The transaction is attempting to create too many accounts at once

**Solutions:**
- Add more SOL to the admin wallet with `node add-more-sol.js`
- Reduce the token supply in your creation form
- Set a lower decimals value (e.g., 6 instead of 9)
- Run `node optimize-token-creation.js` to optimize gas usage

### 3. "Transaction signature verification failure."

**Potential Causes:**
- The admin keypair is invalid or cannot be properly derived
- The transaction is not properly signed

**Solutions:**
- Regenerate the admin keypair with `node setup-dev-environment.js`
- Check if the correct owner is signing the transaction
- Check that `ADMIN_PRIVATE_KEY` is correctly set in the `.env` file

### 4. "failed to get slot: Method not found" or Other RPC Errors

**Potential Causes:**
- Using an RPC endpoint that doesn't fully support Light Protocol methods
- Network connectivity issues

**Solutions:**
- Run `node update-rpc-endpoint.js` to switch to the Helius RPC endpoint
- Check your internet connection
- Ensure the RPC endpoint is correctly set in the `.env` file

## General Troubleshooting Steps

1. **Check Environment Configuration**
   ```
   node check-token-environment.js
   ```
   This will analyze your environment and provide recommendations.

2. **Update Admin Keypair**
   ```
   node setup-dev-environment.js
   ```
   This will regenerate the admin keypair and request SOL airdrops.

3. **Fund Admin Wallet**
   ```
   node add-more-sol.js
   ```
   This will request additional SOL for the admin wallet.

4. **Update RPC Endpoint**
   ```
   node update-rpc-endpoint.js
   ```
   This will update the RPC endpoint to a more reliable one that supports Light Protocol.

5. **Optimize Token Creation**
   ```
   node optimize-token-creation.js
   ```
   This will optimize gas usage for token creation.

## Common Mistakes to Avoid

1. **Using Too Large Token Supply**
   - For testing on devnet, keep token supply below 1,000,000 to avoid transaction size limitations

2. **Invalid Metadata URI**
   - Ensure the metadata URI is a valid JSON metadata file hosted on Arweave or IPFS
   - The metadata should follow the Solana Metaplex format

3. **Incorrect Admin Keypair Format**
   - The admin keypair should be stored as a base64-encoded string
   - The keypair must be 64 bytes long

4. **Insufficient Funds**
   - The admin wallet should have at least 3 SOL for comfortable token creation operations
   - More SOL is required for larger token supplies or multiple operations

## Advanced Debugging

If you're still experiencing issues, check the server logs for more detailed error information.

### Monitoring Transaction Status

For failed transactions, you can check the status on Solana Explorer:
1. Go to [https://explorer.solana.com/?cluster=devnet](https://explorer.solana.com/?cluster=devnet)
2. Enter the transaction signature
3. Look for error messages in the logs

### Light Protocol Resources

- [Light Protocol Documentation](https://docs.light.so)
- [Compressed Tokens Github](https://github.com/lightprotocol/compressed-token)
- [State Compression Guide](https://docs.light.so/state-compression)

## Getting Help

If you've tried all the troubleshooting steps and still face issues:
1. Check if Light Protocol has updated their packages (current recommended version: 0.21.0)
2. Update the RPC endpoint to a more reliable provider like Helius or QuickNode
3. Try reducing the token metadata complexity
4. Reach out to Light Protocol's Discord community for specialized help
