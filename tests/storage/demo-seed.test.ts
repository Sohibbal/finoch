import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getStorage, setDemoMode, setStorageScope } from "@/lib/storage/local-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue } from "@/lib/storage/sync-queue";
import { getWallets, saveWallets, getWalletTransferHistory } from "@/lib/storage/wallet-storage";
import { computeWalletBalances } from "@/lib/financial/wallet-engine";
import { auditMicroExpenses } from "@/lib/financial/audit-engine";
import { generateDemoExpenses, resetDemoData, seedDemoExpenses } from "@/lib/storage/demo-seed";
import { localDateKey } from "@/lib/date";

const CATEGORIES = ["Food & Drinks", "Transportation", "Bills & Utilities", "Shopping & Lifestyle", "Other"];
const NOW = new Date(2026, 9, 11, 14, 30);

describe("demo expense seeding", () => {
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

  it("spreads demo spending over the demo wallets and keeps each at its designed balance", async () => {
    setDemoMode(true);
    const designed = new Map(getWallets().map((w) => [w.id, w.openingBalance]));
    await seedDemoExpenses(NOW);
    const expenses = await expenseStorage.getExpenses();
    const used = new Set(expenses.map((e) => e.walletId));
    expect(used.size).toBeGreaterThan(1);
    const balances = computeWalletBalances(getWallets(), getWalletTransferHistory(), expenses);
    for (const w of balances) {
      expect(w.balance).toBe(designed.get(w.id));
      expect(w.balance).toBeGreaterThanOrEqual(0);
    }
  });

  it("does nothing outside demo mode", async () => {
    expect(await seedDemoExpenses(NOW)).toBe(0);
    expect(await expenseStorage.getExpenses()).toEqual([]);
  });

  it("seeds realistic expenses over last month and this month, never in the future", async () => {
    setDemoMode(true);
    const count = await seedDemoExpenses(NOW);
    expect(count).toBeGreaterThanOrEqual(45);
    expect(count).toBeLessThanOrEqual(70);

    const expenses = await expenseStorage.getExpenses();
    expect(expenses).toHaveLength(count);
    const first = new Date(2026, 8, 1).getTime();
    for (const e of expenses) {
      const at = new Date(e.createdAt).getTime();
      expect(at).toBeGreaterThanOrEqual(first);
      expect(at).toBeLessThanOrEqual(NOW.getTime());
      expect(CATEGORIES).toContain(e.category);
      expect(e.userId).toBe("user-1::demo");
      expect(["wallet-cash-1", "wallet-bank-1", "wallet-ewallet-1"]).toContain(e.walletId);
    }
    const months = new Set(expenses.map((e) => new Date(e.createdAt).getMonth()));
    expect(months).toEqual(new Set([8, 9]));
    // Some no-spend days for Streak Hemat.
    const days = new Set(expenses.map((e) => localDateKey(new Date(e.createdAt))));
    expect(days.size).toBeLessThan(30 + 11);
    // Micro leaks for Audit Bocor Halus.
    expect(auditMicroExpenses(expenses, 2000000, NOW).leakCount).toBeGreaterThanOrEqual(5);
    expect(expenses.some((e) => e.itemName === "Admin transfer" && e.amount === 2500)).toBe(true);

    expect(await syncQueue.getPendingItems()).toEqual([]);
  });

  it("is idempotent, including concurrent calls and toggling demo off and on", async () => {
    setDemoMode(true);
    const [a, b] = await Promise.all([seedDemoExpenses(NOW), seedDemoExpenses(NOW)]);
    expect(a).toBe(b);
    const count = (await expenseStorage.getExpenses()).length;
    expect(count).toBe(a);

    setDemoMode(false);
    expect(await expenseStorage.getExpenses()).toEqual([]);
    setDemoMode(true);
    expect(await seedDemoExpenses(NOW)).toBe(0);
    expect(await expenseStorage.getExpenses()).toHaveLength(count);
  });

  it("is deterministic for a given date", () => {
    expect(generateDemoExpenses(NOW)).toEqual(generateDemoExpenses(new Date(NOW)));
  });

  it("keeps today's items before now, even just after midnight", () => {
    const now = new Date(2026, 9, 1, 0, 5);
    for (const e of generateDemoExpenses(now)) expect(new Date(e.createdAt!).getTime()).toBeLessThanOrEqual(now.getTime());
  });

  it("reset clears demo expenses and feature data, then reseeds; real data untouched", async () => {
    const real = await expenseStorage.saveExpense({ itemName: "Real", amount: 1000, category: "Other" });
    setDemoMode(true);
    await seedDemoExpenses(NOW);
    await expenseStorage.saveExpense({ itemName: "Tambahan demo", amount: 9000, category: "Other" });
    saveWallets([]);
    getStorage()!.setItem("finoch_savings_goals_v1", "[]");

    const count = await resetDemoData(NOW);
    const expenses = await expenseStorage.getExpenses();
    expect(expenses).toHaveLength(count);
    expect(expenses.some((e) => e.itemName === "Tambahan demo")).toBe(false);
    expect(getWallets().length).toBeGreaterThan(0);
    expect(getStorage()!.getItem("finoch_savings_goals_v1")).toBeNull();

    setDemoMode(false);
    expect((await expenseStorage.getExpenses()).map((e) => e.id)).toEqual([real.id]);
  });
});
