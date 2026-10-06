export type EnvelopeStatus = "safe" | "warning" | "exceeded";

export interface BudgetEnvelope {
  id: string;
  name: string;
  icon: string; // 'utensils' | 'home' | 'car' | 'coffee' | 'book' | 'shield' | 'shopping' | 'sparkles'
  color: string; // 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'cyan'
  allocatedAmount: number;
  spentAmount: number;
  categoryAliases: string[];
  rollover?: boolean;
  notes?: string;
  updatedAt: string;
}

export interface EnvelopeTransferRecord {
  id: string;
  fromEnvelopeId: string;
  fromEnvelopeName: string;
  toEnvelopeId: string;
  toEnvelopeName: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  status: EnvelopeStatus;
  envelopeCount: number;
  overbudgetCount: number;
}

export interface ReallocationSuggestion {
  fromEnvelope: BudgetEnvelope;
  toEnvelope: BudgetEnvelope;
  recommendedAmount: number;
  message: string;
}
