import { ModelTier } from "./groq-models";
import { redis } from "./redis";
import { getUserTier, setUserTier } from "./user-tier";
import { refreshUserLimit } from "./user-limits";

/**
 * Initialize a new user with default settings
 * Sets up tier and message limits
 */
export async function initializeNewUser(userId: string, tier: ModelTier = "free"): Promise<void> {
  // Set the user's tier
  await setUserTier(userId, tier);
  
  // Initialize message limits based on tier
  await refreshUserLimit(userId, tier);
}

/**
 * Check if a user is already initialized
 */
export async function isUserInitialized(userId: string): Promise<boolean> {
  const userTier = await getUserTier(userId);
  
  // If the user has a tier, consider them initialized
  // The tier function defaults to "free" if not found, so we need
  // to check if the key actually exists in Redis
  const userTierKey = `user:${userId}:tier`;
  const tierExists = await redis.get(userTierKey);
  
  return !!tierExists;
}

/**
 * Process a user's subscription change
 * Updates tier and refreshes limits
 */
export async function processSubscriptionChange(
  userId: string,
  newTier: ModelTier
): Promise<void> {
  // Get current tier
  const currentTier = await getUserTier(userId);
  
  // Set the new tier
  await setUserTier(userId, newTier);
  
  // Refresh limits with the new tier
  await refreshUserLimit(userId, newTier);
} 