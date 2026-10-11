/**
 * Local-calendar date helpers. `toISOString()` is UTC, so an expense at 00:30 WIB
 * would land on the previous day; these use the device's local calendar instead.
 */

/** YYYY-MM-DD in local time. */
export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** True when both dates fall in the same local calendar month. */
export function isSameLocalMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Parses a date string; null when missing or invalid. */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Local YYYY-MM-DD `days` from `from`. */
export function localDateKeyFromNow(days: number, from: Date = new Date()): string {
  return localDateKey(new Date(from.getFullYear(), from.getMonth(), from.getDate() + days));
}
