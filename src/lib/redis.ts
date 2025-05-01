import { Redis } from '@upstash/redis';

// Define storage types
type StorageValue = string | number | boolean | object | null;
type StorageMap = Map<string, StorageValue>;

// Local storage fallback for development
class LocalStorageFallback {
  private storage: StorageMap = new Map();

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key) as T | null;
  }

  async set(key: string, value: StorageValue): Promise<string> {
    this.storage.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    if (this.storage.has(key)) {
      this.storage.delete(key);
      return 1;
    }
    return 0;
  }

  async smembers(key: string): Promise<string[]> {
    return this.storage.get(key) as string[] || [];
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    const set = new Set(this.storage.get(key) as string[] || []);
    let added = 0;
    
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member);
        added++;
      }
    }
    
    this.storage.set(key, Array.from(set));
    return added;
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = new Set(this.storage.get(key) as string[] || []);
    let removed = 0;
    
    for (const member of members) {
      if (set.has(member)) {
        set.delete(member);
        removed++;
      }
    }
    
    this.storage.set(key, Array.from(set));
    return removed;
  }

  async sismember(key: string, member: string): Promise<number> {
    const set = new Set(this.storage.get(key) as string[] || []);
    return set.has(member) ? 1 : 0;
  }
}

// Get the Redis URL from environment variables
function getRedisUrl(): string | undefined {
  // Try different common environment variable names
  return process.env.KV_REST_API_URL || 
         process.env.KV_URL || 
         process.env.REDIS_URL || 
         process.env.UPSTASH_REDIS_REST_URL;
}

// Get the Redis token from environment variables
function getRedisToken(): string | undefined {
  // Try different common environment variable names
  return process.env.KV_REST_API_TOKEN || 
         process.env.KV_REST_API_READ_ONLY_TOKEN || 
         process.env.UPSTASH_REDIS_REST_TOKEN;
}

// Check Redis credentials
function hasRedisCredentials(): boolean {
  const url = getRedisUrl();
  const token = getRedisToken();
  
  const hasCredentials = !!(url && token);
  
  if (!hasCredentials) {
    console.warn('⚠️ Redis credentials are missing. Using local storage fallback.');
  }
  
  return hasCredentials;
}

// Create Redis client
function createRedisClient() {
  try {
    if (hasRedisCredentials()) {
      // Create upstash Redis client with explicit parameters
      const redisClient = new Redis({
        url: getRedisUrl()!,
        token: getRedisToken()!,
      });
      
      return redisClient;
    } else {
      return new LocalStorageFallback();
    }
  } catch (error) {
    console.error('❌ Failed to initialize Redis client:', error);
    return new LocalStorageFallback();
  }
}

// Initialize Redis client once
export const redis = createRedisClient(); 