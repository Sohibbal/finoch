import { describe, it, expect } from "vitest";
import { calculateFinancialRunway } from "@/lib/financial/runway-engine";

describe("Financial Runway Engine (Hari Bertahan Anak Kost)", () => {
  it("calculates runway accurately for steady, safe spending", () => {
    // 10th day of October (31 days total)
    const mockDate = new Date(2026, 9, 10); // Oct 10, 2026

    const result = calculateFinancialRunway({
      totalIncome: 2500000,
      totalExpensesThisMonth: 600000, // 60.000/day
      currentDate: mockDate,
    });

    expect(result.daysPassed).toBe(10);
    expect(result.daysRemainingInMonth).toBe(22);
    expect(result.currentBurnRate).toBe(60000);
    expect(result.remainingCash).toBe(1900000);

    // 1.900.000 / 60.000 = 31.67 -> 31 days
    expect(result.runwayDays).toBe(31);
    expect(result.status).toBe("safe");
    expect(result.survivalDateText).toBeDefined();
    expect(result.isSurvivingMonth).toBe(true);
  });

  it("detects 'krisis tanggal tua' when burn rate is too aggressive", () => {
    const mockDate = new Date(2026, 9, 10); // Oct 10, 2026

    const result = calculateFinancialRunway({
      totalIncome: 2000000,
      totalExpensesThisMonth: 1200000, // 120.000/day!
      currentDate: mockDate,
    });

    expect(result.currentBurnRate).toBe(120000);
    expect(result.remainingCash).toBe(800000);
    // 800.000 / 120.000 = 6.67 -> ~6 days
    expect(result.runwayDays).toBeLessThan(10);
    expect(result.status).toBe("critical");
    expect(result.isSurvivingMonth).toBe(false);

    // Target daily budget to survive the remaining 22 days: 800.000 / 22 = ~36.363
    expect(result.targetDailyToSurvive).toBeLessThan(result.currentBurnRate);
    expect(result.dailyCutNeeded).toBeGreaterThan(50000);
  });

  it("handles day 1 and zero spending without NaN or division by zero", () => {
    const mockDate = new Date(2026, 9, 1); // Oct 1, 2026

    const result = calculateFinancialRunway({
      totalIncome: 2000000,
      totalExpensesThisMonth: 0,
      currentDate: mockDate,
    });

    expect(result.runwayDays).toBeGreaterThan(0);
    expect(isNaN(result.currentBurnRate)).toBe(false);
    expect(result.status).toBe("safe");
  });

  it("handles deficit (remaining cash <= 0) gracefully", () => {
    const mockDate = new Date(2026, 9, 15);

    const result = calculateFinancialRunway({
      totalIncome: 1500000,
      totalExpensesThisMonth: 1600000, // Defisit 100rb
      currentDate: mockDate,
    });

    expect(result.remainingCash).toBe(0);
    expect(result.runwayDays).toBe(0);
    expect(result.status).toBe("critical");
    expect(result.isSurvivingMonth).toBe(false);
  });
});
