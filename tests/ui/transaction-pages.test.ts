import { describe, it, expect } from "vitest";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/components/transaction/manual-transaction-modal";
import { localDateKey, parseDate } from "@/lib/date";

describe("Income and Expense Pages Architecture", () => {
  it("exports Pemasukan and Pengeluaran page components cleanly", async () => {
    const pemasukanModule = await import("@/app/(app)/pemasukan/page");
    const pengeluaranModule = await import("@/app/(app)/pengeluaran/page");
    expect(pemasukanModule.default).toBeDefined();
    expect(pengeluaranModule.default).toBeDefined();
  });

  it("exports distinct income and expense categories for modal selections", () => {
    expect(INCOME_CATEGORIES).toContain("Uang Saku");
    expect(INCOME_CATEGORIES).toContain("Gaji");
    expect(INCOME_CATEGORIES).toContain("Freelance");
    expect(INCOME_CATEGORIES).not.toContain("Makanan & Minuman");

    expect(EXPENSE_CATEGORIES).toContain("Makanan & Minuman");
    expect(EXPENSE_CATEGORIES).toContain("Transportasi");
    expect(EXPENSE_CATEGORIES).toContain("Kebutuhan Kost");
    expect(EXPENSE_CATEGORIES).not.toContain("Uang Saku");
  });

  it("calculates today expense correctly across voice, manual, and ocr sources", () => {
    const today = new Date();
    const todayKey = localDateKey(today);
    const currentMonthKey = todayKey.substring(0, 7);

    const transactions = [
      {
        id: "tx-voice",
        type: "expense" as const,
        amount: 25000,
        source: "voice" as const,
        transactionDate: todayKey,
        createdAt: today.toISOString(),
      },
      {
        id: "tx-manual",
        type: "expense" as const,
        amount: 30000,
        source: "manual" as const,
        transactionDate: todayKey,
        createdAt: today.toISOString(),
      },
      {
        id: "tx-ocr",
        type: "expense" as const,
        amount: 45000,
        source: "ocr" as const,
        transactionDate: today.toISOString(), // ISO timestamp
        createdAt: today.toISOString(),
      },
      {
        id: "tx-old",
        type: "expense" as const,
        amount: 50000,
        source: "manual" as const,
        transactionDate: "2025-01-01",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    ];

    let todayExpense = 0;
    for (const tx of transactions) {
      const txDate = tx.transactionDate || "";
      const txCreated = tx.createdAt || "";

      let isToday = false;
      const dateCandidates = [txDate, txCreated].filter(Boolean);
      for (const dStr of dateCandidates) {
        if (dStr.startsWith(todayKey)) {
          isToday = true;
          break;
        }
        const parsed = parseDate(dStr);
        if (parsed && !isNaN(parsed.getTime())) {
          if (localDateKey(parsed) === todayKey) {
            isToday = true;
            break;
          }
        }
      }

      if (isToday) {
        todayExpense += tx.amount;
      }
    }

    // 25000 (voice) + 30000 (manual) + 45000 (ocr) = 100000
    expect(todayExpense).toBe(100000);
  });
});

