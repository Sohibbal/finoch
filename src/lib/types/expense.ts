export type ExpenseCategory =
  | "Food & Drinks"
  | "Transportation"
  | "Bills & Utilities"
  | "Shopping & Lifestyle"
  | "Other"
  | string;

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface Expense {
  id: string;
  userId: string;
  itemName: string;
  amount: number;
  category: ExpenseCategory;
  /** Wallet the money came out of; null/undefined when the user has no wallets. */
  walletId?: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus?: SyncStatus;
  isDeleted?: boolean;
}

export interface ParsedVoiceItem {
  id: string;
  rawText: string;
  itemName: string;
  amount: number;
  category: ExpenseCategory;
  confidence: number;
}
