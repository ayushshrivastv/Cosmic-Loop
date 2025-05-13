/**
 * @file scalars.js
 * @description GraphQL custom scalar type resolvers
 */

const { GraphQLScalarType, Kind } = require('graphql');

// JSONObject scalar type resolver
const JSONObject = new GraphQLScalarType({
  name: 'JSONObject',
  description: 'A JSON object custom scalar type',

  // Convert outgoing data to JSON
  serialize(value) {
    if (typeof value === 'object') {
      return value;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  },

  // Parse incoming data from variables
  parseValue(value) {
    if (typeof value === 'object') {
      return value;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  },

  // Parse incoming data from literal in query
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch (error) {
        return null;
      }
    }
    if (ast.kind === Kind.OBJECT) {
      const value = Object.create(null);
      ast.fields.forEach(field => {
        value[field.name.value] = parseLiteral(field.value);
      });
      return value;
    }
    return null;
  },
});

// Helper function to parse literal AST values
function parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.OBJECT:
      const value = Object.create(null);
      ast.fields.forEach(field => {
        value[field.name.value] = parseLiteral(field.value);
      });
      return value;
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

module.exports = {
  JSONObject,
};
