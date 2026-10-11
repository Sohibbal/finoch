import { openDB, type IDBPDatabase } from "idb";
import type { Expense } from "../types/expense";
import type { SyncQueueItem } from "../types/sync";
import type { LocalTransaction } from "./transaction-storage";
import type { LocalWishlist } from "./wishlist-storage";

export const DB_NAME = "finoch_db";
export const DB_VERSION = 2;

export interface FinochDBSchema {
  transactions: {
    key: string;
    value: LocalTransaction;
    indexes: {
      "by-user": string;
      "by-type": string;
      "by-date": string;
    };
  };
  wishlists: {
    key: string;
    value: LocalWishlist;
    indexes: {
      "by-user": string;
      "by-achieved": number; // 0 or 1 for indexing
    };
  };
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

let dbPromise: Promise<IDBPDatabase<FinochDBSchema>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<FinochDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<FinochDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("transactions")) {
          const txStore = db.createObjectStore("transactions", { keyPath: "id" });
          txStore.createIndex("by-user", "userId");
          txStore.createIndex("by-type", "type");
          txStore.createIndex("by-date", "transactionDate");
        }

        if (!db.objectStoreNames.contains("wishlists")) {
          const wishStore = db.createObjectStore("wishlists", { keyPath: "id" });
          wishStore.createIndex("by-user", "userId");
          wishStore.createIndex("by-achieved", "isAchieved");
        }

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
