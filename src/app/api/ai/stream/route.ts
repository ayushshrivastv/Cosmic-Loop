/**
 * Enhanced AI Streaming API Route
 * 
 * Provides streaming endpoint for the enhanced AI services
 * that deliver faster, more concise, and on-point responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIService } from '@/api/prompt-engineering/enhanced-service';

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
          // Send initial status
          sendData(JSON.stringify({ type: 'status', data: 'Searching for information...' }));
          
          // Generate streaming response
          await enhancedAIService.generateStreamingConciseResponse(query, {
            additionalContext,
            onUpdate: (chunk) => {
              if (chunk) {
                sendData(JSON.stringify({ type: 'chunk', data: chunk }));
              } else {
                sendData(JSON.stringify({ type: 'status', data: 'Generating concise response...' }));
              }
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
