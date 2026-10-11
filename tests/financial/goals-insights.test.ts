import { describe, it, expect } from "vitest";
import { comparisonLabels, detectSpendingPatterns, getMonthlyCategoryTotals } from "@/lib/insights/pattern-detector";

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
        { category: "Food & Drinks", amount: 250000, createdAt: at(2026, 8, 14) },
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

describe("Insights compare equal day ranges", () => {
  const at = (y: number, m: number, d: number) => new Date(y, m, d, 10).toISOString();

  it("compares 1..today with 1..the same day of last month, not the whole of last month", () => {
    // 11 Oct: Sep 12..30 must not count, or 11 days of October look like a huge drop.
    const now = new Date(2026, 9, 11, 12);
    const totals = getMonthlyCategoryTotals(
      [
        { category: "Food & Drinks", amount: 200000, createdAt: at(2026, 9, 5) },
        { category: "Food & Drinks", amount: 210000, createdAt: at(2026, 8, 6) },
        { category: "Food & Drinks", amount: 400000, createdAt: at(2026, 8, 20) },
        { category: "Food & Drinks", amount: 50000, createdAt: at(2026, 9, 20) }, // future day this month
      ],
      now
    );
    expect(totals).toEqual({
      currentCategoryTotals: { "Food & Drinks": 200000 },
      previousCategoryTotals: { "Food & Drinks": 210000 },
    });
    expect(detectSpendingPatterns(totals)).toEqual([]);
    expect(comparisonLabels(now)).toEqual({ current: "1–11 Okt", previous: "1–11 Sep" });
  });

  it("clamps the day to last month's length", () => {
    const now = new Date(2026, 2, 30, 12);
    const totals = getMonthlyCategoryTotals([{ category: "Transportation", amount: 90000, createdAt: at(2026, 1, 28) }], now);
    expect(totals.previousCategoryTotals).toEqual({ Transportation: 90000 });
    expect(comparisonLabels(now).previous).toBe("1–28 Feb");
  });

  it("skips bills (paid on fixed dates) and swings too small to mean anything", () => {
    const insights = detectSpendingPatterns({
      currentCategoryTotals: { "Bills & Utilities": 100000, Other: 5000 },
      previousCategoryTotals: { "Bills & Utilities": 220000, Other: 1000 },
    });
    expect(insights).toEqual([]);
  });

  it("writes per-category advice in the kamu voice, never Anda", () => {
    const insights = detectSpendingPatterns({
      currentCategoryTotals: { "Food & Drinks": 100000, Transportation: 200000, "Shopping & Lifestyle": 10000 },
      previousCategoryTotals: { "Food & Drinks": 300000, Transportation: 100000, "Shopping & Lifestyle": 90000 },
      recurringExpenses: [{ name: "Kos", amount: 850000, frequency: "monthly" }],
    });
    expect(insights).toHaveLength(4);
    const text = insights.flatMap((i) => [i.title, i.description, i.impact, i.recommendation]).join(" ");
    expect(text).not.toMatch(/Anda/);
    expect(new Set(insights.map((i) => i.recommendation)).size).toBe(insights.length);
    expect(new Set(insights.map((i) => i.impact)).size).toBe(insights.length);
  });
});
