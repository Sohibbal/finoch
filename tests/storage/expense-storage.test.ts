// tests/storage/expense-storage.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue } from "@/lib/storage/sync-queue";

describe("Expense Storage & Sync Queue", () => {
  beforeEach(async () => {
    await expenseStorage.clearAll();
    await syncQueue.clearQueue();
  });

  it("saves, retrieves, and updates local expenses", async () => {
    const expense = await expenseStorage.saveExpense({
      itemName: "Nasi Padang",
      amount: 18000,
      category: "Food & Drinks",
      userId: "guest",
    });

    expect(expense.id).toBeDefined();
    expect(expense.syncStatus).toBe("pending");

    const all = await expenseStorage.getExpenses("guest");
    expect(all).toHaveLength(1);
    expect(all[0].itemName).toBe("Nasi Padang");

    // Check sync queue item was created
    const queue = await syncQueue.getPendingItems();
    expect(queue).toHaveLength(1);
    expect(queue[0].action).toBe("create");
    expect(queue[0].payload.amount).toBe(18000);
  });

  it("updates an existing expense and queues update action", async () => {
    const expense = await expenseStorage.saveExpense({
      itemName: "Bensin",
      amount: 20000,
      category: "Transportation",
      userId: "guest",
    });

    const updated = await expenseStorage.updateExpense(expense.id, {
      amount: 25000,
      itemName: "Bensin Pertamax",
    });

    expect(updated).not.toBeNull();
    expect(updated?.amount).toBe(25000);
    expect(updated?.itemName).toBe("Bensin Pertamax");

    const items = await expenseStorage.getExpenses("guest");
    expect(items[0].amount).toBe(25000);
  });

  it("soft-deletes an expense and queues delete action", async () => {
    const expense = await expenseStorage.saveExpense({
      itemName: "Kopi",
      amount: 10000,
      category: "Food & Drinks",
      userId: "guest",
    });

    await expenseStorage.deleteExpense(expense.id);

    const activeExpenses = await expenseStorage.getExpenses("guest");
    expect(activeExpenses).toHaveLength(0);

    const queue = await syncQueue.getPendingItems();
    const deleteAction = queue.find(q => q.action === "delete");
    expect(deleteAction).toBeDefined();
  });

  it("migrates guest expenses to authenticated user (Review Focus)", async () => {
    await expenseStorage.saveExpense({
      itemName: "Kopi Susu",
      amount: 15000,
      category: "bocor_halus",
      userId: "guest",
    });

    await expenseStorage.claimGuestExpenses("user-123");

    const guestItems = await expenseStorage.getExpenses("guest");
    expect(guestItems).toHaveLength(0);

    const userItems = await expenseStorage.getExpenses("user-123");
    expect(userItems).toHaveLength(1);
    expect(userItems[0].userId).toBe("user-123");

    const queue = await syncQueue.getPendingItems();
    expect(queue.some(q => q.payload.userId === "user-123")).toBe(true);
  });

  it("reliably migrates multiple guest expenses without transaction auto-commit error and cleans up old queue", async () => {
    // Record 3 guest expenses
    await expenseStorage.saveExpense({ itemName: "Nasi Uduk", amount: 10000, category: "primer", userId: "guest" });
    await expenseStorage.saveExpense({ itemName: "Es Teh", amount: 5000, category: "bocor_halus", userId: "guest" });
    await expenseStorage.saveExpense({ itemName: "Bensin", amount: 20000, category: "primer", userId: "guest" });

    // Migrate all 3 items to user-999
    const count = await expenseStorage.claimGuestExpenses("user-999");
    expect(count).toBe(3);

    const guestItems = await expenseStorage.getExpenses("guest");
    expect(guestItems).toHaveLength(0);

    const userItems = await expenseStorage.getExpenses("user-999");
    expect(userItems).toHaveLength(3);

    // Verify queue items: no orphaned guest queue items remain
    const queue = await syncQueue.getPendingItems();
    const guestQueueItems = queue.filter(q => q.payload.userId === "guest");
    expect(guestQueueItems).toHaveLength(0);
    expect(queue).toHaveLength(3);
  });
});
