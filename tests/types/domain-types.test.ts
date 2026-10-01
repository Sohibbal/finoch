// tests/types/domain-types.test.ts
import { describe, it, expect } from "vitest";
import type { Expense, ExpenseCategory, ParsedVoiceItem } from "@/lib/types/expense";
import type { SyncQueueItem } from "@/lib/types/sync";
import type { UserProfile } from "@/lib/types/auth";

describe("Domain Types Validation", () => {
  it("creates valid Expense and ParsedVoiceItem instances", () => {
    const category: ExpenseCategory = "primer";
    const item: ParsedVoiceItem = {
      id: "item-1",
      rawText: "beli nasi goreng 15rb",
      itemName: "Nasi Goreng",
      amount: 15000,
      category,
      confidence: 0.95,
    };
    expect(item.amount).toBe(15000);
    expect(item.category).toBe("primer");
  });

  it("creates valid SyncQueueItem", () => {
    const expense: Expense = {
      id: "exp-1",
      userId: "guest",
      itemName: "Es Teh",
      amount: 5000,
      category: "bocor_halus",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
    };
    const queueItem: SyncQueueItem = {
      id: "q-1",
      expenseId: expense.id,
      action: "create",
      payload: expense,
      timestamp: Date.now(),
      retryCount: 0,
    };
    expect(queueItem.action).toBe("create");
    expect(queueItem.payload.amount).toBe(5000);
  });

  it("creates valid UserProfile", () => {
    const user: UserProfile = {
      id: "u-1",
      email: "mahasiswa@univ.ac.id",
      name: "Siti Rahma",
      createdAt: new Date().toISOString(),
    };
    expect(user.name).toBe("Siti Rahma");
  });
});
