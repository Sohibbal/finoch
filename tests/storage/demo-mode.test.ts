import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDataScope, isDemoMode, readArray, getStorage, setDemoMode, setStorageScope } from "@/lib/storage/local-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue } from "@/lib/storage/sync-queue";

describe("demo mode", () => {
  beforeEach(async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    });
    await expenseStorage.clearAll();
    await syncQueue.clearQueue();
    setStorageScope("user-1");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("is per user and keeps real feature data separate", () => {
    getStorage()!.setItem("finoch_student_wallets_v1", JSON.stringify([{ id: "real" }]));
    setDemoMode(true);
    expect(isDemoMode()).toBe(true);
    expect(getDataScope()).toBe("user-1::demo");
    expect(readArray("finoch_student_wallets_v1")).toBeNull();
    getStorage()!.setItem("finoch_student_wallets_v1", JSON.stringify([{ id: "demo" }]));

    setDemoMode(false);
    expect(readArray("finoch_student_wallets_v1")).toEqual([{ id: "real" }]);
    setStorageScope("user-2");
    expect(isDemoMode()).toBe(false);
  });

  it("never queues demo expenses for sync", async () => {
    setDemoMode(true);
    const saved = await expenseStorage.saveExpense({ itemName: "Kopi", amount: 5000, category: "Food & Drinks" });
    expect(saved.userId).toBe("user-1::demo");
    const queued = await syncQueue.getPendingItems();
    expect(queued.some((q) => q.expenseId === saved.id)).toBe(false);
  });
});
