import { describe, it, expect } from "vitest";
import {
  calculateWalletSummary,
  computeWalletBalances,
  detectCriticalBalances,
  getDefaultWalletId,
} from "@/lib/financial/wallet-engine";
import type { Expense } from "@/lib/types/expense";
import type { WalletTransferRecord, WalletWithBalance } from "@/types/wallet-types";

describe("Student Wallet Engine", () => {
  const mockWallets: WalletWithBalance[] = [
    {
      id: "1",
      name: "Dompet Tunai",
      type: "cash",
      openingBalance: 100000,
      balance: 100000,
      color: "emerald",
      icon: "wallet",
      updatedAt: "",
    },
    {
      id: "2",
      name: "BCA",
      type: "bank",
      openingBalance: 1500000,
      balance: 1500000,
      color: "blue",
      icon: "landmark",
      updatedAt: "",
    },
    {
      id: "3",
      name: "GoPay",
      type: "ewallet",
      openingBalance: 15000,
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

  const expense = (id: string, amount: number, walletId: string | null): Expense => ({
    id, userId: "u", itemName: id, amount, category: "Other", walletId,
    createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-01T00:00:00.000Z",
  });
  const transfer = (from: string, to: string, amount: number, adminFee: number): WalletTransferRecord => ({
    id: `t-${from}-${to}`, fromWalletId: from, fromWalletName: from, toWalletId: to, toWalletName: to,
    amount, adminFee, reason: "", createdAt: "2026-10-01T00:00:00.000Z",
  });
  const balanceOf = (list: WalletWithBalance[], id: string) => list.find((w) => w.id === id)?.balance;

  it("derives balances from saldo awal, transfers, admin fees and expenses", () => {
    const list = computeWalletBalances(
      mockWallets,
      [transfer("2", "1", 50000, 2500)],
      [expense("a", 12000, "1"), expense("b", 30000, "2"), expense("c", 5000, null)]
    );
    expect(balanceOf(list, "1")).toBe(100000 + 50000 - 12000);
    expect(balanceOf(list, "2")).toBe(1500000 - 50000 - 2500 - 30000);
    expect(balanceOf(list, "3")).toBe(15000);
  });

  it("recomputes on expense edit and delete instead of mutating", () => {
    const created = [expense("a", 12000, "1")];
    expect(balanceOf(computeWalletBalances(mockWallets, [], created), "1")).toBe(88000);
    const edited = [{ ...created[0], amount: 20000 }];
    expect(balanceOf(computeWalletBalances(mockWallets, [], edited), "1")).toBe(80000);
    const deleted = [{ ...edited[0], isDeleted: true }];
    expect(balanceOf(computeWalletBalances(mockWallets, [], deleted), "1")).toBe(100000);
  });

  it("picks the default wallet: flagged, else first cash, else first, else null", () => {
    expect(getDefaultWalletId(mockWallets)).toBe("1");
    expect(getDefaultWalletId(mockWallets.map((w) => ({ ...w, isDefault: w.id === "3" })))).toBe("3");
    expect(getDefaultWalletId(mockWallets.filter((w) => w.type !== "cash"))).toBe("2");
    expect(getDefaultWalletId([])).toBeNull();
  });
});
