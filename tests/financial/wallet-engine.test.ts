import { describe, it, expect } from "vitest";
import {
  calculateWalletSummary,
  detectCriticalBalances,
} from "@/lib/financial/wallet-engine";
import { StudentWallet } from "@/types/wallet-types";

describe("Student Wallet Engine", () => {
  const mockWallets: StudentWallet[] = [
    {
      id: "1",
      name: "Dompet Tunai",
      type: "cash",
      balance: 100000,
      color: "emerald",
      icon: "wallet",
      updatedAt: "",
    },
    {
      id: "2",
      name: "BCA",
      type: "bank",
      balance: 1500000,
      color: "blue",
      icon: "landmark",
      updatedAt: "",
    },
    {
      id: "3",
      name: "GoPay",
      type: "ewallet",
      balance: 15000, // < 20,000 critical
      color: "purple",
      icon: "smartphone",
      updatedAt: "",
    },
  ];

  it("calculates total balance and sub-balances correctly", () => {
    const summary = calculateWalletSummary(mockWallets);

    expect(summary.totalBalance).toBe(1615000);
    expect(summary.cashBalance).toBe(100000);
    expect(summary.bankBalance).toBe(1500000);
    expect(summary.ewalletBalance).toBe(15000);
    expect(summary.criticalWallets.length).toBe(1);
    expect(summary.criticalWallets[0].name).toBe("GoPay");
  });

  it("detects critical low balances and outputs actionable alerts", () => {
    const alerts = detectCriticalBalances(mockWallets, 20000);

    expect(alerts.length).toBe(1);
    expect(alerts[0]).toContain("GoPay");
    expect(alerts[0]).toContain("ojek online");
  });
});
