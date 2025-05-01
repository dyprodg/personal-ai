/**
 * Redis chat data encryption migration utility
 * 
 * This script migrates existing unencrypted chat data in Redis to the new encrypted format.
 * Run this once after implementing encryption.
 */

import { redis } from './redis';
import { encrypt } from './encryption';
import { ChatHistory } from '@/types/chat';
import { Redis } from '@upstash/redis';

// Helper function to find chat keys by prefix without using redis.keys 
// which might not be available in all Redis implementations
async function findChatKeys(pattern: string): Promise<string[]> {
  try {
    // If we're using actual Redis (not the local fallback), we can use the keys command
    if ('keys' in redis) {
      // Use type assertion for the Redis client
      return await (redis as Redis).keys(pattern);
    }
    
    // For the local storage fallback, we can just return an empty array
    // since we can't iterate through all keys easily
    console.log('Using local storage fallback - cannot scan for chat keys');
    return [];
  } catch (error) {
    console.error('Error finding chat keys:', error);
    return [];
  }
}

export async function migrateChatsToEncrypted() {
  console.log('Starting migration of chat data to encrypted format...');
  let migratedCount = 0;
  let errorCount = 0;

  try {
    // Get all chat keys from Redis
    const keys = await findChatKeys('chat:*');
    console.log(`Found ${keys.length} chat keys to process`);

    for (const key of keys) {
      try {
        // Get the chat data
        const chat = await redis.get(key);
        
        if (!chat) {
          console.log(`Empty chat data for key ${key}, skipping`);
          continue;
        }
        
        // Check if already encrypted (simple heuristic)
        const chatStr = typeof chat === 'string' ? chat : JSON.stringify(chat);
        if (chatStr.includes(':') && /^[0-9a-f]{32}:/.test(chatStr)) {
          console.log(`Chat ${key} appears to be already encrypted, skipping`);
          continue;
        }

        // Parse the chat if it's a string
        let chatData: ChatHistory;
        try {
          chatData = typeof chat === 'string' ? JSON.parse(chat) : chat as ChatHistory;
        } catch (parseError) {
          console.error(`Failed to parse chat data for key ${key}:`, parseError);
          errorCount++;
          continue;
        }

        // Encrypt the chat data
        const encryptedChat = encrypt<ChatHistory>(chatData);
        
        // Save the encrypted data back to Redis
        await redis.set(key, encryptedChat);
        
        migratedCount++;
        console.log(`Migrated chat ${key}`);
      } catch (chatError) {
        console.error(`Error processing chat ${key}:`, chatError);
        errorCount++;
      }
    }

    console.log('Migration completed:');
    console.log(`- Successfully migrated: ${migratedCount} chats`);
    console.log(`- Errors encountered: ${errorCount} chats`);
    
    return { success: true, migratedCount, errorCount };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error, migratedCount, errorCount };
  }
}

// Uncomment to run directly with ts-node
// if (require.main === module) {
//   migrateChatsToEncrypted()
//     .then(result => {
//       console.log('Migration result:', result);
//       process.exit(result.success ? 0 : 1);
//     })
//     .catch(error => {
//       console.error('Migration script failed:', error);
//       process.exit(1);
//     });
// } 