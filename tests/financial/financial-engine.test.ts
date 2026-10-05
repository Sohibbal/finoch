import { describe, it, expect } from "vitest";
import {
  calculateCashflowSummary,
  calculateDigitalTwinSplit,
  calculateGoalProjection,
  simulateWhatIfScenario,
  calculateDailySafeToSpend,
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

  describe("calculateDailySafeToSpend", () => {
    it("safe condition: calculates correct daily budget and status 'safe'", () => {
      // Income 3.000.000, fixed bills 1.000.000, expenses 500.000
      // Net remaining budget = 1.500.000
      // October 16, 2026 -> 31 - 16 + 1 = 16 days left
      // Daily budget = 1.500.000 / 16 = 93.750
      const result = calculateDailySafeToSpend({
        monthlyIncome: 3000000,
        monthlyFixedExpenses: 1000000,
        totalExpensesThisMonth: 500000,
        todaySpent: 20000,
        currentDate: new Date(2026, 9, 16),
      });

      expect(result.daysRemaining).toBe(16);
      expect(result.dailyBudget).toBe(93750);
      expect(result.todaySpent).toBe(20000);
      expect(result.remainingToday).toBe(73750);
      expect(result.status).toBe("safe");
      expect(result.headline).toBeTruthy();
      expect(result.advice).toBeTruthy();
    });

    it("warning condition: spending today reaches 85% of daily budget, status 'warning'", () => {
      // Net remaining budget = 1.500.000, 15 days left (October 17, 2026) -> dailyBudget = 100.000
      // todaySpent = 85.000 (85% of dailyBudget)
      const result = calculateDailySafeToSpend({
        monthlyIncome: 3000000,
        monthlyFixedExpenses: 1000000,
        totalExpensesThisMonth: 500000,
        todaySpent: 85000,
        currentDate: new Date(2026, 9, 17),
      });

      expect(result.dailyBudget).toBe(100000);
      expect(result.todaySpent).toBe(85000);
      expect(result.remainingToday).toBe(15000);
      expect(result.status).toBe("warning");
      expect(result.advice).toBeTruthy();
    });

    it("danger / tanggal tua condition: net remaining budget <= 0, status 'danger' with survival advice", () => {
      // Income 3.000.000, fixed bills 1.000.000, expenses 2.200.000 -> net -200.000 <= 0
      const result = calculateDailySafeToSpend({
        monthlyIncome: 3000000,
        monthlyFixedExpenses: 1000000,
        totalExpensesThisMonth: 2200000,
        todaySpent: 10000,
        currentDate: new Date(2026, 9, 16),
      });

      expect(result.dailyBudget).toBe(0);
      expect(result.remainingToday).toBe(0);
      expect(result.status).toBe("danger");
      expect(result.advice.toLowerCase()).toContain("survival");
    });

    it("danger condition: spending today exceeds daily budget", () => {
      // Daily budget = 100.000, todaySpent = 120.000
      const result = calculateDailySafeToSpend({
        monthlyIncome: 3000000,
        monthlyFixedExpenses: 1000000,
        totalExpensesThisMonth: 500000,
        todaySpent: 120000,
        currentDate: new Date(2026, 9, 17),
      });

      expect(result.status).toBe("danger");
      expect(result.remainingToday).toBe(0);
    });

    it("handles default optional parameters gracefully", () => {
      const result = calculateDailySafeToSpend({
        monthlyIncome: 3000000,
        monthlyFixedExpenses: 1000000,
        totalExpensesThisMonth: 500000,
      });

      expect(result.todaySpent).toBe(0);
      expect(result.daysRemaining).toBeGreaterThanOrEqual(1);
      expect(result.dailyBudget).toBeGreaterThan(0);
      expect(result.remainingToday).toBe(result.dailyBudget);
      expect(result.status).toBe("safe");
    });
  });
});
