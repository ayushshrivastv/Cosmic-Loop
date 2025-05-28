import { Request, Response } from 'express';
import perplexityService, { PerplexityMessage } from '../services/perplexity.service';
import logger from '../utils/logger';

/**
 * Handle chat completion requests
 */
export const chatCompletion = async (req: Request, res: Response) => {
  try {
    const { 
      messages,
      model,
      max_tokens,
      temperature,
      top_p,
      presence_penalty,
      stream
    } = req.body;

    logger.info('Chat completion request received', {
      clientId: req.clientId,
      messageCount: messages.length,
      model
    });

    // Send request to Perplexity API
    const response = await perplexityService.sendRequest(
      messages,
      {
        model,
        max_tokens,
        temperature,
        top_p,
        presence_penalty,
        stream
      }
    );

    // Extract the assistant's message from the response
    const assistantMessage = response.choices[0].message.content;
    
    // Return a simplified response to the client
    return res.status(200).json({
      id: response.id,
      text: assistantMessage,
      model: response.model,
      usage: response.usage,
      citations: response.citations || []
    });
  } catch (error) {
    logger.error('Error in chat completion', {
      error: (error as Error).message,
      stack: (error as Error).stack
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    });
  }
};

/**
 * Handle text completion requests (simpler interface than chat)
 */
export const textCompletion = async (req: Request, res: Response) => {
  try {
    const { 
      prompt,
      system_prompt,
      model,
      max_tokens,
      temperature,
      top_p,
      presence_penalty,
      stream
    } = req.body;

    logger.info('Text completion request received', {
      clientId: req.clientId,
      promptLength: prompt.length,
      model
    });

    // Convert simple prompt to chat messages format
    const messages: PerplexityMessage[] = [];
    
    // Add system prompt if provided
    if (system_prompt) {
      messages.push({
        role: 'system',
        content: system_prompt
      });
    }
    
    // Add user prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    // Send request to Perplexity API
    const response = await perplexityService.sendRequest(
      messages,
      {
        model,
        max_tokens,
        temperature,
        top_p,
        presence_penalty,
        stream
      }
    );

    // Extract the assistant's message from the response
    const assistantMessage = response.choices[0].message.content;
    
    // Return a simplified response for text completion
    return res.status(200).json({
      id: response.id,
      text: assistantMessage,
      model: response.model,
      usage: response.usage,
      citations: response.citations || []
    });
  } catch (error) {
    logger.error('Error in text completion', {
      error: (error as Error).message,
      stack: (error as Error).stack
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    });
  }
};

/**
 * Get available models
 */
export const getModels = async (req: Request, res: Response) => {
  try {
    const models = await perplexityService.getModels();
    
    return res.status(200).json({
      models
    });
  } catch (error) {
    logger.error('Error fetching models', {
      error: (error as Error).message
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching available models'
    });
  }
};
