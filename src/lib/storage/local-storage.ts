import { isSyncedDocumentKey } from "@/lib/sync/document-keys";

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

export function getRawStorage(): Storage | null {
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

/**
 * Demo mode (sample data for presentations) is a per-user flag. It switches feature data to a
 * separate `<scope>::demo` namespace, so real data is never touched and turning demo off brings
 * it back. Sync keeps using the real scope and only uploads rows whose userId matches it, so
 * demo expenses (userId `<scope>::demo`) never reach the server.
 */
const DEMO_MODE_KEY = "finoch_demo_mode";

export function isDemoMode(): boolean {
  try {
    return getRawStorage()?.getItem(`${DEMO_MODE_KEY}::${getStorageScope()}`) === "1";
  } catch {
    return false;
  }
}

export function setDemoMode(on: boolean): void {
  try {
    const key = `${DEMO_MODE_KEY}::${getStorageScope()}`;
    if (on) getRawStorage()?.setItem(key, "1");
    else getRawStorage()?.removeItem(key);
  } catch (err) {
    console.error("Gagal mengubah mode demo:", err);
  }
}

/** Owner of feature data and local expenses: the storage scope, or its demo namespace. */
export function getDataScope(): string {
  const scope = getStorageScope();
  return isDemoMode() ? `${scope}::demo` : scope;
}

export function scopedKey(key: string, scope = getDataScope()): string {
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

/** Per-user sync state of each synced feature key on this device: local edit time and whether it still needs uploading. */
export type DocumentMeta = Record<string, { updatedAt: number; dirty: boolean }>;

export function docMetaKey(userId: string): string {
  return `finoch_doc_meta::${userId}`;
}

/** serverTime of the user's last document sync on this device; absent until the first pull. */
export function docCursorKey(userId: string): string {
  return `finoch_doc_cursor::${userId}`;
}

export function readDocumentMeta(userId: string): DocumentMeta {
  try {
    const parsed = JSON.parse(getRawStorage()?.getItem(docMetaKey(userId)) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeDocumentMeta(userId: string, meta: DocumentMeta): void {
  getRawStorage()?.setItem(docMetaKey(userId), JSON.stringify(meta));
}

/**
 * Marks a synced feature key as edited by the logged-in user. Guest and demo data never sync.
 * Writes made before this device's first document pull (template seeding, offline edits right
 * after login) are stamped 0: the server copy wins over them, so a fresh device can't clobber it.
 */
function trackDocumentChange(key: string): void {
  const userId = getStorageScope();
  if (userId === GUEST_SCOPE || isDemoMode() || !isSyncedDocumentKey(key)) return;
  try {
    const meta = readDocumentMeta(userId);
    meta[key] = { updatedAt: getRawStorage()?.getItem(docCursorKey(userId)) ? Date.now() : 0, dirty: true };
    writeDocumentMeta(userId, meta);
  } catch (err) {
    console.error("Gagal mencatat perubahan untuk sinkronisasi:", err);
  }
}

/** localStorage namespaced by the current scope; every feature store goes through here. */
export function getStorage(): ScopedStorage | null {
  const raw = getRawStorage();
  if (!raw) return null;
  return {
    getItem: (key) => raw.getItem(scopedKey(key)),
    setItem: (key, value) => {
      raw.setItem(scopedKey(key), value);
      trackDocumentChange(key);
    },
    removeItem: (key) => {
      raw.removeItem(scopedKey(key));
      trackDocumentChange(key);
    },
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
