import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setDemoMode, setStorageScope } from "@/lib/storage/local-storage";
import { getBills } from "@/lib/storage/bill-storage";
import { getUktPlans } from "@/lib/storage/ukt-storage";
import { getWishlist } from "@/lib/storage/wishlist-storage";
import { getEnvelopes } from "@/lib/storage/budget-storage";
import { addGoal, deleteGoal, getGoals } from "@/lib/storage/goal-storage";

describe("demo-only sample data", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    });
    setStorageScope("user-1");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("gives a fresh real user no bills, UKT plans, wishlist items or goals", () => {
    expect(getBills()).toEqual([]);
    expect(getUktPlans()).toEqual([]);
    expect(getWishlist()).toEqual([]);
    expect(getGoals()).toEqual([]);
    // Envelopes are a template, not sample data: everyone gets them, sized from the allowance.
    expect(getEnvelopes(1000000).reduce((sum, e) => sum + e.allocatedAmount, 0)).toBe(1000000);
  });

  it("seeds sample data in demo mode without touching the real scope", () => {
    setDemoMode(true);
    expect(getBills().length).toBeGreaterThan(0);
    expect(getUktPlans().length).toBeGreaterThan(0);
    expect(getWishlist().length).toBeGreaterThan(0);
    const goals = getGoals();
    expect(goals.length).toBeGreaterThan(0);
    expect(goals.every((g) => g.userId === "user-1::demo")).toBe(true);

    setDemoMode(false);
    expect(getBills()).toEqual([]);
    expect(getGoals()).toEqual([]);
  });

  it("persists goals per scope and keeps a deleted-to-empty list empty", () => {
    const goal = addGoal({
      name: "Laptop Kuliah",
      targetAmount: 8000000,
      currentAmount: 1000000,
      targetDate: "2027-08-01",
      category: "gadget",
      status: "on_track",
    });
    expect(goal.userId).toBe("user-1");
    expect(getGoals().map((g) => g.name)).toEqual(["Laptop Kuliah"]);

    setStorageScope("user-2");
    expect(getGoals()).toEqual([]);

    setStorageScope("user-1");
    deleteGoal(goal.id!);
    expect(getGoals()).toEqual([]);
    setDemoMode(true);
    setDemoMode(false);
    expect(getGoals()).toEqual([]);
  });
});
