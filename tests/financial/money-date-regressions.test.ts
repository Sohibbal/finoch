import { describe, it, expect } from "vitest";
import { localDateKey, isSameLocalMonth } from "@/lib/date";
import { calculateSplitBill } from "@/lib/financial/split-bill-engine";
import { syncExpensesToEnvelopes, getDefaultStudentEnvelopes } from "@/lib/financial/budget-engine";
import { auditMicroExpenses } from "@/lib/financial/audit-engine";
import { calculateStreakMetrics } from "@/lib/financial/streak-engine";
import { generateMonthlyReport, generateCsvContent, generateLpjSpreadsheetCsv, WANTS_CATEGORIES } from "@/lib/financial/report-engine";
import { calculateFinancialRunway } from "@/lib/financial/runway-engine";
import { detectSpendingPatterns } from "@/lib/insights/pattern-detector";
import { Participant, SplitBillConfig, SplitItem } from "@/types/split-bill-types";

process.env.TZ = "Asia/Jakarta";

// 00:30 WIB on 1 Oct 2026 == 17:30 UTC on 30 Sep 2026
const EARLY_WIB = "2026-09-30T17:30:00.000Z";

describe("#1 local date helpers (Asia/Jakarta)", () => {
  it("localDateKey uses the local calendar, not UTC", () => {
    expect(localDateKey(new Date(EARLY_WIB))).toBe("2026-10-01");
    expect(isSameLocalMonth(new Date(EARLY_WIB), new Date(2026, 9, 15))).toBe(true);
    expect(isSameLocalMonth(new Date(EARLY_WIB), new Date(2026, 8, 15))).toBe(false);
  });

  it("CSV and LPJ exports show the local day for an expense at 00:30 WIB", () => {
    const expenses = [{ itemName: "Nasi", amount: 15000, category: "Food", createdAt: EARLY_WIB }];
    expect(generateCsvContent(expenses)).toContain("2026-10-01,");
    const summary = generateMonthlyReport(expenses, 2000000, 10, 2026);
    expect(generateLpjSpreadsheetCsv(expenses, summary)).toContain(",2026-10-01,");
  });

  it("CSV export does not throw on an invalid date", () => {
    expect(generateCsvContent([{ amount: 1, createdAt: "garbage" }])).toContain("-,");
  });
});

describe("#7 split bill shares sum exactly to the total", () => {
  const people: Participant[] = [
    { id: "p1", name: "Saya", isUser: true },
    { id: "p2", name: "Budi", isUser: false },
    { id: "p3", name: "Siti", isUser: false },
  ];
  const config = (overrides: Partial<SplitBillConfig> = {}): SplitBillConfig => ({
    restaurantName: "X",
    date: "2026-10-05",
    mode: "equal",
    taxPercentage: 0,
    servicePercentage: 0,
    discountAmount: 0,
    rounding: 0,
    ...overrides,
  });
  const item = (overrides: Partial<SplitItem> = {}): SplitItem => ({
    id: "i",
    name: "Menu",
    price: 100000,
    quantity: 1,
    assignedParticipantIds: [],
    ...overrides,
  });
  const sum = (r: ReturnType<typeof calculateSplitBill>) => r.shares.reduce((s, x) => s + x.finalAmount, 0);

  it("100.000 / 3 -> 33.334 + 33.333 + 33.333", () => {
    const r = calculateSplitBill([item()], people, config());
    expect(r.shares.map((s) => s.finalAmount)).toEqual([33334, 33333, 33333]);
    expect(sum(r)).toBe(100000);
    expect(r.roundingSurplus).toBe(0);
  });

  it("itemized split also sums exactly", () => {
    const r = calculateSplitBill([item({ assignedParticipantIds: [] })], people, config({ mode: "itemized", taxPercentage: 11 }));
    expect(sum(r)).toBe(r.grandTotal);
  });

  it("rounding step never silently overcharges", () => {
    const r = calculateSplitBill([item()], people, config({ rounding: 1000 }));
    // 3 x ceil(33.333,33 -> 34.000) would be 102.000; now at most one step over, reported explicitly
    expect(sum(r)).toBe(r.grandTotal + r.roundingSurplus);
    expect(r.roundingSurplus).toBeGreaterThanOrEqual(0);
    expect(r.roundingSurplus).toBeLessThan(1000);
    r.shares.forEach((s) => expect(s.finalAmount % 1000).toBe(0));
  });

  it("items assigned to removed participants split among valid assignees only", () => {
    const r = calculateSplitBill(
      [item({ price: 60000, assignedParticipantIds: ["p1", "ghost"] }), item({ id: "j", price: 30000, assignedParticipantIds: ["p2"] })],
      people,
      config({ mode: "itemized" })
    );
    expect(r.shares.find((s) => s.participantId === "p1")!.finalAmount).toBe(60000);
    expect(sum(r)).toBe(90000);
  });

  it("negative discount is ignored rather than raising the bill", () => {
    const r = calculateSplitBill([item()], people, config({ discountAmount: -50000 }));
    expect(r.totalDiscount).toBe(0);
    expect(r.grandTotal).toBe(100000);
  });

  it("quantity 0 means 0, not 1", () => {
    const r = calculateSplitBill([item(), item({ id: "z", price: 50000, quantity: 0 })], people, config());
    expect(r.subtotal).toBe(100000);
  });
});

describe("#9 budget sync: current month only, explicit mapping", () => {
  const ref = new Date(2026, 9, 15);
  const envelopes = getDefaultStudentEnvelopes(2000000);
  const spentOf = (result: ReturnType<typeof syncExpensesToEnvelopes>, id: string) =>
    result.find((e) => e.id === id)!.spentAmount;

  it("ignores expenses from previous months", () => {
    const result = syncExpensesToEnvelopes(
      envelopes,
      [
        { category: "Food & Drinks", amount: 10000, createdAt: new Date(2026, 9, 2).toISOString() },
        { category: "Food & Drinks", amount: 99000, createdAt: new Date(2026, 8, 28).toISOString() },
        { category: "Food & Drinks", amount: 5000, createdAt: EARLY_WIB }, // 1 Oct local
      ],
      ref
    );
    expect(spentOf(result, "env-makan")).toBe(15000);
  });

  it("Shopping does not land in Nongkrong; Education & Career and empty category reach an envelope", () => {
    const date = new Date(2026, 9, 3).toISOString();
    const result = syncExpensesToEnvelopes(
      envelopes,
      [
        { category: "Shopping", amount: 100, createdAt: date },
        { category: "Education & Career", amount: 200, createdAt: date },
        { category: "", amount: 300, createdAt: date },
      ],
      ref
    );
    expect(spentOf(result, "env-nongkrong")).toBe(0);
    const total = result.reduce((s, e) => s + e.spentAmount, 0);
    expect(total).toBe(600); // each counted exactly once
    expect(spentOf(result, "env-darurat")).toBe(600); // "Other" fallback
  });
});

describe("#9 / #11 audit engine", () => {
  const ref = new Date(2026, 9, 15);
  const thisMonth = new Date(2026, 9, 3).toISOString();

  it("counts only the current month", () => {
    const summary = auditMicroExpenses(
      [
        { itemName: "Parkir Indomaret", amount: 2000, category: "Transportation", createdAt: thisMonth },
        { itemName: "Parkir Indomaret", amount: 2000, category: "Transportation", createdAt: new Date(2026, 6, 3).toISOString() },
      ],
      2000000,
      ref
    );
    expect(summary.leakCount).toBe(1);
  });

  it("uses whole-word keyword matching", () => {
    const summary = auditMicroExpenses(
      [
        { itemName: "Coffee latte susu gula aren", amount: 14000, category: "Food & Drinks", createdAt: thisMonth },
        { itemName: "Sewa lapangan badminton", amount: 14000, category: "Entertainment", createdAt: thisMonth },
        { itemName: "Biaya admin bank", amount: 6500, category: "Bills", createdAt: thisMonth },
      ],
      2000000,
      ref
    );
    expect(summary.items.filter((i) => i.category === "admin_fee").map((i) => i.name)).toEqual(["Biaya admin bank"]);
  });
});

describe("#10 streak engine", () => {
  it("a big-spending needs-only day is not green", () => {
    const summary = calculateStreakMetrics(
      [{ amount: 200000, category: "Food & Drinks", createdAt: new Date(2026, 9, 5, 12).toISOString() }],
      50000,
      new Date(2026, 9, 10)
    );
    expect(summary.monthlyPoints[4].status).toBe("overspent");
  });

  it("streak continues across the month boundary", () => {
    const summary = calculateStreakMetrics(
      [
        { amount: 200000, category: "Shopping", createdAt: new Date(2026, 8, 20, 12).toISOString() }, // overspent 20 Sep
        { amount: 10000, category: "Food", createdAt: new Date(2026, 8, 25, 12).toISOString() },
      ],
      50000,
      new Date(2026, 9, 2)
    );
    // 21 Sep .. 2 Oct = 10 + 2 = 12 days
    expect(summary.currentStreak).toBe(12);
    expect(summary.longestStreak).toBeGreaterThanOrEqual(12);
  });

  it("does not count days before the first recorded expense in earlier months", () => {
    const summary = calculateStreakMetrics([], 50000, new Date(2026, 9, 2));
    expect(summary.currentStreak).toBe(2);
  });
});

describe("#12 monthly report excludes undated / invalid-date expenses", () => {
  it("only dated expenses in the month are counted", () => {
    const report = generateMonthlyReport(
      [
        { amount: 10000, category: "Food", createdAt: new Date(2026, 9, 3).toISOString() },
        { amount: 50000, category: "Food" },
        { amount: 70000, category: "Food", createdAt: "not-a-date" },
      ],
      1000000,
      10,
      2026
    );
    expect(report.totalExpenses).toBe(10000);
    expect(report.totalTransactions).toBe(1);
  });
});

describe("#13 runway engine", () => {
  it("negative or NaN expenses do not inflate remaining cash", () => {
    const r = calculateFinancialRunway({ totalIncome: 1000000, totalExpensesThisMonth: -500000, currentDate: new Date(2026, 9, 10) });
    expect(r.remainingCash).toBe(1000000);
    const n = calculateFinancialRunway({ totalIncome: NaN, totalExpensesThisMonth: NaN, currentDate: new Date(2026, 9, 10) });
    expect(Number.isFinite(n.currentBurnRate)).toBe(true);
    expect(Number.isFinite(n.runwayDays)).toBe(true);
  });
});

describe("#15 pattern detector reports categories that dropped to 0", () => {
  it("includes categories missing from the current period", () => {
    const insights = detectSpendingPatterns({
      currentCategoryTotals: { Food: 100000 },
      previousCategoryTotals: { Food: 100000, Shopping: 300000 },
    });
    const drop = insights.find((i) => i.type === "spending_decrease");
    expect(drop?.title).toContain("Shopping");
  });
});

describe("#16 single WANTS_CATEGORIES export", () => {
  it("is shared and lowercase", () => {
    expect(WANTS_CATEGORIES).toContain("family");
    WANTS_CATEGORIES.forEach((c) => expect(c).toBe(c.toLowerCase()));
  });
});
