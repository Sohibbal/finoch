// tests/ui/dashboard-metrics.test.ts
import { describe, it, expect } from "vitest";
import { calculateMetrics } from "@/components/dashboard/metric-cards";
import type { Expense } from "@/lib/types/expense";

describe("Dashboard Analytics Calculation", () => {
  it("calculates total, primer, and bocor_halus ratios correctly", () => {
    const now = new Date().toISOString();
    const expenses: Expense[] = [
      { id: "1", userId: "u", itemName: "Warteg", amount: 15000, category: "primer", createdAt: now, updatedAt: now },
      { id: "2", userId: "u", itemName: "Kopi", amount: 15000, category: "bocor_halus", createdAt: now, updatedAt: now },
    ];
    const metrics = calculateMetrics(expenses);
    expect(metrics.totalMonth).toBe(30000);
    expect(metrics.primerTotal).toBe(15000);
    expect(metrics.bocorHalusTotal).toBe(15000);
    expect(metrics.primerPercentage).toBe(50);
    expect(metrics.bocorHalusPercentage).toBe(50);
  });

  it("handles empty expenses array safely", () => {
    const metrics = calculateMetrics([]);
    expect(metrics.totalMonth).toBe(0);
    expect(metrics.primerTotal).toBe(0);
    expect(metrics.bocorHalusTotal).toBe(0);
    expect(metrics.primerPercentage).toBe(0);
    expect(metrics.bocorHalusPercentage).toBe(0);
  });
});
