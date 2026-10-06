import { DebtItem, DebtSummary } from "@/types/debt-types";
import { calculateDebtSummary } from "@/lib/financial/debt-engine";

const DEBT_STORAGE_KEY = "finoch_student_debts_v1";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof localStorage !== "undefined") return localStorage;
  return null;
}

const DEFAULT_DEBTS: DebtItem[] = [
  {
    id: "debt-default-1",
    type: "receivable",
    personName: "Bagas Teman Kost",
    amount: 35000,
    description: "Talangan fotokopi modul & jilid laporan",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
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
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    status: "unpaid",
    createdAt: new Date().toISOString(),
  },
];

/**
 * Loads debts from localStorage.
 */
export function getDebts(): DebtItem[] {
  const storage = getStorage();
  if (!storage) return DEFAULT_DEBTS;

  try {
    const raw = storage.getItem(DEBT_STORAGE_KEY);
    if (!raw) {
      storage.setItem(DEBT_STORAGE_KEY, JSON.stringify(DEFAULT_DEBTS));
      return DEFAULT_DEBTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEBTS;
  } catch (err) {
    console.error("Error reading debts from storage:", err);
    return DEFAULT_DEBTS;
  }
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
