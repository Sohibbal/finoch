export const GUEST_SCOPE = "guest";

/** Device-level key remembering whose data is active, so reloads read the right scope before /api/auth/me answers. */
export const STORAGE_SCOPE_KEY = "finoch_storage_scope";

/**
 * Feature keys written before per-user scoping existed. Frozen on purpose: new
 * feature keys are scoped from day one and never need migrating. Device prefs
 * (theme, PWA prompt, whisper model) are not listed and stay global.
 */
export const LEGACY_FEATURE_KEYS = [
  "finoch_recurring_bills",
  "finoch_budget_envelopes_v1",
  "finoch_budget_transfers_v1",
  "finoch_student_debts_v1",
  "finoch_talangan_records",
  "finoch_student_ukt_plans_v1",
  "finoch_student_wallets_v1",
  "finoch_student_wallet_transfers_v1",
  "finoch_student_wishlist",
];

export type ScopedStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getRawStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof localStorage !== "undefined") return localStorage;
  return null;
}

/** Current data owner: the logged-in user's id, or "guest". */
export function getStorageScope(): string {
  try {
    return getRawStorage()?.getItem(STORAGE_SCOPE_KEY) || GUEST_SCOPE;
  } catch {
    return GUEST_SCOPE;
  }
}

export function scopedKey(key: string, scope = getStorageScope()): string {
  return `${key}::${scope}`;
}

/**
 * Switches whose data feature stores read and write. Called by useAuth on
 * session check, login, register and logout. The first user to log in on a
 * device inherits the pre-scoping (legacy) data once; the legacy key is removed
 * so nobody else can claim it later.
 */
export function setStorageScope(userId: string | null | undefined): void {
  const raw = getRawStorage();
  if (!raw) return;
  const scope = userId || GUEST_SCOPE;
  try {
    raw.setItem(STORAGE_SCOPE_KEY, scope);
    if (scope === GUEST_SCOPE) return;
    for (const key of LEGACY_FEATURE_KEYS) {
      const legacy = raw.getItem(key);
      if (legacy === null) continue;
      const target = scopedKey(key, scope);
      if (raw.getItem(target) === null) raw.setItem(target, legacy);
      raw.removeItem(key);
    }
  } catch (err) {
    console.error("Gagal mengganti scope storage:", err);
  }
}

/** localStorage namespaced by the current scope; every feature store goes through here. */
export function getStorage(): ScopedStorage | null {
  const raw = getRawStorage();
  if (!raw) return null;
  return {
    getItem: (key) => raw.getItem(scopedKey(key)),
    setItem: (key, value) => raw.setItem(scopedKey(key), value),
    removeItem: (key) => raw.removeItem(scopedKey(key)),
  };
}

/**
 * Reads a JSON array from localStorage.
 * Returns null when the key is absent (caller may seed defaults), [] when the
 * stored value is corrupt or not an array, so a deleted-to-empty list stays empty.
 */
export function readArray<T>(key: string): T[] | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Gagal membaca storage ${key}:`, err);
    return [];
  }
}
