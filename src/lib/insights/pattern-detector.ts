import { AiInsightCard } from "@/types/financial-types";
import { isSameLocalMonth, parseDate } from "@/lib/date";

export interface PatternDetectorInput {
  currentCategoryTotals: Record<string, number>;
  previousCategoryTotals: Record<string, number>;
  recurringExpenses?: Array<{ name: string; amount: number; frequency: string }>;
}

export function detectSpendingPatterns(input: PatternDetectorInput): AiInsightCard[] {
  const insights: AiInsightCard[] = [];
  const { currentCategoryTotals, previousCategoryTotals, recurringExpenses = [] } = input;

  // 1. Detect Category Spending Jumps or Drops (> 20%)
  // Union of both periods so a category that dropped to 0 (absent now) is still reported
  const categories = new Set([...Object.keys(currentCategoryTotals), ...Object.keys(previousCategoryTotals)]);
  for (const category of categories) {
    const currentVal = currentCategoryTotals[category] || 0;
    const previousVal = previousCategoryTotals[category];
    if (previousVal && previousVal > 0) {
      const changePercent = ((currentVal - previousVal) / previousVal) * 100;
      const diffAmount = Math.abs(currentVal - previousVal);

      if (changePercent >= 20) {
        insights.push({
          type: "spending_increase",
          title: `Lonjakan Pengeluaran ${category}`,
          description: `Pengeluaran ${category} melonjak ${changePercent.toFixed(1)}% dibanding periode sebelumnya.`,
          evidence: {
            category,
            current: currentVal,
            previous: previousVal,
            changePercent,
            diffAmount,
          },
          impact: `Pengeluaran ${category} bertambah Rp ${diffAmount.toLocaleString("id-ID")}, memperkecil rasio tabungan.`,
          recommendation: `Evaluasi kembali transaksi ${category} non-esensial untuk mengembalikan alokasi ke batas aman.`,
          confidence: 0.95,
          createdAt: new Date().toISOString(),
        });
      } else if (changePercent <= -20) {
        insights.push({
          type: "spending_decrease",
          title: `Penghematan Hebat pada ${category}`,
          description: `Pengeluaran ${category} berhasil dipangkas ${Math.abs(changePercent).toFixed(1)}%.`,
          evidence: {
            category,
            current: currentVal,
            previous: previousVal,
            changePercent,
            diffAmount,
          },
          impact: `Anda berhasil menghemat Rp ${diffAmount.toLocaleString("id-ID")} yang dapat dialokasikan ke tabungan goal.`,
          recommendation: `Pertahankan disiplin ini dan alihkan surplus langsung ke pos tabungan masa depan.`,
          confidence: 0.95,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // 2. Detect Recurring Commitments / Subscriptions
  if (recurringExpenses.length > 0) {
    const totalRecurring = recurringExpenses.reduce((sum, r) => sum + r.amount, 0);
    insights.push({
      type: "recurring",
      title: "Komitmen Rutin & Langganan Aktif",
      description: `Terdeteksi ${recurringExpenses.length} komitmen berulang dengan total beban Rp ${totalRecurring.toLocaleString("id-ID")}/bulan.`,
      evidence: {
        count: recurringExpenses.length,
        total: totalRecurring,
        items: recurringExpenses.map((r) => r.name),
      },
      impact: "Beban komitmen rutin ini langsung memotong kapasitas tabungan bulanan.",
      recommendation: "Cek apakah ada langganan yang sudah jarang digunakan agar dapat dibatalkan.",
      confidence: 0.9,
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

/** Per-category spending of the local month containing `now` and of the month before it. */
export function getMonthlyCategoryTotals(
  expenses: Array<{ category?: string; amount: number; createdAt?: string | Date }>,
  now: Date = new Date()
): Pick<PatternDetectorInput, "currentCategoryTotals" | "previousCategoryTotals"> {
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentCategoryTotals: Record<string, number> = {};
  const previousCategoryTotals: Record<string, number> = {};
  for (const e of expenses) {
    const at = e.createdAt instanceof Date ? e.createdAt : parseDate(e.createdAt);
    if (!at || !(e.amount > 0)) continue;
    const bucket = isSameLocalMonth(at, now)
      ? currentCategoryTotals
      : isSameLocalMonth(at, previousMonth)
        ? previousCategoryTotals
        : null;
    if (!bucket) continue;
    const category = e.category || "Other";
    bucket[category] = (bucket[category] || 0) + e.amount;
  }
  return { currentCategoryTotals, previousCategoryTotals };
}
