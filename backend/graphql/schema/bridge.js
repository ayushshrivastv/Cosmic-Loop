/**
 * @file bridge.js
 * @description GraphQL schema for bridge-related types and operations
 */

const { gql } = require('apollo-server-express');

module.exports = gql`
  enum BridgeStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    FAILED
  }

  type BridgeOperation {
    id: ID!
    nft: NFT!
    sourceChain: Chain!
    sourceAddress: String!
    destinationChain: Chain!
    destinationAddress: String!
    sourceTransactionHash: String
    destinationTransactionHash: String
    layerzeroMessageHash: String
    status: BridgeStatus!
    errorMessage: String
    completedAt: String
    gasFee: Int
    feeToken: String
    verificationProofs: [VerificationProof!]
    createdAt: String!
    updatedAt: String!
  }

  type VerificationProof {
    id: ID!
    nft: NFT!
    bridgeOperation: BridgeOperation!
    proofType: String!
    proofData: String!
    isVerified: Boolean!
    verificationDetails: JSONObject
    createdAt: String!
    updatedAt: String!
  }

  type BridgeFeeEstimate {
    sourceChain: Chain!
    destinationChain: Chain!
    estimatedFee: Float!
    feeToken: String!
    estimatedTimeSeconds: Int!
  }

  type ChainInfo {
    chain: Chain!
    name: String!
    logo: String!
    isEVM: Boolean!
    rpcEndpoint: String!
    explorerUrl: String!
    nativeToken: String!
    isSupported: Boolean!
  }

  extend type Query {
    bridgeOperation(id: ID!): BridgeOperation
    bridgeOperations(
      nftId: ID
      sourceChain: Chain
      destinationChain: Chain
      status: BridgeStatus
      limit: Int
      offset: Int
    ): [BridgeOperation!]!

    bridgeOperationsByUser(
      userAddress: String!
      status: BridgeStatus
      limit: Int
      offset: Int
    ): [BridgeOperation!]!

    estimateBridgeFee(
      sourceChain: Chain!
      destinationChain: Chain!
      nftId: ID!
    ): BridgeFeeEstimate!

    verificationProof(id: ID!): VerificationProof
    verificationProofs(
      bridgeOperationId: ID!
    ): [VerificationProof!]!

    supportedChains: [ChainInfo!]!
  }

  extend type Mutation {
    bridgeNFT(
      nftId: ID!
      sourceChain: Chain!
      sourceAddress: String!
      destinationChain: Chain!
      destinationAddress: String!
    ): BridgeOperation!

    confirmBridgeOperation(
      bridgeOperationId: ID!
      destinationTransactionHash: String!
    ): BridgeOperation!

    retryFailedBridge(
      bridgeOperationId: ID!
    ): BridgeOperation!

    verifyProof(
      proofId: ID!
    ): VerificationProof!

    addVerificationProof(
      bridgeOperationId: ID!
      proofType: String!
      proofData: String!
    ): VerificationProof!
  }

  extend type Subscription {
    bridgeOperationUpdated(
      bridgeOperationId: ID
      userAddress: String
    ): BridgeOperation!

    bridgeProofVerified(
      bridgeOperationId: ID!
    ): VerificationProof!
  }
`;
