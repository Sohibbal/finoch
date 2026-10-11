import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue } from "@/lib/storage/sync-queue";
import { localDateKey } from "@/lib/date";

const params = { itemName: "Kopi", amount: 5000, category: "Food & Drinks", userId: "u1", walletId: null };

describe("undo, edit and delete through expenseStorage", () => {
  beforeEach(async () => {
    await expenseStorage.clearAll();
    await syncQueue.clearQueue();
  });

  it("undoing a not-yet-synced save leaves only the delete in the queue, never the create", async () => {
    const saved = await expenseStorage.saveExpenses([params, { ...params, itemName: "Roti" }]);
    const kept = await expenseStorage.saveExpense({ ...params, itemName: "Bensin" });

    await expenseStorage.deleteExpenses(saved.map((e) => e.id));

    expect((await expenseStorage.getExpenses("u1")).map((e) => e.id)).toEqual([kept.id]);
    const queue = await syncQueue.getPendingItems();
    // The other expense keeps its create; each undone one has exactly one (no-op on the server) delete.
    expect(queue.filter((q) => q.expenseId === kept.id).map((q) => q.action)).toEqual(["create"]);
    for (const e of saved) {
      expect(queue.filter((q) => q.expenseId === e.id).map((q) => q.action)).toEqual(["delete"]);
    }
  });

  it("a delete supersedes queued updates for the same expense", async () => {
    const e = await expenseStorage.saveExpense(params);
    await expenseStorage.updateExpense(e.id, { amount: 6000 });
    await expenseStorage.deleteExpense(e.id);
    expect((await syncQueue.getPendingItems()).map((q) => q.action)).toEqual(["delete"]);
  });

  it("edits name, amount, category and wallet in place", async () => {
    const e = await expenseStorage.saveExpense(params);
    const edited = await expenseStorage.editExpense(e.id, { itemName: "Kopi susu", amount: 8000, category: "Other", walletId: "w2" });
    expect(edited?.id).toBe(e.id);
    expect(edited).toMatchObject({ itemName: "Kopi susu", amount: 8000, category: "Other", walletId: "w2", syncStatus: "pending" });
    const queue = await syncQueue.getPendingItems();
    expect(queue.at(-1)).toMatchObject({ action: "update", expenseId: e.id });
    expect(queue.at(-1)?.payload.walletId).toBe("w2");
  });

  it("moving to another day re-prints the record (the sync update never carries createdAt)", async () => {
    const at = new Date(2026, 9, 11, 8, 15).toISOString();
    const e = await expenseStorage.saveExpense({ ...params, createdAt: at });
    const moved = await expenseStorage.editExpense(e.id, { date: "2026-10-09", amount: 7000 });

    expect(moved?.id).not.toBe(e.id);
    const created = new Date(moved!.createdAt);
    expect(localDateKey(created)).toBe("2026-10-09");
    expect([created.getHours(), created.getMinutes()]).toEqual([8, 15]);
    expect(moved).toMatchObject({ itemName: "Kopi", amount: 7000, walletId: null });

    expect((await expenseStorage.getExpenses("u1")).map((x) => x.id)).toEqual([moved!.id]);
    const queue = await syncQueue.getPendingItems();
    expect(queue.filter((q) => q.expenseId === e.id).map((q) => q.action)).toEqual(["delete"]);
    expect(queue.filter((q) => q.expenseId === moved!.id).map((q) => q.action)).toEqual(["create"]);
  });

  it("keeps the same day without re-printing", async () => {
    const at = new Date(2026, 9, 11, 8, 15).toISOString();
    const e = await expenseStorage.saveExpense({ ...params, createdAt: at });
    expect((await expenseStorage.editExpense(e.id, { date: "2026-10-11", amount: 9000 }))?.id).toBe(e.id);
  });

  it("returns null for a record this device doesn't have", async () => {
    expect(await expenseStorage.editExpense("missing", { amount: 1 })).toBeNull();
  });

  it("lists soft-deleted rows only when asked, so a merge can hide their server copy", async () => {
    const e = await expenseStorage.saveExpense(params);
    await expenseStorage.deleteExpense(e.id);
    expect(await expenseStorage.getExpenses("u1")).toHaveLength(0);
    const all = await expenseStorage.getExpenses("u1", { includeDeleted: true });
    expect(all.map((x) => [x.id, x.isDeleted])).toEqual([[e.id, true]]);
  });
});
