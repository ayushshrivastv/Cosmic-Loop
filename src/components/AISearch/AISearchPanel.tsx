/**
 * Enhanced AI Search Panel Component
 * 
 * A React component that provides an interface for using the enhanced AI integration API
 * to search for information using Perplexity and get concise, fast responses with Gemini.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Search, ZapIcon, Zap, Info, Clock } from 'lucide-react';
import { AIResponseFormatter } from './AIResponseFormatter';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the enhanced API response types
interface EnhancedAIResponse {
  text: string;
  sources?: {
    search?: { text: string; model?: string };
    summary?: { text: string; model?: string };
  };
  metadata?: {
    latency: {
      search?: number;
      summary?: number;
      total: number;
    };
    tokens?: {
      search?: number;
      summary?: number;
      total: number;
    };
  };
}

// AISearchPanel component
const AISearchPanel = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState<EnhancedAIResponse | null>(null);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('integrated');
  const [error, setError] = useState<string | null>(null);
  const [conciseMode, setConciseMode] = useState(true);
  const [streamStartTime, setStreamStartTime] = useState<number>(0);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Close the event source when component unmounts
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Function to handle search with enhanced AI
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Use the new enhanced AI endpoint
      const endpoint = `/api/ai`;
      
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
    setStatusMessage('Initializing...');
    setStreamStartTime(Date.now());
    
    // Close any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Create a new event source using the enhanced streaming endpoint
    const eventSource = new EventSource(
      `/api/ai/stream?query=${encodeURIComponent(query.trim())}`
    );
    
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chunk') {
          setStreamedResponse((prev) => prev + data.data);
          setStatusMessage(null);
        } else if (data.type === 'status') {
          setStatusMessage(data.data);
        } else if (data.type === 'done') {
          eventSource.close();
          setIsStreaming(false);
          setStatusMessage(null);
        } else if (data.type === 'error') {
          throw new Error(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        eventSource.close();
        setIsStreaming(false);
        setStatusMessage(null);
      }
    };
    
    eventSource.onerror = () => {
      setError('Connection error. Please try again.');
      eventSource.close();
      setIsStreaming(false);
      setStatusMessage(null);
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

  // Format milliseconds to a readable time
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="h-5 w-5 text-yellow-500" />
          Enhanced AI Search
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This AI agent uses Langchain prompt engineering to deliver faster, more concise, and on-point responses.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
            >
              {isLoading || isStreaming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <Switch
              id="concise-mode"
              checked={conciseMode}
              onCheckedChange={setConciseMode}
            />
            <Label htmlFor="concise-mode" className="text-sm flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              Concise Mode
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get faster, more direct responses with fewer tokens</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="integrated">Standard</TabsTrigger>
              <TabsTrigger value="streaming">Streaming</TabsTrigger>
            </TabsList>
            
            <TabsContent value="integrated" className="space-y-4">
              {response && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">AI Response</h3>
                    
                    {response.metadata?.latency && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(response.metadata.latency.total)}
                      </Badge>
                    )}
                  </div>
                  
                  <AIResponseFormatter 
                    content={response.text} 
                    metadata={response.metadata}
                    className="bg-gradient-to-r from-yellow-500/5 to-amber-600/5 border border-yellow-500/10"
                  />
                  
                  {response.sources && (
                    <div className="mt-4">
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-muted-foreground">
                          View Source Data
                        </summary>
                        <div className="mt-2 space-y-2 text-sm">
                          {response.sources.search && (
                            <div>
                              <Badge variant="outline">Search</Badge>
                              <div className="bg-muted p-2 rounded-md mt-1 max-h-60 overflow-y-auto">
                                {response.sources.search.text}
                              </div>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  {response.metadata?.tokens && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Token usage: {response.metadata.tokens.total || 0} tokens
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="streaming" className="space-y-4">
              {streamedResponse || statusMessage ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Live Response
                    </h3>
                    
                    {statusMessage && (
                      <Badge variant="outline" className="animate-pulse">
                        {statusMessage}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500/5 to-amber-600/5 border border-yellow-500/10 p-4 rounded-md min-h-[100px]">
                    {streamedResponse ? (
                      <>
                        <AIResponseFormatter 
                          content={streamedResponse} 
                          metadata={{
                            latency: { total: Date.now() - streamStartTime }
                          }}
                        />
                        {isStreaming && (
                          <span className="inline-block w-2 h-4 bg-yellow-500 animate-pulse ml-1"></span>
                        )}
                      </>
                    ) : (
                      isStreaming && (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin text-yellow-500/50" />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                isStreaming && (
                  <div className="flex flex-col items-center justify-center p-8 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                    <div className="text-sm text-muted-foreground">Searching for information...</div>
                  </div>
                )
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
        <div className="flex items-center gap-1">
          Powered by 
          <Zap className="h-3 w-3 text-yellow-500 mx-1" />
          <span className="font-medium">Langchain</span> prompt engineering with Perplexity and Gemini
        </div>
      </CardFooter>
    </Card>
  );
};

// Use dynamic import with SSR disabled to prevent hydration errors
// This is especially important if this component will be used in a page
// that might also use Solana wallet components
export default dynamic(() => Promise.resolve(AISearchPanel), {
  ssr: false,
});
