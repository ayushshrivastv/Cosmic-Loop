/**
 * @file chain-listener.js
 * @description Service for listening to blockchain events across different chains
 *
 * This service sets up listeners for monitoring events on various blockchains
 * including Solana and EVM chains. It handles real-time validation of bridge
 * transactions and updates the system when events occur.
 */

const { ethers } = require('ethers');
const { Connection, PublicKey } = require('@solana/web3.js');
const { SupportedChain } = require('../../lib/utils/layer-zero');
const logger = require('../../utils/logger');
const { publishEvent, WS_EVENTS } = require('../../websockets');
const { getCache, setCache } = require('../../utils/redis');

// Map to store active listeners by chain and contract
const activeListeners = new Map();

/**
 * Initialize chain listeners for all configured contracts
 *
 * @param {Array} listenerConfigs - Array of listener configurations from database
 * @param {Object} redisClient - Redis client for caching and pub/sub
 */
async function initializeChainListeners(listenerConfigs, redisClient) {
  logger.info(`Initializing ${listenerConfigs.length} chain listeners`);

  for (const config of listenerConfigs) {
    try {
      await startChainListener(config, redisClient);
    } catch (error) {
      logger.error(`Failed to start listener for ${config.chain}:${config.contract_address}:${config.event_name}:`, error);
    }
  }

  logger.info('Chain listeners initialization complete');
}

/**
 * Start a specific chain listener
 *
 * @param {Object} config - Listener configuration
 * @param {Object} redisClient - Redis client for caching and pub/sub
 */
async function startChainListener(config, redisClient) {
  const { chain, contract_address, event_name, last_block_processed, filter_criteria } = config;

  // Generate a unique key for this listener
  const listenerKey = `${chain}:${contract_address}:${event_name}`;

  // Don't start duplicate listeners
  if (activeListeners.has(listenerKey)) {
    logger.warn(`Listener for ${listenerKey} is already active`);
    return;
  }

  logger.info(`Starting chain listener for ${listenerKey} from block ${last_block_processed}`);

  let listener;

  // Choose the appropriate listener based on chain type
  if (chain === SupportedChain.Solana) {
    listener = await startSolanaListener(config, redisClient);
  } else if (isEVMChain(chain)) {
    listener = await startEVMListener(config, redisClient);
  } else {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  if (listener) {
    activeListeners.set(listenerKey, listener);
    logger.info(`Listener for ${listenerKey} started successfully`);
  }
}

/**
 * Start a Solana event listener
 *
 * @param {Object} config - Listener configuration
 * @param {Object} redisClient - Redis client for caching and pub/sub
 * @returns {Object} - Listener object
 */
async function startSolanaListener(config, redisClient) {
  const { chain, contract_address, event_name, last_block_processed, filter_criteria } = config;

  // Create Solana connection
  const connection = new Connection(getChainRpcUrl(chain), 'confirmed');

  // Subscribe to program account changes
  const programId = new PublicKey(contract_address);

  // Convert filter criteria to the format expected by Solana
  const filters = [];
  if (filter_criteria && filter_criteria.memcmp) {
    for (const memcmp of filter_criteria.memcmp) {
      filters.push({
        memcmp: {
          offset: memcmp.offset,
          bytes: memcmp.bytes,
        },
      });
    }
  }

  // Subscribe to account changes
  const subscriptionId = connection.onProgramAccountChange(
    programId,
    async (accountInfo, context) => {
      try {
        logger.info(`Solana program account change detected on ${chain}:${contract_address}`);

        // Process the account change
        const result = processSolanaAccountChange(accountInfo, context, event_name, filter_criteria);

        if (result) {
          // Save the current slot as last processed
          await updateLastProcessedBlock(config.id, context.slot);

          // Publish event to WebSocket
          await publishEvent(
            getEventTypeForChainEvent(event_name),
            result,
            { chain, contractAddress: contract_address },
            redisClient
          );

          // Process transaction if it's a bridge event
          if (isBridgeEvent(event_name)) {
            await processBridgeTransaction(result, chain, redisClient);
          }
        }
      } catch (error) {
        logger.error(`Error processing Solana account change:`, error);
      }
    },
    {
      filters,
      commitment: 'confirmed',
    }
  );

  logger.info(`Solana listener started for ${contract_address} with subscription ID: ${subscriptionId}`);

  return {
    chain,
    contractAddress: contract_address,
    eventName: event_name,
    subscriptionId,
    type: 'solana',
    stop: async () => {
      try {
        await connection.removeProgramAccountChangeListener(subscriptionId);
        logger.info(`Solana listener for ${contract_address} stopped`);
      } catch (error) {
        logger.error(`Error stopping Solana listener:`, error);
      }
    },
  };
}

/**
 * Start an EVM chain event listener
 *
 * @param {Object} config - Listener configuration
 * @param {Object} redisClient - Redis client for caching and pub/sub
 * @returns {Object} - Listener object
 */
async function startEVMListener(config, redisClient) {
  const { chain, contract_address, event_name, last_block_processed, filter_criteria } = config;

  // Create EVM provider
  const provider = new ethers.providers.JsonRpcProvider(getChainRpcUrl(chain));

  // Get contract ABI (in a real implementation, this would be fetched from somewhere)
  const abi = getContractABI(chain, contract_address);

  // Create contract instance
  const contract = new ethers.Contract(contract_address, abi, provider);

  // Convert filter criteria for EVM
  const filterOptions = {};
  if (filter_criteria && filter_criteria.topics) {
    filterOptions.topics = filter_criteria.topics;
  }

  // Start listening from last_block_processed + 1
  const startBlock = last_block_processed + 1;

  // Set up event listener
  contract.on(event_name, async (...args) => {
    try {
      const event = args[args.length - 1];

      logger.info(`EVM event ${event_name} detected on ${chain}:${contract_address} at block ${event.blockNumber}`);

      // Process the event
      const result = processEVMEvent(args, event_name, filter_criteria);

      if (result) {
        // Save the current block as last processed
        await updateLastProcessedBlock(config.id, event.blockNumber);

        // Publish event to WebSocket
        await publishEvent(
          getEventTypeForChainEvent(event_name),
          result,
          { chain, contractAddress: contract_address },
          redisClient
        );

        // Process transaction if it's a bridge event
        if (isBridgeEvent(event_name)) {
          await processBridgeTransaction(result, chain, redisClient);
        }
      }
    } catch (error) {
      logger.error(`Error processing EVM event:`, error);
    }
  });

  logger.info(`EVM listener started for ${contract_address}.${event_name} from block ${startBlock}`);

  return {
    chain,
    contractAddress: contract_address,
    eventName: event_name,
    type: 'evm',
    stop: () => {
      try {
        contract.removeAllListeners(event_name);
        logger.info(`EVM listener for ${contract_address}.${event_name} stopped`);
      } catch (error) {
        logger.error(`Error stopping EVM listener:`, error);
      }
    },
  };
}

/**
 * Process a Solana account change event
 *
 * @param {Object} accountInfo - Updated account info
 * @param {Object} context - Transaction context
 * @param {string} eventName - Event name being monitored
 * @param {Object} filterCriteria - Filter criteria
 * @returns {Object} - Processed event data
 */
function processSolanaAccountChange(accountInfo, context, eventName, filterCriteria) {
  // This would parse the account data based on event type
  // For this example, we'll return a mock result

  return {
    type: eventName,
    slot: context.slot,
    signature: context.signature,
    accountAddress: accountInfo.accountId.toBase58(),
    timestamp: Date.now(),
    data: {
      // This would be the parsed data
      mockData: 'example',
    },
  };
}

/**
 * Process an EVM chain event
 *
 * @param {Array} args - Event arguments
 * @param {string} eventName - Event name
 * @param {Object} filterCriteria - Filter criteria
 * @returns {Object} - Processed event data
 */
function processEVMEvent(args, eventName, filterCriteria) {
  const event = args[args.length - 1];

  // Extract args based on event name
  // In a full implementation, this would be more sophisticated based on the contract and event

  // For this example, we'll create a generic result
  return {
    type: eventName,
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
    logIndex: event.logIndex,
    timestamp: Date.now(),
    data: {
      // This would include extracted parameters
      args: args.slice(0, args.length - 1).map(arg =>
        typeof arg === 'object' && arg.toString ? arg.toString() : arg
      ),
    },
  };
}

/**
 * Process a bridge transaction
 *
 * @param {Object} eventData - Event data
 * @param {string} chain - Chain
 * @param {Object} redisClient - Redis client
 * @returns {Promise<void>}
 */
async function processBridgeTransaction(eventData, chain, redisClient) {
  logger.info(`Processing bridge transaction on ${chain}: ${JSON.stringify(eventData)}`);

  try {
    // In a real implementation, this would:
    // 1. Identify the bridge operation in the database
    // 2. Update its status
    // 3. Trigger verification if needed
    // 4. Notify users via WebSockets

    // For this example, we'll just simulate this with a delay
    setTimeout(async () => {
      await publishEvent(
        WS_EVENTS.BRIDGE_UPDATED,
        {
          bridgeOperationId: `mock-${Date.now()}`,
          status: 'in_progress',
          transactionHash: eventData.transactionHash || eventData.signature,
          chain,
          timestamp: Date.now(),
        },
        { chain },
        redisClient
      );
    }, 2000);
  } catch (error) {
    logger.error(`Error processing bridge transaction:`, error);
  }
}

/**
 * Update the last processed block for a listener
 *
 * @param {string} listenerId - Listener ID
 * @param {number} blockNumber - Block number
 * @returns {Promise<void>}
 */
async function updateLastProcessedBlock(listenerId, blockNumber) {
  // This would typically update the database
  // For this example, we'll just log it
  logger.info(`Updating last processed block for listener ${listenerId} to ${blockNumber}`);
}

/**
 * Get WebSocket event type for a chain event
 *
 * @param {string} eventName - Chain event name
 * @returns {string} - WebSocket event type
 */
function getEventTypeForChainEvent(eventName) {
  // Map chain event names to WebSocket event types
  const eventMap = {
    'SendToChain': WS_EVENTS.BRIDGE_INITIATED,
    'ReceiveFromChain': WS_EVENTS.BRIDGE_COMPLETED,
    'Transfer': WS_EVENTS.NFT_TRANSFERRED,
    'Mint': WS_EVENTS.NFT_MINTED,
  };

  return eventMap[eventName] || 'chain:event';
}

/**
 * Check if an event is a bridge event
 *
 * @param {string} eventName - Event name
 * @returns {boolean} - Whether it's a bridge event
 */
function isBridgeEvent(eventName) {
  const bridgeEvents = ['SendToChain', 'ReceiveFromChain'];
  return bridgeEvents.includes(eventName);
}

/**
 * Get RPC URL for a specific chain
 *
 * @param {string} chain - Chain identifier
 * @returns {string} - RPC URL
 */
function getChainRpcUrl(chain) {
  // This would typically come from environment variables or config
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
 * Get ABI for a contract
 *
 * @param {string} chain - Chain identifier
 * @param {string} contractAddress - Contract address
 * @returns {Array} - Contract ABI
 */
function getContractABI(chain, contractAddress) {
  // In a real implementation, this would fetch the ABI from a database or config
  // For this example, we'll return a basic ABI with common events
  return [
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event SendToChain(uint16 indexed _dstChainId, bytes indexed _to, uint256 indexed _tokenId)',
    'event ReceiveFromChain(uint16 indexed _srcChainId, bytes indexed _from, uint256 indexed _tokenId)',
  ];
}

/**
 * Stop all active listeners
 */
async function stopAllListeners() {
  logger.info(`Stopping ${activeListeners.size} chain listeners`);

  for (const [key, listener] of activeListeners.entries()) {
    try {
      await listener.stop();
      activeListeners.delete(key);
    } catch (error) {
      logger.error(`Error stopping listener ${key}:`, error);
    }
  }

  logger.info('All chain listeners stopped');
}

module.exports = {
  initializeChainListeners,
  startChainListener,
  stopAllListeners,
};
