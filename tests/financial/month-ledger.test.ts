import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { monthLedger, BILL_PAYMENT_PREFIX } from "@/lib/financial/month-ledger";
import { dailyJatah } from "@/components/dashboard/dashboard-data";
import { getDefaultStudentEnvelopes, getOverallBudgetSummary, syncExpensesToEnvelopes } from "@/lib/financial/budget-engine";
import { JatahNote } from "@/components/dashboard/jatah-note";
import { BudgetOverviewCard } from "@/components/budget/budget-overview-card";
import { SimulationResultCard } from "@/components/simulator/simulation-result-card";
import { rupiah } from "@/lib/format";
import type { RecurringBill } from "@/types/bill-types";
import type { TransactionCandidate } from "@/types/financial-types";

// Sun 11 Oct 2026: 21 days left in October including today.
const NOW = new Date(2026, 9, 11, 12);
const tx = (date: string, amount: number, merchant = "Warteg", category = "Food & Drinks"): TransactionCandidate => ({
  merchant,
  amount,
  category,
  date,
  source: "manual",
});
const bill = (id: string, amount: number, dueDay = 1): RecurringBill => ({
  id,
  name: id,
  category: "kos",
  amount,
  dueDay,
  frequency: "monthly",
  isPaidThisMonth: false,
  reminderDaysBefore: 3,
  createdAt: "2026-09-01T00:00:00.000Z",
});

// The demo account the review caught: profile says 900.000 fixed, Tagihan totals 980.000.
const DEMO_BILLS = [bill("kos", 850_000), bill("wifi", 45_000, 10), bill("listrik", 60_000, 15), bill("spotify", 25_000, 25)];
const DEMO_TX = [tx("2026-10-02", 200_000), tx("2026-10-06", 100_000), tx("2026-10-11", 45_000)];
const DEMO = { monthlyIncome: 2_000_000, profileFixedCosts: 900_000, bills: DEMO_BILLS, transactions: DEMO_TX, now: NOW };

describe("monthLedger", () => {
  it("uses the Tagihan total as fixed costs when there are bills", () => {
    const m = monthLedger(DEMO);
    expect(m).toMatchObject({
      income: 2_000_000,
      fixedCosts: 980_000,
      fixedCostSource: "tagihan",
      spendable: 1_020_000,
      spentBefore: 300_000,
      spentToday: 45_000,
      spent: 345_000,
      remaining: 675_000,
      daysLeft: 21,
    });
  });

  it("falls back to the profile's fixed costs without bills", () => {
    const m = monthLedger({ ...DEMO, bills: [] });
    expect(m.fixedCostSource).toBe("profil");
    expect(m.fixedCosts).toBe(900_000);
    expect(m.remaining).toBe(755_000);
  });

  it("never counts a paid bill twice (as fixed cost and as spending)", () => {
    const paid = tx("2026-10-01", 850_000, `${BILL_PAYMENT_PREFIX}kos`, "Bills & Utilities");
    expect(monthLedger({ ...DEMO, transactions: [...DEMO_TX, paid] }).remaining).toBe(675_000);
  });

  it("ignores other months, undated rows and future days", () => {
    const m = monthLedger({ ...DEMO, transactions: [tx("2026-09-30", 999_999), tx("", 5_000), tx("2026-10-20", 7_000)] });
    expect(m.spent).toBe(0);
  });
});

describe("one sisa bulan ini on every consumer", () => {
  it("Dashboard, Simulator and Amplop print the same remaining for the same input", () => {
    const month = monthLedger(DEMO);
    const jatah = dailyJatah({ monthlyIncome: 2_000_000, monthlyFixedExpenses: 900_000, bills: DEMO_BILLS, transactions: DEMO_TX, now: NOW });
    expect(jatah.sisaBulanIni).toBe(month.remaining);
    expect(jatah.month).toEqual(month);
    // The jatah is cut from the same figures: (spendable − spent before today) / days left.
    expect(jatah.jatah).toBe(Math.round((month.spendable - month.spentBefore) / month.daysLeft));

    const sisa = rupiah(month.remaining);
    const note = renderToString(React.createElement(JatahNote, { jatah, today: "2026-10-11", turn: 0, onCatat: () => {} }));
    expect(note).toContain(sisa);
    expect(note).toContain("dari tagihan");

    const envelopes = syncExpensesToEnvelopes(
      getDefaultStudentEnvelopes(month.spendable),
      DEMO_TX.map((t) => ({ category: t.category, amount: t.amount, createdAt: new Date(`${t.date}T10:00:00`).toISOString() })),
      NOW
    );
    const summary = getOverallBudgetSummary(envelopes);
    expect(summary.totalRemaining).toBe(month.remaining);
    const amplop = renderToString(React.createElement(BudgetOverviewCard, { summary, month }));
    expect(amplop).toContain(sisa);

    const sim = renderToString(
      React.createElement(SimulationResultCard, {
        result: { simulatedNetSavings: 0, simulatedMonthsToGoal: Infinity } as never,
        before: jatah,
        after: jatah,
        baselineNetSavings: month.spendable,
        baselineMonthsToGoal: Infinity,
        today: "2026-10-11",
      })
    );
    expect(sim).toContain(sisa);
  });

  it("envelopes split exactly the spendable amount", () => {
    for (const spendable of [1_020_000, 1_234_567, 333_333, 0]) {
      const sum = getDefaultStudentEnvelopes(spendable).reduce((s, e) => s + e.allocatedAmount, 0);
      expect(sum).toBe(spendable);
    }
  });

  it("keeps bill payments out of the envelopes too", () => {
    const envelopes = syncExpensesToEnvelopes(
      getDefaultStudentEnvelopes(1_000_000),
      [{ itemName: `${BILL_PAYMENT_PREFIX}kos`, category: "Bills & Utilities", amount: 850_000, createdAt: NOW.toISOString() }],
      NOW
    );
    expect(getOverallBudgetSummary(envelopes).totalSpent).toBe(0);
  });
});

describe("Laporan agrees with the month ledger", () => {
  it("subtracts fixed costs and skips bill payments, like the ledger", async () => {
    const { generateMonthlyReport } = await import("@/lib/financial/report-engine");
    const { BILL_PAYMENT_PREFIX } = await import("@/lib/financial/month-ledger");
    const at = new Date(2026, 9, 5, 12).toISOString();
    const expenses = [
      { id: "a", itemName: "Makan warteg", amount: 300000, category: "Food & Drinks", createdAt: at },
      { id: "b", itemName: `${BILL_PAYMENT_PREFIX}Kos`, amount: 850000, category: "Bills & Utilities", createdAt: at },
    ];
    const s = generateMonthlyReport(expenses, 2000000, 10, 2026, 980000);
    expect(s.fixedCosts).toBe(980000);
    expect(s.totalExpenses).toBe(300000);
    expect(s.netSavings).toBe(2000000 - 980000 - 300000);
    expect(s.savingsRate).toBe(36);
  });
});
