/**
 * @file distribute-nfts.js
 * @description Serverless function for distributing NFTs to multiple recipients during high-volume events
 *
 * This Lambda function is designed to handle the distribution of NFTs to a large number of recipients
 * in a scalable way. It processes batches of recipient addresses and mints NFTs for them across
 * multiple chains, including Solana and EVM chains.
 */

const { PublicKey, Keypair } = require('@solana/web3.js');
const { createConnection, mintCompressedTokens } = require('../../utils/solana-utils');
const { createNftRecord, updateDistributionStatus } = require('../../services/nft-service/nft-service');
const { ethers } = require('ethers');
const { SupportedChain } = require('../../lib/utils/layer-zero');
const logger = require('../../utils/logger');

// Maximum number of tokens to mint in a single batch
const MAX_BATCH_SIZE = 50;

/**
 * Lambda handler for NFT distribution
 *
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context
 * @returns {Object} - Distribution results
 */
exports.handler = async (event, context) => {
  logger.info('Starting NFT distribution serverless function');

  try {
    const {
      eventId,
      collectionId,
      recipients,
      chain,
      isCompressed = true,
      metadata,
    } = event;

    logger.info(`Processing distribution for event ${eventId}, collection ${collectionId} on ${chain}`);
    logger.info(`Total recipients: ${recipients.length}`);

    // Validate input
    if (!eventId || !collectionId || !Array.isArray(recipients) || recipients.length === 0 || !chain) {
      throw new Error('Missing required parameters');
    }

    // Process in batches to avoid timeouts
    const results = {
      successful: [],
      failed: [],
      totalProcessed: 0,
    };

    // Divide recipients into batches
    const batches = [];
    for (let i = 0; i < recipients.length; i += MAX_BATCH_SIZE) {
      batches.push(recipients.slice(i, i + MAX_BATCH_SIZE));
    }

    logger.info(`Split distribution into ${batches.length} batches`);

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`Processing batch ${i + 1}/${batches.length} with ${batch.length} recipients`);

      try {
        let batchResults;

        // Choose distribution method based on chain
        if (chain.toLowerCase() === SupportedChain.Solana) {
          batchResults = await processSolanaBatch(
            eventId,
            collectionId,
            batch,
            isCompressed,
            metadata
          );
        } else {
          batchResults = await processEVMBatch(
            eventId,
            collectionId,
            batch,
            chain,
            metadata
          );
        }

        // Aggregate results
        results.successful.push(...batchResults.successful);
        results.failed.push(...batchResults.failed);
        results.totalProcessed += batch.length;

        // Update distribution status
        await updateDistributionStatus(eventId, {
          processedCount: results.totalProcessed,
          successCount: results.successful.length,
          failCount: results.failed.length,
          inProgress: i < batches.length - 1,
        });

        logger.info(`Batch ${i + 1} complete. Success: ${batchResults.successful.length}, Failed: ${batchResults.failed.length}`);
      } catch (batchError) {
        logger.error(`Error processing batch ${i + 1}:`, batchError);

        // Mark all recipients in this batch as failed
        const batchFailures = batch.map(recipient => ({
          walletAddress: recipient.walletAddress,
          userId: recipient.userId,
          error: batchError.message,
        }));

        results.failed.push(...batchFailures);
        results.totalProcessed += batch.length;

        // Update distribution status
        await updateDistributionStatus(eventId, {
          processedCount: results.totalProcessed,
          successCount: results.successful.length,
          failCount: results.failed.length,
          inProgress: i < batches.length - 1,
        });
      }
    }

    logger.info(`Distribution complete. Total processed: ${results.totalProcessed}, Success: ${results.successful.length}, Failed: ${results.failed.length}`);

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (error) {
    logger.error('Error in NFT distribution function:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    };
  }
};

/**
 * Process a batch of Solana NFT distributions
 *
 * @param {string} eventId - Event ID
 * @param {string} collectionId - NFT collection ID
 * @param {Array} recipients - Batch of recipients
 * @param {boolean} isCompressed - Whether to mint compressed tokens
 * @param {Object} metadata - NFT metadata
 * @returns {Object} - Batch results
 */
async function processSolanaBatch(eventId, collectionId, recipients, isCompressed, metadata) {
  const results = {
    successful: [],
    failed: [],
  };

  // Create Solana connection
  const connection = createConnection({
    endpoint: process.env.SOLANA_RPC_URL,
    cluster: 'devnet',
  });

  // For demonstration, we're using a new keypair, but in production we'd use a securely stored key
  const payer = Keypair.generate();

  // Get collection details
  const collection = await getCollectionDetails(collectionId);

  // Mint tokens for each recipient
  for (const recipient of recipients) {
    try {
      const { walletAddress, userId } = recipient;

      // Validate Solana address
      const destinationPubkey = new PublicKey(walletAddress);

      // Mint the NFT
      const mintResult = await mintCompressedTokens(
        connection,
        payer,
        new PublicKey(collection.contractAddress),
        destinationPubkey,
        payer, // Using payer as authority for demo
        1 // Always mint 1 token
      );

      // Create NFT record in database
      const nftRecord = await createNftRecord({
        collectionId,
        tokenId: mintResult.tokenId,
        ownerAddress: walletAddress,
        ownerId: userId,
        uri: `${collection.baseUri}/${mintResult.tokenId}`,
        metadata,
        chain: SupportedChain.Solana,
        contractAddress: collection.contractAddress,
        isCompressed,
        eventId,
      });

      results.successful.push({
        walletAddress,
        userId,
        nftId: nftRecord.id,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.signature,
      });
    } catch (error) {
      logger.error(`Failed to mint NFT for ${recipient.walletAddress}:`, error);

      results.failed.push({
        walletAddress: recipient.walletAddress,
        userId: recipient.userId,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Process a batch of EVM NFT distributions
 *
 * @param {string} eventId - Event ID
 * @param {string} collectionId - NFT collection ID
 * @param {Array} recipients - Batch of recipients
 * @param {string} chain - Target chain
 * @param {Object} metadata - NFT metadata
 * @returns {Object} - Batch results
 */
async function processEVMBatch(eventId, collectionId, recipients, chain, metadata) {
  const results = {
    successful: [],
    failed: [],
  };

  // Get RPC URL for the specified chain
  const rpcUrl = getChainRpcUrl(chain);

  // Set up provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);

  // Get collection details
  const collection = await getCollectionDetails(collectionId);

  // Create contract instance
  const nftContract = new ethers.Contract(
    collection.contractAddress,
    NFT_ABI, // ABI would be imported from a separate file
    wallet
  );

  // Mint tokens for each recipient
  for (const recipient of recipients) {
    try {
      const { walletAddress, userId } = recipient;

      // Validate EVM address
      if (!ethers.utils.isAddress(walletAddress)) {
        throw new Error(`Invalid address: ${walletAddress}`);
      }

      // Prepare token URI (would typically be IPFS or similar)
      const tokenUri = `${collection.baseUri}/${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Mint the NFT
      const tx = await nftContract.mintTo(walletAddress, tokenUri);
      const receipt = await tx.wait();

      // Extract token ID from event logs
      const transferEvent = receipt.events.find(e => e.event === 'Transfer');
      const tokenId = transferEvent.args.tokenId.toString();

      // Create NFT record in database
      const nftRecord = await createNftRecord({
        collectionId,
        tokenId,
        ownerAddress: walletAddress,
        ownerId: userId,
        uri: tokenUri,
        metadata,
        chain,
        contractAddress: collection.contractAddress,
        isCompressed: false, // EVM NFTs are not compressed
        eventId,
      });

      results.successful.push({
        walletAddress,
        userId,
        nftId: nftRecord.id,
        tokenId,
        transactionHash: receipt.transactionHash,
      });
    } catch (error) {
      logger.error(`Failed to mint NFT for ${recipient.walletAddress}:`, error);

      results.failed.push({
        walletAddress: recipient.walletAddress,
        userId: recipient.userId,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Get collection details from database
 *
 * @param {string} collectionId - Collection ID
 * @returns {Object} - Collection details
 */
async function getCollectionDetails(collectionId) {
  // This would typically query the database
  // For demo purposes, we return mock data
  return {
    id: collectionId,
    name: 'Demo Collection',
    symbol: 'DEMO',
    contractAddress: 'mock_contract_address',
    baseUri: 'https://api.example.com/nfts',
    maxSupply: 10000,
  };
}

/**
 * Get RPC URL for a specific chain
 *
 * @param {string} chain - Chain identifier
 * @returns {string} - RPC URL
 */
function getChainRpcUrl(chain) {
  // This would typically come from config or environment
  const chainRpcMap = {
    [SupportedChain.Ethereum]: process.env.ETHEREUM_RPC_URL,
    [SupportedChain.Polygon]: process.env.POLYGON_RPC_URL,
    [SupportedChain.Arbitrum]: process.env.ARBITRUM_RPC_URL,
    [SupportedChain.Optimism]: process.env.OPTIMISM_RPC_URL,
    [SupportedChain.Avalanche]: process.env.AVALANCHE_RPC_URL,
    [SupportedChain.BinanceSmartChain]: process.env.BSC_RPC_URL,
  };

  return chainRpcMap[chain] || chainRpcMap[SupportedChain.Ethereum];
}

// Sample NFT ABI - in production, this would be imported from a separate file
const NFT_ABI = [
  'function mintTo(address to, string uri) external returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];
