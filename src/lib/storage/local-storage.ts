export function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof localStorage !== "undefined") return localStorage;
  return null;
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
