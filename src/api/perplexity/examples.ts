/**
 * Perplexity API Examples
 * 
 * This file contains examples of how to use the Perplexity API with prompt engineering
 * to answer a wide range of questions effectively.
 */

import { promptEngineeringService, EnhancedResponse } from './prompt-engineering';
import { perplexityService } from './service';
import { 
  BASE_PROMPT, 
  SOLANA_DEVELOPMENT_PROMPT, 
  BLOCKCHAIN_DATA_PROMPT 
} from './prompts';

/**
 * Example of using the prompt engineering service to process a query
 */
async function examplePromptEngineering() {
  try {
    // Example 1: Development question
    const developmentQuery = "How do I create a Solana program that handles SPL tokens?";
    const developmentResponse = await promptEngineeringService.processQuery(developmentQuery);
    console.log('Development Query Response:');
    console.log(`Category: ${developmentResponse.category}`);
    console.log(developmentResponse.text);
    console.log('\n---\n');

    // Example 2: Data analysis question
    const dataQuery = "What metrics should I track to understand NFT marketplace activity?";
    const dataResponse = await promptEngineeringService.processQuery(dataQuery);
    console.log('Data Analysis Query Response:');
    console.log(`Category: ${dataResponse.category}`);
    console.log(dataResponse.text);
    console.log('\n---\n');

    // Example 3: Educational question with additional context
    const educationalQuery = "Explain how Solana's proof of history works";
    const additionalContext = "The user is new to blockchain technology and needs a simplified explanation.";
    const educationalResponse = await promptEngineeringService.processQuery(
      educationalQuery, 
      additionalContext
    );
    console.log('Educational Query Response:');
    console.log(`Category: ${educationalResponse.category}`);
    console.log(educationalResponse.text);
    console.log('\n---\n');

    // Example 4: Streaming response
    const streamingQuery = "Compare Solana to other layer 1 blockchains";
    console.log('Streaming Response:');
    let fullResponse = '';
    
    await promptEngineeringService.processStreamingQuery(
      streamingQuery,
      (partialResponse) => {
        // In a real application, this would update the UI incrementally
        process.stdout.write(partialResponse);
        fullResponse += partialResponse;
      }
    );
    
    console.log('\nFull streaming response length:', fullResponse.length);
  } catch (error) {
    console.error('Error in example:', error);
  }
}

/**
 * Example of using custom prompts directly with the Perplexity service
 */
async function exampleCustomPrompts() {
  try {
    // Example 1: Using the development prompt for a technical question
    const technicalQuery = "How does Solana's account model differ from Ethereum's?";
    const technicalResponse = await perplexityService.generateCustomResponse(
      technicalQuery,
      SOLANA_DEVELOPMENT_PROMPT
    );
    console.log('Technical Query Response:');
    console.log(technicalResponse.text);
    console.log('\n---\n');

    // Example 2: Using the blockchain data prompt for analysis
    const analysisQuery = "What insights can I derive from token transfer patterns?";
    const analysisResponse = await perplexityService.generateCustomResponse(
      analysisQuery,
      BLOCKCHAIN_DATA_PROMPT
    );
    console.log('Analysis Query Response:');
    console.log(analysisResponse.text);
    console.log('\n---\n');
  } catch (error) {
    console.error('Error in custom prompts example:', error);
  }
}

// Export the examples for use in other files
export {
  examplePromptEngineering,
  exampleCustomPrompts
};

// Run the examples if this file is executed directly
if (require.main === module) {
  console.log('Running Perplexity API Examples with Prompt Engineering');
  examplePromptEngineering()
    .then(() => exampleCustomPrompts())
    .then(() => console.log('Examples completed'))
    .catch(error => console.error('Error running examples:', error));
}
