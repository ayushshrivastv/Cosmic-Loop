/**
 * @file graphql/schema/ai-assistant.js
 * @description GraphQL schema for the AI assistant
 */

const aiAssistantSchema = `
  # UI component types that can be rendered in the chat
  enum ComponentType {
    TEXT
    CODE
    DATA
    TABLE
    CHART
    TOKEN
    LINK
  }

  # A generic UI component
  type Component {
    type: ComponentType!
    content: String
    data: JSON
    headers: [String]
    address: String
    url: String
  }

  # AI assistant response
  type AiResponse {
    text: String!
    components: [Component]
    error: String
  }

  # Chart type options
  enum ChartType {
    LINE
    BAR
    PIE
    AREA
  }

  # Data for charts
  type ChartData {
    type: ChartType!
    title: String
    labels: [String!]!
    datasets: [JSON!]!
  }

  # NFT statistics
  type NftStats {
    collection: String
    totalMinted: Int
    totalBurned: Int
    totalTransferred: Int
    activeCount: Int
    floorPrice: Float
    averagePrice: Float
    volumeLast24h: Float
    volumeLast7d: Float
    error: String
  }

  # Bridge statistics
  type BridgeStats {
    outboundCount: Int
    inboundCount: Int
    totalVolume: Float
    chainCounts: JSON
    topDestinations: [String]
    error: String
  }

  # Marketplace statistics
  type MarketplaceStats {
    listingCount: Int
    saleCount: Int
    bidCount: Int
    totalVolume: Float
    marketplaceCounts: JSON
    error: String
  }

  # Chain statistics
  type ChainStats {
    blockHeight: Int
    tps: Float
    activeWallets: Int
    dailyTransactions: Int
    marketCap: Float
    price: Float
    error: String
  }

  # Message in a chat conversation
  type ChatMessage {
    id: ID!
    role: String!
    content: String!
    timestamp: String!
    components: [Component]
  }

  # Chat conversation
  type ChatConversation {
    id: ID!
    title: String
    messages: [ChatMessage!]!
    createdAt: String!
    updatedAt: String!
  }

  # Input for chat message
  input ChatMessageInput {
    role: String!
    content: String!
  }

  # Query type
  extend type Query {
    # Get AI assistant response for a question
    askAssistant(question: String!, conversationId: ID): AiResponse!

    # Get NFT statistics
    getNftStats(collection: String!): NftStats!

    # Get bridge statistics
    getBridgeStats: BridgeStats!

    # Get marketplace statistics
    getMarketplaceStats: MarketplaceStats!

    # Get chain statistics
    getChainStats: ChainStats!

    # Get user's chat conversations
    getChatConversations: [ChatConversation!]!

    # Get a specific chat conversation
    getChatConversation(id: ID!): ChatConversation
  }

  # Mutation type
  extend type Mutation {
    # Create a new chat conversation
    createChatConversation(title: String): ChatConversation!

    # Add a message to a chat conversation
    addChatMessage(conversationId: ID!, message: ChatMessageInput!): ChatMessage!

    # Update conversation title
    updateConversationTitle(conversationId: ID!, title: String!): ChatConversation!

    # Delete a chat conversation
    deleteChatConversation(id: ID!): Boolean!
  }

  # Subscription type
  extend type Subscription {
    # Subscribe to new chat messages
    onChatMessageAdded(conversationId: ID!): ChatMessage!
  }
`;

module.exports = aiAssistantSchema;
