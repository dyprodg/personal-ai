export type ModelTier = "free" | "basic" | "premium";

export interface GroqModel {
  id: string;
  name: string;
  description: string;
  tier: ModelTier;
}

export const GROQ_MODELS: GroqModel[] = [
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 (8B) Instant",
    description: "Fast responses, good for basic tasks",
    tier: "free",
  },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout (17B)",
    description: "Balanced performance and capabilities",
    tier: "basic",
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    name: "DeepSeek R1 Distill Llama (70B)",
    description: "Advanced reasoning and knowledge",
    tier: "premium",
  },
];

// Model IDs by tier for easy access
export const FREE_TIER_MODEL_IDS = GROQ_MODELS
  .filter(model => model.tier === "free")
  .map(model => model.id);

export const BASIC_TIER_MODEL_IDS = [
  ...FREE_TIER_MODEL_IDS,
  ...GROQ_MODELS
    .filter(model => model.tier === "basic")
    .map(model => model.id)
];

export const PREMIUM_TIER_MODEL_IDS = [
  ...BASIC_TIER_MODEL_IDS,
  ...GROQ_MODELS
    .filter(model => model.tier === "premium")
    .map(model => model.id)
];

/**
 * Check if a model is available for a specific user tier
 */
export function isModelAvailableForTier(modelId: string, userTier: ModelTier): boolean {
  // Find the model to get its tier
  const model = GROQ_MODELS.find(m => m.id === modelId);
  if (!model) return false;
  
  // Check availability based on tier
  switch (userTier) {
    case "premium":
      return true; // Premium users can access all models
    case "basic":
      return model.tier === "free" || model.tier === "basic";
    case "free":
    default:
      return model.tier === "free";
  }
}

/**
 * Get all models available for a specific user tier
 */
export function getAvailableModelsForTier(userTier: ModelTier): GroqModel[] {
  switch (userTier) {
    case "premium":
      return GROQ_MODELS;
    case "basic":
      return GROQ_MODELS.filter(model => model.tier === "free" || model.tier === "basic");
    case "free":
    default:
      return GROQ_MODELS.filter(model => model.tier === "free");
  }
}

/**
 * Get model IDs available for a specific user tier
 */
export function getModelIdsForTier(userTier: ModelTier): string[] {
  switch (userTier) {
    case "premium":
      return PREMIUM_TIER_MODEL_IDS;
    case "basic":
      return BASIC_TIER_MODEL_IDS;
    case "free":
    default:
      return FREE_TIER_MODEL_IDS;
  }
} 