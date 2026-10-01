import { getDatabase } from "./indexed-db";
import type { SyncAction, SyncQueueItem } from "../types/sync";
import type { Expense } from "../types/expense";

export class SyncQueueManager {
  async enqueue(action: SyncAction, expense: Expense): Promise<SyncQueueItem> {
    const db = await getDatabase();
    const item: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      expenseId: expense.id,
      action,
      payload: expense,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await db.put("sync_queue", item);
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

  async markFailed(id: string, errorMessage: string): Promise<void> {
    const db = await getDatabase();
    const item = await db.get("sync_queue", id);
    if (item) {
      item.retryCount += 1;
      item.errorMessage = errorMessage;
      await db.put("sync_queue", item);
    }
  }

  async clearQueue(): Promise<void> {
    const db = await getDatabase();
    await db.clear("sync_queue");
  }
}

export const syncQueue = new SyncQueueManager();
