import { describe, it, expect } from "vitest";
import { auditMicroExpenses } from "@/lib/financial/audit-engine";

describe("Micro-Expense Leak Audit Engine", () => {
  const mockExpenses = [
    { itemName: "Biaya Admin TopUp GoPay", amount: 2500, category: "Other" },
    { itemName: "Biaya Layanan GoFood", amount: 4000, category: "Food & Drinks" },
    { itemName: "Parkir Indomaret", amount: 2000, category: "Transportation" },
    { itemName: "Es Teh Jumbo Depan Kampus", amount: 5000, category: "Food" },
    { itemName: "Langganan Spotify Premium", amount: 54990, category: "Subscription" },
    { itemName: "Bayar Kost Bulanan", amount: 800000, category: "Housing" }, // normal expense, not a micro leak
  ];

  it("detects micro leaks and computes total leaked amount accurately", () => {
    const summary = auditMicroExpenses(mockExpenses, 2000000);

    expect(summary.leakCount).toBe(5);
    // 2500 + 4000 + 2000 + 5000 + 54990 = 68490
    expect(summary.totalLeakedAmount).toBe(68490);
    expect(summary.wartegEquivalence).toBe(Math.round(68490 / 15000));
    expect(summary.leaksByCategory.length).toBeGreaterThan(0);
  });

  it("calculates warteg equivalence and generates realistic student shock message", () => {
    const summary = auditMicroExpenses(mockExpenses, 2000000);
    expect(summary.shockMessage).toContain("nasi warteg");
    expect(summary.actionChecklist.length).toBeGreaterThan(0);
  });

  it("handles zero leaks gracefully", () => {
    const emptySummary = auditMicroExpenses([], 2000000);
    expect(emptySummary.totalLeakedAmount).toBe(0);
    expect(emptySummary.leakCount).toBe(0);
    expect(emptySummary.wartegEquivalence).toBe(0);
  });

  it("never flags essential kost bills like galon as bocor halus", () => {
    const summary = auditMicroExpenses(
      [
        { itemName: "Isi ulang galon", amount: 6000, category: "Bills & Utilities" },
        { itemName: "Air galon", amount: 7000, category: "Food & Drinks" },
        { itemName: "Cilok", amount: 5000, category: "Food & Drinks" },
      ],
      2000000
    );
    expect(summary.items.map((i) => i.name)).toEqual(["Cilok"]);
  });

  it("only gives the Family Plan tip when a subscription was detected", () => {
    const noSub = auditMicroExpenses([{ itemName: "Parkir Indomaret", amount: 2000, category: "Transportation" }], 2000000);
    expect(noSub.actionChecklist.join(" ")).not.toContain("Family Plan");
    expect(noSub.actionChecklist.length).toBe(1);

    const withSub = auditMicroExpenses(mockExpenses, 2000000);
    expect(withSub.actionChecklist.join(" ")).toContain("Family Plan");
  });
});
