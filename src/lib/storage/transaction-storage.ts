import { getDatabase } from "./indexed-db";
import { syncQueue } from "./sync-queue";
import { getDataScope } from "./local-storage";

export interface LocalTransaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  itemName: string;
  amount: number;
  category: string;
  source: "manual" | "voice" | "ocr";
  transactionDate: string; // ISO string
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "failed";
}

export async function saveTransaction(
  tx: Omit<LocalTransaction, "id" | "userId" | "createdAt" | "updatedAt" | "isDeleted"> & {
    id?: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
  }
): Promise<LocalTransaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fullTx: LocalTransaction = {
    id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: tx.userId || getDataScope(),
    type: tx.type,
    itemName: tx.itemName.trim(),
    amount: Math.round(tx.amount),
    category: tx.category,
    source: tx.source || "manual",
    transactionDate: tx.transactionDate || now,
    isDeleted: tx.isDeleted ?? false,
    createdAt: tx.createdAt || now,
    updatedAt: tx.updatedAt || now,
    syncStatus: "pending",
  };

  await db.put("transactions", fullTx);
  await syncQueue.enqueue("create", fullTx as any);
  return fullTx;
}

export async function getTransactions(
  userId: string = getDataScope(),
  type?: "income" | "expense"
): Promise<LocalTransaction[]> {
  const db = await getDatabase();
  const all = await db.getAllFromIndex("transactions", "by-user", userId);

  return all
    .filter((t) => !t.isDeleted && (!type || t.type === type))
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
}

export async function deleteTransaction(id: string, userId: string = getDataScope()): Promise<void> {
  const db = await getDatabase();
  const existing = await db.get("transactions", id);
  if (!existing || existing.userId !== userId) return;

  const updated: LocalTransaction = {
    ...existing,
    isDeleted: true,
    updatedAt: new Date().toISOString(),
    syncStatus: "pending",
  };

  await db.put("transactions", updated);
  await syncQueue.enqueue("delete", updated as any);
}
