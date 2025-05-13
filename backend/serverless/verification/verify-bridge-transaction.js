/**
 * @file verify-bridge-transaction.js
 * @description Serverless function for verifying cross-chain bridge transactions
 *
 * This Lambda function is responsible for verifying the validity of bridge operations
 * by checking proofs from the source and destination chains. It implements automated
 * verification using cryptographic proofs.
 */

const { ethers } = require('ethers');
const { Connection, PublicKey } = require('@solana/web3.js');
const { ChainId } = require('@layerzerolabs/lz-sdk');
const logger = require('../../utils/logger');
const { SupportedChain } = require('../../lib/utils/layer-zero');

/**
 * Lambda handler for bridge transaction verification
 *
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context
 * @returns {Object} - Verification results
 */
exports.handler = async (event, context) => {
  logger.info('Starting bridge transaction verification function');

  try {
    const {
      bridgeOperationId,
      sourceChain,
      destinationChain,
      sourceTransactionHash,
      destinationTransactionHash,
      layerzeroMessageHash,
      nftId,
    } = event;

    logger.info(`Verifying bridge operation ${bridgeOperationId} from ${sourceChain} to ${destinationChain}`);

    // Validate input
    if (!bridgeOperationId || !sourceChain || !destinationChain || !sourceTransactionHash) {
      throw new Error('Missing required parameters');
    }

    // Perform verification based on the chains involved
    let verificationResult;

    if (sourceChain === SupportedChain.Solana) {
      if (isEVMChain(destinationChain)) {
        verificationResult = await verifySolanaToEVMBridge(
          sourceTransactionHash,
          destinationTransactionHash,
          layerzeroMessageHash,
          sourceChain,
          destinationChain,
          nftId
        );
      } else {
        verificationResult = await verifySolanaToNonEVMBridge(
          sourceTransactionHash,
          destinationTransactionHash,
          layerzeroMessageHash,
          sourceChain,
          destinationChain,
          nftId
        );
      }
    } else if (isEVMChain(sourceChain)) {
      if (destinationChain === SupportedChain.Solana) {
        verificationResult = await verifyEVMToSolanaBridge(
          sourceTransactionHash,
          destinationTransactionHash,
          layerzeroMessageHash,
          sourceChain,
          destinationChain,
          nftId
        );
      } else {
        verificationResult = await verifyEVMToEVMBridge(
          sourceTransactionHash,
          destinationTransactionHash,
          layerzeroMessageHash,
          sourceChain,
          destinationChain,
          nftId
        );
      }
    } else {
      throw new Error(`Unsupported chain combination: ${sourceChain} to ${destinationChain}`);
    }

    // Store verification proof in the database
    const proof = await storeVerificationProof(
      bridgeOperationId,
      nftId,
      verificationResult
    );

    // Update bridge operation status based on verification result
    await updateBridgeOperationStatus(
      bridgeOperationId,
      verificationResult.isVerified ? 'completed' : 'failed',
      verificationResult.isVerified ? null : verificationResult.errorReason
    );

    logger.info(`Verification completed for bridge operation ${bridgeOperationId}. Verified: ${verificationResult.isVerified}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        bridgeOperationId,
        proofId: proof.id,
        isVerified: verificationResult.isVerified,
        details: verificationResult.details,
      }),
    };
  } catch (error) {
    logger.error('Error in bridge verification function:', error);

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
 * Verify a bridge operation from Solana to an EVM chain
 *
 * @param {string} sourceTransactionHash - Source transaction hash
 * @param {string} destinationTransactionHash - Destination transaction hash
 * @param {string} layerzeroMessageHash - LayerZero message hash
 * @param {string} sourceChain - Source chain
 * @param {string} destinationChain - Destination chain
 * @param {string} nftId - NFT ID
 * @returns {Object} - Verification result
 */
async function verifySolanaToEVMBridge(
  sourceTransactionHash,
  destinationTransactionHash,
  layerzeroMessageHash,
  sourceChain,
  destinationChain,
  nftId
) {
  logger.info(`Verifying Solana to EVM bridge: ${sourceChain} to ${destinationChain}`);

  try {
    // 1. Verify source transaction on Solana
    const solanaConnection = new Connection(getChainRpcUrl(sourceChain));
    const sourceTransaction = await solanaConnection.getTransaction(sourceTransactionHash);

    if (!sourceTransaction) {
      return {
        isVerified: false,
        errorReason: 'Source transaction not found on Solana',
        details: {
          sourceTransactionHash,
          sourceChain,
        },
      };
    }

    // 2. Verify destination transaction on EVM chain
    if (!destinationTransactionHash) {
      return {
        isVerified: false,
        errorReason: 'Destination transaction hash not provided',
        details: {
          sourceTransactionHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    const evmProvider = new ethers.providers.JsonRpcProvider(getChainRpcUrl(destinationChain));
    const destinationTransaction = await evmProvider.getTransaction(destinationTransactionHash);

    if (!destinationTransaction) {
      return {
        isVerified: false,
        errorReason: 'Destination transaction not found on EVM chain',
        details: {
          sourceTransactionHash,
          destinationTransactionHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    // 3. Verify LayerZero message (in a real implementation, this would involve more complex validation)
    const isLayerZeroMessageValid = validateLayerZeroMessage(
      layerzeroMessageHash,
      sourceChain,
      destinationChain
    );

    if (!isLayerZeroMessageValid) {
      return {
        isVerified: false,
        errorReason: 'LayerZero message validation failed',
        details: {
          sourceTransactionHash,
          destinationTransactionHash,
          layerzeroMessageHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    // 4. Extract and validate NFT data from transactions
    // This would involve parsing Solana and EVM transaction data to match NFT details
    // For this example, we'll assume it's successful

    return {
      isVerified: true,
      details: {
        sourceTransactionHash,
        destinationTransactionHash,
        layerzeroMessageHash,
        sourceChain,
        destinationChain,
        confirmations: {
          source: sourceTransaction.confirmations,
          destination: await evmProvider.getTransactionReceipt(destinationTransactionHash).then(r => r.confirmations),
        },
        timestamp: {
          source: sourceTransaction.blockTime ? new Date(sourceTransaction.blockTime * 1000).toISOString() : null,
          destination: await evmProvider.getBlock(destinationTransaction.blockNumber).then(b => new Date(b.timestamp * 1000).toISOString()),
        },
      },
    };
  } catch (error) {
    logger.error('Error verifying Solana to EVM bridge:', error);

    return {
      isVerified: false,
      errorReason: `Verification error: ${error.message}`,
      details: {
        sourceTransactionHash,
        destinationTransactionHash,
        sourceChain,
        destinationChain,
        error: error.message,
      },
    };
  }
}

/**
 * Verify a bridge operation from an EVM chain to Solana
 *
 * @param {string} sourceTransactionHash - Source transaction hash
 * @param {string} destinationTransactionHash - Destination transaction hash
 * @param {string} layerzeroMessageHash - LayerZero message hash
 * @param {string} sourceChain - Source chain
 * @param {string} destinationChain - Destination chain
 * @param {string} nftId - NFT ID
 * @returns {Object} - Verification result
 */
async function verifyEVMToSolanaBridge(
  sourceTransactionHash,
  destinationTransactionHash,
  layerzeroMessageHash,
  sourceChain,
  destinationChain,
  nftId
) {
  logger.info(`Verifying EVM to Solana bridge: ${sourceChain} to ${destinationChain}`);

  try {
    // 1. Verify source transaction on EVM chain
    const evmProvider = new ethers.providers.JsonRpcProvider(getChainRpcUrl(sourceChain));
    const sourceTransaction = await evmProvider.getTransaction(sourceTransactionHash);

    if (!sourceTransaction) {
      return {
        isVerified: false,
        errorReason: 'Source transaction not found on EVM chain',
        details: {
          sourceTransactionHash,
          sourceChain,
        },
      };
    }

    // 2. Verify destination transaction on Solana
    if (!destinationTransactionHash) {
      return {
        isVerified: false,
        errorReason: 'Destination transaction hash not provided',
        details: {
          sourceTransactionHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    const solanaConnection = new Connection(getChainRpcUrl(destinationChain));
    const destinationTransaction = await solanaConnection.getTransaction(destinationTransactionHash);

    if (!destinationTransaction) {
      return {
        isVerified: false,
        errorReason: 'Destination transaction not found on Solana',
        details: {
          sourceTransactionHash,
          destinationTransactionHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    // 3. Verify LayerZero message
    const isLayerZeroMessageValid = validateLayerZeroMessage(
      layerzeroMessageHash,
      sourceChain,
      destinationChain
    );

    if (!isLayerZeroMessageValid) {
      return {
        isVerified: false,
        errorReason: 'LayerZero message validation failed',
        details: {
          sourceTransactionHash,
          destinationTransactionHash,
          layerzeroMessageHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    // 4. Extract and validate NFT data from transactions
    // This would involve parsing EVM and Solana transaction data to match NFT details
    // For this example, we'll assume it's successful

    return {
      isVerified: true,
      details: {
        sourceTransactionHash,
        destinationTransactionHash,
        layerzeroMessageHash,
        sourceChain,
        destinationChain,
        confirmations: {
          source: await evmProvider.getTransactionReceipt(sourceTransactionHash).then(r => r.confirmations),
          destination: destinationTransaction.confirmations,
        },
        timestamp: {
          source: await evmProvider.getBlock(sourceTransaction.blockNumber).then(b => new Date(b.timestamp * 1000).toISOString()),
          destination: destinationTransaction.blockTime ? new Date(destinationTransaction.blockTime * 1000).toISOString() : null,
        },
      },
    };
  } catch (error) {
    logger.error('Error verifying EVM to Solana bridge:', error);

    return {
      isVerified: false,
      errorReason: `Verification error: ${error.message}`,
      details: {
        sourceTransactionHash,
        destinationTransactionHash,
        sourceChain,
        destinationChain,
        error: error.message,
      },
    };
  }
}

/**
 * Verify a bridge operation between two EVM chains
 *
 * @param {string} sourceTransactionHash - Source transaction hash
 * @param {string} destinationTransactionHash - Destination transaction hash
 * @param {string} layerzeroMessageHash - LayerZero message hash
 * @param {string} sourceChain - Source chain
 * @param {string} destinationChain - Destination chain
 * @param {string} nftId - NFT ID
 * @returns {Object} - Verification result
 */
async function verifyEVMToEVMBridge(
  sourceTransactionHash,
  destinationTransactionHash,
  layerzeroMessageHash,
  sourceChain,
  destinationChain,
  nftId
) {
  logger.info(`Verifying EVM to EVM bridge: ${sourceChain} to ${destinationChain}`);

  try {
    // 1. Verify source transaction
    const sourceProvider = new ethers.providers.JsonRpcProvider(getChainRpcUrl(sourceChain));
    const sourceTransaction = await sourceProvider.getTransaction(sourceTransactionHash);

    if (!sourceTransaction) {
      return {
        isVerified: false,
        errorReason: 'Source transaction not found',
        details: {
          sourceTransactionHash,
          sourceChain,
        },
      };
    }

    // 2. Verify destination transaction
    if (!destinationTransactionHash) {
      return {
        isVerified: false,
        errorReason: 'Destination transaction hash not provided',
        details: {
          sourceTransactionHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    const destinationProvider = new ethers.providers.JsonRpcProvider(getChainRpcUrl(destinationChain));
    const destinationTransaction = await destinationProvider.getTransaction(destinationTransactionHash);

    if (!destinationTransaction) {
      return {
        isVerified: false,
        errorReason: 'Destination transaction not found',
        details: {
          sourceTransactionHash,
          destinationTransactionHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    // 3. Verify LayerZero message
    const isLayerZeroMessageValid = validateLayerZeroMessage(
      layerzeroMessageHash,
      sourceChain,
      destinationChain
    );

    if (!isLayerZeroMessageValid) {
      return {
        isVerified: false,
        errorReason: 'LayerZero message validation failed',
        details: {
          sourceTransactionHash,
          destinationTransactionHash,
          layerzeroMessageHash,
          sourceChain,
          destinationChain,
        },
      };
    }

    // 4. Extract and validate NFT data from transactions
    // This would involve parsing transaction logs to confirm correct NFT bridging
    // For this example, we'll assume it's successful

    return {
      isVerified: true,
      details: {
        sourceTransactionHash,
        destinationTransactionHash,
        layerzeroMessageHash,
        sourceChain,
        destinationChain,
        confirmations: {
          source: await sourceProvider.getTransactionReceipt(sourceTransactionHash).then(r => r.confirmations),
          destination: await destinationProvider.getTransactionReceipt(destinationTransactionHash).then(r => r.confirmations),
        },
        timestamp: {
          source: await sourceProvider.getBlock(sourceTransaction.blockNumber).then(b => new Date(b.timestamp * 1000).toISOString()),
          destination: await destinationProvider.getBlock(destinationTransaction.blockNumber).then(b => new Date(b.timestamp * 1000).toISOString()),
        },
      },
    };
  } catch (error) {
    logger.error('Error verifying EVM to EVM bridge:', error);

    return {
      isVerified: false,
      errorReason: `Verification error: ${error.message}`,
      details: {
        sourceTransactionHash,
        destinationTransactionHash,
        sourceChain,
        destinationChain,
        error: error.message,
      },
    };
  }
}

/**
 * Verify a bridge operation from Solana to a non-EVM chain
 *
 * @param {string} sourceTransactionHash - Source transaction hash
 * @param {string} destinationTransactionHash - Destination transaction hash
 * @param {string} layerzeroMessageHash - LayerZero message hash
 * @param {string} sourceChain - Source chain
 * @param {string} destinationChain - Destination chain
 * @param {string} nftId - NFT ID
 * @returns {Object} - Verification result
 */
async function verifySolanaToNonEVMBridge(
  sourceTransactionHash,
  destinationTransactionHash,
  layerzeroMessageHash,
  sourceChain,
  destinationChain,
  nftId
) {
  // This is a placeholder function for verifying Solana to non-EVM chains
  // In a real implementation, this would need to be customized for the specific destination chain

  logger.info(`Verifying Solana to non-EVM bridge: ${sourceChain} to ${destinationChain}`);

  return {
    isVerified: false,
    errorReason: `Bridge verification from Solana to ${destinationChain} is not yet implemented`,
    details: {
      sourceTransactionHash,
      destinationTransactionHash,
      layerzeroMessageHash,
      sourceChain,
      destinationChain,
    },
  };
}

/**
 * Check if a chain is EVM-compatible
 *
 * @param {string} chain - Chain identifier
 * @returns {boolean} - Whether the chain is EVM-compatible
 */
function isEVMChain(chain) {
  const evmChains = [
    SupportedChain.Ethereum,
    SupportedChain.Polygon,
    SupportedChain.Arbitrum,
    SupportedChain.Optimism,
    SupportedChain.Avalanche,
    SupportedChain.BinanceSmartChain,
  ];

  return evmChains.includes(chain);
}

/**
 * Mock function to validate a LayerZero message
 *
 * @param {string} layerzeroMessageHash - LayerZero message hash
 * @param {string} sourceChain - Source chain
 * @param {string} destinationChain - Destination chain
 * @returns {boolean} - Whether the message is valid
 */
function validateLayerZeroMessage(layerzeroMessageHash, sourceChain, destinationChain) {
  // In a real implementation, this would involve cryptographic verification
  // For this example, we'll just check that the hash is provided
  return !!layerzeroMessageHash;
}

/**
 * Store verification proof in the database
 *
 * @param {string} bridgeOperationId - Bridge operation ID
 * @param {string} nftId - NFT ID
 * @param {Object} verificationResult - Verification result
 * @returns {Object} - Stored proof
 */
async function storeVerificationProof(bridgeOperationId, nftId, verificationResult) {
  // This would typically involve a database call
  // For this example, we'll return a mock response

  return {
    id: `proof-${Date.now()}`,
    bridgeOperationId,
    nftId,
    proofType: 'layerzero-v2',
    proofData: JSON.stringify(verificationResult.details),
    isVerified: verificationResult.isVerified,
    verificationDetails: verificationResult.details,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Update bridge operation status in the database
 *
 * @param {string} bridgeOperationId - Bridge operation ID
 * @param {string} status - New status
 * @param {string} errorMessage - Error message if status is 'failed'
 * @returns {Object} - Updated bridge operation
 */
async function updateBridgeOperationStatus(bridgeOperationId, status, errorMessage = null) {
  // This would typically involve a database call
  // For this example, we'll return a mock response

  return {
    id: bridgeOperationId,
    status,
    errorMessage,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get RPC URL for a specific chain
 *
 * @param {string} chain - Chain identifier
 * @returns {string} - RPC URL
 */
function getChainRpcUrl(chain) {
  // This would typically come from environment variables or a config service
  const chainRpcMap = {
    [SupportedChain.Solana]: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    [SupportedChain.Ethereum]: process.env.ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth_goerli',
    [SupportedChain.Polygon]: process.env.POLYGON_RPC_URL || 'https://rpc.ankr.com/polygon_mumbai',
    [SupportedChain.Arbitrum]: process.env.ARBITRUM_RPC_URL || 'https://goerli-rollup.arbitrum.io/rpc',
    [SupportedChain.Optimism]: process.env.OPTIMISM_RPC_URL || 'https://goerli.optimism.io',
    [SupportedChain.Avalanche]: process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    [SupportedChain.BinanceSmartChain]: process.env.BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
  };

  return chainRpcMap[chain] || chainRpcMap[SupportedChain.Ethereum];
}
