import { describe, it, expect } from "vitest";
import {
  mergeExpenses,
  toTransaction,
  currentMonthTransactions,
  splitNeedsWants,
  buildMonthlyTrend,
} from "@/components/dashboard/dashboard-data";
import type { TransactionCandidate } from "@/types/financial-types";

const row = (id: string, updatedAt: string, extra: Partial<{ itemName: string; amount: number; createdAt: string }> = {}) => ({
  id,
  itemName: extra.itemName ?? id,
  amount: extra.amount ?? 1000,
  category: "Food & Drinks",
  createdAt: extra.createdAt ?? updatedAt,
  updatedAt,
});

const tx = (date: string, amount: number, category = "Food & Drinks", spendingType: "needs" | "wants" = "needs"): TransactionCandidate => ({
  amount,
  category,
  spendingType,
  date,
  source: "manual",
});

describe("mergeExpenses", () => {
  it("keeps unsynced local expenses next to server ones", () => {
    const merged = mergeExpenses([row("a", "2026-10-01T10:00:00Z")], [row("b", "2026-10-02T10:00:00Z")]);
    expect(merged.map((e) => e.id)).toEqual(["b", "a"]);
  });

  it("prefers the newer updatedAt for the same id", () => {
    const server = [row("a", "2026-10-01T10:00:00Z", { amount: 1000 })];
    const localNewer = [row("a", "2026-10-03T10:00:00Z", { amount: 5000, createdAt: "2026-10-01T10:00:00Z" })];
    expect(mergeExpenses(server, localNewer)).toHaveLength(1);
    expect(mergeExpenses(server, localNewer)[0].amount).toBe(5000);

    const localOlder = [row("a", "2026-09-30T10:00:00Z", { amount: 7000 })];
    expect(mergeExpenses(server, localOlder)[0].amount).toBe(1000);
  });
});

describe("toTransaction", () => {
  it("uses the local calendar day, not the UTC one", () => {
    // 00:30 local time on Oct 5 is still Oct 4 in UTC for any timezone east of UTC.
    const local = new Date(2026, 9, 5, 0, 30);
    const t = toTransaction({ ...row("a", local.toISOString()), createdAt: local.toISOString() }, "manual");
    expect(t.date).toBe("2026-10-05");
  });

  it("leaves undated expenses undated instead of pretending they are today", () => {
    expect(toTransaction({ id: "a", itemName: "x", amount: 1, category: "Other" }, "voice").date).toBe("");
  });

  it("classifies needs vs wants", () => {
    expect(toTransaction(row("a", "2026-10-01T10:00:00Z"), "manual").spendingType).toBe("needs");
    expect(toTransaction({ ...row("a", "2026-10-01T10:00:00Z"), category: "Shopping & Lifestyle" }, "manual").spendingType).toBe("wants");
  });
});

describe("month scoping", () => {
  const now = new Date(2026, 9, 15);
  const txs = [
    tx("2026-10-01", 100, "Food & Drinks", "needs"),
    tx("2026-10-31", 200, "Shopping & Lifestyle", "wants"),
    tx("2026-09-30", 400, "Food & Drinks", "needs"),
    tx("2025-10-10", 800, "Shopping & Lifestyle", "wants"),
    tx("", 1600, "Other", "wants"),
  ];

  it("keeps only this local month and never counts undated expenses", () => {
    expect(currentMonthTransactions(txs, now).map((t) => t.amount)).toEqual([100, 200]);
  });

  it("splits needs/wants from the same month-scoped list", () => {
    expect(splitNeedsWants(currentMonthTransactions(txs, now))).toEqual({ needs: 100, wants: 200 });
  });
});

describe("buildMonthlyTrend", () => {
  it("is empty when there is nothing to chart", () => {
    expect(buildMonthlyTrend([], new Date(2026, 9, 15))).toEqual([]);
    expect(buildMonthlyTrend([tx("2024-01-01", 100)], new Date(2026, 9, 15))).toEqual([]);
  });

  it("sums real expenses per month and category for the last 4 months", () => {
    const trend = buildMonthlyTrend(
      [
        tx("2026-10-02", 100, "Food & Drinks"),
        tx("2026-10-03", 50, "Transportation"),
        tx("2026-08-10", 300, "Bills & Utilities"),
        tx("2026-01-10", 999, "Food & Drinks"),
      ],
      new Date(2026, 9, 15)
    );
    expect(trend.map((m) => m.month)).toEqual(["Jul", "Agu", "Sep", "Okt (Ini)"]);
    expect(trend[3]).toMatchObject({ food: 100, transport: 50, bills: 0 });
    expect(trend[1]).toMatchObject({ bills: 300 });
  });
});
