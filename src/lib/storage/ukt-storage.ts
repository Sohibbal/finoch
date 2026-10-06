import { UktPlan, UktDepositRecord } from "@/types/ukt-types";

const UKT_STORAGE_KEY = "finoch_student_ukt_plans_v1";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof localStorage !== "undefined") return localStorage;
  return null;
}

const DEFAULT_PLANS: UktPlan[] = [
  {
    id: "ukt-default-1",
    name: "UKT Semester Ganjil / Genap",
    targetAmount: 3500000,
    currentSaved: 1400000,
    deadline: "2026-08-20",
    category: "ukt",
    deposits: [
      {
        id: "dep-1",
        amount: 500000,
        note: "Sisa uang saku bulan lalu",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "dep-2",
        amount: 900000,
        note: "Honor asisten praktikum kampus",
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ukt-default-2",
    name: "Biaya KKN / Praktikum Lapangan",
    targetAmount: 1200000,
    currentSaved: 450000,
    deadline: "2026-07-15",
    category: "kkn",
    deposits: [
      {
        id: "dep-3",
        amount: 450000,
        note: "Tabungan rutin mingguan",
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];

export function getUktPlans(): UktPlan[] {
  const storage = getStorage();
  if (!storage) return DEFAULT_PLANS;

  try {
    const raw = storage.getItem(UKT_STORAGE_KEY);
    if (!raw) {
      storage.setItem(UKT_STORAGE_KEY, JSON.stringify(DEFAULT_PLANS));
      return DEFAULT_PLANS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PLANS;
  } catch (err) {
    console.error("Error reading UKT plans:", err);
    return DEFAULT_PLANS;
  }
}

export function saveUktPlans(plans: UktPlan[]): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(UKT_STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error("Error saving UKT plans:", err);
  }
}

export function addUktPlan(
  data: Omit<UktPlan, "id" | "currentSaved" | "deposits" | "updatedAt">
): UktPlan {
  const plans = getUktPlans();
  const newPlan: UktPlan = {
    ...data,
    id: `ukt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    currentSaved: 0,
    deposits: [],
    updatedAt: new Date().toISOString(),
  };

  const updated = [newPlan, ...plans];
  saveUktPlans(updated);
  return newPlan;
}

export function depositToUktPlan(
  planId: string,
  amount: number,
  note: string = "Setoran mandiri"
): UktPlan | null {
  if (amount <= 0) return null;
  const plans = getUktPlans();
  const index = plans.findIndex((p) => p.id === planId);
  if (index === -1) return null;

  const targetPlan = plans[index];
  const newDeposit: UktDepositRecord = {
    id: `dep-${Date.now()}`,
    amount,
    note,
    createdAt: new Date().toISOString(),
  };

  const updatedPlan: UktPlan = {
    ...targetPlan,
    currentSaved: targetPlan.currentSaved + amount,
    deposits: [newDeposit, ...targetPlan.deposits],
    updatedAt: new Date().toISOString(),
  };

  plans[index] = updatedPlan;
  saveUktPlans(plans);
  return updatedPlan;
}

export function deleteUktPlan(id: string): void {
  const plans = getUktPlans();
  const filtered = plans.filter((p) => p.id !== id);
  saveUktPlans(filtered);
}
