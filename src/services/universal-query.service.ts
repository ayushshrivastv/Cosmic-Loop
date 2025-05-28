/**
 * Universal Query Service
 * 
 * This service interacts with the Universal Query API in the gateway
 * to provide advanced prompt engineering for a wide range of queries.
 */
import { gatewayClientService } from './gateway-client.service';

// Define types for the universal query
export interface UniversalQueryOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface UniversalQueryResponse {
  id: string;
  text: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  metadata: {
    promptEngineered: boolean;
    systemPromptPreview: string;
    detectedIntent: string;
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  parameters: {
    name: string;
    description: string;
    required: boolean;
    type: string;
    default?: string | number | boolean | Array<unknown>;
  }[];
}

/**
 * Universal Query Service for interacting with the gateway's universal query API
 */
class UniversalQueryService {
  /**
   * Send a universal query to the gateway
   * @param query The user's query
   * @param options Optional parameters for the request
   * @returns The response from the gateway
   */
  async sendQuery(query: string, options: UniversalQueryOptions = {}): Promise<UniversalQueryResponse> {
    try {
      const response = await gatewayClientService.post<UniversalQueryResponse>(
        '/universal',
        {
          query,
          ...options
        }
      );
      
      return response;
    } catch (error) {
      console.error('Error sending universal query:', error);
      throw error;
    }
  }

  /**
   * Get all available prompt templates
   * @returns Array of prompt templates
   */
  async getPromptTemplates(): Promise<PromptTemplate[]> {
    try {
      const response = await gatewayClientService.get<{ templates: PromptTemplate[] }>('/prompt-templates');
      return response.templates;
    } catch (error) {
      console.error('Error fetching prompt templates:', error);
      throw error;
    }
  }

  /**
   * Get templates by category
   * @param category The category to filter by
   * @returns Array of templates in the specified category
   */
  async getTemplatesByCategory(category: string): Promise<PromptTemplate[]> {
    try {
      const response = await gatewayClientService.get<{ templates: PromptTemplate[] }>(
        `/prompt-templates/category/${category}`
      );
      return response.templates;
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }
  }

  /**
   * Get a specific prompt template
   * @param id The template ID
   * @returns The prompt template
   */
  async getPromptTemplate(id: string): Promise<PromptTemplate> {
    try {
      const response = await gatewayClientService.get<{ template: PromptTemplate }>(`/prompt-templates/${id}`);
      return response.template;
    } catch (error) {
      console.error('Error fetching prompt template:', error);
      throw error;
    }
  }

  /**
   * Use a specific template with parameters
   * @param id The template ID
   * @param parameters The parameters to use
   * @returns The generated system and user prompts
   */
  async usePromptTemplate(
    id: string,
    parameters: Record<string, string | number | boolean | Array<unknown>>
  ): Promise<{ systemPrompt: string; userPrompt: string }> {
    try {
      const response = await gatewayClientService.post<{
        systemPrompt: string;
        userPrompt: string;
      }>(`/prompt-templates/${id}/use`, parameters);
      
      return response;
    } catch (error) {
      console.error('Error using prompt template:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const universalQueryService = new UniversalQueryService();
