import { describe, it, expect, beforeEach } from "vitest";
import {
  getUktPlans,
  addUktPlan,
  depositToUktPlan,
  deleteUktPlan,
} from "@/lib/storage/ukt-storage";

describe("Student UKT Storage Engine", () => {
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

  it("loads default student UKT plans when storage is empty", () => {
    const plans = getUktPlans();
    expect(plans.length).toBeGreaterThanOrEqual(1);
    expect(plans.some((p) => p.name.includes("UKT"))).toBe(true);
  });

  it("adds a new UKT plan correctly", () => {
    const created = addUktPlan({
      name: "Biaya Wisuda & Toga",
      targetAmount: 850000,
      deadline: "2026-12-01",
      category: "wisuda",
    });

    expect(created.id).toBeDefined();
    expect(created.currentSaved).toBe(0);
    const all = getUktPlans();
    expect(all.some((p) => p.id === created.id)).toBe(true);
  });

  it("deposits money into an existing plan", () => {
    const plans = getUktPlans();
    const first = plans[0];
    const initialSaved = first.currentSaved;

    const updated = depositToUktPlan(first.id, 50000, "Nabung uang parkir");
    expect(updated?.currentSaved).toBe(initialSaved + 50000);
    expect(updated?.deposits[0].amount).toBe(50000);
  });

  it("deletes a plan successfully", () => {
    const plans = getUktPlans();
    const toDelete = plans[0];
    deleteUktPlan(toDelete.id);

    const after = getUktPlans();
    expect(after.some((p) => p.id === toDelete.id)).toBe(false);
  });
});
