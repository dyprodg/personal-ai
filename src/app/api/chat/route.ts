import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define types for Groq API
type Message = {
  role: string;
  content: string;
};

type ChatRequest = {
  messages: Message[];
};

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the message content from the request
    const { messages }: ChatRequest = await request.json();

    // Send chat completion request to Groq with streaming
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
        model: "llama-3.1-8b-instant", // You can change this to any Groq model
        temperature: 0.7,
        max_tokens: 2048,
        stream: true // Enable streaming
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error from Groq API');
    }

    // Return the streaming response directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: unknown) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 