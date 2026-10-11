import { describe, it, expect } from "vitest";
import { dailyJatah } from "@/components/dashboard/dashboard-data";
import type { TransactionCandidate } from "@/types/financial-types";

const tx = (date: string, amount: number): TransactionCandidate => ({ amount, category: "Other", date, source: "manual" });
// Sun 11 Oct 2026: 21 days left in October including today.
const NOW = new Date(2026, 9, 11, 12);
const profile = { monthlyIncome: 3_000_000, monthlyFixedExpenses: 900_000 };

describe("dailyJatah", () => {
  it("splits what is left of the month (before today) over the days left including today", () => {
    const j = dailyJatah({ ...profile, transactions: [tx("2026-10-02", 420_000)], now: NOW });
    expect(j.daysLeft).toBe(21);
    expect(j.jatah).toBe(80_000); // (3.000.000 − 900.000 − 420.000) / 21
    expect(j.spentToday).toBe(0);
    expect(j.sisaHariIni).toBe(80_000);
    expect(j.sisaBulanIni).toBe(1_680_000);
    expect(j.status).toBe("aman");
  });

  it("does not shrink today's jatah when spending today (no double count)", () => {
    const before = dailyJatah({ ...profile, transactions: [tx("2026-10-02", 420_000)], now: NOW });
    const after = dailyJatah({ ...profile, transactions: [tx("2026-10-02", 420_000), tx("2026-10-11", 30_000)], now: NOW });
    expect(after.jatah).toBe(before.jatah);
    expect(after.sisaHariIni).toBe(50_000);
    expect(after.sisaBulanIni).toBe(1_650_000);
  });

  it("is Mepet from 80% of the jatah and Habis once it is used up", () => {
    const at = (spent: number) => dailyJatah({ ...profile, transactions: [tx("2026-10-02", 420_000), tx("2026-10-11", spent)], now: NOW });
    expect(at(63_999).status).toBe("aman");
    expect(at(64_000).status).toBe("mepet");
    expect(at(80_000).status).toBe("habis");
    expect(at(95_000).sisaHariIni).toBe(-15_000);
  });

  it("ignores other months and undated rows", () => {
    const j = dailyJatah({ ...profile, transactions: [tx("2026-09-30", 999_999), tx("", 5_000)], now: NOW });
    expect(j.jatah).toBe(100_000);
  });

  it("is Habis with a zero jatah when the month's money is gone", () => {
    const j = dailyJatah({ ...profile, transactions: [tx("2026-10-01", 2_100_000)], now: NOW });
    expect(j.jatah).toBe(0);
    expect(j.status).toBe("habis");
    expect(j.sisaBulanIni).toBe(0);
  });
});
