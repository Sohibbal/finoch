import { syncQueue } from "../storage/sync-queue";
import { getDatabase } from "../storage/indexed-db";
import {
  GUEST_SCOPE,
  docCursorKey,
  getRawStorage,
  getStorageScope,
  readDocumentMeta,
  scopedKey,
  writeDocumentMeta,
} from "../storage/local-storage";
import { DATA_PULLED_EVENT, SYNCED_DOCUMENT_KEYS, isSyncedDocumentKey } from "./document-keys";
import type { Expense } from "../types/expense";
import type { BatchSyncRequest, BatchSyncResponse, DocumentSyncRequest, DocumentSyncResponse, SyncDocument } from "../types/sync";

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

function parseStored(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function postDocuments(body: DocumentSyncRequest): Promise<DocumentSyncResponse> {
  const response = await fetch("/api/sync/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Document sync failed with status ${response.status}`);
  return response.json();
}

/**
 * Writes pulled documents into the user's real (non-demo) scope. A local edit not yet pushed wins
 * until it is; writes stamped 0 (made before this device's first pull) always lose. Writes go to raw
 * storage so applying server data never marks a key dirty again. Returns whether anything changed.
 */
function applyDocuments(userId: string, documents: SyncDocument[]): boolean {
  const raw = getRawStorage();
  if (!raw) return false;
  const meta = readDocumentMeta(userId);
  let changed = false;
  for (const doc of documents) {
    if (!isSyncedDocumentKey(doc.key)) continue;
    const docTime = new Date(doc.updatedAt).getTime();
    const local = meta[doc.key];
    if (local && ((local.dirty && local.updatedAt > 0) || docTime <= local.updatedAt)) continue;
    const target = scopedKey(doc.key, userId);
    if (doc.isDeleted) raw.removeItem(target);
    else raw.setItem(target, JSON.stringify(doc.data));
    meta[doc.key] = { updatedAt: docTime, dirty: false };
    changed = true;
  }
  writeDocumentMeta(userId, meta);
  return changed;
}

/**
 * Syncs the localStorage feature stores (wallets, debts, bills, ...) as one document per key.
 * A device's first sync pulls before it pushes, so its seeded templates never overwrite server data.
 */
export async function syncDocuments(userId: string): Promise<void> {
  const raw = getRawStorage();
  if (!raw || userId === GUEST_SCOPE) return;

  // Data written outside getStorage (pre-sync installs, legacy key migration) uploads once, but loses to a server copy.
  const meta = readDocumentMeta(userId);
  for (const key of SYNCED_DOCUMENT_KEYS) {
    if (!meta[key] && raw.getItem(scopedKey(key, userId)) !== null) meta[key] = { updatedAt: 0, dirty: true };
  }
  writeDocumentMeta(userId, meta);

  let pulled = false;
  try {
    let since = raw.getItem(docCursorKey(userId)) ?? undefined;
    if (!since) {
      const first = await postDocuments({ changes: [] });
      pulled = applyDocuments(userId, first.documents);
      since = first.serverTime;
      raw.setItem(docCursorKey(userId), since);
    }

    // Still-unstamped writes are pushed as of now; the first pull already let the server copy win over them.
    const dirtyMeta = readDocumentMeta(userId);
    const pushed = new Map<string, string | null>();
    const changes: SyncDocument[] = [];
    for (const [key, entry] of Object.entries(dirtyMeta)) {
      if (!entry.dirty || !isSyncedDocumentKey(key)) continue;
      if (!entry.updatedAt) entry.updatedAt = Date.now();
      const value = raw.getItem(scopedKey(key, userId));
      pushed.set(key, value);
      changes.push({
        key,
        data: value === null ? null : parseStored(value),
        isDeleted: value === null,
        updatedAt: new Date(entry.updatedAt).toISOString(),
      });
    }
    writeDocumentMeta(userId, dirtyMeta);

    const result = await postDocuments({ changes, since });

    // Settled keys are clean unless they were edited again while the request was in flight.
    const settledMeta = readDocumentMeta(userId);
    for (const key of [...result.appliedKeys, ...result.rejected.map((r) => r.key)]) {
      const entry = settledMeta[key];
      if (entry && pushed.has(key) && raw.getItem(scopedKey(key, userId)) === pushed.get(key)) entry.dirty = false;
    }
    writeDocumentMeta(userId, settledMeta);

    pulled = applyDocuments(userId, result.documents) || pulled;
    raw.setItem(docCursorKey(userId), result.serverTime);
  } finally {
    if (pulled && typeof window !== "undefined") window.dispatchEvent(new Event(DATA_PULLED_EVENT));
  }
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
        if (db.objectStoreNames.contains("transactions")) {
          const tx = db.transaction("transactions", "readwrite");
          for (const remote of result.serverChanges) {
            const existing = await tx.store.get(remote.id);
            if (existing) {
              const winner = reconcileChanges(existing as any, remote as any);
              winner.syncStatus = "synced";
              await tx.store.put(winner as any);
            } else {
              await tx.store.put({ ...remote, syncStatus: "synced" } as any);
            }
          }
          await tx.done;
        }

        if (db.objectStoreNames.contains("expenses")) {
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

        if (result.serverWishlists && result.serverWishlists.length > 0 && db.objectStoreNames.contains("wishlists")) {
          const wtx = db.transaction("wishlists", "readwrite");
          for (const remote of result.serverWishlists) {
            const existing = await wtx.store.get(remote.id);
            if (existing) {
              const localTime = new Date(existing.updatedAt).getTime();
              const serverTime = new Date(remote.updatedAt).getTime();
              const winner = localTime >= serverTime ? existing : remote;
              winner.syncStatus = "synced";
              await wtx.store.put(winner);
            } else {
              await wtx.store.put({ ...remote, syncStatus: "synced" });
            }
          }
          await wtx.done;
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("finoch:wishlist-changed"));
          }
        }
      }

      // Update last sync timestamp
      await db.put("metadata", {
        key: lastSyncKey(userId),
        val: result.serverTimestamp || new Date().toISOString(),
      });

      await syncDocuments(userId);

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

  /**
   * Forgets a user's unsynced queue items and pull cursors (used on logout). Their local expenses and
   * feature data stay, scoped by userId; unpushed document edits stay dirty for their next login.
   */
  async clearUserSyncState(userId: string) {
    getRawStorage()?.removeItem(docCursorKey(userId));
    await syncQueue.removeUserItems(userId);
    const db = await getDatabase();
    await db.delete("metadata", lastSyncKey(userId));
  }
}

export const syncManager = new SyncManager();
