import { FinancialGoal } from "@/types/financial-types";
import { getDataScope, getStorage, isDemoMode, readArray } from "@/lib/storage/local-storage";
import { localDateKeyFromNow } from "@/lib/date";

const GOALS_STORAGE_KEY = "finoch_savings_goals_v1";

// Built per call: deadlines stay relative to today.
const createDemoGoals = (userId: string): FinancialGoal[] => [
  {
    id: "goal-demo-darurat",
    userId,
    name: "Dana Darurat (3 Bulan)",
    targetAmount: 6000000,
    currentAmount: 2500000,
    targetDate: localDateKeyFromNow(240),
    category: "emergency_fund",
    status: "on_track",
  },
  {
    id: "goal-demo-laptop",
    userId,
    name: "Laptop Kuliah & Skripsi",
    targetAmount: 9000000,
    currentAmount: 1500000,
    targetDate: localDateKeyFromNow(300),
    category: "gadget",
    status: "at_risk",
  },
];

/** Savings goals of the current scope; sample goals only in demo mode, an emptied list stays empty. */
export function getGoals(): FinancialGoal[] {
  const stored = readArray<FinancialGoal>(GOALS_STORAGE_KEY);
  if (stored) return stored;
  if (!isDemoMode()) return [];
  const defaults = createDemoGoals(getDataScope());
  saveGoals(defaults);
  return defaults;
}

export function saveGoals(goals: FinancialGoal[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (err) {
    console.error("Gagal menyimpan target tabungan:", err);
  }
}

export function addGoal(input: Omit<FinancialGoal, "id" | "userId" | "createdAt">): FinancialGoal {
  const goal: FinancialGoal = {
    ...input,
    id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: getDataScope(),
    createdAt: new Date().toISOString(),
  };
  saveGoals([...getGoals(), goal]);
  return goal;
}

export function deleteGoal(id: string): void {
  saveGoals(getGoals().filter((g) => g.id !== id));
}
