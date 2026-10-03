export type TransactionType = "income" | "expense";
export type SpendingType = "needs" | "wants" | "savings";
export type TransactionSource = "manual" | "ocr" | "voice";
export type GoalStatus = "on_track" | "at_risk" | "behind_target" | "achieved";

export const SPENDING_CATEGORIES = [
  "Food & Drinks",
  "Transportation",
  "Housing & Bills",
  "Shopping & Clothing",
  "Entertainment & Leisure",
  "Education & Career",
  "Health & Personal Care",
  "Social & Family",
  "Other",
  // Backward-compatible category aliases
  "Food",
  "Groceries",
  "Housing",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Shopping",
  "Subscription",
  "Family",
] as const;

export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];

export const DEFAULT_50_30_20_TARGETS = {
  needsRatio: 0.5,
  wantsRatio: 0.3,
  savingsRatio: 0.2,
};

export interface TransactionCandidate {
  id?: string;
  merchant?: string;
  amount: number;
  category: SpendingCategory | string;
  spendingType?: SpendingType;
  date: string;
  source: TransactionSource;
  confidence?: number;
  items?: Array<{ name: string; amount: number }>;
  paymentMethod?: string;
  description?: string;
}

export interface FinancialProfile {
  id?: string;
  userId: string;
  monthlyIncome: number;
  incomeType: "salary" | "freelance" | "business" | "allowance" | "other" | string;
  currentSavings: number;
  monthlyFixedExpenses: number;
  financialPriority: "saving" | "emergency_fund" | "buy_item" | "education" | "travel" | "debt_repayment" | "other" | string;
  currency?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface FinancialGoal {
  id?: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | Date;
  category: "gadget" | "emergency_fund" | "vehicle" | "travel" | "education" | "other" | string;
  status: GoalStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DigitalTwinMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsRate: number;
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  needsStatus: "optimal" | "warning" | "danger";
  wantsStatus: "optimal" | "warning" | "danger";
  savingsStatus: "optimal" | "warning" | "danger";
}

export interface SimulationResult {
  newMonthlySavings: number;
  newSavingsRate: number;
  monthlySavingsDiff: number;
  newMonthsToGoal: number;
  monthsSaved: number;
  feasibility: "achievable" | "stretch" | "critical";
  timelineProjection: Array<{
    month: number;
    monthLabel: string;
    baselineSavings: number;
    simulatedSavings: number;
  }>;
}

export interface AiInsightCard {
  id?: string;
  type: "spending_increase" | "spending_decrease" | "recurring" | "unusual_spending" | "goal_projection";
  title: string;
  description: string;
  evidence: Record<string, unknown>;
  impact: string;
  recommendation: string;
  confidence?: number;
  createdAt?: string | Date;
}

export function validateTransactionCandidate(c: Partial<TransactionCandidate>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!c.amount || typeof c.amount !== "number" || c.amount <= 0) {
    errors.push("Nominal harus berupa angka lebih besar dari 0.");
  }
  if (!c.category || !SPENDING_CATEGORIES.includes(c.category as SpendingCategory)) {
    errors.push("Kategori wajib ditentukan dan valid.");
  }
  if (c.spendingType && !["needs", "wants", "savings"].includes(c.spendingType)) {
    errors.push("Tipe alokasi belanja harus needs, wants, atau savings.");
  }
  if (!c.date || isNaN(Date.parse(c.date))) {
    errors.push("Tanggal transaksi tidak valid.");
  }
  return { isValid: errors.length === 0, errors };
}
