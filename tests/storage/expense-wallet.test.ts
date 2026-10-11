import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue } from "@/lib/storage/sync-queue";
import { addWallet, saveWallets } from "@/lib/storage/wallet-storage";

const wallet = { color: "emerald", icon: "wallet", openingBalance: 0 };
const params = { itemName: "Kopi", amount: 5000, category: "Food & Drinks" };

describe("expenseStorage wallet assignment", () => {
  beforeEach(async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    });
    await expenseStorage.clearAll();
    await syncQueue.clearQueue();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("leaves walletId null when the user has no wallets", async () => {
    expect((await expenseStorage.saveExpense(params)).walletId).toBeNull();
  });

  it("charges the flagged default wallet, else the first cash wallet, else the first wallet", async () => {
    const bank = addWallet({ ...wallet, name: "BCA", type: "bank" });
    expect((await expenseStorage.saveExpense(params)).walletId).toBe(bank.id);

    const cash = addWallet({ ...wallet, name: "Tunai", type: "cash" });
    expect((await expenseStorage.saveExpense(params)).walletId).toBe(cash.id);

    const gopay = addWallet({ ...wallet, name: "GoPay", type: "ewallet", isDefault: true });
    const saved = await expenseStorage.saveExpenses([params, params]);
    expect(saved.map((e) => e.walletId)).toEqual([gopay.id, gopay.id]);
  });

  it("keeps an explicit wallet choice (including none) and queues it for sync", async () => {
    saveWallets([{ ...wallet, id: "w1", name: "Tunai", type: "cash", updatedAt: "" }]);
    expect((await expenseStorage.saveExpense({ ...params, walletId: "w2" })).walletId).toBe("w2");
    expect((await expenseStorage.saveExpense({ ...params, walletId: null })).walletId).toBeNull();
    const queued = await syncQueue.getPendingItems();
    expect(queued.map((q) => q.payload.walletId).sort()).toEqual([null, "w2"].sort());
  });
});
