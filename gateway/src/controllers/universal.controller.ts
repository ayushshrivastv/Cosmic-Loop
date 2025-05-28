/**
 * Universal Controller
 * 
 * This controller handles universal queries using the prompt library
 * to generate appropriate prompts for different types of questions.
 */
import { Request, Response } from 'express';
import { promptLibraryService } from '../services/prompt-library.service';
import perplexityService from '../services/perplexity.service';
import logger from '../utils/logger';

/**
 * Handle universal query requests
 */
export const universalQuery = async (req: Request, res: Response) => {
  try {
    const { query, model, max_tokens, temperature } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Query is required'
      });
    }

    logger.info('Universal query request received', {
      clientId: req.clientId,
      queryLength: query.length
    });

    // Process the query using the prompt library
    const { systemPrompt, userPrompt } = promptLibraryService.processQuery(query);

    logger.debug('Generated prompts for query', {
      templateDetected: true,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length
    });

    // Send request to Perplexity API
    const response = await perplexityService.sendRequest(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        model,
        max_tokens,
        temperature
      }
    );

    // Extract the assistant's message from the response
    const assistantMessage = response.choices[0].message.content;
    
    // Return a response with metadata about the template used
    return res.status(200).json({
      id: response.id,
      text: assistantMessage,
      model: response.model,
      usage: response.usage,
      citations: response.citations || [],
      metadata: {
        promptEngineered: true,
        systemPromptPreview: systemPrompt.substring(0, 100) + '...',
        detectedIntent: promptLibraryService.detectTemplate(query)
      }
    });
  } catch (error) {
    logger.error('Error in universal query', {
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
 * Get all available prompt templates
 */
export const getPromptTemplates = async (req: Request, res: Response) => {
  try {
    const templates = promptLibraryService.getAllTemplates().map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags,
      parameters: template.parameters
    }));
    
    return res.status(200).json({
      templates
    });
  } catch (error) {
    logger.error('Error fetching prompt templates', {
      error: (error as Error).message
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching prompt templates'
    });
  }
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const templates = promptLibraryService.getTemplatesByCategory(category).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags,
      parameters: template.parameters
    }));
    
    return res.status(200).json({
      category,
      templates
    });
  } catch (error) {
    logger.error('Error fetching templates by category', {
      error: (error as Error).message,
      category: req.params.category
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching templates by category'
    });
  }
};

/**
 * Get a specific prompt template
 */
export const getPromptTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = promptLibraryService.getTemplate(id);
    
    if (!template) {
      return res.status(404).json({
        error: 'Not found',
        message: `Template with ID '${id}' not found`
      });
    }
    
    return res.status(200).json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        parameters: template.parameters,
        systemPromptPreview: template.systemPrompt.substring(0, 200) + '...',
        userPromptTemplate: template.userPromptTemplate
      }
    });
  } catch (error) {
    logger.error('Error fetching prompt template', {
      error: (error as Error).message,
      templateId: req.params.id
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching the prompt template'
    });
  }
};

/**
 * Use a specific template with parameters
 */
export const usePromptTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parameters = req.body;
    
    const template = promptLibraryService.getTemplate(id);
    
    if (!template) {
      return res.status(404).json({
        error: 'Not found',
        message: `Template with ID '${id}' not found`
      });
    }
    
    // Generate prompts using the template
    const { systemPrompt, userPrompt } = promptLibraryService.useTemplate(id, parameters);
    
    return res.status(200).json({
      templateId: id,
      templateName: template.name,
      systemPrompt,
      userPrompt,
      parameters
    });
  } catch (error) {
    logger.error('Error using prompt template', {
      error: (error as Error).message,
      templateId: req.params.id,
      parameters: req.body
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while using the prompt template'
    });
  }
};
