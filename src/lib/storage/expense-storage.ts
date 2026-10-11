import { getDatabase } from "./indexed-db";
import { syncQueue } from "./sync-queue";
import { GUEST_SCOPE, getDataScope } from "./local-storage";
import { localDateKey } from "../date";
import type { Expense, ExpenseCategory } from "../types/expense";

export interface CreateExpenseParams {
  itemName: string;
  amount: number;
  category: ExpenseCategory;
  /** Omitted or null: no wallet. */
  walletId?: string | null;
  userId?: string;
  createdAt?: string;
}

/** What the record sheet can change; `date` is a local YYYY-MM-DD. */
export interface ExpenseEdit {
  itemName?: string;
  amount?: number;
  category?: ExpenseCategory;
  walletId?: string | null;
  date?: string;
}

/** The same local clock time on another local day. */
function onDay(iso: string, day: string): string {
  const d = new Date(iso);
  const [y, m, dd] = day.split("-").map(Number);
  return new Date(y, m - 1, dd, d.getHours(), d.getMinutes(), d.getSeconds()).toISOString();
}

export class ExpenseStorage {
  async saveExpense(params: CreateExpenseParams): Promise<Expense> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const expense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: params.userId || getDataScope(),
      itemName: params.itemName.trim(),
      amount: Math.round(params.amount),
      category: params.category,
      walletId: params.walletId ?? null,
      createdAt: params.createdAt || now,
      updatedAt: now,
      syncStatus: "pending",
      isDeleted: false,
    };

    await db.put("expenses", expense);
    await syncQueue.enqueue("create", expense);

    return expense;
  }

  async saveExpenses(items: CreateExpenseParams[]): Promise<Expense[]> {
    const results: Expense[] = [];
    for (const item of items) {
      const saved = await this.saveExpense(item);
      results.push(saved);
    }
    return results;
  }

  // Defaults to the current storage scope so a shared device never lists another user's rows.
  // includeDeleted: soft-deleted rows too, so a merge with the server list can hide their copy until sync.
  async getExpenses(userId: string = getDataScope(), { includeDeleted = false } = {}): Promise<Expense[]> {
    const db = await getDatabase();
    const all = await db.getAllFromIndex("expenses", "by-user", userId);

    // Filter out soft-deleted items and sort newest first
    return all
      .filter(item => includeDeleted || !item.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const db = await getDatabase();
    const item = await db.get("expenses", id);
    if (item && !item.isDeleted) {
      return item;
    }
    return undefined;
  }

  async updateExpense(id: string, updates: Partial<Pick<Expense, "itemName" | "amount" | "category" | "walletId" | "syncStatus">>): Promise<Expense | null> {
    const db = await getDatabase();
    const existing = await db.get("expenses", id);
    if (!existing) return null;

    const updated: Expense = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: updates.syncStatus || "pending",
    };

    await db.put("expenses", updated);

    // Only enqueue update if syncStatus is pending
    if (updated.syncStatus === "pending") {
      await syncQueue.enqueue("update", updated);
    }

    return updated;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await db.get("expenses", id);
    if (!existing) return false;

    // Soft delete to support cloud synchronization
    const deleted: Expense = {
      ...existing,
      isDeleted: true,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
    };

    await db.put("expenses", deleted);
    // The delete supersedes everything still queued for this expense: an unsynced create never uploads.
    // The delete itself stays queued in case that create is already in flight (unknown ids are a no-op server-side).
    await syncQueue.removeExpenseItems(id);
    await syncQueue.enqueue("delete", deleted);

    return true;
  }

  /** Undo of a save: deletes exactly these expenses. */
  async deleteExpenses(ids: string[]): Promise<void> {
    for (const id of ids) await this.deleteExpense(id);
  }

  /**
   * The record sheet's save. A new day re-prints the record (delete + create) because the sync
   * update never carries createdAt. Null when this device doesn't hold the record.
   */
  async editExpense(id: string, { date, ...updates }: ExpenseEdit): Promise<Expense | null> {
    const existing = await this.getExpense(id);
    if (!existing) return null;
    if (date && date !== localDateKey(new Date(existing.createdAt))) {
      await this.deleteExpense(id);
      return this.saveExpense({
        itemName: updates.itemName ?? existing.itemName,
        amount: updates.amount ?? existing.amount,
        category: updates.category ?? existing.category,
        walletId: updates.walletId !== undefined ? updates.walletId : existing.walletId ?? null,
        userId: existing.userId,
        createdAt: onDay(existing.createdAt, date),
      });
    }
    return this.updateExpense(id, updates);
  }

  async claimGuestExpenses(newUserId: string): Promise<number> {
    const db = await getDatabase();
    const tx = db.transaction("expenses", "readwrite");
    const index = tx.store.index("by-user");
    const guestExpenses = await index.getAll(GUEST_SCOPE);

    const migratedList: Expense[] = [];
    for (const exp of guestExpenses) {
      // Deleted guest rows never reached the server; claiming them would re-create them there.
      if (exp.isDeleted) continue;
      const migrated: Expense = {
        ...exp,
        userId: newUserId,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      };
      await tx.store.put(migrated);
      migratedList.push(migrated);
    }

    await tx.done;

    // Clean up legacy guest queue items to prevent duplication
    await syncQueue.removeUserItems(GUEST_SCOPE);

    // Enqueue migrated items for authenticated cloud sync
    for (const migrated of migratedList) {
      await syncQueue.enqueue("create", migrated);
    }

    return migratedList.length;
  }

  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.clear("expenses");
  }
}

export const expenseStorage = new ExpenseStorage();
