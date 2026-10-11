import { syncQueue } from "../storage/sync-queue";
import { getDatabase } from "../storage/indexed-db";
import { getStorageScope } from "../storage/local-storage";
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

// Per user: another account on the same device must start from its own cursor.
function lastSyncKey(userId: string): string {
  return `last_sync_timestamp::${userId}`;
}

export class SyncManager {
  private isSyncing = false;
  private isAuthenticated: boolean | null = null;
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

  setAuthenticated(status: boolean) {
    this.isAuthenticated = status;
    if (status) {
      this.triggerSync(true);
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

  async triggerSync(force = false): Promise<boolean> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.notify("offline");
      return false;
    }

    if (this.isAuthenticated === false && !force) {
      this.notify("pending");
      return false;
    }

    if (this.isSyncing) return false;
    this.isSyncing = true;
    this.notify("syncing");

    try {
      // Only the active user's changes; items left by another account on this device must never upload under this session.
      const userId = getStorageScope();
      const pendingItems = (await syncQueue.getPendingItems()).filter(item => item.payload.userId === userId);

      // Retrieve last sync timestamp from metadata
      const db = await getDatabase();
      const meta = await db.get("metadata", lastSyncKey(userId));
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
          this.isAuthenticated = false;
          this.notify("pending");
          return false;
        }
        throw new Error(`Sync failed with status ${response.status}`);
      }

      this.isAuthenticated = true;
      const result: BatchSyncResponse = await response.json();

      // Applied and rejected items are settled; rejected ones will never be accepted, so retrying is pointless.
      const appliedIds = result.appliedIds ?? [];
      const rejectedIds = (result.rejectedIds ?? []).map(r => r.id);
      const settled = new Set([...appliedIds, ...rejectedIds]);
      if (settled.size > 0) {
        await syncQueue.removeItems([...settled]);
      }

      // Anything else failed server-side this round; count it so a poisoned item is eventually dropped.
      const failedExpenseIds = pendingItems.filter(item => rejectedIds.includes(item.id)).map(item => item.expenseId);
      for (const item of pendingItems) {
        if (settled.has(item.id)) continue;
        if (await syncQueue.markFailed(item.id, "Tidak diproses server")) {
          failedExpenseIds.push(item.expenseId);
        }
      }
      if (failedExpenseIds.length > 0) {
        await this.markExpensesFailed(failedExpenseIds);
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
        key: lastSyncKey(userId),
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

  /** Local copies stay on the device but are flagged so the UI can tell they never reached the server. */
  private async markExpensesFailed(expenseIds: string[]) {
    const db = await getDatabase();
    const tx = db.transaction("expenses", "readwrite");
    for (const id of expenseIds) {
      const expense = await tx.store.get(id);
      if (expense) await tx.store.put({ ...expense, syncStatus: "failed" });
    }
    await tx.done;
  }

  /** Forgets a user's unsynced queue items and pull cursor (used on logout). Their local expenses stay, scoped by userId. */
  async clearUserSyncState(userId: string) {
    await syncQueue.removeUserItems(userId);
    const db = await getDatabase();
    await db.delete("metadata", lastSyncKey(userId));
  }
}

export const syncManager = new SyncManager();
