// tests/ui/dashboard-metrics.test.ts
import { describe, it, expect } from "vitest";
import { calculateMetrics } from "@/components/dashboard/metric-cards";
import type { Expense } from "@/lib/types/expense";

describe("Dashboard Analytics Calculation", () => {
  it("calculates total, top category, and percentage correctly", () => {
    const now = new Date().toISOString();
    const expenses: Expense[] = [
      { id: "1", userId: "u", itemName: "Warteg", amount: 20000, category: "Food & Drinks", createdAt: now, updatedAt: now },
      { id: "2", userId: "u", itemName: "Kopi", amount: 10000, category: "Food & Drinks", createdAt: now, updatedAt: now },
      { id: "3", userId: "u", itemName: "Ojek", amount: 10000, category: "Transportation", createdAt: now, updatedAt: now },
    ];
    const metrics = calculateMetrics(expenses);
    expect(metrics.totalMonth).toBe(40000);
    expect(metrics.topCategoryName).toBe("Food & Drinks");
    expect(metrics.topCategoryTotal).toBe(30000);
    expect(metrics.topCategoryPercentage).toBe(75);
  });

  it("handles empty expenses array safely", () => {
    const metrics = calculateMetrics([]);
    expect(metrics.totalMonth).toBe(0);
    expect(metrics.topCategoryName).toBe("Belum ada pengeluaran");
    expect(metrics.topCategoryTotal).toBe(0);
    expect(metrics.topCategoryPercentage).toBe(0);
  });
});
