export type ExpenseCategory = "primer" | "bocor_halus";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface Expense {
  id: string;
  userId: string;
  itemName: string;
  amount: number;
  category: ExpenseCategory;
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
