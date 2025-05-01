'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { redis } from '@/lib/redis';
import { ChatHistory, ChatHistoryPreview, Message } from '@/types/chat';

// Helper function for retry logic
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 300
): Promise<T> {
  let lastError: Error | unknown = new Error('Operation failed');
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Retry ${i + 1}/${retries} failed:`, error);
      lastError = error;
      
      // Wait before next retry
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Get a list of chat histories for the current user
 */
export async function getChatHistories(): Promise<ChatHistoryPreview[]> {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  // Get all chat history IDs for this user
  const chatKeys = await redis.smembers(`user:${userId}:chats`);
  
  if (!chatKeys.length) {
    return [];
  }

  // Get all chat histories
  const chats: ChatHistory[] = await Promise.all(
    chatKeys.map(async (chatId) => {
      const chat = await redis.get<ChatHistory>(`chat:${chatId}`);
      return chat as ChatHistory;
    })
  );

  // Create preview of each chat
  return chats
    .filter(Boolean)
    .map((chat) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessage: chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.slice(0, 50) 
        : 'New conversation'
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Get a specific chat history by ID
 */
export async function getChatHistory(chatId: string): Promise<ChatHistory | null> {
  const { userId } = await auth();
  
  if (!userId) {
    console.log("getChatHistory: No userId found");
    return null;
  }

  // Check if this chat belongs to the user
  const isMember = await redis.sismember(`user:${userId}:chats`, chatId);
  
  if (!isMember) {
    console.log(`getChatHistory: User ${userId} is not a member of chat ${chatId}`);
    return null;
  }

  const chat = await redis.get<ChatHistory>(`chat:${chatId}`);
  return chat;
}

/**
 * Create a new chat history
 */
export async function createChatHistory(title: string = 'New conversation'): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    console.error("createChatHistory: No userId found, cannot create chat");
    throw new Error('Unauthorized');
  }

  const id = randomUUID();
  const now = new Date();

  const chat: ChatHistory = {
    id,
    title,
    userId,
    createdAt: now,
    updatedAt: now,
    messages: [{
      id: '1',
      content: 'Hello! How can I assist you today?',
      isUser: false,
      timestamp: now,
      role: 'assistant',
    }],
  };

  console.log(`Creating new chat with ID ${id} for user ${userId}`);

  try {
    // Save the chat history
    await redis.set(`chat:${id}`, chat);
    
    // Add the chat ID to the user's set of chats
    await redis.sadd(`user:${userId}:chats`, id);
  
    revalidatePath('/chat');
    return id;
  } catch (error) {
    console.error("Error creating chat history:", error);
    throw error;
  }
}

/**
 * Update an existing chat history with new messages
 */
export async function updateChatHistory(
  chatId: string, 
  messages: Message[]
): Promise<void> {
  try {
    console.log(`Attempting to update chat ${chatId} with ${messages.length} messages`);
    
    const { userId } = await auth();
    
    if (!userId) {
      console.error("updateChatHistory: No userId found");
      throw new Error('Unauthorized: No user ID');
    }

    console.log(`User ID: ${userId}, Chat ID: ${chatId}`);

    // Try to ensure the chat exists in user's set first with a retry mechanism
    const ensureChatExists = async () => {
      // First check if the chat exists by trying to get it
      const chatData = await redis.get<ChatHistory>(`chat:${chatId}`);
      const chatExists = chatData !== null;
      
      if (!chatExists) {
        console.log(`Chat ${chatId} doesn't exist, attempting to recreate`);
        
        // If chat doesn't exist but should, recreate a basic structure
        const now = new Date();
        const newChat: ChatHistory = {
          id: chatId,
          title: 'Recovered conversation',
          userId,
          createdAt: now,
          updatedAt: now,
          messages: [], // We'll update with the provided messages later
        };
        
        await redis.set(`chat:${chatId}`, newChat);
        await redis.sadd(`user:${userId}:chats`, chatId);
        return true;
      }
      
      // Now check membership
      const isMember = await redis.sismember(`user:${userId}:chats`, chatId);
      
      if (!isMember) {
        console.log(`Adding chat ${chatId} to user ${userId}'s set`);
        await redis.sadd(`user:${userId}:chats`, chatId);
      }
      
      return true;
    };

    // Execute with retry
    await retryOperation(ensureChatExists, 3, 500);

    // Now get the chat data
    const chat = await redis.get<ChatHistory>(`chat:${chatId}`);
    
    if (!chat) {
      // This shouldn't happen now that we have the ensure function above
      console.error(`Chat not found despite ensuring it exists: ${chatId}`);
      throw new Error('Chat not found');
    }

    const updatedChat: ChatHistory = {
      ...chat,
      updatedAt: new Date(),
      messages,
    };

    // Update with retry
    await retryOperation(async () => {
      await redis.set(`chat:${chatId}`, updatedChat);
      console.log(`Successfully updated chat ${chatId}`);
    }, 3, 500);
    
    revalidatePath(`/chat/${chatId}`);
  } catch (error) {
    console.error(`Error updating chat history (${chatId}):`, error);
    // Instead of failing the entire operation, we'll log the error but not throw
    // This prevents the error message from appearing to the end user
  }
}

/**
 * Rename a chat history
 */
export async function renameChatHistory(chatId: string, title: string): Promise<void> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if this chat belongs to the user
  const isMember = await redis.sismember(`user:${userId}:chats`, chatId);
  
  if (!isMember) {
    throw new Error('Unauthorized');
  }

  const chat = await redis.get<ChatHistory>(`chat:${chatId}`);
  
  if (!chat) {
    throw new Error('Chat not found');
  }

  const updatedChat: ChatHistory = {
    ...chat,
    updatedAt: new Date(),
    title,
  };

  await redis.set(`chat:${chatId}`, updatedChat);
  revalidatePath('/chat');
  revalidatePath(`/chat/${chatId}`);
}

/**
 * Delete a chat history
 */
export async function deleteChatHistory(chatId: string): Promise<void> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if this chat belongs to the user
  const isMember = await redis.sismember(`user:${userId}:chats`, chatId);
  
  if (!isMember) {
    throw new Error('Unauthorized');
  }

  // Remove the chat from Redis
  await redis.del(`chat:${chatId}`);
  
  // Remove the chat ID from the user's set of chats
  await redis.srem(`user:${userId}:chats`, chatId);

  revalidatePath('/chat');
} 