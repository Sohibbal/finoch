// tests/api/sync-reconciliation.test.ts
import { describe, it, expect } from "vitest";
import { reconcileChanges } from "@/lib/sync/sync-manager";
import type { Expense } from "@/lib/types/expense";

describe("Sync Conflict Reconciliation", () => {
  it("resolves conflicts using Last-Write-Wins based on updatedAt (local newer)", () => {
    const local: Expense = {
      id: "e-1",
      userId: "u-1",
      itemName: "Nasi Goreng Spesial",
      amount: 20000,
      category: "Food & Drinks",
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:05:00.000Z",
    };

    const server: Expense = {
      id: "e-1",
      userId: "u-1",
      itemName: "Nasi Goreng Biasa",
      amount: 15000,
      category: "Food & Drinks",
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:02:00.000Z",
    };

    const winner = reconcileChanges(local, server);
    expect(winner.itemName).toBe("Nasi Goreng Spesial");
    expect(winner.amount).toBe(20000);
  });

  it("resolves conflicts using Last-Write-Wins based on updatedAt (server newer)", () => {
    const local: Expense = {
      id: "e-2",
      userId: "u-1",
      itemName: "Kopi Hitam",
      amount: 8000,
      category: "Food & Drinks",
      createdAt: "2026-10-01T08:00:00.000Z",
      updatedAt: "2026-10-01T08:10:00.000Z",
    };

    const server: Expense = {
      id: "e-2",
      userId: "u-1",
      itemName: "Kopi Susu",
      amount: 12000,
      category: "Food & Drinks",
      createdAt: "2026-10-01T08:00:00.000Z",
      updatedAt: "2026-10-01T08:15:00.000Z",
    };

    const winner = reconcileChanges(local, server);
    expect(winner.itemName).toBe("Kopi Susu");
    expect(winner.amount).toBe(12000);
  });
});
