import { openDB, type IDBPDatabase } from "idb";
import type { Expense } from "../types/expense";
import type { SyncQueueItem } from "../types/sync";

export const DB_NAME = "voicash_db";
export const DB_VERSION = 1;

export interface VoiCashDBSchema {
  expenses: {
    key: string;
    value: Expense;
    indexes: {
      "by-user": string;
      "by-created": string;
      "by-sync-status": string;
    };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      "by-timestamp": number;
      "by-action": string;
    };
  };
  metadata: {
    key: string;
    value: { key: string; val: any };
  };
}

let dbPromise: Promise<IDBPDatabase<VoiCashDBSchema>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<VoiCashDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<VoiCashDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("expenses")) {
          const expenseStore = db.createObjectStore("expenses", { keyPath: "id" });
          expenseStore.createIndex("by-user", "userId");
          expenseStore.createIndex("by-created", "createdAt");
          expenseStore.createIndex("by-sync-status", "syncStatus");
        }

        if (!db.objectStoreNames.contains("sync_queue")) {
          const queueStore = db.createObjectStore("sync_queue", { keyPath: "id" });
          queueStore.createIndex("by-timestamp", "timestamp");
          queueStore.createIndex("by-action", "action");
        }

        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}
