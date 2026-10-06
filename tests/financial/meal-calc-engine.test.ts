import { describe, it, expect } from "vitest";
import {
  calculateMealMetrics,
  DEFAULT_MEAL_CONFIG,
  DEFAULT_STUDENT_GROCERIES,
} from "@/lib/financial/meal-calc-engine";

describe("Meal Calc Engine (Cooking vs Warteg)", () => {
  it("calculates baseline metrics accurately with default configuration", () => {
    const result = calculateMealMetrics(DEFAULT_MEAL_CONFIG);

    expect(result.cookCostPerMeal).toBeGreaterThan(0);
    expect(result.outsideCostPerMeal).toBe(16000);
    expect(result.cookCostPerMeal).toBeLessThan(result.outsideCostPerMeal);

    expect(result.monthlyCookSpend).toBeLessThan(result.monthlyOutsideSpend);
    expect(result.monthlySavingsCooking).toBeGreaterThan(0);
    expect(result.annualSavingsCooking).toBe(result.monthlySavingsCooking * 12);
    expect(result.tacticalAdvice).toBeTruthy();
  });

  it("calculates hybrid strategy (rice magic com + warteg side dishes) correctly", () => {
    const result = calculateMealMetrics(DEFAULT_MEAL_CONFIG);

    // Hybrid should be cheaper than 100% warteg, but slightly more than 100% cooking
    expect(result.hybridCostPerMeal).toBeLessThan(result.outsideCostPerMeal);
    expect(result.monthlySavingsHybrid).toBeGreaterThan(0);
    expect(result.monthlySavingsHybrid).toBeLessThan(result.monthlySavingsCooking);
  });

  it("handles 3x meals per day scaling properly", () => {
    const customConfig = {
      ...DEFAULT_MEAL_CONFIG,
      mealsPerDay: 3,
    };
    const result = calculateMealMetrics(customConfig);
    const baseline = calculateMealMetrics(DEFAULT_MEAL_CONFIG);

    expect(result.monthlyOutsideSpend).toBeGreaterThan(baseline.monthlyOutsideSpend);
    expect(result.monthlySavingsCooking).toBeGreaterThan(baseline.monthlySavingsCooking);
  });
});
