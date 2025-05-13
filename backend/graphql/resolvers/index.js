/**
 * @file index.js
 * @description GraphQL resolver index file that combines all resolver modules
 */

const userResolvers = require('./user');
const nftResolvers = require('./nft');
const bridgeResolvers = require('./bridge');
const eventResolvers = require('./event');
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
  },

  // Mutation resolvers
  Mutation: {
    ...userResolvers.Mutation,
    ...nftResolvers.Mutation,
    ...bridgeResolvers.Mutation,
    ...eventResolvers.Mutation,
  },

  // Subscription resolvers
  Subscription: {
    ...nftResolvers.Subscription,
    ...bridgeResolvers.Subscription,
    ...eventResolvers.Subscription,
  },

  // Type resolvers
  User: userResolvers.User,
  NFTCollection: nftResolvers.NFTCollection,
  NFT: nftResolvers.NFT,
  BridgeOperation: bridgeResolvers.BridgeOperation,
  VerificationProof: bridgeResolvers.VerificationProof,
  Event: eventResolvers.Event,
  EventParticipant: eventResolvers.EventParticipant,
};
