// tests/ui/dashboard-metrics.test.ts
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { calculateMetrics } from "@/components/dashboard/metric-cards";
import { DailySafeToSpendCard } from "@/components/dashboard/daily-safe-to-spend-card";
import type { Expense } from "@/lib/types/expense";
import type { DailySafeToSpendResult } from "@/types/financial-types";

describe("Dashboard Analytics Calculation", () => {
  it("calculates total, top category, and percentage correctly", () => {
    const now = new Date().toISOString();
    const expenses: Expense[] = [
      { id: "1", userId: "u", itemName: "Warteg", amount: 20000, category: "Food & Drinks", createdAt: now, updatedAt: now },
      { id: "2", userId: "u", itemName: "Kopi", amount: 10000, category: "Food & Drinks", createdAt: now, updatedAt: now },
      { id: "3", userId: "u", itemName: "Ojek", amount: 10000, category: "Transportation", createdAt: now, updatedAt: now },
    ];
    const metrics = calculateMetrics(expenses);
    expect(metrics.totalMonth).toBe(40000);
    expect(metrics.topCategoryName).toBe("Food & Drinks");
    expect(metrics.topCategoryTotal).toBe(30000);
    expect(metrics.topCategoryPercentage).toBe(75);
  });

  it("handles empty expenses array safely", () => {
    const metrics = calculateMetrics([]);
    expect(metrics.totalMonth).toBe(0);
    expect(metrics.topCategoryName).toBe("Belum ada pengeluaran");
    expect(metrics.topCategoryTotal).toBe(0);
    expect(metrics.topCategoryPercentage).toBe(0);
  });
});

describe("DailySafeToSpendCard Component", () => {
  it("renders daily budget amount, safe status badge, and remaining days", () => {
    const safeResult: DailySafeToSpendResult = {
      dailyBudget: 75000,
      todaySpent: 25000,
      remainingToday: 50000,
      daysRemaining: 15,
      status: "safe",
      headline: "Jatah Jajan Hari Ini Aman",
      advice: "Aman buat nongkrong santai sore ini. Tetap bijak dan sisihkan sisa jatah harian.",
    };

    const html = renderToString(
      React.createElement(DailySafeToSpendCard, {
        result: safeResult,
        onOpenVoice: () => {},
      })
    );

    // Displays budget amount
    expect(html).toContain("75.000");
    // Displays safe badge
    expect(html).toMatch(/Aman/i);
    // Displays remaining days
    expect(html).toContain("15 hari tersisa");
    // Displays student advice
    expect(html).toContain("Aman buat nongkrong santai sore ini");
    // Displays quick CTA
    expect(html).toMatch(/Bicara|Catat/i);
  });

  it("renders warning status badge when budget is near limit", () => {
    const warningResult: DailySafeToSpendResult = {
      dailyBudget: 60000,
      todaySpent: 52000,
      remainingToday: 8000,
      daysRemaining: 10,
      status: "warning",
      headline: "Mendekati Batas Harian",
      advice: "Pengeluaran hari ini sudah mencapai 80%+ dari batas aman. Rem jajan sore!",
    };

    const html = renderToString(
      React.createElement(DailySafeToSpendCard, {
        result: warningResult,
      })
    );

    expect(html).toContain("60.000");
    expect(html).toMatch(/Waspada/i);
    expect(html).toContain("10 hari tersisa");
    expect(html).toContain("Mendekati Batas Harian");
  });

  it("renders Krisis Tanggal Tua badge and survival advice when budget is exhausted", () => {
    const dangerResult: DailySafeToSpendResult = {
      dailyBudget: 0,
      todaySpent: 65000,
      remainingToday: 0,
      daysRemaining: 7,
      status: "danger",
      headline: "Krisis Tanggal Tua!",
      advice: "Krisis tanggal tua! Masak mie/telur di kos, tahan nongkrong di kafe.",
    };

    const html = renderToString(
      React.createElement(DailySafeToSpendCard, {
        result: dangerResult,
      })
    );

    expect(html).toMatch(/Krisis Tanggal Tua/i);
    expect(html).toContain("7 hari tersisa");
    expect(html).toContain("Krisis tanggal tua! Masak mie/telur di kos");
  });

  it("handles spending breakdown and omits quick action CTA when onOpenVoice is omitted", () => {
    const safeResult: DailySafeToSpendResult = {
      dailyBudget: 50000,
      todaySpent: 10000,
      remainingToday: 40000,
      daysRemaining: 20,
      status: "safe",
      headline: "Jatah Jajan Aman",
      advice: "Pengeluaran terkendali!",
    };

    const html = renderToString(
      React.createElement(DailySafeToSpendCard, {
        result: safeResult,
      })
    );

    // Displays spent and remaining
    expect(html).toContain("10.000");
    expect(html).toContain("40.000");
    expect(html).toContain("20% dari jatah");
    // Does not render voice button
    expect(html).not.toContain("Catat Pengeluaran (Bicara)");
  });
});


