/**
 * @file index.js
 * @description GraphQL schema definitions
 */

const { gql } = require('apollo-server-express');
const userTypeDefs = require('./user');
const nftTypeDefs = require('./nft');
const bridgeTypeDefs = require('./bridge');
const eventTypeDefs = require('./event');
const aiAssistantTypeDefs = require('./ai-assistant');

// Base schema with Query and Mutation types
const baseTypeDefs = gql`
  # Scalar for complex data
  scalar JSON

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

module.exports = [
  baseTypeDefs,
  userTypeDefs,
  nftTypeDefs,
  bridgeTypeDefs,
  eventTypeDefs,
  aiAssistantTypeDefs,
];
