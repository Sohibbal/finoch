import { describe, it, expect } from "vitest";
import {
  calculateCashflowSummary,
  calculateDigitalTwinSplit,
  calculateGoalProjection,
  simulateWhatIfScenario,
} from "@/lib/financial/financial-engine";

describe("Financial Calculation Engine", () => {
  it("calculates cashflow and savings rate correctly", () => {
    const summary = calculateCashflowSummary({
      income: 3000000,
      expenses: 2150000,
    });
    expect(summary.netSavings).toBe(850000);
    expect(summary.savingsRate).toBeCloseTo(28.33, 1);
  });

  it("handles zero income without division by zero crash", () => {
    const summary = calculateCashflowSummary({ income: 0, expenses: 500000 });
    expect(summary.netSavings).toBe(-500000);
    expect(summary.savingsRate).toBe(0);
  });

  it("calculates 50/30/20 Digital Twin split", () => {
    const split = calculateDigitalTwinSplit({
      income: 3000000,
      needs: 1500000,
      wants: 650000,
      netSavings: 850000,
    });
    expect(split.needsPercentage).toBe(50);
    expect(split.wantsPercentage).toBeCloseTo(21.67, 1);
    expect(split.savingsPercentage).toBeCloseTo(28.33, 1);
    expect(split.needsStatus).toBe("optimal");
  });

  it("calculates goal projection accurately", () => {
    const projection = calculateGoalProjection({
      targetAmount: 12000000,
      currentAmount: 2500000,
      monthlySaving: 850000,
      targetMonths: 24,
    });
    expect(projection.remainingAmount).toBe(9500000);
    expect(projection.requiredMonthlySaving).toBeCloseTo(395833, 0);
    expect(projection.status).toBe("on_track");
    expect(projection.estimatedMonthsToAchieve).toBe(12);
  });

  it("simulates what-if scenario adjusting budget", () => {
    const result = simulateWhatIfScenario({
      currentMonthlyIncome: 3000000,
      currentMonthlyExpense: 2150000,
      expenseCuts: 200000, // potong jajan 200rb
      incomeAddition: 0,
      remainingGoalAmount: 9500000,
    });
    expect(result.simulatedNetSavings).toBe(1050000);
    expect(result.deltaMonthlySavings).toBe(200000);
    expect(result.simulatedMonthsToGoal).toBe(10); // 9.5M / 1.05M = 9.04 -> 10 bulan
  });
});
