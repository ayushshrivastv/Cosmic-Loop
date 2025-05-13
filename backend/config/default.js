/**
 * @file default.js
 * @description Default configuration for the backend services
 */

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  },

  // Database configuration
  database: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'cosmic_loop',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? true : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: '../database/migrations',
    },
    seeds: {
      directory: '../database/seeders',
    },
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0,
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  // Layer Zero configuration
  layerZero: {
    endpoints: {
      solana: 'https://devnet-endpoint.layerzero.network/solana',
      ethereum: 'https://testnet-endpoint.layerzero.network/ethereum',
      polygon: 'https://testnet-endpoint.layerzero.network/polygon',
      arbitrum: 'https://testnet-endpoint.layerzero.network/arbitrum',
      optimism: 'https://testnet-endpoint.layerzero.network/optimism',
      avalanche: 'https://testnet-endpoint.layerzero.network/avalanche',
      binanceSmartChain: 'https://testnet-endpoint.layerzero.network/bsc',
    },
    rpcEndpoints: {
      solana: process.env.SOLANA_RPC || 'https://api.devnet.solana.com',
      ethereum: process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth_goerli',
      polygon: process.env.POLYGON_RPC || 'https://rpc.ankr.com/polygon_mumbai',
      arbitrum: process.env.ARBITRUM_RPC || 'https://goerli-rollup.arbitrum.io/rpc',
      optimism: process.env.OPTIMISM_RPC || 'https://goerli.optimism.io',
      avalanche: process.env.AVALANCHE_RPC || 'https://api.avax-test.network/ext/bc/C/rpc',
      binanceSmartChain: process.env.BSC_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    },
    contracts: {
      solana: {
        nftBridge: process.env.SOLANA_NFT_BRIDGE || 'soLzBridgeAddressV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
      ethereum: {
        nftBridge: process.env.ETHEREUM_NFT_BRIDGE || '0xEthBridgeAddressV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
      polygon: {
        nftBridge: process.env.POLYGON_NFT_BRIDGE || '0xPolBridgeAddressV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
      arbitrum: {
        nftBridge: process.env.ARBITRUM_NFT_BRIDGE || '0xArbBridgeAddressV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
      optimism: {
        nftBridge: process.env.OPTIMISM_NFT_BRIDGE || '0xOptBridgeAddressV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
      avalanche: {
        nftBridge: process.env.AVALANCHE_NFT_BRIDGE || '0xAvaBridgeAddressV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
      binanceSmartChain: {
        nftBridge: process.env.BSC_NFT_BRIDGE || '0xBscBridgeAddressV2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
    },
  },

  // GraphQL configuration
  graphql: {
    path: '/graphql',
    playground: process.env.NODE_ENV !== 'production',
    introspection: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
  },

  // WebSocket configuration
  websocket: {
    path: '/ws',
    pingInterval: 30000, // 30 seconds
    pingTimeout: 5000, // 5 seconds
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  },
};
