import { describe, it, expect, beforeEach } from "vitest";
import {
  getWallets,
  saveWallets,
  addWallet,
  updateWallet,
  transferWalletFunds,
  getWalletTransferHistory,
} from "@/lib/storage/wallet-storage";
import { computeWalletBalances } from "@/lib/financial/wallet-engine";
import { setDemoMode } from "@/lib/storage/local-storage";
import type { Expense } from "@/lib/types/expense";

const cashWallet = { name: "Dompet", type: "cash" as const, openingBalance: 0, color: "emerald", icon: "wallet" };

describe("Student Wallet Storage Engine", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
      key: (i: number) => Object.keys(mockStore)[i] || null,
      get length() {
        return Object.keys(mockStore).length;
      },
    };

    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

    if (typeof window !== "undefined") {
      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  it("seeds sample wallets only in demo mode", () => {
    expect(getWallets()).toEqual([]);
    expect(mockStore["finoch_student_wallets_v1::guest"]).toBeUndefined();

    setDemoMode(true);
    const list = getWallets();
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.some((w) => w.name.includes("BCA"))).toBe(true);
    expect(list.some((w) => w.name.includes("Tunai"))).toBe(true);
  });

  it("keeps an existing user's stored wallets outside demo mode", () => {
    saveWallets([{ ...cashWallet, id: "mine", updatedAt: "" }]);
    expect(getWallets().map((w) => w.id)).toEqual(["mine"]);
  });

  it("adds a new wallet properly", () => {
    const created = addWallet({ ...cashWallet, name: "OVO Jajan", type: "ewallet" });
    expect(created.id).toBeDefined();
    expect(getWallets().some((w) => w.id === created.id)).toBe(true);
  });

  it("keeps a single default wallet", () => {
    const a = addWallet({ ...cashWallet, isDefault: true });
    const b = addWallet({ ...cashWallet, isDefault: true });
    expect(getWallets().filter((w) => w.isDefault).map((w) => w.id)).toEqual([b.id]);
    updateWallet(a.id, { isDefault: true });
    expect(getWallets().filter((w) => w.isDefault).map((w) => w.id)).toEqual([a.id]);
  });

  it("records transfers without mutating stored wallets; balances are derived", () => {
    const from = addWallet({ ...cashWallet, name: "BCA", openingBalance: 200000 });
    const to = addWallet({ ...cashWallet, name: "Tunai", openingBalance: 10000 });

    const record = transferWalletFunds(from.id, to.id, 100000, 2500, "Tarik tunai ATM");
    expect(record.amount).toBe(100000);
    expect(record.adminFee).toBe(2500);
    expect(getWalletTransferHistory()[0].id).toBe(record.id);
    expect(getWallets().find((w) => w.id === from.id)?.openingBalance).toBe(200000);

    const list = computeWalletBalances(getWallets(), getWalletTransferHistory(), []);
    expect(list.find((w) => w.id === from.id)?.balance).toBe(97500);
    expect(list.find((w) => w.id === to.id)?.balance).toBe(110000);
  });

  it("validates Pindah Saldo against the derived balance (spending included)", () => {
    const from = addWallet({ ...cashWallet, openingBalance: 50000 });
    const to = addWallet(cashWallet);
    const spent: Expense = {
      id: "e1", userId: "guest", itemName: "Makan", amount: 40000, category: "Food & Drinks",
      walletId: from.id, createdAt: "", updatedAt: "",
    };
    expect(() => transferWalletFunds(from.id, to.id, 20000, 0, "x", [spent])).toThrow(/tidak mencukupi/);
    expect(() => transferWalletFunds(from.id, to.id, 10000, 0, "x", [spent])).not.toThrow();
  });

  it("migrates a stored balance to saldo awal once, backing out past transfers", () => {
    // Legacy shape: balance already includes the 30k transfer (+ 1k fee) from bank to cash.
    mockStore["finoch_student_wallets_v1::guest"] = JSON.stringify([
      { id: "cash", name: "Tunai", type: "cash", balance: 80000, color: "emerald", icon: "wallet", updatedAt: "" },
      { id: "bank", name: "BCA", type: "bank", balance: 469000, color: "blue", icon: "landmark", updatedAt: "" },
    ]);
    mockStore["finoch_student_wallet_transfers_v1::guest"] = JSON.stringify([
      { id: "t1", fromWalletId: "bank", fromWalletName: "BCA", toWalletId: "cash", toWalletName: "Tunai",
        amount: 30000, adminFee: 1000, reason: "", createdAt: "" },
    ]);

    const migrated = getWallets();
    expect(migrated.map((w) => w.openingBalance)).toEqual([50000, 500000]);
    expect(migrated.some((w) => "balance" in w)).toBe(false);
    // Second read is a no-op.
    expect(getWallets()).toEqual(migrated);

    const list = computeWalletBalances(migrated, getWalletTransferHistory(), []);
    expect(list.map((w) => w.balance)).toEqual([80000, 469000]);
  });
});
