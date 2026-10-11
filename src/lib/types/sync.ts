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

export interface SyncRejection {
  id: string;
  reason: string;
}

export interface BatchSyncResponse {
  appliedIds: string[];
  /** Changes the server will never accept (invalid, or the record belongs to someone else). */
  rejectedIds: SyncRejection[];
  serverChanges: Expense[];
  /** Server-clock cursor; send back as lastSyncTimestamp on the next sync. */
  serverTimestamp: string;
}
