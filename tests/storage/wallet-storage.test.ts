import { describe, it, expect, beforeEach } from "vitest";
import {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
  transferWalletFunds,
  getWalletTransferHistory,
  getWalletSummary,
} from "@/lib/storage/wallet-storage";

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

  it("loads default student wallets when storage is empty", () => {
    const list = getWallets();
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.some((w) => w.name.includes("BCA"))).toBe(true);
    expect(list.some((w) => w.name.includes("Tunai"))).toBe(true);
  });

  it("adds a new wallet properly", () => {
    const created = addWallet({
      name: "OVO Jajan",
      type: "ewallet",
      balance: 50000,
      color: "purple",
      icon: "smartphone",
    });

    expect(created.id).toBeDefined();
    const all = getWallets();
    expect(all.some((w) => w.id === created.id)).toBe(true);
  });

  it("updates an existing wallet balance", () => {
    const list = getWallets();
    const first = list[0];

    const updated = updateWallet(first.id, { balance: 250000 });
    expect(updated?.balance).toBe(250000);
  });

  it("transfers funds between wallets with admin fee deduction", () => {
    const list = getWallets();
    const from = list[1]; // e.g. BCA (1,450,000)
    const to = list[0]; // e.g. Tunai (120,000)

    const initialFromBal = from.balance;
    const initialToBal = to.balance;

    const record = transferWalletFunds(from.id, to.id, 100000, 2500, "Tarik tunai ATM");

    expect(record.id).toBeDefined();
    expect(record.amount).toBe(100000);
    expect(record.adminFee).toBe(2500);

    const afterList = getWallets();
    const afterFrom = afterList.find((w) => w.id === from.id);
    const afterTo = afterList.find((w) => w.id === to.id);

    expect(afterFrom?.balance).toBe(initialFromBal - 102500);
    expect(afterTo?.balance).toBe(initialToBal + 100000);

    const history = getWalletTransferHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].id).toBe(record.id);
  });
});
