import { AiInsightCard } from "@/types/financial-types";
import { isSameLocalMonth, parseDate } from "@/lib/date";
import { categoryLabel, rupiah } from "@/lib/format";

export interface PatternDetectorInput {
  currentCategoryTotals: Record<string, number>;
  previousCategoryTotals: Record<string, number>;
  recurringExpenses?: Array<{ name: string; amount: number; frequency: string }>;
}

// Paid on fixed dates (rent, WiFi, pulsa): a day-range comparison only shows where the due dates fell.
const FIXED_DATE_CATEGORIES = new Set(["Bills & Utilities", "Housing & Bills", "Bills"]);
// Smaller swings are noise (one admin fee), not a pattern.
const MIN_DIFF = 10_000;

type Advice = { up: string; down: string };

// What to do next, per category, in the kamu voice. Keyed by the Indonesian label so old category names share it.
const ADVICE: Record<string, Advice> = {
  "Makan & Minum": {
    up: "Bawa bekal atau masak nasi di kos dua kali seminggu. Warteg tetap boleh, jajan sorenya yang dikurangi.",
    down: "Pola makanmu lagi rapi. Pindahkan selisihnya ke amplop dana darurat sebelum kepakai jajan.",
  },
  Transportasi: {
    up: "Gabungkan perjalanan ke kampus, dan cek ojol mana yang bisa diganti jalan kaki atau nebeng teman.",
    down: "Ongkos jalanmu lebih ringan. Simpan selisihnya buat minggu ujian yang biasanya lebih boros.",
  },
  "Belanja & Gaya Hidup": {
    up: "Tahan checkout 24 jam dulu. Yang masih kamu mau besok, masukkan ke Wishlist Tunda.",
    down: "Lapar matamu terkendali. Selisihnya bisa langsung masuk ke target tabunganmu.",
  },
};
const DEFAULT_ADVICE: Advice = {
  up: "Buka Laporan dan cek catatan di kategori ini. Yang sering muncul sebaiknya dikasih amplop sendiri.",
  down: "Pengeluaran di luar rencana lebih sedikit. Biarkan selisihnya tetap di dana darurat.",
};

/**
 * Category changes of at least 20% between two equal day ranges (see getMonthlyCategoryTotals), plus
 * the recurring bills. Fixed-date categories and swings under Rp10.000 are not compared.
 */
export function detectSpendingPatterns(input: PatternDetectorInput): AiInsightCard[] {
  const insights: AiInsightCard[] = [];
  const { currentCategoryTotals, previousCategoryTotals, recurringExpenses = [] } = input;

  // 1. Detect Category Spending Jumps or Drops (> 20%)
  // Union of both periods so a category that dropped to 0 (absent now) is still reported
  const categories = new Set([...Object.keys(currentCategoryTotals), ...Object.keys(previousCategoryTotals)]);
  for (const category of categories) {
    if (FIXED_DATE_CATEGORIES.has(category)) continue;
    const currentVal = currentCategoryTotals[category] || 0;
    const previousVal = previousCategoryTotals[category];
    if (!previousVal || previousVal <= 0) continue;
    const changePercent = ((currentVal - previousVal) / previousVal) * 100;
    const diffAmount = Math.abs(currentVal - previousVal);
    if (Math.abs(changePercent) < 20 || diffAmount < MIN_DIFF) continue;

    const up = changePercent > 0;
    const label = categoryLabel(category);
    const advice = ADVICE[label] ?? DEFAULT_ADVICE;
    insights.push({
      type: up ? "spending_increase" : "spending_decrease",
      title: up ? `Lonjakan Pengeluaran ${category}` : `Penghematan pada ${category}`,
      description: `${label} ${up ? "naik" : "turun"} ${Math.abs(changePercent).toFixed(1)}% dibanding tanggal yang sama bulan lalu.`,
      evidence: {
        category,
        current: currentVal,
        previous: previousVal,
        changePercent,
        diffAmount,
      },
      impact: up
        ? `${label} sudah ${rupiah(diffAmount)} lebih banyak dibanding tanggal yang sama bulan lalu.`
        : `Kamu keluar ${rupiah(diffAmount)} lebih sedikit untuk ${label} dibanding tanggal yang sama bulan lalu.`,
      recommendation: up ? advice.up : advice.down,
      confidence: 0.95,
      createdAt: new Date().toISOString(),
    });
  }

  // 2. Detect Recurring Commitments / Subscriptions
  if (recurringExpenses.length > 0) {
    const totalRecurring = recurringExpenses.reduce((sum, r) => sum + r.amount, 0);
    insights.push({
      type: "recurring",
      title: "Tagihan Rutin",
      description: `Ada ${recurringExpenses.length} tagihan rutin, total ${rupiah(totalRecurring)}/bulan.`,
      evidence: {
        count: recurringExpenses.length,
        total: totalRecurring,
        items: recurringExpenses.map((r) => r.name),
      },
      impact: "Tagihan ini disisihkan dari uang sakumu sebelum jatah harian dan amplop dihitung.",
      recommendation: "Cek langganan yang jarang kamu pakai, lalu batalkan yang nggak perlu.",
      confidence: 0.9,
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

/**
 * The two equal day ranges Insight compares: day 1..today of this month against day 1..the same day
 * of last month, clamped to last month's length (30 March compares with 1–28 February).
 */
export function comparisonWindow(now: Date = new Date()): { day: number; previousDay: number; previousMonth: Date } {
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousLength = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  return { day: now.getDate(), previousDay: Math.min(now.getDate(), previousLength), previousMonth };
}

/** Per-category spending of the two equal day ranges from comparisonWindow. */
export function getMonthlyCategoryTotals(
  expenses: Array<{ category?: string; amount: number; createdAt?: string | Date }>,
  now: Date = new Date()
): Pick<PatternDetectorInput, "currentCategoryTotals" | "previousCategoryTotals"> {
  const { day, previousDay, previousMonth } = comparisonWindow(now);
  const currentCategoryTotals: Record<string, number> = {};
  const previousCategoryTotals: Record<string, number> = {};
  for (const e of expenses) {
    const at = e.createdAt instanceof Date ? e.createdAt : parseDate(e.createdAt);
    if (!at || !(e.amount > 0)) continue;
    const bucket =
      isSameLocalMonth(at, now) && at.getDate() <= day
        ? currentCategoryTotals
        : isSameLocalMonth(at, previousMonth) && at.getDate() <= previousDay
          ? previousCategoryTotals
          : null;
    if (!bucket) continue;
    const category = e.category || "Other";
    bucket[category] = (bucket[category] || 0) + e.amount;
  }
  return { currentCategoryTotals, previousCategoryTotals };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "1–11 Okt" and "1–11 Sep": the two equal day ranges the comparison covers. */
export function comparisonLabels(now: Date): { current: string; previous: string } {
  const { day, previousDay, previousMonth } = comparisonWindow(now);
  const range = (end: number, month: number) => (end === 1 ? `1 ${MONTHS[month]}` : `1–${end} ${MONTHS[month]}`);
  return { current: range(day, now.getMonth()), previous: range(previousDay, previousMonth.getMonth()) };
}
