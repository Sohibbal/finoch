import { describe, it, expect } from "vitest";
import { formatFinancialContextForLLM, type UserFinancialSnapshot } from "@/lib/copilot/context-builder";

describe("FinBot Context Builder", () => {
  it("formats financial snapshot into structured factual prompt context", () => {
    const text = formatFinancialContextForLLM({
      nickname: "Rian",
      netBalance: 1250000,
      monthlyIncome: 2000000,
      monthlyExpense: 750000,
      topExpenseCategory: "Makanan & Minuman",
      topExpenseItem: "Mie Gacoan (Rp45.000)",
      wishlistSummary: "1. Headphone Sony (Rp1.200.000)",
      streakDays: 4,
    });

    expect(text).toContain("Rian");
    expect(text).toContain("Rp1.250.000");
    expect(text).toContain("Makanan & Minuman");
    expect(text).toContain("Headphone Sony");
  });

  it("handles empty or default snapshot gracefully", () => {
    const text = formatFinancialContextForLLM({
      nickname: "Teman",
      netBalance: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
    });

    expect(text).toContain("Teman");
    expect(text).toContain("Rp0");
  });
});
