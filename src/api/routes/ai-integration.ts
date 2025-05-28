/**
 * AI Integration API Routes
 * Provides endpoints for accessing the integrated AI services
 */

import express, { Request, Response } from 'express';
import { integrationService } from '../integration/service';

const router = express.Router();

/**
 * @route POST /api/ai/search-summarize
 * @description Generate an integrated response using Perplexity for search and Gemini for summarization
 * @access Public
 */
router.post('/search-summarize', async (req: Request, res: Response) => {
  try {
    const { query, includeSourceData, additionalContext } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Valid query is required' });
    }

    const response = await integrationService.generateIntegratedResponse(query, {
      includeSourceData: !!includeSourceData,
      additionalContext
    });

    return res.json(response);
  } catch (error) {
    console.error('Error in search-summarize endpoint:', error);
    return res.status(500).json({ error: 'Server error processing request' });
  }
});

/**
 * @route POST /api/ai/search
 * @description Generate a response using only Perplexity search
 * @access Public
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, includeSourceData, additionalContext } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Valid query is required' });
    }

    const response = await integrationService.generateSearchOnlyResponse(query, {
      includeSourceData: !!includeSourceData,
      additionalContext
    });

    return res.json(response);
  } catch (error) {
    console.error('Error in search endpoint:', error);
    return res.status(500).json({ error: 'Server error processing request' });
  }
});

/**
 * @route POST /api/ai/summarize
 * @description Generate a summary using only Gemini
 * @access Public
 */
router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { content, includeSourceData, additionalContext } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Valid content is required' });
    }

    const response = await integrationService.generateSummaryOnlyResponse(content, {
      includeSourceData: !!includeSourceData,
      additionalContext
    });

    return res.json(response);
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    return res.status(500).json({ error: 'Server error processing request' });
  }
});

/**
 * @route GET /api/ai/stream/search-summarize
 * @description Stream an integrated response using SSE
 * @access Public
 */
router.get('/stream/search-summarize', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const additionalContext = req.query.context as string | undefined;

    if (!query) {
      return res.status(400).json({ error: 'Valid query parameter is required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Function to send SSE data
    const sendData = (data: string) => {
      res.write(`data: ${data}\n\n`);
    };

    // First get search results
    const searchResponse = await integrationService.generateSearchOnlyResponse(query, {
      additionalContext
    });

    sendData(JSON.stringify({ type: 'search_complete', data: 'Search complete, generating summary...' }));

    // Then stream the summary
    await integrationService.generateSummaryOnlyResponse(searchResponse.text, {
      streamResponse: true,
      onUpdate: (chunk) => {
        sendData(JSON.stringify({ type: 'chunk', data: chunk }));
      },
      additionalContext
    });

    sendData(JSON.stringify({ type: 'done', data: 'Stream complete' }));
    res.end();
  } catch (error) {
    console.error('Error in streaming endpoint:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', data: 'Server error processing request' })}\n\n`);
    res.end();
  }
});

export default router;
