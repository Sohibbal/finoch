import { BudgetEnvelope, EnvelopeTransferRecord } from "@/types/budget-types";
import { getDefaultStudentEnvelopes } from "@/lib/financial/budget-engine";
import { getStorage, readArray } from "@/lib/storage/local-storage";

const ENVELOPES_STORAGE_KEY = "finoch_budget_envelopes_v1";
const TRANSFERS_STORAGE_KEY = "finoch_budget_transfers_v1";

/**
 * Loads budget envelopes from localStorage, initializing with student defaults if empty.
 */
export function getEnvelopes(monthlyAllowance: number = 2000000): BudgetEnvelope[] {
  // Defaults only when nothing was ever stored; an emptied list stays empty.
  const stored = readArray<BudgetEnvelope>(ENVELOPES_STORAGE_KEY);
  if (stored) return stored;
  const defaults = getDefaultStudentEnvelopes(monthlyAllowance);
  saveEnvelopes(defaults);
  return defaults;
}

/**
 * Saves all budget envelopes to localStorage.
 */
export function saveEnvelopes(envelopes: BudgetEnvelope[]): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(ENVELOPES_STORAGE_KEY, JSON.stringify(envelopes));
  } catch (err) {
    console.error("Error saving budget envelopes:", err);
  }
}

/**
 * Adds a new custom envelope.
 */
export function addEnvelope(
  data: Omit<BudgetEnvelope, "id" | "updatedAt" | "spentAmount"> & { spentAmount?: number }
): BudgetEnvelope {
  if (!Number.isFinite(data.allocatedAmount) || data.allocatedAmount < 0) {
    throw new Error("Nominal alokasi pos tidak valid");
  }
  const envelopes = getEnvelopes();
  const newEnvelope: BudgetEnvelope = {
    ...data,
    spentAmount: data.spentAmount ?? 0,
    id: `env-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    updatedAt: new Date().toISOString(),
  };

  const updated = [newEnvelope, ...envelopes];
  saveEnvelopes(updated);
  return newEnvelope;
}

/**
 * Updates an existing envelope.
 */
export function updateEnvelope(
  id: string,
  updates: Partial<Omit<BudgetEnvelope, "id">>
): BudgetEnvelope | null {
  const envelopes = getEnvelopes();
  const index = envelopes.findIndex((e) => e.id === id);
  if (index === -1) return null;

  envelopes[index] = {
    ...envelopes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveEnvelopes(envelopes);
  return envelopes[index];
}

/**
 * Deletes an envelope.
 */
export function deleteEnvelope(id: string): void {
  const envelopes = getEnvelopes();
  const filtered = envelopes.filter((e) => e.id !== id);
  saveEnvelopes(filtered);
}

/**
 * Executes a transfer between two envelopes and records history.
 */
export function transferFunds(
  fromId: string,
  toId: string,
  amount: number,
  reason: string
): EnvelopeTransferRecord {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Nominal transfer harus lebih dari Rp 0");
  }
  if (fromId === toId) {
    throw new Error("Tidak bisa transfer ke pos yang sama");
  }

  const envelopes = getEnvelopes();
  const fromIndex = envelopes.findIndex((e) => e.id === fromId);
  const toIndex = envelopes.findIndex((e) => e.id === toId);

  if (fromIndex === -1 || toIndex === -1) {
    throw new Error("Pos pengirim atau penerima tidak ditemukan");
  }

  // Money only moves, never gets created: the source must cover the full amount.
  if (amount > envelopes[fromIndex].allocatedAmount) {
    throw new Error(`Alokasi pos ${envelopes[fromIndex].name} tidak mencukupi untuk transfer ini`);
  }

  envelopes[fromIndex].allocatedAmount -= amount;
  envelopes[toIndex].allocatedAmount += amount;
  envelopes[fromIndex].updatedAt = new Date().toISOString();
  envelopes[toIndex].updatedAt = new Date().toISOString();

  saveEnvelopes(envelopes);

  // Record transfer log
  const record: EnvelopeTransferRecord = {
    id: `xfer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fromEnvelopeId: fromId,
    fromEnvelopeName: envelopes[fromIndex].name,
    toEnvelopeId: toId,
    toEnvelopeName: envelopes[toIndex].name,
    amount,
    reason: reason || "Penyeimbangan anggaran antar pos",
    createdAt: new Date().toISOString(),
  };

  const transfers = getTransferHistory();
  const storage = getStorage();
  if (storage) {
    storage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify([record, ...transfers]));
  }

  return record;
}

/**
 * Retrieves transfer history log.
 */
export function getTransferHistory(): EnvelopeTransferRecord[] {
  return readArray<EnvelopeTransferRecord>(TRANSFERS_STORAGE_KEY) ?? [];
}

/**
 * Resets envelopes to student defaults.
 */
export function resetEnvelopesToDefault(monthlyAllowance: number = 2000000): BudgetEnvelope[] {
  const defaults = getDefaultStudentEnvelopes(monthlyAllowance);
  saveEnvelopes(defaults);
  return defaults;
}
