/**
 * @file ai-agent/embeddings.js
 * @description Utilities for creating and managing embeddings for the AI agent
 */

const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Create an embedding for a text string
 * @param {string} text - The text to create an embedding for
 * @returns {Array<number>} - The embedding vector
 */
const createEmbedding = async (text) => {
  try {
    // Get API key and endpoint from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const endpoint = 'https://api.openai.com/v1/embeddings';

    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Call OpenAI API to create embedding
    const response = await axios.post(endpoint, {
      input: text,
      model: 'text-embedding-ada-002', // Use latest model available
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    // Extract and return the embedding vector
    return response.data.data[0].embedding;
  } catch (error) {
    logger.error('Error creating embedding', error);
    throw new Error(`Failed to create embedding: ${error.message}`);
  }
};

/**
 * Index a document by creating embeddings and storing in vector database
 * @param {string} text - The text to index
 * @param {Object} metadata - Metadata associated with the text
 * @param {Object} pineconeClient - Initialized Pinecone client
 * @param {string} indexName - Name of the Pinecone index
 * @returns {string} - The ID of the indexed document
 */
const indexDocument = async (text, metadata, pineconeClient, indexName) => {
  try {
    // Create embedding for the text
    const embedding = await createEmbedding(text);

    // Generate a unique ID for the document
    const id = `doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    // Store the embedding in Pinecone
    const index = pineconeClient.index(indexName);
    await index.upsert([{
      id,
      values: embedding,
      metadata: {
        ...metadata,
        text,
      },
    }]);

    return id;
  } catch (error) {
    logger.error('Error indexing document', error);
    throw new Error(`Failed to index document: ${error.message}`);
  }
};

/**
 * Batch index multiple documents
 * @param {Array<Object>} documents - Array of {text, metadata} objects to index
 * @param {Object} pineconeClient - Initialized Pinecone client
 * @param {string} indexName - Name of the Pinecone index
 * @returns {Array<string>} - Array of document IDs
 */
const batchIndexDocuments = async (documents, pineconeClient, indexName) => {
  try {
    // Process documents in batches to avoid rate limits
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      // Create embeddings for all texts in the batch
      const embeddingPromises = batch.map(doc => createEmbedding(doc.text));
      const embeddings = await Promise.all(embeddingPromises);

      // Prepare vectors for Pinecone
      const vectors = embeddings.map((embedding, index) => ({
        id: `batch_${Date.now()}_${i + index}`,
        values: embedding,
        metadata: {
          ...batch[index].metadata,
          text: batch[index].text,
        },
      }));

      // Upsert vectors to Pinecone
      const index = pineconeClient.index(indexName);
      await index.upsert(vectors);

      // Collect document IDs
      results.push(...vectors.map(v => v.id));
    }

    return results;
  } catch (error) {
    logger.error('Error batch indexing documents', error);
    throw new Error(`Failed to batch index documents: ${error.message}`);
  }
};

module.exports = {
  createEmbedding,
  indexDocument,
  batchIndexDocuments,
};
