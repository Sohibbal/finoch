/**
 * localStorage feature keys synced to the server as whole-value documents (one row per user per key).
 * Shared by the client tracker and the /api/sync/documents allowlist. Device prefs (theme, PWA,
 * whisper, storage scope, demo flag) and the profile cache (`finoch_financial_profile`, the server
 * owns the profile) are deliberately absent.
 */
export const SYNCED_DOCUMENT_KEYS = [
  "finoch_recurring_bills",
  "finoch_budget_envelopes_v1",
  "finoch_budget_transfers_v1",
  "finoch_budget_allowance_v1",
  "finoch_student_debts_v1",
  "finoch_talangan_records",
  "finoch_student_ukt_plans_v1",
  "finoch_student_wallets_v1",
  "finoch_student_wallet_transfers_v1",
  "finoch_student_wishlist",
  "finoch_savings_goals_v1",
] as const;

export function isSyncedDocumentKey(key: unknown): key is string {
  return typeof key === "string" && (SYNCED_DOCUMENT_KEYS as readonly string[]).includes(key);
}

/** Fired after the document sync wrote server data into localStorage, so open pages re-read it. */
export const DATA_PULLED_EVENT = "finoch:data-pulled";
