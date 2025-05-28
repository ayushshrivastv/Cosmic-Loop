/**
 * AI Search Panel Component
 * 
 * A React component that provides an interface for using the AI integration API
 * to search for information using Perplexity and get summarized results with Gemini.
 */

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Search, ZapIcon } from 'lucide-react';

// Import your UI components - assuming you're using some UI library like shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Define the API response types
interface AIResponse {
  text: string;
  sources?: {
    search: { text: string; model?: string };
    summary: { text: string; model?: string };
  };
  usage?: {
    search_tokens: number;
    summary_tokens: number;
    total_tokens: number;
  };
}

// AISearchPanel component
const AISearchPanel = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [activeTab, setActiveTab] = useState('integrated');
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Close the event source when component unmounts
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Function to handle search with summarization
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const endpoint = `/api/ai/${activeTab === 'integrated' ? 'search-summarize' : 'search'}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          includeSourceData: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle streaming response
  const handleStreamSearch = () => {
    if (!query.trim()) return;
    
    setIsStreaming(true);
    setError(null);
    setStreamedResponse('');
    
    // Close any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Create a new event source
    const eventSource = new EventSource(
      `/api/ai/stream/search-summarize?query=${encodeURIComponent(query.trim())}`
    );
    
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chunk') {
          setStreamedResponse((prev) => prev + data.data);
        } else if (data.type === 'done') {
          eventSource.close();
          setIsStreaming(false);
        } else if (data.type === 'error') {
          throw new Error(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        eventSource.close();
        setIsStreaming(false);
      }
    };
    
    eventSource.onerror = () => {
      setError('Connection error. Please try again.');
      eventSource.close();
      setIsStreaming(false);
    };
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'streaming') {
      handleStreamSearch();
    } else {
      handleSearch();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="h-5 w-5" />
          AI-Powered Search & Summarization
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading || isStreaming}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || isStreaming || !query.trim()}
            >
              {isLoading || isStreaming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="integrated">Integrated</TabsTrigger>
              <TabsTrigger value="search">Search Only</TabsTrigger>
              <TabsTrigger value="streaming">Streaming</TabsTrigger>
            </TabsList>
            
            <TabsContent value="integrated" className="space-y-4">
              {response && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Synthesized Response</h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {response.text}
                  </div>
                  
                  {response.sources && (
                    <div className="mt-4">
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-muted-foreground">
                          View Source Data
                        </summary>
                        <div className="mt-2 space-y-2 text-sm">
                          <div>
                            <Badge variant="outline">Search</Badge>
                            <div className="bg-muted p-2 rounded-md mt-1 max-h-60 overflow-y-auto">
                              {response.sources.search.text}
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                  
                  {response.usage && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Token usage: {response.usage.total_tokens} tokens
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="search" className="space-y-4">
              {response && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Search Results</h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {response.text}
                  </div>
                  
                  {response.usage && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Token usage: {response.usage.search_tokens} tokens
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="streaming" className="space-y-4">
              {(isStreaming || streamedResponse) && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    Streaming Response
                    {isStreaming && (
                      <Badge variant="outline" className="ml-2 animate-pulse">
                        Live
                      </Badge>
                    )}
                  </h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap min-h-[100px]">
                    {streamedResponse || "Waiting for response..."}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="text-destructive p-2 border border-destructive rounded-md mt-4">
              {error}
            </div>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <div>
          Powered by Perplexity Sonar API (search) and Google Gemini Flash API (summarization)
        </div>
      </CardFooter>
    </Card>
  );
};

// Use dynamic import with SSR disabled to prevent hydration errors
// This is especially important if this component will be used in a page
// that might also use Solana wallet components
export default dynamic(() => Promise.resolve(AISearchPanel), {
  ssr: false
});
