import { getDatabase } from "./indexed-db";
import type { SyncAction, SyncQueueItem } from "../types/sync";
import type { Expense } from "../types/expense";

/** After this many failed attempts an item is dropped so one poisoned change can't wedge the queue. */
export const MAX_SYNC_RETRIES = 5;

// The queue is read in timestamp order; two changes in the same millisecond must still keep
// the order they were made in (create before its edit), so timestamps only ever increase.
let lastTimestamp = 0;
function nextTimestamp(): number {
  lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
  return lastTimestamp;
}

export class SyncQueueManager {
  async enqueue(action: SyncAction, expense: Expense): Promise<SyncQueueItem> {
    const db = await getDatabase();
    const item: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      expenseId: expense.id,
      action,
      payload: expense,
      timestamp: nextTimestamp(),
      retryCount: 0,
    };

    // Demo-mode rows (userId "<scope>::demo") are sample data and must never reach the server.
    if (!expense.userId.endsWith("::demo")) await db.put("sync_queue", item);
    return item;
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const tx = db.transaction("sync_queue", "readonly");
    const index = tx.store.index("by-timestamp");
    return index.getAll();
  }

  async removeItem(id: string): Promise<void> {
    const db = await getDatabase();
    await db.delete("sync_queue", id);
  }

  async removeItems(ids: string[]): Promise<void> {
    const db = await getDatabase();
    const tx = db.transaction("sync_queue", "readwrite");
    await Promise.all(ids.map(id => tx.store.delete(id)));
    await tx.done;
  }

  /** Counts a failed attempt; returns true when the item hit MAX_SYNC_RETRIES and was dropped. */
  async markFailed(id: string, errorMessage: string): Promise<boolean> {
    const db = await getDatabase();
    const item = await db.get("sync_queue", id);
    if (!item) return false;
    item.retryCount += 1;
    item.errorMessage = errorMessage;
    if (item.retryCount >= MAX_SYNC_RETRIES) {
      await db.delete("sync_queue", id);
      return true;
    }
    await db.put("sync_queue", item);
    return false;
  }

  async removeUserItems(userId: string): Promise<void> {
    const db = await getDatabase();
    const all = await db.getAll("sync_queue");
    const userItemIds = all
      .filter((item) => item.payload.userId === userId)
      .map((item) => item.id);
    if (userItemIds.length > 0) {
      await this.removeItems(userItemIds);
    }
  }

  async removeExpenseItems(expenseId: string): Promise<void> {
    const db = await getDatabase();
    const ids = (await db.getAll("sync_queue")).filter((item) => item.expenseId === expenseId).map((item) => item.id);
    if (ids.length > 0) await this.removeItems(ids);
  }

  async clearQueue(): Promise<void> {
    const db = await getDatabase();
    await db.clear("sync_queue");
  }
}

export const syncQueue = new SyncQueueManager();
