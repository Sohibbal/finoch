import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readArray, setDemoMode } from "@/lib/storage/local-storage";
import { getWallets, saveWallets, addWallet, transferWalletFunds } from "@/lib/storage/wallet-storage";
import { getDebts, saveDebts, addDebt } from "@/lib/storage/debt-storage";
import { getUktPlans, saveUktPlans, addUktPlan, depositToUktPlan } from "@/lib/storage/ukt-storage";
import { getEnvelopes, saveEnvelopes, addEnvelope, transferFunds } from "@/lib/storage/budget-storage";
import {
  getBills,
  saveBills,
  addBill,
  markBillAsPaid,
  getBillSummary,
  getEffectiveDueDay,
  getMonthlyBillAmount,
} from "@/lib/storage/bill-storage";
import { getWishlist } from "@/lib/storage/wishlist-storage";
import { RecurringBill } from "@/types/bill-types";

process.env.TZ = "Asia/Jakarta";

let mockStore: Record<string, string> = {};

beforeEach(() => {
  mockStore = {};
  const mockStorage = {
    getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
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
  Object.defineProperty(globalThis, "localStorage", { value: mockStorage, writable: true, configurable: true });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("readArray (shared localStorage helper)", () => {
  it("returns null for a missing key, [] for corrupt or non-array JSON", () => {
    expect(readArray("missing")).toBeNull();
    mockStore["bad::guest"] = "{not json";
    expect(readArray("bad")).toEqual([]);
    mockStore["obj::guest"] = '{"a":1}';
    expect(readArray("obj")).toEqual([]);
    mockStore["ok::guest"] = "[1,2]";
    expect(readArray("ok")).toEqual([1, 2]);
  });
});

describe("#2 deleting the last item does not resurrect demo data", () => {
  it("wallets / debts / ukt / envelopes stay empty after being emptied", () => {
    getWallets();
    saveWallets([]);
    expect(getWallets()).toEqual([]);

    getDebts();
    saveDebts([]);
    expect(getDebts()).toEqual([]);

    getUktPlans();
    saveUktPlans([]);
    expect(getUktPlans()).toEqual([]);

    getEnvelopes();
    saveEnvelopes([]);
    expect(getEnvelopes()).toEqual([]);
  });
});

describe("#3 corrupt JSON does not crash", () => {
  it("bills / legacy talangan / wishlist return [] on corrupt storage", () => {
    mockStore["finoch_recurring_bills::guest"] = "{oops";
    mockStore["finoch_talangan_records::guest"] = "[{";
    mockStore["finoch_student_wishlist::guest"] = "nope";
    expect(getBills()).toEqual([]);
    expect(getDebts()).toEqual([]);
    expect(getWishlist()).toEqual([]);
  });
});

describe("#4 defaults are fresh copies with relative dates", () => {
  it("mutating returned default bills does not affect later reads", () => {
    setDemoMode(true);
    const first = getBills();
    first[0].amount = 1;
    first.push({ ...first[0], id: "x" });
    const second = getBills();
    expect(second[0].amount).not.toBe(1);
    expect(second.some((b) => b.id === "x")).toBe(false);
  });

  it("without storage there is no sample data to leak", () => {
    const saved = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", { value: undefined, writable: true, configurable: true });
    try {
      expect(getBills()).toEqual([]);
      expect(getWishlist()).toEqual([]);
    } finally {
      Object.defineProperty(globalThis, "localStorage", { value: saved, writable: true, configurable: true });
    }
  });

  it("default UKT deadlines are in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2027, 5, 1));
    const today = "2027-06-01";
    setDemoMode(true);
    expect(getUktPlans().length).toBeGreaterThan(0);
    for (const plan of getUktPlans()) {
      expect(plan.deadline > today).toBe(true);
    }
  });
});

describe("#5 envelope transfer never creates money", () => {
  it("rejects amounts above the source allocation, non-finite and <= 0", () => {
    const [from, to] = getEnvelopes(2000000);
    expect(() => transferFunds(from.id, to.id, from.allocatedAmount + 1, "x")).toThrow();
    expect(() => transferFunds(from.id, to.id, NaN, "x")).toThrow();
    expect(() => transferFunds(from.id, to.id, Infinity, "x")).toThrow();
    expect(() => transferFunds(from.id, to.id, 0, "x")).toThrow();
    expect(() => transferFunds(from.id, to.id, -5, "x")).toThrow();

    const totalBefore = getEnvelopes().reduce((s, e) => s + e.allocatedAmount, 0);
    transferFunds(from.id, to.id, from.allocatedAmount, "semua");
    const totalAfter = getEnvelopes().reduce((s, e) => s + e.allocatedAmount, 0);
    expect(totalAfter).toBe(totalBefore);
  });

  it("addEnvelope rejects invalid allocation", () => {
    const base = { name: "X", icon: "book", color: "cyan", categoryAliases: [] };
    expect(() => addEnvelope({ ...base, allocatedAmount: NaN })).toThrow();
    expect(() => addEnvelope({ ...base, allocatedAmount: -1 })).toThrow();
  });
});

describe("#6 wallet / debt validation", () => {
  it("transfer rejects negative admin fee and NaN amount", () => {
    const wallet = { type: "cash" as const, color: "emerald", icon: "wallet", openingBalance: 50000 };
    const a = addWallet({ ...wallet, name: "A" });
    const b = addWallet({ ...wallet, name: "B" });
    expect(() => transferWalletFunds(a.id, b.id, 1000, -500)).toThrow();
    expect(() => transferWalletFunds(a.id, b.id, NaN)).toThrow();
    expect(() => transferWalletFunds(a.id, b.id, 1000, NaN)).toThrow();
    expect(readArray("finoch_student_wallet_transfers_v1")).toBeNull();
  });

  it("addWallet / addDebt reject invalid amounts", () => {
    const wallet = { name: "W", type: "cash" as const, color: "emerald", icon: "wallet", isPrimary: false };
    expect(() => addWallet({ ...wallet, openingBalance: NaN })).toThrow();
    expect(() => addWallet({ ...wallet, openingBalance: -1 })).toThrow();
    const debt = { type: "payable" as const, personName: "A", description: "d", dueDate: "2026-12-01" };
    expect(() => addDebt({ ...debt, amount: 0 })).toThrow();
    expect(() => addDebt({ ...debt, amount: NaN })).toThrow();
  });
});

describe("#8 bills: monthly paid reset, due-day clamp, weekly totals, overdue split", () => {
  const bill = (overrides: Partial<RecurringBill>): RecurringBill => ({
    id: "b",
    name: "B",
    category: "other",
    amount: 10000,
    dueDay: 10,
    frequency: "monthly",
    isPaidThisMonth: false,
    reminderDaysBefore: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  });

  it("paid status resets in the next local month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 31, 23, 0)); // 31 Oct 23:00 WIB
    saveBills([bill({ id: "kos" })]);
    markBillAsPaid("kos");
    expect(getBills()[0].isPaidThisMonth).toBe(true);

    vi.setSystemTime(new Date(2026, 10, 1, 0, 30)); // 1 Nov 00:30 WIB (still Oct in UTC)
    expect(getBills()[0].isPaidThisMonth).toBe(false);
    expect(getBillSummary(new Date()).paidCount).toBe(0);
  });

  it("keeps the stored flag for legacy records without lastPaidDate", () => {
    saveBills([bill({ isPaidThisMonth: true })]);
    expect(getBills()[0].isPaidThisMonth).toBe(true);
  });

  it("dueDay 31 clamps to the last day of February", () => {
    const feb = new Date(2026, 1, 20);
    expect(getEffectiveDueDay(bill({ dueDay: 31 }), feb)).toBe(28);
    saveBills([bill({ dueDay: 31, reminderDaysBefore: 3 })]);
    expect(getBillSummary(new Date(2026, 1, 26)).criticalUpcomingBills).toHaveLength(1);
  });

  it("weekly bill monthly total = amount x occurrences in month", () => {
    // October 2026 has 31 days; due day 1 -> 1, 8, 15, 22, 29 = 5 weeks
    const oct = new Date(2026, 9, 5);
    expect(getMonthlyBillAmount(bill({ frequency: "weekly", dueDay: 1 }), oct)).toBe(50000);
    // February 2026 (28 days) -> 4 weeks
    expect(getMonthlyBillAmount(bill({ frequency: "weekly", dueDay: 3 }), new Date(2026, 1, 5))).toBe(40000);
    saveBills([bill({ frequency: "weekly", dueDay: 1 })]);
    expect(getBillSummary(oct).totalMonthlyBills).toBe(50000);
  });

  it("separates overdue bills from upcoming ones", () => {
    saveBills([bill({ id: "late", dueDay: 2 }), bill({ id: "soon", dueDay: 12 })]);
    const summary = getBillSummary(new Date(2026, 9, 10));
    expect(summary.overdueBills.map((b) => b.id)).toEqual(["late"]);
    expect(summary.criticalUpcomingBills.map((b) => b.id)).toEqual(["soon"]);
  });

  it("addBill still works with derived status", () => {
    saveBills([]);
    addBill({ name: "N", category: "other", amount: 1, dueDay: 1, frequency: "monthly", reminderDaysBefore: 1 });
    expect(getBills()).toHaveLength(1);
  });
});

describe("#14 UKT deposit ids are unique", () => {
  it("two deposits in the same millisecond get distinct ids", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 11));
    saveUktPlans([]);
    const plan = addUktPlan({ name: "UKT", targetAmount: 1000000, deadline: "2027-01-01", category: "ukt" });
    depositToUktPlan(plan.id, 1000);
    const updated = depositToUktPlan(plan.id, 2000)!;
    const ids = updated.deposits.map((d) => d.id);
    expect(new Set(ids).size).toBe(2);
    expect(depositToUktPlan(plan.id, NaN)).toBeNull();
  });
});
