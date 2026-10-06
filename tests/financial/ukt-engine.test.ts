import { describe, it, expect } from "vitest";
import { calculateUktMetrics } from "@/lib/financial/ukt-engine";
import { UktPlan } from "@/types/ukt-types";

describe("Academic UKT Sinking Fund Engine", () => {
  const basePlan: UktPlan = {
    id: "plan-1",
    name: "UKT Semester 5",
    targetAmount: 3000000,
    currentSaved: 1000000,
    deadline: "2026-11-01",
    category: "ukt",
    deposits: [],
    updatedAt: "2026-10-01T00:00:00Z",
  };

  const refDate = new Date("2026-10-01T00:00:00Z");

  it("calculates remaining amount and progress percentage correctly", () => {
    const metrics = calculateUktMetrics(basePlan, 2000000, refDate);

    expect(metrics.remainingAmount).toBe(2000000);
    expect(metrics.progressPercentage).toBe(33); // 1jt / 3jt = 33%
    expect(metrics.isCompleted).toBe(false);
    expect(metrics.daysRemaining).toBe(31);
    expect(metrics.dailyTarget).toBe(Math.ceil(2000000 / 31));
    expect(metrics.weeklyTarget).toBe(metrics.dailyTarget * 7);
  });

  it("detects completed plans accurately", () => {
    const completedPlan: UktPlan = {
      ...basePlan,
      currentSaved: 3000000,
    };
    const metrics = calculateUktMetrics(completedPlan, 2000000, refDate);

    expect(metrics.remainingAmount).toBe(0);
    expect(metrics.progressPercentage).toBe(100);
    expect(metrics.isCompleted).toBe(true);
    expect(metrics.dailyTarget).toBe(0);
    expect(metrics.feasibilityStatus).toBe("aman");
    expect(metrics.advice).toContain("Alhamdulillah");
  });
});
