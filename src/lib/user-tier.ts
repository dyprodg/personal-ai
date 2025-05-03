import { ModelTier } from "./groq-models";

/**
 * Get a user's subscription tier by userId
 * For now, this is hardcoded, but in the future it would fetch from a database or API
 * 
 * Works for both client and server contexts
 */
export async function getUserTier(userId: string): Promise<ModelTier> {
  // Hardcoded for now - would be replaced with actual lookup
  // In production, this would check a database or subscription service
  return "premium";
}

/**
 * Format a tier name for display
 */
export function formatTierName(tier: ModelTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

/**
 * Get tier upgrade information
 */
export function getTierUpgradeInfo(currentTier: ModelTier): { 
  canUpgrade: boolean; 
  nextTier?: ModelTier;
  upgradeText: string;
} {
  switch (currentTier) {
    case "free":
      return { 
        canUpgrade: true, 
        nextTier: "basic",
        upgradeText: "Upgrade to Basic" 
      };
    case "basic":
      return { 
        canUpgrade: true, 
        nextTier: "premium",
        upgradeText: "Upgrade to Premium" 
      };
    case "premium":
      return { 
        canUpgrade: false,
        upgradeText: "Manage subscription" 
      };
    default:
      return { 
        canUpgrade: false,
        upgradeText: "View plans" 
      };
  }
} 