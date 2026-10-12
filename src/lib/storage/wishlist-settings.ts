import { getStorage } from "@/lib/storage/local-storage";

export const DEFAULT_WISHLIST_SAVINGS_PERCENTAGE = 20;
export const WISHLIST_SAVINGS_STORAGE_KEY = "finoch_wishlist_savings_pct";
export const WISHLIST_SETTINGS_CHANGED_EVENT = "finoch:wishlist-settings-changed";

/**
 * Gets the configured percentage of daily allowance dedicated to wishlist savings.
 * Defaults to 20% if not yet configured.
 */
export function getWishlistSavingsPercentage(): number {
  const storage = getStorage();
  if (!storage) return DEFAULT_WISHLIST_SAVINGS_PERCENTAGE;

  try {
    const raw = storage.getItem(WISHLIST_SAVINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_WISHLIST_SAVINGS_PERCENTAGE;
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
      return DEFAULT_WISHLIST_SAVINGS_PERCENTAGE;
    }
    return parsed;
  } catch {
    return DEFAULT_WISHLIST_SAVINGS_PERCENTAGE;
  }
}

/**
 * Saves the configured percentage of daily allowance dedicated to wishlist savings.
 * Dispatches an event so other components and the dashboard update reactively.
 */
export function setWishlistSavingsPercentage(percentage: number): void {
  const storage = getStorage();
  if (!storage) return;

  const clean = Math.min(100, Math.max(1, Math.round(percentage)));
  try {
    storage.setItem(WISHLIST_SAVINGS_STORAGE_KEY, clean.toString());
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(WISHLIST_SETTINGS_CHANGED_EVENT, { detail: { percentage: clean } }));
      window.dispatchEvent(new Event("finoch:wishlist-changed"));
    }
  } catch (err) {
    console.error("Gagal menyimpan persentase tabungan wishlist:", err);
  }
}
