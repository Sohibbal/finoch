import { describe, it, expect, beforeEach } from "vitest";
import {
  getDebts,
  addDebt,
  markDebtAsPaid,
  deleteDebt,
  getDebtSummary,
} from "@/lib/storage/debt-storage";
import { setDemoMode } from "@/lib/storage/local-storage";

describe("Student Debt Storage Engine", () => {
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

  it("seeds sample debts only in demo mode", () => {
    expect(getDebts()).toEqual([]);
    expect(mockStore["finoch_student_debts_v1::guest"]).toBeUndefined();

    setDemoMode(true);
    const list = getDebts();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.some((d) => d.personName.includes("Bagas"))).toBe(true);
  });

  it("moves split-bill talangan records into receivables once", () => {
    const talangan = [
      { id: "talangan_1", restaurantName: "Mie Gacoan", date: "2026-10-05", friendName: "Budi", amount: 30000,
        itemsSummary: "Mie Level 2", isPaid: false, createdAt: "2026-10-05T00:00:00.000Z" },
      { id: "talangan_2", restaurantName: "Warteg", date: "2026-10-04", friendName: "Citra", amount: 20000,
        itemsSummary: "", isPaid: true, paidAt: "2026-10-06T00:00:00.000Z", createdAt: "2026-10-04T00:00:00.000Z" },
    ];
    mockStore["finoch_student_debts_v1::guest"] = JSON.stringify([
      { id: "debt-x", type: "payable", personName: "Ibu Kost", amount: 5000, description: "", status: "unpaid", createdAt: "" },
    ]);
    mockStore["finoch_talangan_records::guest"] = JSON.stringify(talangan);

    const debts = getDebts();
    expect(debts.map((d) => d.id)).toEqual(["debt-talangan_1", "debt-talangan_2", "debt-x"]);
    expect(debts[0]).toMatchObject({ type: "receivable", personName: "Budi", amount: 30000, status: "unpaid" });
    expect(debts[1]).toMatchObject({ status: "paid", settledAt: "2026-10-06T00:00:00.000Z" });
    expect(mockStore["finoch_talangan_records::guest"]).toBeUndefined();
    expect(getDebtSummary().totalReceivable).toBe(30000);

    // A stale copy reappearing (e.g. an interrupted earlier run) must not duplicate entries.
    mockStore["finoch_talangan_records::guest"] = JSON.stringify(talangan);
    expect(getDebts().map((d) => d.id)).toEqual(["debt-talangan_1", "debt-talangan_2", "debt-x"]);
  });

  it("migrates talangan for a user with no stored debts outside demo mode", () => {
    mockStore["finoch_talangan_records::guest"] = JSON.stringify([
      { id: "t", restaurantName: "Kopi", date: "", friendName: "Dono", amount: 18000, itemsSummary: "Americano",
        isPaid: false, createdAt: "" },
    ]);
    expect(getDebts().map((d) => d.personName)).toEqual(["Dono"]);
  });

  it("adds a new debt record properly", () => {
    const created = addDebt({
      type: "receivable",
      personName: "Rani Kampus",
      amount: 45000,
      description: "Beli modul praktikum fisika",
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe("unpaid");

    const all = getDebts();
    expect(all.some((d) => d.id === created.id)).toBe(true);
  });

  it("toggles paid status with markDebtAsPaid", () => {
    const target = addDebt({ type: "receivable", personName: "Bagas", amount: 35000, description: "Fotokopi" });

    const updated = markDebtAsPaid(target.id);
    expect(updated?.status).toBe("paid");
    expect(updated?.settledAt).toBeDefined();

    // Toggle back
    const toggledBack = markDebtAsPaid(target.id);
    expect(toggledBack?.status).toBe("unpaid");
  });

  it("deletes a debt item", () => {
    const created = addDebt({
      type: "payable",
      personName: "Teman Kos",
      amount: 15000,
      description: "Beli galon",
    });

    deleteDebt(created.id);
    const all = getDebts();
    expect(all.some((d) => d.id === created.id)).toBe(false);
  });
});
