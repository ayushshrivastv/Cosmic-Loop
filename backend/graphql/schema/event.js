/**
 * @file event.js
 * @description GraphQL schema for event and token distribution related types and operations
 */

const { gql } = require('apollo-server-express');

module.exports = gql`
  enum EventStatus {
    DRAFT
    ACTIVE
    COMPLETED
    CANCELLED
  }

  type Event {
    id: ID!
    name: String!
    description: String
    creator: User
    targetChains: [Chain!]!
    nftCollection: NFTCollection
    maxParticipants: Int
    startDate: String!
    endDate: String!
    distributionRules: JSONObject
    status: EventStatus!
    participants: [EventParticipant!]
    createdAt: String!
    updatedAt: String!
  }

  type EventParticipant {
    id: ID!
    event: Event!
    user: User
    walletAddress: String!
    hasClaimed: Boolean!
    claimedNft: NFT
    claimedAt: String
    claimTransactionHash: String
    createdAt: String!
    updatedAt: String!
  }

  type EventStatistics {
    eventId: ID!
    totalParticipants: Int!
    claimedNFTs: Int!
    pendingClaims: Int!
    participantsByChain: [ChainDistribution!]!
  }

  type ChainDistribution {
    chain: Chain!
    count: Int!
    percentage: Float!
  }

  input DistributionRulesInput {
    allowedChains: [Chain!]
    requiresVerification: Boolean
    limitPerWallet: Int
    startDate: String
    endDate: String
    customRules: JSONObject
  }

  extend type Query {
    event(id: ID!): Event
    events(
      status: EventStatus
      creatorId: ID
      limit: Int
      offset: Int
    ): [Event!]!

    activeEvents(
      chain: Chain
      limit: Int
      offset: Int
    ): [Event!]!

    eventParticipant(id: ID!): EventParticipant
    eventParticipants(
      eventId: ID!
      hasClaimed: Boolean
      limit: Int
      offset: Int
    ): [EventParticipant!]!

    eventStatistics(eventId: ID!): EventStatistics!

    eventsByParticipant(
      walletAddress: String!
      limit: Int
      offset: Int
    ): [Event!]!

    isEligibleForEvent(
      eventId: ID!
      walletAddress: String!
    ): Boolean!
  }

  extend type Mutation {
    createEvent(
      name: String!
      description: String
      nftCollectionId: ID!
      targetChains: [Chain!]!
      maxParticipants: Int
      startDate: String!
      endDate: String!
      distributionRules: DistributionRulesInput
    ): Event!

    updateEvent(
      id: ID!
      name: String
      description: String
      targetChains: [Chain!]
      maxParticipants: Int
      startDate: String
      endDate: String
      distributionRules: DistributionRulesInput
      status: EventStatus
    ): Event!

    cancelEvent(
      id: ID!
    ): Event!

    registerForEvent(
      eventId: ID!
      walletAddress: String!
    ): EventParticipant!

    claimEventNFT(
      eventId: ID!
      walletAddress: String!
      chain: Chain!
    ): EventParticipant!

    batchDistributeNFTs(
      eventId: ID!
      participantIds: [ID!]!
      chain: Chain!
    ): [EventParticipant!]!
  }

  extend type Subscription {
    eventStatusUpdated(eventId: ID!): Event!
    eventParticipantAdded(eventId: ID!): EventParticipant!
    nftClaimed(eventId: ID): EventParticipant!
  }
`;
