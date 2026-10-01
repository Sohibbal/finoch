import { syncQueue } from "../storage/sync-queue";
import { getDatabase } from "../storage/indexed-db";
import type { Expense } from "../types/expense";
import type { BatchSyncRequest, BatchSyncResponse } from "../types/sync";

/**
 * Reconciles conflicts between local and server records using Last-Write-Wins based on updatedAt.
 */
export function reconcileChanges(local: Expense, server: Expense): Expense {
  const localTime = new Date(local.updatedAt).getTime();
  const serverTime = new Date(server.updatedAt).getTime();

  if (localTime >= serverTime) {
    return local;
  }
  return server;
}

export class SyncManager {
  private isSyncing = false;
  private listeners = new Set<(status: "synced" | "syncing" | "pending" | "failed" | "offline") => void>();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleNetworkReturn());
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.triggerSync();
        }
      });
    }
  }

  subscribe(callback: (status: "synced" | "syncing" | "pending" | "failed" | "offline") => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(status: "synced" | "syncing" | "pending" | "failed" | "offline") {
    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch {
        // Ignore subscriber errors
      }
    }
  }

  private async handleNetworkReturn() {
    await this.triggerSync();
  }

  async triggerSync(): Promise<boolean> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.notify("offline");
      return false;
    }

    if (this.isSyncing) return false;
    this.isSyncing = true;
    this.notify("syncing");

    try {
      const pendingItems = await syncQueue.getPendingItems();

      // Retrieve last sync timestamp from metadata
      const db = await getDatabase();
      const meta = await db.get("metadata", "last_sync_timestamp");
      const lastSyncTimestamp = meta?.val;

      // Even if pendingItems is empty, we sync to pull remote changes
      const payload: BatchSyncRequest = {
        clientChanges: pendingItems.map(item => ({
          id: item.id,
          action: item.action,
          payload: item.payload,
        })),
        lastSyncTimestamp,
      };

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // If 401, user is guest/unauthenticated; local changes remain queued
        if (response.status === 401) {
          this.notify("pending");
          return false;
        }
        throw new Error(`Sync failed with status ${response.status}`);
      }

      const result: BatchSyncResponse = await response.json();

      // Remove applied items from sync queue
      if (result.appliedIds && result.appliedIds.length > 0) {
        await syncQueue.removeItems(result.appliedIds);
      }

      // Reconcile incoming server changes into local IndexedDB
      if (result.serverChanges && result.serverChanges.length > 0) {
        const tx = db.transaction("expenses", "readwrite");
        for (const remote of result.serverChanges) {
          const existing = await tx.store.get(remote.id);
          if (existing) {
            const winner = reconcileChanges(existing, remote);
            winner.syncStatus = "synced";
            await tx.store.put(winner);
          } else {
            await tx.store.put({ ...remote, syncStatus: "synced" });
          }
        }
        await tx.done;
      }

      // Update last sync timestamp
      await db.put("metadata", {
        key: "last_sync_timestamp",
        val: result.serverTimestamp || new Date().toISOString(),
      });

      this.notify("synced");
      return true;
    } catch (error) {
      this.notify("failed");
      return false;
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncManager = new SyncManager();
