import { describe, it, expect, beforeEach } from "vitest";
import {
  getBills,
  addBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getBillSummary,
} from "@/lib/storage/bill-storage";

describe("Bill Storage Engine", () => {
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

  it("loads default student bills when storage is empty", () => {
    const bills = getBills();
    expect(bills.length).toBeGreaterThanOrEqual(3);
    const names = bills.map((b) => b.name);
    expect(names).toContain("Kamar Kos Bulanan");
    expect(names).toContain("Patungan WiFi Kos");
  });

  it("adds and updates a custom recurring bill", () => {
    const newBill = addBill({
      name: "Laundry Kiloan Express",
      category: "other",
      amount: 60000,
      dueDay: 20,
      frequency: "monthly",
      reminderDaysBefore: 2,
    });

    expect(newBill.id).toBeDefined();
    expect(newBill.isPaidThisMonth).toBe(false);

    updateBill(newBill.id, { amount: 65000 });
    const bills = getBills();
    const found = bills.find((b) => b.id === newBill.id);
    expect(found?.amount).toBe(65000);
  });

  it("marks a bill as paid and updates monthly summary", () => {
    const bill = addBill({
      name: "Spotify Premium Family",
      category: "subscription",
      amount: 25000,
      dueDay: 5,
      frequency: "monthly",
      reminderDaysBefore: 3,
    });

    markBillAsPaid(bill.id);

    const updated = getBills().find((b) => b.id === bill.id);
    expect(updated?.isPaidThisMonth).toBe(true);
    expect(updated?.lastPaidDate).toBeDefined();

    const summary = getBillSummary();
    expect(summary.paidAmountThisMonth).toBeGreaterThanOrEqual(25000);
  });

  it("deletes a bill properly", () => {
    const bill = addBill({
      name: "Kursus Online",
      category: "education",
      amount: 100000,
      dueDay: 15,
      frequency: "monthly",
      reminderDaysBefore: 3,
    });

    expect(getBills().some((b) => b.id === bill.id)).toBe(true);
    deleteBill(bill.id);
    expect(getBills().some((b) => b.id === bill.id)).toBe(false);
  });
});
