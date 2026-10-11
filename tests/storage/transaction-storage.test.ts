import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import {
  saveTransaction,
  getTransactions,
  deleteTransaction,
  type LocalTransaction,
} from "@/lib/storage/transaction-storage";

describe("Transaction Local Storage", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it("stores and retrieves income and expense transactions", async () => {
    const tx1: LocalTransaction = {
      id: "tx-1",
      userId: "u-1",
      type: "income",
      itemName: "Gaji Freelance",
      amount: 500000,
      category: "Freelance",
      source: "manual",
      transactionDate: new Date().toISOString(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tx2: LocalTransaction = {
      id: "tx-2",
      userId: "u-1",
      type: "expense",
      itemName: "Makan Siang",
      amount: 25000,
      category: "Makanan & Minuman",
      source: "voice",
      transactionDate: new Date().toISOString(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveTransaction(tx1);
    await saveTransaction(tx2);

    const all = await getTransactions("u-1");
    expect(all).toHaveLength(2);

    const incomes = await getTransactions("u-1", "income");
    expect(incomes).toHaveLength(1);
    expect(incomes[0].itemName).toBe("Gaji Freelance");

    await deleteTransaction("tx-2", "u-1");
    const afterDelete = await getTransactions("u-1", "expense");
    expect(afterDelete).toHaveLength(0);
  });
});
