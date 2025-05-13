/**
 * @file user.js
 * @description GraphQL schema for user-related types and operations
 */

const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    walletAddresses: WalletAddresses!
    emailVerified: Boolean!
    avatarUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type WalletAddresses {
    solana: String
    ethereum: String
    polygon: String
    arbitrum: String
    optimism: String
    avalanche: String
    binanceSmartChain: String
  }

  input WalletAddressesInput {
    solana: String
    ethereum: String
    polygon: String
    arbitrum: String
    optimism: String
    avalanche: String
    binanceSmartChain: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
  }

  extend type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      walletAddresses: WalletAddressesInput
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    updateUser(
      username: String
      email: String
      walletAddresses: WalletAddressesInput
      avatarUrl: String
    ): User!

    updatePassword(
      currentPassword: String!
      newPassword: String!
    ): Boolean!

    verifyEmail(
      token: String!
    ): Boolean!

    requestPasswordReset(
      email: String!
    ): Boolean!

    resetPassword(
      token: String!
      newPassword: String!
    ): Boolean!

    deleteAccount: Boolean!
  }
`;
