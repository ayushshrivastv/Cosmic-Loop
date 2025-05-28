/**
 * API Route for proxying Perplexity API requests
 * This avoids CORS issues when calling the Perplexity API directly from the browser
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get API key from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    // Get request body
    const requestData = await request.json();
    
    // Log request (without sensitive data)
    console.log('Proxying request to Perplexity API:', {
      model: requestData.model,
      messageCount: requestData.messages?.length || 0,
    });

    // Make request to Perplexity API
    const response = await axios.post(
      `${PERPLEXITY_BASE_URL}/chat/completions`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        },
        timeout: 30000 // 30 second timeout for longer responses
      }
    );

    // Return the API response
    return NextResponse.json(response.data);
  } catch (error) {
    // Type guard for axios errors
    const axiosError = error as Error & {
      response?: {
        status?: number;
        statusText?: string;
        data?: unknown;
      };
    };
    // Log error details
    console.error('Error proxying request to Perplexity API:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data
    });

    // Return error response
    return NextResponse.json(
      { 
        error: 'Error proxying request to Perplexity API',
        message: axiosError.message,
        details: axiosError.response?.data
      },
      { status: axiosError.response?.status || 500 }
    );
  }
}
