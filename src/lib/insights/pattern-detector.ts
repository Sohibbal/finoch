import { AiInsightCard } from "@/types/financial-types";

export interface PatternDetectorInput {
  currentCategoryTotals: Record<string, number>;
  previousCategoryTotals: Record<string, number>;
  recurringExpenses?: Array<{ name: string; amount: number; frequency: string }>;
}

export function detectSpendingPatterns(input: PatternDetectorInput): AiInsightCard[] {
  const insights: AiInsightCard[] = [];
  const { currentCategoryTotals, previousCategoryTotals, recurringExpenses = [] } = input;

  // 1. Detect Category Spending Jumps or Drops (> 20%)
  for (const [category, currentVal] of Object.entries(currentCategoryTotals)) {
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
