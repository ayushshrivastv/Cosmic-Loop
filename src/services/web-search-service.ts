/**
 * Service for performing web searches to provide up-to-date information
 */

// We'll use Serper.dev API as it's more affordable and easier to set up than Google Custom Search
const SERPER_API_KEY = process.env.NEXT_PUBLIC_SERPER_API_KEY || '';
const SERPER_API_URL = 'https://google.serper.dev/search';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
  source?: string;
}

export class WebSearchService {
  /**
   * Perform a web search using the Serper.dev API
   * @param query The search query
   * @param limit Maximum number of results to return
   * @returns Array of search results
   */
  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      if (!SERPER_API_KEY) {
        console.warn('Serper API key not set. Web search functionality is disabled.');
        return [];
      }

      const response = await fetch(SERPER_API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          num: limit
        })
      });

      if (!response.ok) {
        throw new Error(`Search API returned status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract organic search results
      const results: SearchResult[] = [];
      
      if (data.organic && Array.isArray(data.organic)) {
        data.organic.slice(0, limit).forEach((item: any, index: number) => {
          results.push({
            title: item.title || '',
            link: item.link || '',
            snippet: item.snippet || '',
            position: index + 1,
            source: 'organic'
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error performing web search:', error);
      return [];
    }
  }

  /**
   * Format search results as a markdown string for inclusion in AI prompts
   * @param results Search results to format
   * @returns Formatted markdown string
   */
  formatResultsAsMarkdown(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No search results found.';
    }

    let markdown = '### Web Search Results\n\n';
    
    results.forEach((result, index) => {
      markdown += `**${index + 1}. ${result.title}**\n`;
      markdown += `${result.snippet}\n`;
      markdown += `Source: ${result.link}\n\n`;
    });
    
    return markdown;
  }

  /**
   * Perform a search and return results formatted as markdown
   * @param query The search query
   * @param limit Maximum number of results to return
   * @returns Formatted markdown string of search results
   */
  async searchAndFormat(query: string, limit: number = 5): Promise<string> {
    const results = await this.search(query, limit);
    return this.formatResultsAsMarkdown(results);
  }
}

// Export a singleton instance
export const webSearchService = new WebSearchService();
