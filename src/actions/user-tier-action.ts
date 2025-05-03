"use server";

import { ModelTier } from "@/lib/groq-models";
import { getUserTier as getTier } from "@/lib/user-tier";

/**
 * Server action to get the user's tier
 * This ensures we use the server-side Redis connection
 * rather than the client-side which may not have credentials
 */
export async function getUserTierAction(userId: string): Promise<ModelTier> {
  try {
    const tier = await getTier(userId);
    return tier;
  } catch (error) {
    console.error(`Error getting user tier:`, error);
    return "free"; // Default to free tier on error
  }
} 