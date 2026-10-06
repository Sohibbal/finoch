export type UktCategory = "ukt" | "praktikum" | "kkn" | "skripsi" | "wisuda";

export interface UktDepositRecord {
  id: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface UktPlan {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  deadline: string; // YYYY-MM-DD
  category: UktCategory;
  deposits: UktDepositRecord[];
  updatedAt: string;
}

export interface UktMetrics {
  remainingAmount: number;
  daysRemaining: number;
  dailyTarget: number;
  weeklyTarget: number;
  progressPercentage: number;
  isCompleted: boolean;
  feasibilityStatus: "aman" | "moderat" | "berat";
  advice: string;
}
