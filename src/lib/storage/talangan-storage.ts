import { TalanganRecord } from "@/types/split-bill-types";

const TALANGAN_STORAGE_KEY = "finoch_talangan_records";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

export function getTalanganList(): TalanganRecord[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(TALANGAN_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca storage talangan:", err);
    return [];
  }
}

export function saveTalanganRecords(records: TalanganRecord[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(TALANGAN_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Gagal menyimpan storage talangan:", err);
  }
}

export function addTalanganRecord(
  input: Omit<TalanganRecord, "id" | "createdAt" | "isPaid">
): TalanganRecord {
  const records = getTalanganList();
  const newRecord: TalanganRecord = {
    ...input,
    id: `talangan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isPaid: false,
    createdAt: new Date().toISOString(),
  };

  records.unshift(newRecord);
  saveTalanganRecords(records);
  return newRecord;
}

export function markTalanganAsPaid(id: string): void {
  const records = getTalanganList();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index].isPaid = true;
    records[index].paidAt = new Date().toISOString();
    saveTalanganRecords(records);
  }
}

export function deleteTalanganRecord(id: string): void {
  const records = getTalanganList();
  const filtered = records.filter((r) => r.id !== id);
  saveTalanganRecords(filtered);
}

export function getTalanganSummary(): {
  totalUnpaid: number;
  totalPaid: number;
  countUnpaid: number;
} {
  const records = getTalanganList();
  return records.reduce(
    (acc, cur) => {
      if (cur.isPaid) {
        acc.totalPaid += cur.amount;
      } else {
        acc.totalUnpaid += cur.amount;
        acc.countUnpaid += 1;
      }
      return acc;
    },
    { totalUnpaid: 0, totalPaid: 0, countUnpaid: 0 }
  );
}
