import { describe, it, expect } from "vitest";
import {
  calculateDebtSummary,
  generateWhatsAppDebtReminder,
} from "@/lib/financial/debt-engine";
import { DebtItem } from "@/types/debt-types";

describe("Student Debt & Kasbon Engine", () => {
  const mockDebts: DebtItem[] = [
    {
      id: "1",
      type: "receivable",
      personName: "Rian",
      amount: 50000,
      description: "Talangan fotokopi",
      status: "unpaid",
      createdAt: "",
    },
    {
      id: "2",
      type: "payable",
      personName: "Warung Bu Siti",
      amount: 20000,
      description: "Kasbon makan siang",
      status: "unpaid",
      createdAt: "",
    },
    {
      id: "3",
      type: "receivable",
      personName: "Doni",
      amount: 30000,
      description: "Uang bensin",
      status: "paid", // already paid, should be excluded from active totals
      createdAt: "",
    },
  ];

  it("calculates total receivables, payables, and net balance correctly", () => {
    const summary = calculateDebtSummary(mockDebts);

    expect(summary.totalReceivable).toBe(50000);
    expect(summary.totalPayable).toBe(20000);
    expect(summary.netBalance).toBe(30000);
    expect(summary.unpaidReceivablesCount).toBe(1);
    expect(summary.unpaidPayablesCount).toBe(1);
  });

  it("generates polite non-awkward WhatsApp reminder for receivable", () => {
    const reminder = generateWhatsAppDebtReminder(
      mockDebts[0],
      "Budi",
      "BCA 1234567890 a.n Budi"
    );

    expect(reminder).toContain("Halo Rian!");
    expect(reminder).toContain("50.000");
    expect(reminder).toContain("Talangan fotokopi");
    expect(reminder).toContain("BCA 1234567890");
    expect(reminder).toContain("finoch.id");
  });
});
