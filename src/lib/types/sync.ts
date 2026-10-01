import type { Expense, SyncStatus } from "./expense";

export type SyncAction = "create" | "update" | "delete";

export interface SyncQueueItem {
  id: string;
  expenseId: string;
  action: SyncAction;
  payload: Expense;
  timestamp: number;
  retryCount: number;
  errorMessage?: string;
}

export interface BatchSyncRequest {
  clientChanges: {
    id: string;
    action: SyncAction;
    payload: Expense;
  }[];
  lastSyncTimestamp?: string;
}

export interface BatchSyncResponse {
  appliedIds: string[];
  serverChanges: Expense[];
  serverTimestamp: string;
}
