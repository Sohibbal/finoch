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

  it("builds multi-month breakdown and category summaries from clientFacts", async () => {
    const { buildUserFinancialSnapshot } = await import("@/lib/copilot/context-builder");

    const snapshot = await buildUserFinancialSnapshot("demo-user", {
      transactions: [
        { type: "expense", amount: 50000, itemName: "Nasi Padang", category: "Makanan", transactionDate: "2026-09-10" },
        { type: "expense", amount: 150000, itemName: "Bensin Mobil", category: "Transportasi", transactionDate: "2026-08-15" },
        { type: "income", amount: 5000000, itemName: "Gaji Bulanan", category: "Gaji", transactionDate: "2026-09-01" },
      ],
      wishlists: [
        { name: "iPad Pro", targetPrice: 15000000, isAchieved: false },
      ],
      streakDays: 7,
    });

    expect(snapshot.allTimeIncome).toBe(5000000);
    expect(snapshot.allTimeExpense).toBe(200000);
    expect(snapshot.netBalance).toBe(4800000);
    expect(snapshot.wishlistSummary).toContain("iPad Pro");
    expect(snapshot.monthlyBreakdown).toBeDefined();
    expect(snapshot.monthlyBreakdown?.length).toBeGreaterThanOrEqual(2);

    const formatted = formatFinancialContextForLLM(snapshot);
    expect(formatted).toContain("REKAP HISTORI PER BULAN");
    expect(formatted).toContain("RINCIAN PENGELUARAN PER KATEGORI");
  });

  it("formats daily allowance status properly when overspent vs safe", () => {
    const safeText = formatFinancialContextForLLM({
      nickname: "Alex",
      netBalance: 1000000,
      monthlyIncome: 2000000,
      monthlyExpense: 500000,
      todayExpense: 30000,
      dailyAllowance: 50000,
    });
    expect(safeText).toContain("Target Jatah Harian");
    expect(safeText).toContain("AMAN");
    expect(safeText).toContain("Sisa jatah hari ini: Rp20.000");

    const overspentText = formatFinancialContextForLLM({
      nickname: "Alex",
      netBalance: 1000000,
      monthlyIncome: 2000000,
      monthlyExpense: 500000,
      todayExpense: 120000,
      dailyAllowance: 50000,
    });
    expect(overspentText).toContain("KURANG AMAN");
    expect(overspentText).toContain("MELEBIHI JATAH");
    expect(overspentText).toContain("Rp70.000");
  });
});
