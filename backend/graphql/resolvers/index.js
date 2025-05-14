/**
 * @file index.js
 * @description GraphQL resolver index file that combines all resolver modules
 */

const userResolvers = require('./user');
const nftResolvers = require('./nft');
const bridgeResolvers = require('./bridge');
const eventResolvers = require('./event');
const aiAssistantResolvers = require('./ai-assistant');
const scalarResolvers = require('./scalars');

// Combine all resolvers
module.exports = {
  // Scalar resolvers
  ...scalarResolvers,

  // Query resolvers
  Query: {
    ...userResolvers.Query,
    ...nftResolvers.Query,
    ...bridgeResolvers.Query,
    ...eventResolvers.Query,
    ...aiAssistantResolvers.Query,
  },

  // Mutation resolvers
  Mutation: {
    ...userResolvers.Mutation,
    ...nftResolvers.Mutation,
    ...bridgeResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...aiAssistantResolvers.Mutation,
  },

  // Subscription resolvers
  Subscription: {
    ...nftResolvers.Subscription,
    ...bridgeResolvers.Subscription,
    ...eventResolvers.Subscription,
    ...aiAssistantResolvers.Subscription,
  },

  // Type resolvers
  User: userResolvers.User,
  NFTCollection: nftResolvers.NFTCollection,
  NFT: nftResolvers.NFT,
  BridgeOperation: bridgeResolvers.BridgeOperation,
  VerificationProof: bridgeResolvers.VerificationProof,
  Event: eventResolvers.Event,
  EventParticipant: eventResolvers.EventParticipant,
  // AI Assistant types can be added here if needed
};
