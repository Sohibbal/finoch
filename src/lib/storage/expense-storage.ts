import { getDatabase } from "./indexed-db";
import { syncQueue } from "./sync-queue";
import type { Expense, ExpenseCategory } from "../types/expense";

export interface CreateExpenseParams {
  itemName: string;
  amount: number;
  category: ExpenseCategory;
  userId?: string;
  createdAt?: string;
}

export class ExpenseStorage {
  async saveExpense(params: CreateExpenseParams): Promise<Expense> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const expense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: params.userId || "guest",
      itemName: params.itemName.trim(),
      amount: Math.round(params.amount),
      category: params.category,
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

  async getExpenses(userId?: string): Promise<Expense[]> {
    const db = await getDatabase();
    let all: Expense[] = [];

    if (userId) {
      const tx = db.transaction("expenses", "readonly");
      const index = tx.store.index("by-user");
      all = await index.getAll(userId);
    } else {
      all = await db.getAll("expenses");
    }

    // Filter out soft-deleted items and sort newest first
    return all
      .filter(item => !item.isDeleted)
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

  async updateExpense(id: string, updates: Partial<Pick<Expense, "itemName" | "amount" | "category" | "syncStatus">>): Promise<Expense | null> {
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
    await syncQueue.enqueue("delete", deleted);

    return true;
  }

  async claimGuestExpenses(newUserId: string): Promise<number> {
    const db = await getDatabase();
    const tx = db.transaction("expenses", "readwrite");
    const index = tx.store.index("by-user");
    const guestExpenses = await index.getAll("guest");

    let count = 0;
    for (const exp of guestExpenses) {
      const migrated: Expense = {
        ...exp,
        userId: newUserId,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      };
      await tx.store.put(migrated);
      await syncQueue.enqueue("create", migrated);
      count++;
    }

    await tx.done;
    return count;
  }

  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.clear("expenses");
  }
}

export const expenseStorage = new ExpenseStorage();
