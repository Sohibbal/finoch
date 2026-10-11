export interface WishlistProjectionResult {
  estimatedDays: number;
  status: "on_track" | "delayed" | "achievable_now";
  targetDateISO: string;
}

/**
 * Calculates projection and estimated timeline for reaching a wishlist item.
 * @param targetPrice Total cost of the item
 * @param currentSavings User's current net savings / surplus allocated
 * @param dailySavingsRate Surplus savings per day (income - expenses normalized)
 * @param now Reference date
 */
export function calculateWishlistProjection(
  targetPrice: number,
  currentSavings: number,
  dailySavingsRate: number,
  now: Date = new Date()
): WishlistProjectionResult {
  const cleanTarget = Math.max(0, targetPrice || 0);
  const cleanSavings = Math.max(0, currentSavings || 0);
  const remaining = Math.max(0, cleanTarget - cleanSavings);

  if (remaining === 0) {
    return {
      estimatedDays: 0,
      status: "achievable_now",
      targetDateISO: now.toISOString(),
    };
  }

  if (dailySavingsRate <= 0) {
    const delayedDate = new Date(now.getTime() + 999 * 86400000);
    return {
      estimatedDays: 999,
      status: "delayed",
      targetDateISO: delayedDate.toISOString(),
    };
  }

  const days = Math.ceil(remaining / dailySavingsRate);
  const targetDate = new Date(now.getTime() + days * 86400000);

  return {
    estimatedDays: days,
    status: "on_track",
    targetDateISO: targetDate.toISOString(),
  };
}
