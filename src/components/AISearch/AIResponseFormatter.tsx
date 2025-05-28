'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock } from 'lucide-react';
import type { Components } from 'react-markdown';

interface AIResponseFormatterProps {
  content: string;
  metadata?: {
    latency?: {
      total: number;
    };
    tokens?: {
      total: number;
    };
  };
  className?: string;
}

/**
 * AIResponseFormatter component
 * 
 * Renders AI responses with proper formatting, syntax highlighting,
 * and metadata display
 */
export function AIResponseFormatter({ 
  content, 
  metadata, 
  className = '' 
}: AIResponseFormatterProps) {
  // Format milliseconds to readable time
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Extract sources if they exist in the content
  const sourcesSection = content.match(/Sources:\s*([\s\S]*?)(?:\n\n|$)/);
  const mainContent = content.replace(/Sources:\s*([\s\S]*?)(?:\n\n|$)/, '');
  
  // Custom components for ReactMarkdown
  const customComponents = {
    // Customize link rendering
    a: (props: React.HTMLProps<HTMLAnchorElement>) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 inline-flex items-center"
      >
        {props.children}
        <ExternalLink className="ml-1 h-3 w-3" />
      </a>
    ),
    // Customize code block rendering
    code: (props: React.HTMLProps<HTMLElement> & { inline?: boolean; className?: string }) => {
      const { inline, className, children, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto my-2">
          <code 
            className={`${language ? `language-${language}` : ''} block p-2 text-sm`} 
            {...rest}
          >
            {children}
          </code>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...rest}>
          {children}
        </code>
      );
    }
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4">
        {/* Main content with Markdown rendering */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
            components={customComponents}
          >
            {mainContent}
          </ReactMarkdown>
        </div>
        
        {/* Sources section if present */}
        {sourcesSection && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">Sources:</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <ReactMarkdown>
                {sourcesSection[1]}
              </ReactMarkdown>
            </div>
          </div>
        )}
        
        {/* Metadata display */}
        {metadata && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
            {metadata.latency && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {formatTime(metadata.latency.total)}
              </Badge>
            )}
            {metadata.tokens && (
              <Badge variant="outline" className="text-xs">
                {metadata.tokens.total} tokens
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
