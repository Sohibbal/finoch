import { describe, it, expect } from "vitest";
import { detectSpendingPatterns } from "@/lib/insights/pattern-detector";

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
