'use server';

import { redis } from './redis';
import { auth } from '@clerk/nextjs/server';
import { formatISO, startOfDay, startOfMonth } from 'date-fns';

/**
 * Keys for Redis stats
 */
const STATS_KEYS = {
  // Global stats
  TOTAL_CHATS: 'stats:total:chats',
  TOTAL_MESSAGES: 'stats:total:messages',
  TOTAL_TOKENS: 'stats:total:tokens',

  // Daily stats
  DAILY_CHATS: (date: Date) => `stats:daily:${formatISO(startOfDay(date), { representation: 'date' })}:chats`,
  DAILY_MESSAGES: (date: Date) => `stats:daily:${formatISO(startOfDay(date), { representation: 'date' })}:messages`,
  DAILY_TOKENS: (date: Date) => `stats:daily:${formatISO(startOfDay(date), { representation: 'date' })}:tokens`,

  // Monthly stats
  MONTHLY_CHATS: (date: Date) => `stats:monthly:${formatISO(startOfMonth(date), { representation: 'date' })}:chats`,
  MONTHLY_MESSAGES: (date: Date) => `stats:monthly:${formatISO(startOfMonth(date), { representation: 'date' })}:messages`,
  MONTHLY_TOKENS: (date: Date) => `stats:monthly:${formatISO(startOfMonth(date), { representation: 'date' })}:tokens`,

  // User stats
  USER_TOTAL_CHATS: (userId: string) => `user:${userId}:stats:total:chats`,
  USER_TOTAL_MESSAGES: (userId: string) => `user:${userId}:stats:total:messages`,
  USER_TOTAL_TOKENS: (userId: string) => `user:${userId}:stats:total:tokens`,
  USER_DAILY_MESSAGES: (userId: string, date: Date) => 
    `user:${userId}:stats:daily:${formatISO(startOfDay(date), { representation: 'date' })}:messages`,
  USER_DAILY_TOKENS: (userId: string, date: Date) => 
    `user:${userId}:stats:daily:${formatISO(startOfDay(date), { representation: 'date' })}:tokens`,
};

/**
 * Record a new chat created
 */
export async function recordNewChat() {
  const { userId } = await auth();
  if (!userId) return;

  const now = new Date();
  const pipeline = redis.pipeline();

  // Increment global stats
  pipeline.incr(STATS_KEYS.TOTAL_CHATS);
  pipeline.incr(STATS_KEYS.DAILY_CHATS(now));
  pipeline.incr(STATS_KEYS.MONTHLY_CHATS(now));

  // Increment user stats
  pipeline.incr(STATS_KEYS.USER_TOTAL_CHATS(userId));

  await pipeline.exec();
}

/**
 * Record a new message with token usage
 */
export async function recordMessageStats(tokens: number, isPrivateMode: boolean = false) {
  const { userId } = await auth();
  if (!userId) return;

  const now = new Date();
  const pipeline = redis.pipeline();

  // Skip recording private messages to storage stats if in private mode
  if (!isPrivateMode) {
    // Increment global message stats
    pipeline.incr(STATS_KEYS.TOTAL_MESSAGES);
    pipeline.incr(STATS_KEYS.DAILY_MESSAGES(now));
    pipeline.incr(STATS_KEYS.MONTHLY_MESSAGES(now));
    
    // Increment user message stats
    pipeline.incr(STATS_KEYS.USER_TOTAL_MESSAGES(userId));
    pipeline.incr(STATS_KEYS.USER_DAILY_MESSAGES(userId, now));
  }

  // Always increment token usage for billing/usage purposes
  // Increment global token stats
  pipeline.incrby(STATS_KEYS.TOTAL_TOKENS, tokens);
  pipeline.incrby(STATS_KEYS.DAILY_TOKENS(now), tokens);
  pipeline.incrby(STATS_KEYS.MONTHLY_TOKENS(now), tokens);
  
  // Increment user token stats
  pipeline.incrby(STATS_KEYS.USER_TOTAL_TOKENS(userId), tokens);
  pipeline.incrby(STATS_KEYS.USER_DAILY_TOKENS(userId, now), tokens);

  await pipeline.exec();
}

/**
 * Get global stats
 */
export async function getGlobalStats() {
  const { userId } = await auth();
  if (!userId) return null;

  const now = new Date();
  
  const [
    totalChats,
    totalMessages,
    totalTokens,
    dailyMessages,
    dailyTokens
  ] = await Promise.all([
    redis.get<number>(STATS_KEYS.TOTAL_CHATS) || 0,
    redis.get<number>(STATS_KEYS.TOTAL_MESSAGES) || 0,
    redis.get<number>(STATS_KEYS.TOTAL_TOKENS) || 0,
    redis.get<number>(STATS_KEYS.DAILY_MESSAGES(now)) || 0,
    redis.get<number>(STATS_KEYS.DAILY_TOKENS(now)) || 0,
  ]);

  return {
    totalChats,
    totalMessages,
    totalTokens,
    dailyMessages,
    dailyTokens
  };
}

/**
 * Get user stats
 */
export async function getUserStats() {
  const { userId } = await auth();
  if (!userId) return null;

  const now = new Date();
  
  const [
    totalChats,
    totalMessages,
    totalTokens,
    dailyMessages,
    dailyTokens
  ] = await Promise.all([
    redis.get<number>(STATS_KEYS.USER_TOTAL_CHATS(userId)) || 0,
    redis.get<number>(STATS_KEYS.USER_TOTAL_MESSAGES(userId)) || 0,
    redis.get<number>(STATS_KEYS.USER_TOTAL_TOKENS(userId)) || 0,
    redis.get<number>(STATS_KEYS.USER_DAILY_MESSAGES(userId, now)) || 0,
    redis.get<number>(STATS_KEYS.USER_DAILY_TOKENS(userId, now)) || 0,
  ]);

  return {
    totalChats,
    totalMessages,
    totalTokens,
    dailyMessages,
    dailyTokens
  };
}

/**
 * Estimate token count based on the content
 * This is a very rough estimation - for accurate counts you would need a tokenizer
 */
export async function estimateTokenCount(text: string): Promise<number> {
  // GPT models use about ~4 chars per token on average (very rough estimate)
  return Math.ceil(text.length / 4);
} 