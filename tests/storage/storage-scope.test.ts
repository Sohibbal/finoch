// tests/storage/storage-scope.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { getStorageScope, setStorageScope, STORAGE_SCOPE_KEY } from "@/lib/storage/local-storage";
import { getWallets, saveWallets } from "@/lib/storage/wallet-storage";
import { getDebts } from "@/lib/storage/debt-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue, MAX_SYNC_RETRIES } from "@/lib/storage/sync-queue";
import type { StudentWallet } from "@/types/wallet-types";

let store: Map<string, string>;

beforeEach(async () => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
  await expenseStorage.clearAll();
  await syncQueue.clearQueue();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const wallet = (name: string) => ({ id: name, name, type: "cash", balance: 1000 }) as unknown as StudentWallet;

describe("per-user localStorage scope", () => {
  it("defaults to guest and keeps each user's feature data invisible to others", () => {
    expect(getStorageScope()).toBe("guest");
    saveWallets([wallet("guest-wallet")]);

    setStorageScope("user-a");
    saveWallets([wallet("a-wallet")]);
    expect(getWallets().map(w => w.name)).toEqual(["a-wallet"]);

    setStorageScope("user-b");
    expect(getWallets().map(w => w.name)).not.toContain("a-wallet");

    setStorageScope(null);
    expect(getStorageScope()).toBe("guest");
    expect(getWallets().map(w => w.name)).toEqual(["guest-wallet"]);
    expect(store.has("finoch_student_wallets_v1::user-a")).toBe(true);
  });

  it("moves legacy un-namespaced keys into the first logged-in user's scope exactly once", () => {
    store.set("finoch_student_wallets_v1", JSON.stringify([wallet("legacy")]));
    store.set("finoch_theme", "dark");

    setStorageScope("user-a");
    expect(getWallets().map(w => w.name)).toEqual(["legacy"]);
    expect(store.has("finoch_student_wallets_v1")).toBe(false);

    setStorageScope("user-b");
    expect(getWallets().map(w => w.name)).not.toContain("legacy");
    // Device prefs stay global.
    expect(store.get("finoch_theme")).toBe("dark");
  });

  it("does not overwrite a user's existing scoped data with legacy data", () => {
    store.set("finoch_student_debts_v1::user-a", "[]");
    store.set("finoch_student_debts_v1", JSON.stringify([{ id: "legacy" }]));
    setStorageScope("user-a");
    expect(getDebts()).toEqual([]);
  });

  it("does not migrate legacy data into the guest scope", () => {
    store.set("finoch_student_wallets_v1", JSON.stringify([wallet("legacy")]));
    setStorageScope(null);
    expect(store.get(STORAGE_SCOPE_KEY)).toBe("guest");
    expect(store.has("finoch_student_wallets_v1")).toBe(true);
  });
});

describe("expenses follow the storage scope", () => {
  it("saves under the current user and lists only that user's rows by default", async () => {
    setStorageScope("user-a");
    const mine = await expenseStorage.saveExpense({ itemName: "Kopi", amount: 8000, category: "Food & Drinks" });
    expect(mine.userId).toBe("user-a");

    setStorageScope("user-b");
    await expenseStorage.saveExpense({ itemName: "Bensin", amount: 20000, category: "Transportation" });
    expect((await expenseStorage.getExpenses()).map(e => e.itemName)).toEqual(["Bensin"]);

    setStorageScope(null);
    expect(await expenseStorage.getExpenses()).toEqual([]);
  });
});

describe("claimGuestExpenses", () => {
  it("claims only live rows whose userId is literally guest", async () => {
    const live = await expenseStorage.saveExpense({ itemName: "Nasi", amount: 10000, category: "Food & Drinks", userId: "guest" });
    const gone = await expenseStorage.saveExpense({ itemName: "Batal", amount: 5000, category: "Other", userId: "guest" });
    await expenseStorage.deleteExpense(gone.id);
    await expenseStorage.saveExpense({ itemName: "Punya C", amount: 7000, category: "Other", userId: "user-c" });

    const claimed = await expenseStorage.claimGuestExpenses("user-a");
    expect(claimed).toBe(1);

    const queue = await syncQueue.getPendingItems();
    const userAItems = queue.filter(item => item.payload.userId === "user-a");
    expect(userAItems.map(item => [item.expenseId, item.action])).toEqual([[live.id, "create"]]);
    expect(queue.some(item => item.payload.userId === "guest")).toBe(false);
    expect((await expenseStorage.getExpenses("user-c")).map(e => e.itemName)).toEqual(["Punya C"]);
  });
});

describe("sync queue retry cap", () => {
  it("drops an item after MAX_SYNC_RETRIES failed attempts", async () => {
    await expenseStorage.saveExpense({ itemName: "Gagal", amount: 1000, category: "Other", userId: "user-a" });
    const [item] = await syncQueue.getPendingItems();

    for (let i = 1; i < MAX_SYNC_RETRIES; i++) {
      expect(await syncQueue.markFailed(item.id, "boom")).toBe(false);
    }
    expect((await syncQueue.getPendingItems())[0].retryCount).toBe(MAX_SYNC_RETRIES - 1);
    expect(await syncQueue.markFailed(item.id, "boom")).toBe(true);
    expect(await syncQueue.getPendingItems()).toEqual([]);
  });

  it("removeUserItems only drops that user's queue items", async () => {
    await expenseStorage.saveExpense({ itemName: "A", amount: 1000, category: "Other", userId: "user-a" });
    await expenseStorage.saveExpense({ itemName: "B", amount: 1000, category: "Other", userId: "user-b" });
    await syncQueue.removeUserItems("user-a");
    const left = await syncQueue.getPendingItems();
    expect(left.map(item => item.payload.userId)).toEqual(["user-b"]);
  });
});
