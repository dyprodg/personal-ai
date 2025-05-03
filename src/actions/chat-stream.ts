"use server";

import { auth } from '@clerk/nextjs/server';
import { recordMessageStats, estimateTokenCount } from '@/lib/stats';
import { 
  ModelTier, 
  isModelAvailableForTier, 
  getModelIdsForTier 
} from '@/lib/groq-models';
import { getUserTierAction } from './user-tier-action';
import { checkAndDecrementUserLimit } from './user-limits';

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
    const userTier = await getUserTierAction(userId);
    
    // Validate if the requested model is available for this user's tier
    if (!isModelAvailableForTier(model, userTier)) {
      throw new Error(`Model not available in your tier`);
    }

    // Check and decrement user's message limit
    const limitCheck = await checkAndDecrementUserLimit(userId);
    if (!limitCheck.success) {
      throw new Error(limitCheck.error || "You've reached your message limit for this month");
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
        model: model,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error from API');
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
              if (completionTokens === 0 && fullContent.length > 0) {
                completionTokens = await estimateTokenCount(fullContent);
              }
              
              if (completionTokens > 0) {
                await recordMessageStats(completionTokens, isPrivateMode);
              }
              
              controller.close();
              break;
            }
            
            controller.enqueue(value);
            
            const text = new TextDecoder().decode(value);
            if (text.includes('data: ')) {
              try {
                const jsonStr = text.replace('data: ', '').trim();
                if (jsonStr === '[DONE]') continue;

                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  fullContent += content;
                }

                if (parsed.usage?.completion_tokens) {
                  completionTokens = parsed.usage.completion_tokens;
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        } catch (error) {
          console.error('Stream error occurred');
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });
  } catch (error: unknown) {
    console.error('Chat error occurred');
    throw error;
  }
} 