import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { recordMessageStats, estimateTokenCount } from '@/lib/stats';

// Define types for Groq API
type Message = {
  role: string;
  content: string;
};

type ChatRequest = {
  messages: Message[];
  isPrivateMode?: boolean;
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
    const { messages, isPrivateMode = false }: ChatRequest = await request.json();

    // Track estimated input tokens (prompt)
    const promptText = messages.map(msg => msg.content).join(' ');
    const estimatedPromptTokens = await estimateTokenCount(promptText);

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
        max_tokens: 4096, // Increased to handle longer responses
        stream: true // Enable streaming
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error from Groq API');
    }

    // Record the prompt tokens in stats (only do this once)
    await recordMessageStats(estimatedPromptTokens, isPrivateMode);

    let completionTokens = 0;
    let fullContent = '';

    // Create a TransformStream to process the response
    const transformStream = new TransformStream({
      transform: async (chunk, controller) => {
        // Pass the chunk through to the client
        const _controller = controller; // Explicit use to satisfy linter
        _controller.enqueue(chunk);
        
        // Accumulate statistics without writing to Redis
        const text = new TextDecoder().decode(chunk);
        if (text.includes('data: ')) {
          try {
            const jsonStr = text.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') {
              // This is the end of the stream
              // We'll handle the final stats write after the stream completes
            } else {
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';
              
              // Accumulate full content for later token estimation
              if (content) {
                fullContent += content;
              }

              // If there's a usage object in the response, use that instead of our estimates
              if (data.usage?.completion_tokens) {
                completionTokens = data.usage.completion_tokens;
              }
            }
          } catch {
            // Ignore parsing errors for partial chunks
          }
        }
      },
      flush: async (controller) => {
        // If we didn't get token counts from the API, estimate them
        if (completionTokens === 0 && fullContent.length > 0) {
          completionTokens = await estimateTokenCount(fullContent);
        }
        
        // Write the completion tokens to Redis (only once at the end)
        if (completionTokens > 0) {
          console.log(`Recording ${completionTokens} completion tokens at end of stream`);
          await recordMessageStats(completionTokens, isPrivateMode);
        }
      }
    });

    // Return the streaming response with the transform applied
    const responseStream = response.body
      ?.pipeThrough(transformStream);
    
    if (!responseStream) {
      throw new Error('Failed to create response stream');
    }

    return new Response(responseStream, {
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