import { describe, it, expect } from "vitest";
import { detectSpendingPatterns, getMonthlyCategoryTotals } from "@/lib/insights/pattern-detector";

describe("Spending Pattern Detector", () => {
  it("detects spending increase greater than 20%", () => {
    const insights = detectSpendingPatterns({
      currentCategoryTotals: { Food: 920000 },
      previousCategoryTotals: { Food: 720000 },
    });
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].type).toBe("spending_increase");
    expect(insights[0].evidence.changePercent).toBeCloseTo(27.78, 1);
  });
});

describe("Insights from real expenses", () => {
  it("compares this local month with the previous one and ignores older rows", () => {
    const now = new Date(2026, 9, 15);
    const at = (y: number, m: number, d: number) => new Date(y, m, d, 10).toISOString();
    const totals = getMonthlyCategoryTotals(
      [
        { category: "Food & Drinks", amount: 300000, createdAt: at(2026, 9, 2) },
        { category: "Food & Drinks", amount: 100000, createdAt: at(2026, 9, 10) },
        { category: "Food & Drinks", amount: 250000, createdAt: at(2026, 8, 20) },
        { category: "Transportation", amount: 90000, createdAt: at(2026, 8, 5) },
        { category: "Food & Drinks", amount: 999999, createdAt: at(2026, 7, 5) },
      ],
      now
    );
    expect(totals).toEqual({
      currentCategoryTotals: { "Food & Drinks": 400000 },
      previousCategoryTotals: { "Food & Drinks": 250000, Transportation: 90000 },
    });
    const insights = detectSpendingPatterns(totals);
    expect(insights.map((i) => i.type).sort()).toEqual(["spending_decrease", "spending_increase"]);
  });

  it("has nothing to report without a previous month", () => {
    const totals = getMonthlyCategoryTotals([{ category: "Food & Drinks", amount: 50000, createdAt: new Date() }]);
    expect(detectSpendingPatterns(totals)).toEqual([]);
  });
});
