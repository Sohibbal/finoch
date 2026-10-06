import { describe, it, expect } from "vitest";
import { calculateSurvivalPlan } from "@/lib/financial/survival-engine";

describe("Student Survival Mode Engine", () => {
  it("calculates daily survival ration and status correctly", () => {
    // Rp 60,000 for 5 days = Rp 12,000 / day -> critical (< 15,000)
    const criticalPlan = calculateSurvivalPlan(60000, 5);
    expect(criticalPlan.dailySurvivalRation).toBe(12000);
    expect(criticalPlan.daysLeft).toBe(5);
    expect(criticalPlan.status).toBe("critical");
    expect(criticalPlan.emergencyMeals.length).toBeGreaterThan(0);
    expect(criticalPlan.survivalRules.length).toBeGreaterThan(0);

    // Rp 100,000 for 5 days = Rp 20,000 / day -> tight (15,000 - 30,000)
    const tightPlan = calculateSurvivalPlan(100000, 5);
    expect(tightPlan.dailySurvivalRation).toBe(20000);
    expect(tightPlan.status).toBe("tight");
  });

  it("handles zero or negative balance safely", () => {
    const zeroPlan = calculateSurvivalPlan(0, 3);
    expect(zeroPlan.dailySurvivalRation).toBe(0);
    expect(zeroPlan.status).toBe("critical");
  });
});
