/**
 * Enhanced AI API Route
 * 
 * Provides endpoints for accessing the enhanced AI services
 * that deliver faster, more concise, and on-point responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIService } from '@/api/prompt-engineering/enhanced-service';

/**
 * POST handler for the enhanced AI API
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const requestData = await request.json();
    const { query, includeSourceData, additionalContext } = requestData;
    
    // Validate query
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Valid query is required' },
        { status: 400 }
      );
    }
    
    // Generate concise response
    const response = await enhancedAIService.generateConciseResponse(query, {
      includeSourceData: !!includeSourceData,
      additionalContext
    });
    
    // Return the response
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in enhanced AI API:', error);
    return NextResponse.json(
      { error: 'Server error processing request' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for streaming responses
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const additionalContext = searchParams.get('context') || undefined;
    
    // Validate query
    if (!query) {
      return NextResponse.json(
        { error: 'Valid query parameter is required' },
        { status: 400 }
      );
    }
    
    // Set up Server-Sent Events
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        // Function to send SSE data
        const sendData = (data: string) => {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };
        
        try {
          // Generate streaming response
          await enhancedAIService.generateStreamingConciseResponse(query, {
            additionalContext,
            onUpdate: (chunk) => {
              sendData(JSON.stringify({ type: 'chunk', data: chunk }));
            }
          });
          
          // Signal completion
          sendData(JSON.stringify({ type: 'done', data: 'Stream complete' }));
          controller.close();
        } catch (error) {
          console.error('Error in streaming AI API:', error);
          sendData(JSON.stringify({ 
            type: 'error', 
            data: 'Server error processing streaming request' 
          }));
          controller.close();
        }
      }
    });
    
    // Return the stream
    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error setting up streaming AI API:', error);
    return NextResponse.json(
      { error: 'Server error setting up streaming request' },
      { status: 500 }
    );
  }
}
