import { BudgetEnvelope, EnvelopeTransferRecord } from "@/types/budget-types";
import { getDefaultStudentEnvelopes } from "@/lib/financial/budget-engine";
import { getStorage, readArray } from "@/lib/storage/local-storage";

const ENVELOPES_STORAGE_KEY = "finoch_budget_envelopes_v1";
const TRANSFERS_STORAGE_KEY = "finoch_budget_transfers_v1";
/** Allowance the stored allocations were sized for, so they can follow the profile when it changes. */
const ALLOWANCE_STORAGE_KEY = "finoch_budget_allowance_v1";

function saveAllowanceBase(monthlyAllowance: number | undefined): void {
  if (!monthlyAllowance) return;
  try {
    getStorage()?.setItem(ALLOWANCE_STORAGE_KEY, String(monthlyAllowance));
  } catch (err) {
    console.error("Error saving budget allowance:", err);
  }
}

/**
 * Loads budget envelopes, seeding the student template sized from `monthlyAllowance` on first use.
 * Envelopes are a template, not data: when the allowance differs from the one they were sized for,
 * every allocation is rescaled proportionally. Without an argument (mutations) nothing is rescaled.
 */
export function getEnvelopes(monthlyAllowance?: number): BudgetEnvelope[] {
  // Defaults only when nothing was ever stored; an emptied list stays empty.
  const stored = readArray<BudgetEnvelope>(ENVELOPES_STORAGE_KEY);
  if (!stored) {
    const defaults = getDefaultStudentEnvelopes(monthlyAllowance);
    saveEnvelopes(defaults);
    saveAllowanceBase(monthlyAllowance);
    return defaults;
  }
  if (!monthlyAllowance || monthlyAllowance <= 0 || stored.length === 0) return stored;

  // Envelopes from before the allowance was recorded: their total is the allowance they were sized for.
  const recorded = Number(getStorage()?.getItem(ALLOWANCE_STORAGE_KEY));
  const base = recorded > 0 ? recorded : stored.reduce((sum, e) => sum + e.allocatedAmount, 0);
  if (base <= 0 || base === monthlyAllowance) {
    saveAllowanceBase(monthlyAllowance);
    return stored;
  }

  const ratio = monthlyAllowance / base;
  const now = new Date().toISOString();
  const rescaled = stored.map((e) => ({ ...e, allocatedAmount: Math.round(e.allocatedAmount * ratio), updatedAt: now }));
  saveEnvelopes(rescaled);
  saveAllowanceBase(monthlyAllowance);
  return rescaled;
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
export function resetEnvelopesToDefault(monthlyAllowance?: number): BudgetEnvelope[] {
  const defaults = getDefaultStudentEnvelopes(monthlyAllowance);
  saveEnvelopes(defaults);
  saveAllowanceBase(monthlyAllowance);
  return defaults;
}
