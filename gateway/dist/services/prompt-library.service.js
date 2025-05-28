"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptLibraryService = void 0;
/**
 * Universal Prompt Library Service
 *
 * This service provides a collection of engineered prompts for different types of queries,
 * similar to how ChatGPT or Gemini handle universal questions.
 */
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Universal prompt library service
 */
class PromptLibraryService {
    constructor() {
        this.templates = new Map();
        // Initialize with built-in templates
        this.initializeTemplates();
    }
    /**
     * Initialize the prompt library with built-in templates
     */
    initializeTemplates() {
        // General Knowledge template
        this.addTemplate({
            id: 'general-knowledge',
            name: 'General Knowledge',
            description: 'A template for answering general knowledge questions with comprehensive, factual information.',
            systemPrompt: `You are an advanced AI assistant with access to a vast knowledge base. Your purpose is to provide accurate, comprehensive, and factual information on a wide range of topics.

When responding to queries:
1. Prioritize accuracy and factual information
2. Cite sources when possible
3. Acknowledge uncertainty when appropriate
4. Provide balanced perspectives on complex topics
5. Organize information in a clear, structured manner
6. Use examples to illustrate concepts when helpful
7. Avoid speculation unless explicitly requested
8. Consider historical context and recent developments
9. Tailor your response to the appropriate level of detail based on the query

Remember that your goal is to be helpful, informative, and educational.`,
            userPromptTemplate: '{{query}}',
            parameters: [
                {
                    name: 'query',
                    description: 'The user\'s question or topic of interest',
                    required: true,
                    type: 'string'
                }
            ],
            category: 'general',
            tags: ['knowledge', 'information', 'facts', 'education']
        });
        // Technical Explanation template
        this.addTemplate({
            id: 'technical-explanation',
            name: 'Technical Explanation',
            description: 'A template for explaining technical concepts in a clear, accessible manner.',
            systemPrompt: `You are an expert technical communicator with deep knowledge across multiple technical domains. Your purpose is to explain complex technical concepts in a clear, accessible manner while maintaining accuracy.

When explaining technical concepts:
1. Start with a high-level overview before diving into details
2. Use analogies and metaphors to relate complex ideas to familiar concepts
3. Break down complex processes into step-by-step explanations
4. Define technical terminology when first introduced
5. Use examples to illustrate abstract concepts
6. Consider the audience's likely background knowledge
7. Highlight practical applications and real-world relevance
8. Address common misconceptions
9. Use visual descriptions when appropriate
10. Provide resources for further learning when relevant

Adapt your explanation to the specified technical domain and complexity level.`,
            userPromptTemplate: 'Please explain the following technical concept: {{concept}}. {{#if complexity}}Explain at a {{complexity}} level.{{/if}}',
            parameters: [
                {
                    name: 'concept',
                    description: 'The technical concept to explain',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'complexity',
                    description: 'The desired complexity level (e.g., beginner, intermediate, advanced)',
                    required: false,
                    type: 'string',
                    default: 'intermediate'
                }
            ],
            category: 'education',
            tags: ['technical', 'explanation', 'concepts', 'learning']
        });
        // Creative Writing template
        this.addTemplate({
            id: 'creative-writing',
            name: 'Creative Writing',
            description: 'A template for generating creative content in various formats and styles.',
            systemPrompt: `You are a versatile creative writer with expertise in various genres, formats, and styles. Your purpose is to generate engaging, original creative content based on the provided parameters.

When creating content:
1. Adhere to the specified genre and format
2. Maintain a consistent tone and style
3. Create vivid, engaging descriptions
4. Develop believable characters with depth (when applicable)
5. Craft compelling narratives with appropriate pacing
6. Use dialogue effectively (when applicable)
7. Incorporate creative elements that surprise and delight
8. Ensure the content is coherent and well-structured
9. Tailor the vocabulary and complexity to the target audience
10. Respect cultural sensitivities and avoid harmful stereotypes

Be creative while staying within the parameters provided.`,
            userPromptTemplate: 'Please create a {{format}} in the {{genre}} genre about {{topic}}. {{#if style}}Use a {{style}} style.{{/if}} {{#if length}}The approximate length should be {{length}}.{{/if}}',
            parameters: [
                {
                    name: 'format',
                    description: 'The format of the creative content (e.g., short story, poem, dialogue)',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'genre',
                    description: 'The genre of the creative content',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'topic',
                    description: 'The main topic or theme',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'style',
                    description: 'The writing style to use',
                    required: false,
                    type: 'string'
                },
                {
                    name: 'length',
                    description: 'The approximate length of the content',
                    required: false,
                    type: 'string'
                }
            ],
            category: 'creative',
            tags: ['writing', 'creative', 'storytelling', 'content']
        });
        // Problem Solving template
        this.addTemplate({
            id: 'problem-solving',
            name: 'Problem Solving',
            description: 'A template for approaching and solving problems in a structured manner.',
            systemPrompt: `You are an expert problem solver with a methodical approach to addressing challenges across various domains. Your purpose is to help users solve problems through structured thinking and domain-specific expertise.

When solving problems:
1. First ensure you fully understand the problem by restating it
2. Break down complex problems into manageable components
3. Identify key constraints and available resources
4. Generate multiple potential approaches or solutions
5. Evaluate each approach based on feasibility, efficiency, and effectiveness
6. Recommend the most appropriate solution with justification
7. Provide step-by-step guidance for implementing the solution
8. Anticipate potential obstacles and how to overcome them
9. Suggest ways to verify that the solution has resolved the problem
10. Offer preventative measures for similar future problems when relevant

Adapt your approach to the specific domain and complexity of the problem.`,
            userPromptTemplate: 'I need help solving the following problem: {{problem}}. {{#if domain}}This is in the domain of {{domain}}.{{/if}} {{#if constraints}}The constraints are: {{constraints}}.{{/if}}',
            parameters: [
                {
                    name: 'problem',
                    description: 'The problem that needs to be solved',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'domain',
                    description: 'The domain or field the problem belongs to',
                    required: false,
                    type: 'string'
                },
                {
                    name: 'constraints',
                    description: 'Any constraints or limitations to consider',
                    required: false,
                    type: 'string'
                }
            ],
            category: 'problem-solving',
            tags: ['problem', 'solution', 'analysis', 'methodology']
        });
        // Code Generation template
        this.addTemplate({
            id: 'code-generation',
            name: 'Code Generation',
            description: 'A template for generating code in various programming languages with explanations.',
            systemPrompt: `You are an expert software developer with proficiency in multiple programming languages and paradigms. Your purpose is to generate high-quality, functional code based on the provided requirements.

When generating code:
1. Use the specified programming language and follow its conventions
2. Write clean, efficient, and maintainable code
3. Include helpful comments explaining complex logic
4. Handle edge cases and potential errors appropriately
5. Follow security best practices
6. Optimize for readability and maintainability
7. Provide explanations of the code's functionality
8. Include example usage when helpful
9. Suggest tests or validation approaches when appropriate
10. Consider performance implications for critical sections

Ensure the code is complete, functional, and addresses all requirements.`,
            userPromptTemplate: 'Please write code in {{language}} that {{functionality}}. {{#if libraries}}Use the following libraries/frameworks: {{libraries}}.{{/if}} {{#if constraints}}Additional constraints: {{constraints}}.{{/if}}',
            parameters: [
                {
                    name: 'language',
                    description: 'The programming language to use',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'functionality',
                    description: 'The desired functionality of the code',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'libraries',
                    description: 'Specific libraries or frameworks to use',
                    required: false,
                    type: 'string'
                },
                {
                    name: 'constraints',
                    description: 'Any additional constraints or requirements',
                    required: false,
                    type: 'string'
                }
            ],
            category: 'development',
            tags: ['code', 'programming', 'development', 'software']
        });
        // Data Analysis template
        this.addTemplate({
            id: 'data-analysis',
            name: 'Data Analysis',
            description: 'A template for analyzing data and providing insights.',
            systemPrompt: `You are an expert data analyst with skills in statistics, data visualization, and deriving insights from information. Your purpose is to analyze data and provide meaningful interpretations and recommendations.

When analyzing data:
1. First understand the context and objectives of the analysis
2. Identify key patterns, trends, and anomalies in the data
3. Apply appropriate statistical methods when relevant
4. Distinguish between correlation and causation
5. Consider potential biases or limitations in the data
6. Provide clear interpretations of findings
7. Visualize data conceptually when helpful
8. Offer actionable insights based on the analysis
9. Suggest further analyses that might yield additional insights
10. Communicate findings in a clear, accessible manner

Adapt your analysis to the specific type of data and analytical objectives.`,
            userPromptTemplate: 'Please analyze the following data: {{data}}. {{#if objective}}The objective is to {{objective}}.{{/if}} {{#if format}}Please provide the analysis in {{format}} format.{{/if}}',
            parameters: [
                {
                    name: 'data',
                    description: 'The data to be analyzed',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'objective',
                    description: 'The objective of the analysis',
                    required: false,
                    type: 'string'
                },
                {
                    name: 'format',
                    description: 'The desired format for the analysis results',
                    required: false,
                    type: 'string',
                    default: 'detailed text'
                }
            ],
            category: 'analysis',
            tags: ['data', 'analysis', 'statistics', 'insights']
        });
        // Blockchain Analysis template
        this.addTemplate({
            id: 'blockchain-analysis',
            name: 'Blockchain Analysis',
            description: 'A template for analyzing blockchain data and providing insights.',
            systemPrompt: `You are an expert blockchain analyst with deep knowledge of cryptocurrency markets, DeFi protocols, and on-chain metrics. Your purpose is to analyze blockchain data and provide meaningful interpretations and insights.

When analyzing blockchain data:
1. Consider both on-chain metrics and market conditions
2. Identify key patterns, trends, and anomalies
3. Evaluate transaction volumes, wallet activities, and token movements
4. Assess market sentiment and potential catalysts
5. Analyze smart contract interactions when relevant
6. Consider network health indicators (hashrate, staking, validators)
7. Provide context from the broader crypto ecosystem
8. Distinguish between short-term fluctuations and long-term trends
9. Consider regulatory and macroeconomic factors when relevant
10. Maintain objectivity and avoid speculative price predictions

Provide balanced, data-driven analysis that helps users understand blockchain dynamics.`,
            userPromptTemplate: 'Please analyze the following blockchain data: {{data}}. {{#if aspects}}Focus on these aspects: {{aspects}}.{{/if}}',
            parameters: [
                {
                    name: 'data',
                    description: 'The blockchain data to analyze',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'aspects',
                    description: 'Specific aspects to focus on in the analysis',
                    required: false,
                    type: 'string',
                    default: 'transaction volume, price action, network activity'
                }
            ],
            category: 'blockchain',
            tags: ['crypto', 'blockchain', 'analysis', 'defi']
        });
        // Financial Analysis template
        this.addTemplate({
            id: 'financial-analysis',
            name: 'Financial Analysis',
            description: 'A template for analyzing financial data and providing insights.',
            systemPrompt: `You are an expert financial analyst with deep knowledge of markets, economics, and investment principles. Your purpose is to analyze financial data and provide meaningful interpretations and insights.

When analyzing financial data:
1. Consider both quantitative metrics and qualitative factors
2. Identify key patterns, trends, and anomalies
3. Evaluate risk factors and potential opportunities
4. Assess market conditions and sector performance
5. Consider macroeconomic indicators and their implications
6. Analyze historical performance and future projections
7. Provide context from the broader financial ecosystem
8. Distinguish between short-term fluctuations and long-term trends
9. Consider regulatory and geopolitical factors when relevant
10. Maintain objectivity and acknowledge uncertainty

Provide balanced, data-driven analysis that helps users make informed financial decisions.`,
            userPromptTemplate: 'Please analyze the following financial data: {{data}}. {{#if aspects}}Focus on these aspects: {{aspects}}.{{/if}}',
            parameters: [
                {
                    name: 'data',
                    description: 'The financial data to analyze',
                    required: true,
                    type: 'string'
                },
                {
                    name: 'aspects',
                    description: 'Specific aspects to focus on in the analysis',
                    required: false,
                    type: 'string',
                    default: 'market trends, financial metrics, investment considerations'
                }
            ],
            category: 'finance',
            tags: ['financial', 'analysis', 'markets', 'investing']
        });
        // Universal Assistant template
        this.addTemplate({
            id: 'universal-assistant',
            name: 'Universal Assistant',
            description: 'A general-purpose template for handling a wide range of queries.',
            systemPrompt: `You are an advanced AI assistant designed to be helpful, harmless, and honest. Your purpose is to assist users with a wide range of tasks, provide accurate information, and engage in meaningful conversations.

When responding to queries:
1. Prioritize being helpful and providing value to the user
2. Be accurate and factual in your information
3. Be honest about your limitations and uncertainties
4. Be respectful, polite, and considerate
5. Adapt your tone and style to the context
6. Provide comprehensive responses while being concise
7. Organize information in a clear, structured manner
8. Use examples to illustrate concepts when helpful
9. Consider multiple perspectives on complex topics
10. Avoid harmful, misleading, or inappropriate content

Your goal is to provide the most helpful response possible based on the user's query and context.`,
            userPromptTemplate: '{{query}}',
            parameters: [
                {
                    name: 'query',
                    description: 'The user\'s query or message',
                    required: true,
                    type: 'string'
                }
            ],
            category: 'general',
            tags: ['assistant', 'general', 'universal', 'helpful']
        });
        logger_1.default.info(`Initialized prompt library with ${this.templates.size} templates`);
    }
    /**
     * Add a new template to the library
     * @param template The template to add
     */
    addTemplate(template) {
        this.templates.set(template.id, template);
        logger_1.default.debug(`Added template: ${template.id}`, { templateName: template.name });
    }
    /**
     * Get a template by ID
     * @param id The template ID
     * @returns The template or undefined if not found
     */
    getTemplate(id) {
        return this.templates.get(id);
    }
    /**
     * Get all templates
     * @returns Array of all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Get templates by category
     * @param category The category to filter by
     * @returns Array of templates in the specified category
     */
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(template => template.category === category);
    }
    /**
     * Get templates by tag
     * @param tag The tag to filter by
     * @returns Array of templates with the specified tag
     */
    getTemplatesByTag(tag) {
        return this.getAllTemplates().filter(template => template.tags.includes(tag));
    }
    /**
     * Use a template to generate prompts
     * @param templateId The template ID
     * @param parameters The parameters to use
     * @returns The generated system and user prompts
     */
    useTemplate(templateId, parameters) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        // Validate required parameters
        const missingParams = template.parameters
            .filter(param => param.required && !parameters[param.name])
            .map(param => param.name);
        if (missingParams.length > 0) {
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }
        // Apply default values for missing optional parameters
        const allParams = { ...parameters };
        template.parameters.forEach(param => {
            if (!allParams[param.name] && param.default !== undefined) {
                allParams[param.name] = param.default;
            }
        });
        // Generate user prompt by replacing placeholders
        let userPrompt = template.userPromptTemplate;
        // Simple template replacement for {{param}}
        Object.entries(allParams).forEach(([key, value]) => {
            userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
        // Handle conditional blocks {{#if param}}content{{/if}}
        const conditionalRegex = /{{#if ([^}]+)}}(.*?){{\/if}}/g;
        userPrompt = userPrompt.replace(conditionalRegex, (match, condition, content) => {
            return allParams[condition] ? content : '';
        });
        return {
            systemPrompt: template.systemPrompt,
            userPrompt
        };
    }
    /**
     * Detect the most appropriate template for a given query
     * @param query The user's query
     * @returns The best matching template ID
     */
    detectTemplate(query) {
        // Simple keyword-based detection for now
        const queryLower = query.toLowerCase();
        // Check for code-related queries
        if (queryLower.includes('code') ||
            queryLower.includes('program') ||
            queryLower.includes('function') ||
            queryLower.includes('algorithm')) {
            return 'code-generation';
        }
        // Check for creative writing queries
        if (queryLower.includes('write a') ||
            queryLower.includes('create a') ||
            queryLower.includes('story') ||
            queryLower.includes('poem')) {
            return 'creative-writing';
        }
        // Check for technical explanation queries
        if (queryLower.includes('explain') ||
            queryLower.includes('how does') ||
            queryLower.includes('what is') ||
            queryLower.includes('define')) {
            return 'technical-explanation';
        }
        // Check for problem-solving queries
        if (queryLower.includes('solve') ||
            queryLower.includes('fix') ||
            queryLower.includes('issue') ||
            queryLower.includes('problem')) {
            return 'problem-solving';
        }
        // Check for data analysis queries
        if (queryLower.includes('analyze') ||
            queryLower.includes('data') ||
            queryLower.includes('statistics') ||
            queryLower.includes('trends')) {
            return 'data-analysis';
        }
        // Check for blockchain-specific queries
        if (queryLower.includes('blockchain') ||
            queryLower.includes('crypto') ||
            queryLower.includes('bitcoin') ||
            queryLower.includes('ethereum') ||
            queryLower.includes('solana') ||
            queryLower.includes('defi')) {
            return 'blockchain-analysis';
        }
        // Check for financial queries
        if (queryLower.includes('finance') ||
            queryLower.includes('stock') ||
            queryLower.includes('market') ||
            queryLower.includes('investment') ||
            queryLower.includes('economic')) {
            return 'financial-analysis';
        }
        // Default to universal assistant for general queries
        return 'universal-assistant';
    }
    /**
     * Process a query using the appropriate template
     * @param query The user's query
     * @returns The processed query with system and user prompts
     */
    processQuery(query) {
        // Detect the appropriate template
        const templateId = this.detectTemplate(query);
        logger_1.default.debug(`Detected template for query: ${templateId}`, { query: query.substring(0, 100) });
        // Create parameters object based on the template's required parameters
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        // Map the query to the appropriate parameter name based on the template
        const parameters = {};
        // Find the primary parameter for this template
        const primaryParam = template.parameters.find(p => p.required);
        if (primaryParam) {
            parameters[primaryParam.name] = query;
        }
        else {
            // Fallback to using 'query' as the parameter name
            parameters['query'] = query;
        }
        // For data analysis templates, also set the data parameter if it exists
        if (templateId === 'data-analysis' || templateId === 'blockchain-analysis' || templateId === 'financial-analysis') {
            parameters['data'] = query;
        }
        // For code generation, set both functionality and language if needed
        if (templateId === 'code-generation') {
            if (!parameters['functionality']) {
                parameters['functionality'] = query;
            }
            if (!parameters['language'] && !template.parameters.find(p => p.name === 'language')?.required) {
                parameters['language'] = 'JavaScript'; // Default language
            }
        }
        // For creative writing, set required parameters with defaults
        if (templateId === 'creative-writing') {
            // Always set these parameters regardless of whether they're already set
            parameters['format'] = 'short story';
            parameters['genre'] = 'science fiction';
            parameters['topic'] = query;
        }
        // For technical explanation, set the concept parameter
        if (templateId === 'technical-explanation') {
            if (!parameters['concept']) {
                parameters['concept'] = query;
            }
        }
        // For problem solving, set the problem parameter
        if (templateId === 'problem-solving') {
            if (!parameters['problem']) {
                parameters['problem'] = query;
            }
        }
        logger_1.default.debug(`Using template ${templateId} with parameters:`, parameters);
        // Use the template to generate prompts
        return this.useTemplate(templateId, parameters);
    }
}
// Export a singleton instance
exports.promptLibraryService = new PromptLibraryService();
