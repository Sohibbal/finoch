import { DebtItem, DebtSummary } from "@/types/debt-types";
import { calculateDebtSummary } from "@/lib/financial/debt-engine";
import { getStorage, readArray } from "@/lib/storage/local-storage";
import { localDateKeyFromNow } from "@/lib/date";

const DEBT_STORAGE_KEY = "finoch_student_debts_v1";

// Built per call: due dates stay relative to today and callers can mutate freely.
const createDefaultDebts = (): DebtItem[] => [
  {
    id: "debt-default-1",
    type: "receivable",
    personName: "Bagas Teman Kost",
    amount: 35000,
    description: "Talangan fotokopi modul & jilid laporan",
    dueDate: localDateKeyFromNow(3),
    phone: "081234567890",
    status: "unpaid",
    createdAt: new Date().toISOString(),
  },
  {
    id: "debt-default-2",
    type: "payable",
    personName: "Ibu Warteg Berkah",
    amount: 22000,
    description: "Kasbon makan malam nasi telur + es teh",
    dueDate: localDateKeyFromNow(2),
    status: "unpaid",
    createdAt: new Date().toISOString(),
  },
];

/**
 * Loads debts from localStorage.
 */
export function getDebts(): DebtItem[] {
  // Defaults only when nothing was ever stored; an emptied list stays empty.
  const stored = readArray<DebtItem>(DEBT_STORAGE_KEY);
  if (stored) return stored;
  const defaults = createDefaultDebts();
  saveDebts(defaults);
  return defaults;
}

/**
 * Saves debts to localStorage.
 */
export function saveDebts(debts: DebtItem[]): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(DEBT_STORAGE_KEY, JSON.stringify(debts));
  } catch (err) {
    console.error("Error saving debts to storage:", err);
  }
}

/**
 * Adds a new debt or receivable record.
 */
export function addDebt(data: Omit<DebtItem, "id" | "status" | "createdAt">): DebtItem {
  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    throw new Error("Nominal hutang/piutang harus lebih dari Rp 0");
  }
  const debts = getDebts();
  const newDebt: DebtItem = {
    ...data,
    id: `debt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: "unpaid",
    createdAt: new Date().toISOString(),
  };

  const updated = [newDebt, ...debts];
  saveDebts(updated);
  return newDebt;
}

/**
 * Toggles or marks debt as paid.
 */
export function markDebtAsPaid(id: string): DebtItem | null {
  const debts = getDebts();
  const index = debts.findIndex((d) => d.id === id);
  if (index === -1) return null;

  debts[index].status = debts[index].status === "paid" ? "unpaid" : "paid";
  debts[index].settledAt = debts[index].status === "paid" ? new Date().toISOString() : undefined;

  saveDebts(debts);
  return debts[index];
}

/**
 * Deletes a debt item.
 */
export function deleteDebt(id: string): void {
  const debts = getDebts();
  const filtered = debts.filter((d) => d.id !== id);
  saveDebts(filtered);
}

/**
 * Returns current summary.
 */
export function getDebtSummary(): DebtSummary {
  return calculateDebtSummary(getDebts());
}
