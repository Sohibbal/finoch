import { BudgetEnvelope, BudgetSummary, EnvelopeStatus, ReallocationSuggestion } from "@/types/budget-types";

/**
 * Calculates progress, remaining rupiah, overspent rupiah, and status for a single envelope.
 */
export function calculateEnvelopeProgress(
  allocated: number,
  spent: number
): {
  percentage: number;
  remaining: number;
  overspent: number;
  status: EnvelopeStatus;
} {
  const safeAllocated = Math.max(0, allocated);
  const safeSpent = Math.max(0, spent);

  const percentage = safeAllocated > 0
    ? Math.round((safeSpent / safeAllocated) * 100)
    : safeSpent > 0 ? 100 : 0;

  const remaining = Math.max(0, safeAllocated - safeSpent);
  const overspent = Math.max(0, safeSpent - safeAllocated);

  let status: EnvelopeStatus = "safe";
  if (safeSpent > safeAllocated) {
    status = "exceeded";
  } else if (percentage >= 75) {
    status = "warning";
  }

  return { percentage, remaining, overspent, status };
}

/**
 * Calculates overall budget health and totals across all envelopes.
 */
export function getOverallBudgetSummary(envelopes: BudgetEnvelope[]): BudgetSummary {
  const totalAllocated = envelopes.reduce((sum, e) => sum + Math.max(0, e.allocatedAmount), 0);
  const totalSpent = envelopes.reduce((sum, e) => sum + Math.max(0, e.spentAmount), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  const overallPercentage = totalAllocated > 0
    ? Math.round((totalSpent / totalAllocated) * 100)
    : totalSpent > 0 ? 100 : 0;

  const overbudgetCount = envelopes.filter((e) => e.spentAmount > e.allocatedAmount).length;

  let status: EnvelopeStatus = "safe";
  if (totalSpent > totalAllocated || overbudgetCount > 0) {
    status = "exceeded";
  } else if (overallPercentage >= 75) {
    status = "warning";
  }

  return {
    totalAllocated,
    totalSpent,
    totalRemaining,
    overallPercentage,
    status,
    envelopeCount: envelopes.length,
    overbudgetCount,
  };
}

/**
 * Aggregates expense list into envelopes according to their categoryAliases.
 */
export function syncExpensesToEnvelopes(
  envelopes: BudgetEnvelope[],
  expenses: Array<{ category?: string; amount: number }>
): BudgetEnvelope[] {
  return envelopes.map((env) => {
    const aliases = env.categoryAliases.map((a) => a.toLowerCase().trim());

    const spent = expenses.reduce((acc, exp) => {
      const cat = (exp.category || "other").toLowerCase().trim();
      const isMatch = aliases.some(
        (alias) => cat === alias || cat.includes(alias) || alias.includes(cat)
      );
      return isMatch ? acc + (exp.amount || 0) : acc;
    }, 0);

    return {
      ...env,
      spentAmount: spent,
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Finds intelligent reallocation recommendations between envelopes.
 */
export function findReallocationSuggestions(
  envelopes: BudgetEnvelope[]
): ReallocationSuggestion[] {
  const suggestions: ReallocationSuggestion[] = [];

  const deficits = envelopes.filter((e) => e.spentAmount > e.allocatedAmount);
  const surpluses = envelopes
    .filter((e) => e.allocatedAmount > e.spentAmount && (e.allocatedAmount - e.spentAmount) >= 20000)
    .sort((a, b) => (b.allocatedAmount - b.spentAmount) - (a.allocatedAmount - a.spentAmount));

  if (deficits.length === 0 || surpluses.length === 0) {
    return suggestions;
  }

  for (const deficit of deficits) {
    const shortage = deficit.spentAmount - deficit.allocatedAmount;

    // Pick top available surplus envelope (that isn't the same envelope)
    const donor = surpluses.find((s) => s.id !== deficit.id && (s.allocatedAmount - s.spentAmount) > 0);
    if (!donor) continue;

    const availableSurplus = donor.allocatedAmount - donor.spentAmount;
    const transferAmount = Math.min(shortage, Math.floor(availableSurplus * 0.75));

    if (transferAmount >= 10000) {
      suggestions.push({
        fromEnvelope: donor,
        toEnvelope: deficit,
        recommendedAmount: transferAmount,
        message: `Pos "${deficit.name}" defisit Rp ${shortage.toLocaleString("id-ID")}. Alihkan Rp ${transferAmount.toLocaleString("id-ID")} dari pos "${donor.name}" agar keuangan tetap seimbang!`,
      });
    }
  }

  return suggestions;
}

/**
 * Default preset envelopes for an Indonesian college student / anak kost.
 */
export function getDefaultStudentEnvelopes(monthlyAllowance: number = 2000000): BudgetEnvelope[] {
  const base = Math.max(500000, monthlyAllowance);

  return [
    {
      id: "env-makan",
      name: "Makan & Minum Harian",
      icon: "utensils",
      color: "emerald",
      allocatedAmount: Math.round(base * 0.4), // 40%
      spentAmount: 0,
      categoryAliases: ["Food & Drinks", "Food", "Groceries", "Makan", "Minum"],
      rollover: true,
      notes: "Warteg, warung makan kampus, galon & sarapan",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-kost",
      name: "Kost & Utilitas",
      icon: "home",
      color: "blue",
      allocatedAmount: Math.round(base * 0.3), // 30%
      spentAmount: 0,
      categoryAliases: ["Bills & Utilities", "Bills", "Housing & Bills", "Housing", "Kost", "Listrik"],
      rollover: false,
      notes: "Sewa kamar, token listrik, iuran kebersihan",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-transport",
      name: "Bensin & Transportasi",
      icon: "car",
      color: "amber",
      allocatedAmount: Math.round(base * 0.1), // 10%
      spentAmount: 0,
      categoryAliases: ["Transportation", "Transport", "Bensin", "Gojek", "Grab"],
      rollover: true,
      notes: "Bensin motor, parkir kampus, ojek online",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-nongkrong",
      name: "Nongkrong & Kopi",
      icon: "coffee",
      color: "purple",
      allocatedAmount: Math.round(base * 0.1), // 10%
      spentAmount: 0,
      categoryAliases: ["Shopping & Lifestyle", "Entertainment & Leisure", "Entertainment", "Nongkrong", "Kopi"],
      rollover: false,
      notes: "Coffee shop tugas, snack akhir pekan",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-darurat",
      name: "Dana Darurat & Obat",
      icon: "shield",
      color: "rose",
      allocatedAmount: Math.round(base * 0.1), // 10%
      spentAmount: 0,
      categoryAliases: ["Health & Personal Care", "Health", "Other", "Obat", "Dokter"],
      rollover: true,
      notes: "Obat-obatan, tambal ban, darurat mendadak",
      updatedAt: new Date().toISOString(),
    },
  ];
}
