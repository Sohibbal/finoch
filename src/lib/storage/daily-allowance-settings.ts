import { getStorage } from "@/lib/storage/local-storage";

export const DEFAULT_DAILY_ALLOWANCE = 50000;
export const DAILY_ALLOWANCE_STORAGE_KEY = "finoch_daily_allowance_target";
export const DAILY_ALLOWANCE_CHANGED_EVENT = "finoch:daily-allowance-changed";

/**
 * Gets the user-configured daily allowance target (in IDR).
 * Defaults to 50,000 if not yet configured.
 */
export function getDailyAllowanceSetting(): number {
  const storage = getStorage();
  if (!storage) return DEFAULT_DAILY_ALLOWANCE;

  try {
    const raw = storage.getItem(DAILY_ALLOWANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_DAILY_ALLOWANCE;
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return DEFAULT_DAILY_ALLOWANCE;
    }
    return parsed;
  } catch {
    return DEFAULT_DAILY_ALLOWANCE;
  }
}

/**
 * Saves the user-configured daily allowance target (in IDR).
 * Dispatches an event so other components and the dashboard update reactively.
 */
export function setDailyAllowanceSetting(amount: number): void {
  const storage = getStorage();
  if (!storage) return;

  const clean = Math.max(1000, Math.round(amount));
  try {
    storage.setItem(DAILY_ALLOWANCE_STORAGE_KEY, clean.toString());
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(DAILY_ALLOWANCE_CHANGED_EVENT, { detail: { allowance: clean } })
      );
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
  } catch (err) {
    console.error("Gagal menyimpan target jatah harian:", err);
  }
}
