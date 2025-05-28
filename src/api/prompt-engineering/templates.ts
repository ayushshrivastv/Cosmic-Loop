/**
 * Enhanced AI Response Templates
 * 
 * Templates for formatting AI responses in a clear, concise way
 * with proper attribution and sources
 */

// Template for formatting responses with sources
export const RESPONSE_WITH_SOURCES_TEMPLATE = `
{{mainContent}}

{{#if sources}}
Sources:
{{#each sources}}
[{{@index}}] {{this}}
{{/each}}
{{/if}}
`;

// Template for financial data responses
export const FINANCIAL_DATA_TEMPLATE = `
# {{title}}

{{summary}}

## Key Data:
{{#each dataPoints}}
- **{{this.label}}**: {{this.value}}
{{/each}}

{{#if sources}}
Sources:
{{#each sources}}
[{{@index}}] {{this}}
{{/each}}
{{/if}}
`;

// Template for simple Q&A responses
export const SIMPLE_QA_TEMPLATE = `
{{answer}}

{{#if sources}}
Sources: {{sourcesList}}
{{/if}}
`;

// Helper function to format a response with sources
export function formatResponseWithSources(content: string, sources: string[] = []): string {
  let template = RESPONSE_WITH_SOURCES_TEMPLATE;
  
  // Replace main content
  template = template.replace('{{mainContent}}', content);
  
  // Replace sources if they exist
  if (sources && sources.length > 0) {
    let sourcesHtml = '';
    sources.forEach((source, index) => {
      sourcesHtml += `[${index + 1}] ${source}\n`;
    });
    template = template.replace('{{#if sources}}', '');
    template = template.replace('{{#each sources}}', '');
    template = template.replace('[{{@index}}] {{this}}', sourcesHtml.trim());
    template = template.replace('{{/each}}', '');
    template = template.replace('{{/if}}', '');
  } else {
    // Remove sources section if no sources
    template = template.replace('{{#if sources}}', '');
    template = template.replace('Sources:', '');
    template = template.replace('{{#each sources}}', '');
    template = template.replace('[{{@index}}] {{this}}', '');
    template = template.replace('{{/each}}', '');
    template = template.replace('{{/if}}', '');
  }
  
  return template.trim();
}

// Helper function to format financial data
export function formatFinancialData(
  title: string, 
  summary: string, 
  dataPoints: Array<{label: string, value: string}>,
  sources: string[] = []
): string {
  let template = FINANCIAL_DATA_TEMPLATE;
  
  // Replace title and summary
  template = template.replace('{{title}}', title);
  template = template.replace('{{summary}}', summary);
  
  // Replace data points
  let dataPointsHtml = '';
  dataPoints.forEach(point => {
    dataPointsHtml += `- **${point.label}**: ${point.value}\n`;
  });
  template = template.replace('{{#each dataPoints}}', '');
  template = template.replace('- **{{this.label}}**: {{this.value}}', dataPointsHtml.trim());
  template = template.replace('{{/each}}', '');
  
  // Replace sources if they exist
  if (sources && sources.length > 0) {
    let sourcesHtml = '';
    sources.forEach((source, index) => {
      sourcesHtml += `[${index + 1}] ${source}\n`;
    });
    template = template.replace('{{#if sources}}', '');
    template = template.replace('{{#each sources}}', '');
    template = template.replace('[{{@index}}] {{this}}', sourcesHtml.trim());
    template = template.replace('{{/each}}', '');
    template = template.replace('{{/if}}', '');
  } else {
    // Remove sources section if no sources
    template = template.replace('{{#if sources}}', '');
    template = template.replace('Sources:', '');
    template = template.replace('{{#each sources}}', '');
    template = template.replace('[{{@index}}] {{this}}', '');
    template = template.replace('{{/each}}', '');
    template = template.replace('{{/if}}', '');
  }
  
  return template.trim();
}

// Helper function for simple Q&A format
export function formatSimpleQA(answer: string, sources: string[] = []): string {
  let template = SIMPLE_QA_TEMPLATE;
  
  // Replace answer
  template = template.replace('{{answer}}', answer);
  
  // Replace sources if they exist
  if (sources && sources.length > 0) {
    const sourcesList = sources.map((source, index) => `[${index + 1}] ${source}`).join('; ');
    template = template.replace('{{#if sources}}', '');
    template = template.replace('{{sourcesList}}', sourcesList);
    template = template.replace('{{/if}}', '');
  } else {
    // Remove sources section if no sources
    template = template.replace('{{#if sources}}', '');
    template = template.replace('Sources: {{sourcesList}}', '');
    template = template.replace('{{/if}}', '');
  }
  
  return template.trim();
}
