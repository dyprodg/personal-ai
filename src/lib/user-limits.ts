import { ModelTier } from "./groq-models";
import { redis } from "./redis";

// Define limits for each tier
export interface TierLimits {
  messageLimit: number;
}

export const TIER_LIMITS: Record<ModelTier, TierLimits> = {
  free: {
    messageLimit: 200,
  },
  basic: {
    messageLimit: 1000,
  },
  premium: {
    messageLimit: 10000,
  },
};

// Redis key helpers
const getUserLimitKey = (userId: string) => `user:${userId}:limit`;
const getUserPeriodKey = (userId: string) => `user:${userId}:period`;

/**
 * Get the current message limit for a user
 */
export async function getUserLimit(userId: string): Promise<number> {
  const currentLimit = await redis.get<number>(getUserLimitKey(userId));
  return currentLimit ?? 0;
}

/**
 * Get the last period refresh date for a user
 */
export async function getUserPeriodDate(userId: string): Promise<Date | null> {
  const periodDate = await redis.get<string>(getUserPeriodKey(userId));
  return periodDate ? new Date(periodDate) : null;
}

/**
 * Set the user's message limit
 */
export async function setUserLimit(userId: string, limit: number): Promise<void> {
  await redis.set(getUserLimitKey(userId), limit);
}

/**
 * Set the user's period refresh date
 */
export async function setUserPeriodDate(userId: string, date: Date): Promise<void> {
  await redis.set(getUserPeriodKey(userId), date.toISOString());
}

/**
 * Check if the period needs to be refreshed (if it's a new calendar month)
 */
export function isPeriodExpired(lastRefreshDate: Date): boolean {
  const now = new Date();
  
  // Different calendar month or year
  return (
    now.getMonth() !== lastRefreshDate.getMonth() ||
    now.getFullYear() !== lastRefreshDate.getFullYear()
  );
}

/**
 * Initialize or refresh a user's limit based on their tier
 */
export async function refreshUserLimit(userId: string, tier: ModelTier): Promise<void> {
  const limit = TIER_LIMITS[tier].messageLimit;
  await setUserLimit(userId, limit);
  await setUserPeriodDate(userId, new Date());
}

/**
 * Check and update a user's period if needed
 * Returns true if the period was refreshed
 */
export async function checkAndUpdatePeriod(userId: string, tier: ModelTier): Promise<boolean> {
  const lastPeriodDate = await getUserPeriodDate(userId);
  
  // If no period date or period is expired, refresh
  if (!lastPeriodDate || isPeriodExpired(lastPeriodDate)) {
    await refreshUserLimit(userId, tier);
    return true;
  }
  
  return false;
} 