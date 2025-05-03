"use server";

import { auth } from '@clerk/nextjs/server';
import { recordMessageStats, estimateTokenCount } from '@/lib/stats';
import { 
  ModelTier, 
  isModelAvailableForTier, 
  getModelIdsForTier 
} from '@/lib/groq-models';
import { getUserTier } from '@/lib/user-tier';

// Define types for Groq API
type Message = {
  role: string;
  content: string;
};

type ChatRequest = {
  messages: Message[];
  isPrivateMode?: boolean;
  model?: string;
};

/**
 * Server action that streams chat completions from Groq
 */
export async function streamChatCompletion(request: ChatRequest) {
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { messages, isPrivateMode = false, model = "llama-3.1-8b-instant" } = request;
    
    // Check user tier to confirm model access
    const userTier = await getUserTier(userId);
    
    // Validate if the requested model is available for this user's tier
    if (!isModelAvailableForTier(model, userTier)) {
      throw new Error(`Model ${model} is not available in your ${userTier} tier`);
    }

    // Track estimated input tokens (prompt)
    const promptText = messages.map(msg => msg.content).join(' ');
    const estimatedPromptTokens = await estimateTokenCount(promptText);

    // Record the prompt tokens in stats
    await recordMessageStats(estimatedPromptTokens, isPrivateMode);

    // Create the fetch request to Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
        model: model, // Use the requested model
        temperature: 0.7,
        max_tokens: 4096,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error from Groq API');
    }

    // Use ReadableStream to track completion tokens
    let completionTokens = 0;
    let fullContent = '';

    // Return a new stream that processes and forwards the Groq API's response
    return new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Handle completion token tracking at the end of stream
              if (completionTokens === 0 && fullContent.length > 0) {
                completionTokens = await estimateTokenCount(fullContent);
              }
              
              if (completionTokens > 0) {
                console.log(`Recording ${completionTokens} completion tokens at end of stream`);
                await recordMessageStats(completionTokens, isPrivateMode);
              }
              
              controller.close();
              break;
            }
            
            // Pass through the chunk to the client
            controller.enqueue(value);
            
            // Process for token tracking
            const text = new TextDecoder().decode(value);
            if (text.includes('data: ')) {
              try {
                const jsonStr = text.replace('data: ', '').trim();
                if (jsonStr === '[DONE]') {
                  // End of stream marker
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
          }
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error in chat stream action:', error);
    throw error;
  }
} 