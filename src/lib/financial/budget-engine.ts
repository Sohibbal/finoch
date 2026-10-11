import { BudgetEnvelope, BudgetSummary, EnvelopeStatus, ReallocationSuggestion } from "@/types/budget-types";
import { isSameLocalMonth, parseDate } from "@/lib/date";
import { BILL_PAYMENT_PREFIX } from "@/lib/financial/month-ledger";

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
 * Aggregates this month's expenses into envelopes. Each expense lands in exactly one envelope:
 * the first whose categoryAliases contain its category (case-insensitive exact match), otherwise
 * the envelope holding the "Other" alias. Empty category counts as "Other". Bill payments logged by
 * Tagihan are skipped: fixed costs are taken out before the envelopes are filled (see monthLedger).
 */
export function syncExpensesToEnvelopes(
  envelopes: BudgetEnvelope[],
  expenses: Array<{ category?: string; amount: number; createdAt?: string; itemName?: string }>,
  referenceDate: Date = new Date()
): BudgetEnvelope[] {
  const normalize = (value: string) => value.toLowerCase().trim();
  const aliasSets = envelopes.map((env) => new Set(env.categoryAliases.map(normalize)));
  const otherIndex = aliasSets.findIndex((aliases) => aliases.has("other"));
  const spentByEnvelope = envelopes.map(() => 0);

  for (const exp of expenses) {
    // Undated expenses are treated as current (callers may strip dates); others must be this month
    const date = exp.createdAt ? parseDate(exp.createdAt) : referenceDate;
    if (!date || !isSameLocalMonth(date, referenceDate)) continue;
    if (exp.itemName?.startsWith(BILL_PAYMENT_PREFIX)) continue;
    const amount = Number.isFinite(exp.amount) && exp.amount > 0 ? exp.amount : 0;

    const cat = normalize(exp.category || "") || "other";
    const matchIndex = aliasSets.findIndex((aliases) => aliases.has(cat));
    const targetIndex = matchIndex !== -1 ? matchIndex : otherIndex;
    if (targetIndex !== -1) spentByEnvelope[targetIndex] += amount;
  }

  return envelopes.map((env, index) => ({
    ...env,
    spentAmount: spentByEnvelope[index],
    updatedAt: new Date().toISOString(),
  }));
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
 * Default preset envelopes for an Indonesian college student / anak kost. `monthlyAllowance` is what
 * the month can spend after fixed costs (monthLedger's spendable): rent and bills are already set
 * aside, so the envelopes split exactly that amount, to the rupiah.
 */
export function getDefaultStudentEnvelopes(monthlyAllowance: number = 2000000): BudgetEnvelope[] {
  const base = Math.max(0, Math.round(monthlyAllowance));

  const envelopes: BudgetEnvelope[] = [
    {
      id: "env-makan",
      name: "Makan & Minum Harian",
      icon: "utensils",
      color: "emerald",
      allocatedAmount: Math.round(base * 0.45), // 45%
      spentAmount: 0,
      categoryAliases: ["Food & Drinks", "Food", "Groceries", "Makan", "Minum"],
      rollover: true,
      notes: "Warteg, warung makan kampus, galon & sarapan",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-kost",
      name: "Kebutuhan Kos & Pulsa",
      icon: "home",
      color: "blue",
      allocatedAmount: Math.round(base * 0.15), // 15%
      spentAmount: 0,
      categoryAliases: ["Bills & Utilities", "Bills", "Housing & Bills", "Housing", "Subscription", "Kost", "Listrik"],
      rollover: false,
      notes: "Laundry, galon, pulsa. Sewa dan tagihan rutin sudah disisihkan di Tagihan",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-transport",
      name: "Bensin & Transportasi",
      icon: "car",
      color: "amber",
      allocatedAmount: Math.round(base * 0.15), // 15%
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
      categoryAliases: ["Entertainment & Leisure", "Entertainment", "Social & Family", "Nongkrong", "Kopi"],
      rollover: false,
      notes: "Coffee shop tugas, snack akhir pekan",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-darurat",
      name: "Dana Darurat & Obat",
      icon: "shield",
      color: "rose",
      allocatedAmount: Math.round(base * 0.15), // 15%
      spentAmount: 0,
      // "Other" also catches categories no envelope claims (e.g. Shopping, Education & Career)
      categoryAliases: ["Health & Personal Care", "Health", "Other", "Obat", "Dokter"],
      rollover: true,
      notes: "Obat-obatan, tambal ban, darurat mendadak",
      updatedAt: new Date().toISOString(),
    },
  ];
  // Rounding leftovers go to the first envelope so the split adds up to the base exactly.
  envelopes[0].allocatedAmount += base - envelopes.reduce((sum, e) => sum + e.allocatedAmount, 0);
  return envelopes;
}
