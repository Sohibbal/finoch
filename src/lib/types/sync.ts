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

/** One synced localStorage feature key; `data` is the parsed JSON value stored under it. */
export interface SyncDocument {
  key: string;
  data: unknown;
  isDeleted: boolean;
  /** Client edit time, last-write-wins per key. */
  updatedAt: string;
}

export interface DocumentSyncRequest {
  changes: SyncDocument[];
  /** serverTime of the previous document sync; omitted on a device's first pull. */
  since?: string;
}

export interface DocumentSyncResponse {
  appliedKeys: string[];
  rejected: { key: string; reason: string }[];
  /** Documents changed on the server since `since` (all of them when omitted). */
  documents: SyncDocument[];
  serverTime: string;
}
