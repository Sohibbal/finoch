import { describe, it, expect, beforeEach } from "vitest";
import {
  getDebts,
  addDebt,
  markDebtAsPaid,
  deleteDebt,
  getDebtSummary,
} from "@/lib/storage/debt-storage";

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

  it("loads pre-populated student default debts when empty", () => {
    const list = getDebts();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.some((d) => d.personName.includes("Bagas"))).toBe(true);
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
    const list = getDebts();
    const target = list[0];

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
