/**
 * @file nft.js
 * @description GraphQL schema for NFT-related types and operations
 */

const { gql } = require('apollo-server-express');

module.exports = gql`
  enum Chain {
    SOLANA
    ETHEREUM
    POLYGON
    ARBITRUM
    OPTIMISM
    AVALANCHE
    BINANCE_SMART_CHAIN
  }

  type NFTCollection {
    id: ID!
    name: String!
    description: String
    symbol: String!
    creatorAddress: String!
    creator: User
    baseUri: String
    maxSupply: Int
    metadata: JSONObject
    nfts: [NFT!]
    createdAt: String!
    updatedAt: String!
  }

  type NFT {
    id: ID!
    collection: NFTCollection!
    tokenId: Int!
    ownerAddress: String!
    owner: User
    uri: String!
    metadata: JSONObject
    chain: Chain!
    contractAddress: String!
    isCompressed: Boolean!
    bridgeOperations: [BridgeOperation!]
    verificationProofs: [VerificationProof!]
    createdAt: String!
    updatedAt: String!
  }

  input NFTMetadataInput {
    name: String!
    description: String
    image: String
    externalUrl: String
    attributes: [NFTAttributeInput!]
  }

  input NFTAttributeInput {
    traitType: String!
    value: String!
  }

  # Generic JSON object type
  scalar JSONObject

  extend type Query {
    nftCollection(id: ID!): NFTCollection
    nftCollections(
      limit: Int
      offset: Int
      creatorId: ID
      chain: Chain
    ): [NFTCollection!]!

    nft(id: ID!): NFT
    nfts(
      limit: Int
      offset: Int
      collectionId: ID
      ownerAddress: String
      chain: Chain
    ): [NFT!]!

    nftsByOwner(
      ownerAddress: String!
      chain: Chain
      limit: Int
      offset: Int
    ): [NFT!]!
  }

  extend type Mutation {
    createNFTCollection(
      name: String!
      description: String
      symbol: String!
      creatorAddress: String!
      baseUri: String
      maxSupply: Int
      metadata: JSONObject
    ): NFTCollection!

    updateNFTCollection(
      id: ID!
      name: String
      description: String
      baseUri: String
      maxSupply: Int
      metadata: JSONObject
    ): NFTCollection!

    mintNFT(
      collectionId: ID!
      ownerAddress: String!
      metadata: NFTMetadataInput!
      chain: Chain!
      isCompressed: Boolean
    ): NFT!

    mintBatchNFTs(
      collectionId: ID!
      ownerAddresses: [String!]!
      metadataArray: [NFTMetadataInput!]!
      chain: Chain!
      isCompressed: Boolean
    ): [NFT!]!

    transferNFT(
      nftId: ID!
      fromAddress: String!
      toAddress: String!
    ): NFT!

    burnNFT(
      nftId: ID!
      ownerAddress: String!
    ): Boolean!
  }

  extend type Subscription {
    nftMinted(collectionId: ID): NFT!
    nftTransferred(nftId: ID): NFT!
  }
`;
