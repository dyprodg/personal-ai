'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { redis } from '@/lib/redis';
import { ChatHistory, ChatHistoryPreview, Message } from '@/types/chat';
import { recordNewChat } from '@/lib/stats';
import { encrypt, decrypt } from '@/lib/encryption';

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
      console.error(`Retry failed`);
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
  const chatResults = await Promise.all(
    chatKeys.map(async (chatId) => {
      const encryptedChat = await redis.get<string>(`chat:${chatId}`);
      if (!encryptedChat) return null;
      
      try {
        return decrypt<ChatHistory>(encryptedChat);
      } catch (error) {
        console.error('Error decrypting chat');
        return null;
      }
    })
  );

  // Filter out nulls and create preview
  const chats = chatResults.filter((chat): chat is ChatHistory => chat !== null);

  // Create preview of each chat
  return chats
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
    return null;
  }

  // Check if this is a private chat (not stored in Redis)
  if (chatId.startsWith('private-')) {
    const privateChat = getPrivateChat(chatId);
    if (privateChat && privateChat.userId === userId) {
      return privateChat;
    }
    return null;
  }

  // Check if this chat belongs to the user
  const isMember = await redis.sismember(`user:${userId}:chats`, chatId);
  
  if (!isMember) {
    return null;
  }

  const encryptedChat = await redis.get<string>(`chat:${chatId}`);
  if (!encryptedChat) return null;
  
  try {
    // Ensure we have a string before trying to decrypt
    if (typeof encryptedChat !== 'string') {
      console.error('Invalid chat data format');
      throw new Error('Invalid chat data format');
    }
    return decrypt<ChatHistory>(encryptedChat);
  } catch (error) {
    console.error('Error decrypting chat');
    return null;
  }
}

// In-memory storage for private chats (will be lost on server restart)
const privateChats = new Map<string, ChatHistory>();

/**
 * Get a private chat from memory
 */
function getPrivateChat(chatId: string): ChatHistory | null {
  // Check if chat exists in memory
  if (privateChats.has(chatId)) {
    return privateChats.get(chatId) || null;
  }
  
  // For server rehydration, no need to try to read cookies
  // This is because we're in a server context
  return null;
}

/**
 * Store a private chat in memory
 */
function storePrivateChat(chat: ChatHistory): void {
  privateChats.set(chat.id, chat);
}

/**
 * Create a new chat history
 */
export async function createChatHistory(title: string = 'New conversation', isPrivate: boolean = false): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    console.error('Unauthorized');
    throw new Error('Unauthorized');
  }

  const now = new Date();
  // For private chats, use a prefix to differentiate them
  const id = isPrivate ? `private-${randomUUID()}` : randomUUID();

  const chat: ChatHistory = {
    id,
    title,
    userId,
    createdAt: now,
    updatedAt: now,
    isPrivate,
    messages: [{
      id: '1',
      content: 'Hello! How can I assist you today?',
      isUser: false,
      timestamp: now,
      role: 'assistant',
    }],
  };

  // Record new chat creation in stats (only for persistent chats)
  if (!isPrivate) {
    await recordNewChat();
  }

  if (isPrivate) {
    // Store private chat in memory
    storePrivateChat(chat);
    
    // Make sure to revalidate paths for private chats too
    revalidatePath('/chat');
    revalidatePath(`/chat/${id}`);
    
    return id;
  } else {
    // Store normal chat in Redis
    try {
      // Encrypt and save the chat history
      const encryptedChat = encrypt<ChatHistory>(chat);
      await redis.set(`chat:${id}`, encryptedChat);
      
      // Add the chat ID to the user's set of chats
      await redis.sadd(`user:${userId}:chats`, id);
    
      revalidatePath('/chat');
      return id;
    } catch (error) {
      console.error('Error creating chat history');
      throw error;
    }
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
    const { userId } = await auth();
    
    if (!userId) {
      console.error('Unauthorized');
      throw new Error('Unauthorized: No user ID');
    }

    // Handle private chats differently
    if (chatId.startsWith('private-')) {
      const privateChat = getPrivateChat(chatId);
      
      if (!privateChat) {
        console.error('Chat not found');
        throw new Error('Chat not found');
      }
      
      if (privateChat.userId !== userId) {
        console.error('Unauthorized');
        throw new Error('Unauthorized');
      }
      
      // Update the private chat in memory
      privateChat.messages = messages;
      privateChat.updatedAt = new Date();
      storePrivateChat(privateChat);
      
      return;
    }

    // Try to ensure the chat exists in user's set first with a retry mechanism
    const ensureChatExists = async () => {
      // First check if the chat exists by trying to get it
      const encryptedChat = await redis.get<string>(`chat:${chatId}`);
      const chatExists = encryptedChat !== null;
      
      if (!chatExists) {
        // If chat doesn't exist but should, recreate a basic structure
        const now = new Date();
        const newChat: ChatHistory = {
          id: chatId,
          title: 'Recovered conversation',
          userId,
          createdAt: now,
          updatedAt: now,
          isPrivate: false,
          messages: [], // We'll update with the provided messages later
        };
        
        const encryptedNewChat = encrypt<ChatHistory>(newChat);
        await redis.set(`chat:${chatId}`, encryptedNewChat);
        await redis.sadd(`user:${userId}:chats`, chatId);
        return true;
      }
      
      // Now check membership
      const isMember = await redis.sismember(`user:${userId}:chats`, chatId);
      
      if (!isMember) {
        await redis.sadd(`user:${userId}:chats`, chatId);
      }
      
      return true;
    };

    // Execute with retry
    await retryOperation(ensureChatExists, 3, 500);

    // Now get the chat data
    const encryptedChat = await redis.get<string>(`chat:${chatId}`);
    
    if (!encryptedChat) {
      console.error('Chat not found');
      throw new Error('Chat not found');
    }

    // Decrypt the chat
    let chat: ChatHistory;
    try {
      // Ensure we have a string before trying to decrypt
      if (typeof encryptedChat !== 'string') {
        console.error('Invalid chat data format');
        throw new Error('Invalid chat data format');
      }
      chat = decrypt<ChatHistory>(encryptedChat);
    } catch (error) {
      console.error('Failed to decrypt chat data');
      throw new Error('Failed to decrypt chat data');
    }

    const updatedChat: ChatHistory = {
      ...chat,
      updatedAt: new Date(),
      messages,
    };

    // Update with retry
    await retryOperation(async () => {
      const encryptedUpdatedChat = encrypt<ChatHistory>(updatedChat);
      await redis.set(`chat:${chatId}`, encryptedUpdatedChat);
    }, 3, 500);
    
    revalidatePath(`/chat/${chatId}`);
  } catch (error) {
    console.error('Error updating chat history');
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

  // Handle private chats
  if (chatId.startsWith('private-')) {
    const privateChat = getPrivateChat(chatId);
    
    if (!privateChat) {
      throw new Error('Chat not found');
    }
    
    if (privateChat.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    privateChat.title = title;
    privateChat.updatedAt = new Date();
    storePrivateChat(privateChat);
    
    return;
  }

  // Check if this chat belongs to the user
  const isMember = await redis.sismember(`user:${userId}:chats`, chatId);
  
  if (!isMember) {
    throw new Error('Unauthorized');
  }

  const encryptedChat = await redis.get<string>(`chat:${chatId}`);
  
  if (!encryptedChat) {
    throw new Error('Chat not found');
  }

  // Decrypt the chat
  let chat: ChatHistory;
  try {
    // Ensure we have a string before trying to decrypt
    if (typeof encryptedChat !== 'string') {
      console.error('Invalid chat data format');
      throw new Error('Invalid chat data format');
    }
    chat = decrypt<ChatHistory>(encryptedChat);
  } catch (error) {
    console.error('Failed to decrypt chat data');
    throw new Error('Failed to decrypt chat data');
  }

  const updatedChat: ChatHistory = {
    ...chat,
    updatedAt: new Date(),
    title,
  };

  const encryptedUpdatedChat = encrypt<ChatHistory>(updatedChat);
  await redis.set(`chat:${chatId}`, encryptedUpdatedChat);
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

  // Handle private chats
  if (chatId.startsWith('private-')) {
    const privateChat = getPrivateChat(chatId);
    
    if (!privateChat) {
      throw new Error('Chat not found');
    }
    
    if (privateChat.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    // Remove private chat from memory
    privateChats.delete(chatId);
    
    return;
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