"use client";

import { useEffect, useState, useRef } from "react";
import { getUserRemainingMessages } from "@/actions/user-limits";
import { formatTierName } from "@/lib/user-tier";
import { ModelTier } from "@/lib/groq-models";
import { useUser } from "@clerk/nextjs";

export default function UsageDisplay() {
  const { user, isLoaded } = useUser();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [tier, setTier] = useState<ModelTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevTierRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      if (!isLoaded || !user) return;

      try {
        setIsLoading(true);
        const { limit, tier: userTier } = await getUserRemainingMessages(
          user.id
        );

        setRemaining(limit);
        setTier(userTier as ModelTier);
      } catch (err) {
        console.error("[UsageDisplay] Error fetching usage:", err);
        setError("Could not load your usage information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();

    // Set up interval to refresh usage data every 10 seconds
    const refreshInterval = setInterval(fetchUsage, 10000);

    return () => clearInterval(refreshInterval);
  }, [user, isLoaded]);

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <svg className="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Loading usage...
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col space-y-1">
      <div className="text-sm flex items-center">
        <span className="text-gray-600 mr-2">Tier:</span>
        <span
          className="font-medium text-blue-600"
          data-tier={tier} // Add data attribute for debugging
        >
          {tier && formatTierName(tier)}
        </span>
      </div>
      <div className="text-sm flex items-center">
        <span className="text-gray-600 mr-2">Messages remaining:</span>
        <span className="font-medium text-blue-600">{remaining}</span>
      </div>
    </div>
  );
}
