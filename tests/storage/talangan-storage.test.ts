import { describe, it, expect, beforeEach } from "vitest";
import {
  getTalanganList,
  addTalanganRecord,
  markTalanganAsPaid,
  deleteTalanganRecord,
  getTalanganSummary,
} from "@/lib/storage/talangan-storage";

describe("Talangan Storage Engine", () => {
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

    // Polyfill global localStorage and window.localStorage
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

  it("adds and retrieves talangan records properly", () => {
    const item = addTalanganRecord({
      restaurantName: "Warteg Barokah",
      date: "2026-10-05",
      friendName: "Andi",
      amount: 25000,
      itemsSummary: "Nasi Rames + Es Teh",
    });

    expect(item.id).toBeDefined();
    expect(item.isPaid).toBe(false);

    const list = getTalanganList();
    expect(list).toHaveLength(1);
    expect(list[0].friendName).toBe("Andi");
    expect(list[0].amount).toBe(25000);
  });

  it("marks a record as paid and updates summary", () => {
    const r1 = addTalanganRecord({
      restaurantName: "Mie Gacoan",
      date: "2026-10-05",
      friendName: "Budi",
      amount: 30000,
      itemsSummary: "Mie Level 2 + Udang Keju",
    });

    const r2 = addTalanganRecord({
      restaurantName: "Mie Gacoan",
      date: "2026-10-05",
      friendName: "Citra",
      amount: 20000,
      itemsSummary: "Mie Level 1",
    });

    let summary = getTalanganSummary();
    expect(summary.totalUnpaid).toBe(50000);
    expect(summary.countUnpaid).toBe(2);

    markTalanganAsPaid(r1.id);

    summary = getTalanganSummary();
    expect(summary.totalUnpaid).toBe(20000);
    expect(summary.totalPaid).toBe(30000);
    expect(summary.countUnpaid).toBe(1);

    const updatedList = getTalanganList();
    const budiRecord = updatedList.find((r) => r.id === r1.id);
    expect(budiRecord?.isPaid).toBe(true);
    expect(budiRecord?.paidAt).toBeDefined();
  });

  it("deletes a talangan record properly", () => {
    const r = addTalanganRecord({
      restaurantName: "Kopi Kenangan",
      date: "2026-10-05",
      friendName: "Dono",
      amount: 18000,
      itemsSummary: "Americano",
    });

    expect(getTalanganList()).toHaveLength(1);

    deleteTalanganRecord(r.id);
    expect(getTalanganList()).toHaveLength(0);
  });
});
