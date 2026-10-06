import { describe, it, expect } from "vitest";
import {
  calculateEnvelopeProgress,
  getOverallBudgetSummary,
  syncExpensesToEnvelopes,
  findReallocationSuggestions,
  getDefaultStudentEnvelopes,
} from "@/lib/financial/budget-engine";
import { BudgetEnvelope } from "@/types/budget-types";

describe("Budget Engine", () => {
  it("calculates envelope progress accurately", () => {
    // 50% spent: safe
    const res1 = calculateEnvelopeProgress(1000000, 500000);
    expect(res1.percentage).toBe(50);
    expect(res1.remaining).toBe(500000);
    expect(res1.overspent).toBe(0);
    expect(res1.status).toBe("safe");

    // 80% spent: warning
    const res2 = calculateEnvelopeProgress(1000000, 800000);
    expect(res2.percentage).toBe(80);
    expect(res2.remaining).toBe(200000);
    expect(res2.status).toBe("warning");

    // 120% spent: exceeded
    const res3 = calculateEnvelopeProgress(1000000, 1200000);
    expect(res3.percentage).toBe(120);
    expect(res3.remaining).toBe(0);
    expect(res3.overspent).toBe(200000);
    expect(res3.status).toBe("exceeded");
  });

  it("calculates overall budget summary across envelopes", () => {
    const mockEnvelopes: BudgetEnvelope[] = [
      {
        id: "1",
        name: "Makan",
        icon: "utensils",
        color: "emerald",
        allocatedAmount: 1000000,
        spentAmount: 800000,
        categoryAliases: ["Food"],
        updatedAt: "",
      },
      {
        id: "2",
        name: "Kost",
        icon: "home",
        color: "blue",
        allocatedAmount: 800000,
        spentAmount: 800000,
        categoryAliases: ["Housing"],
        updatedAt: "",
      },
    ];

    const summary = getOverallBudgetSummary(mockEnvelopes);
    expect(summary.totalAllocated).toBe(1800000);
    expect(summary.totalSpent).toBe(1600000);
    expect(summary.totalRemaining).toBe(200000);
    expect(summary.overallPercentage).toBe(89);
    expect(summary.status).toBe("warning");
  });

  it("syncs expenses to matching envelopes by category aliases", () => {
    const envelopes: BudgetEnvelope[] = [
      {
        id: "1",
        name: "Makan",
        icon: "utensils",
        color: "emerald",
        allocatedAmount: 500000,
        spentAmount: 0,
        categoryAliases: ["Food & Drinks", "Groceries"],
        updatedAt: "",
      },
      {
        id: "2",
        name: "Transport",
        icon: "car",
        color: "amber",
        allocatedAmount: 200000,
        spentAmount: 0,
        categoryAliases: ["Transportation"],
        updatedAt: "",
      },
    ];

    const expenses = [
      { category: "Food & Drinks", amount: 45000 },
      { category: "Groceries", amount: 35000 },
      { category: "Transportation", amount: 20000 },
      { category: "Entertainment", amount: 99000 }, // unmatched
    ];

    const synced = syncExpensesToEnvelopes(envelopes, expenses);
    expect(synced[0].spentAmount).toBe(80000);
    expect(synced[1].spentAmount).toBe(20000);
  });

  it("generates intelligent reallocation suggestions when an envelope is exceeded", () => {
    const envelopes: BudgetEnvelope[] = [
      {
        id: "1",
        name: "Makan",
        icon: "utensils",
        color: "emerald",
        allocatedAmount: 500000,
        spentAmount: 580000, // deficit 80,000
        categoryAliases: ["Food"],
        updatedAt: "",
      },
      {
        id: "2",
        name: "Nongkrong",
        icon: "coffee",
        color: "purple",
        allocatedAmount: 300000,
        spentAmount: 100000, // surplus 200,000
        categoryAliases: ["Entertainment"],
        updatedAt: "",
      },
    ];

    const suggestions = findReallocationSuggestions(envelopes);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].fromEnvelope.name).toBe("Nongkrong");
    expect(suggestions[0].toEnvelope.name).toBe("Makan");
    expect(suggestions[0].recommendedAmount).toBe(80000);
  });

  it("provides student presets based on monthly allowance", () => {
    const presets = getDefaultStudentEnvelopes(2000000);
    expect(presets.length).toBe(5);

    const totalAllocated = presets.reduce((sum, p) => sum + p.allocatedAmount, 0);
    expect(totalAllocated).toBe(2000000);
  });
});
