import { MicroLeakItem, LeakAuditSummary, LeakCategory } from "@/types/audit-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { isSameLocalMonth, parseDate } from "@/lib/date";

export interface ExpenseAuditCandidate {
  id?: string;
  itemName?: string;
  amount: number;
  category?: string;
  createdAt?: string;
}

const LEAK_PATTERNS: Array<{
  category: LeakCategory;
  label: string;
  keywords: string[];
  maxAmount: number;
  tip: string;
}> = [
  {
    category: "admin_fee",
    label: "Biaya Admin Bank & Top-Up",
    keywords: ["admin", "biaya admin", "topup", "top up", "fee", "transfer", "biaya transfer"],
    maxAmount: 15000,
    tip: "Gunakan transfer BI-Fast (Rp 0 / gratis) atau aplikasi Flip untuk hemat biaya transfer.",
  },
  {
    category: "platform_fee",
    label: "Biaya Layanan Ojol & Platform",
    keywords: ["layanan", "ongkir", "platform fee", "biaya aplikasi", "jasa aplikasi", "gofood", "grabfood", "shopeefood"],
    maxAmount: 20000,
    tip: "Ambil langsung makanan ke warung (takeaway) saat pulang kampus untuk hemat biaya jasa aplikasi Rp 3.000 - Rp 5.000 per order.",
  },
  {
    category: "parking",
    label: "Uang Parkir Minimarket & Kampus",
    keywords: ["parkir", "karcis", "uang parkir", "titip motor"],
    maxAmount: 10000,
    tip: "Beli kebutuhan mingguan sekaligus di minimarket dalam satu kunjungan agar tidak bayar parkir berulang kali.",
  },
  {
    category: "cheap_snack",
    label: "Jajan Receh & Es Teh Jumbo",
    keywords: ["es teh", "teh jumbo", "gorengan", "cilok", "cilor", "kopi sachet", "rokok eceran", "snack", "chiki"],
    maxAmount: 15000,
    tip: "Bawa tumbler air minum dan seduh kopi sendiri di kost untuk pangkas jajan impulsif harian.",
  },
  {
    category: "subscription",
    label: "Langganan Aplikasi Digital Pasif",
    keywords: ["spotify", "netflix", "youtube premium", "icloud", "google one", "canva", "disney", "chatgpt"],
    maxAmount: 200000,
    tip: "Gabung paket Family Plan bareng teman kampus atau batalkan langganan yang sudah jarang ditonton.",
  },
];

// Rumah-tangga kost, not jajan: never a generic micro leak, however small.
const ESSENTIAL_CATEGORY = /bill|housing|utilit/i;
const ESSENTIAL_ITEM = /\b(galon|air minum|gas|elpiji|lpg|token listrik)\b/i;

// One tip per detected leak category, so advice only names habits the user actually has.
const CHECKLIST: Record<LeakCategory, string> = {
  admin_fee: "Aktifkan transfer gratis via BI-Fast di m-Banking atau gunakan Flip.",
  platform_fee: "Ambil pesanan makanan langsung ke warung jika jaraknya dekat dengan kost.",
  parking: "Belanja mingguan sekali jalan biar nggak bayar parkir berkali-kali.",
  cheap_snack: "Bawa botol tumbler air minum sendiri saat ke kampus atau perpustakaan.",
  subscription: "Gabung paket langganan keluarga (Family Plan) bersama teman kost.",
  other_leak: "Kumpulkan uang kembalian di celengan koin, jangan langsung dijajanin.",
};

// Whole-word matchers so "coffee" doesn't hit "fee" and "badminton" doesn't hit "admin".
const LEAK_MATCHERS = LEAK_PATTERNS.map((pattern) => ({
  pattern,
  regexes: pattern.keywords.map(
    (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
  ),
}));

/**
 * Analyzes expenses for micro-leaks ("bocor halus") and computes shock-value metrics.
 */
export function auditMicroExpenses(
  expenses: ExpenseAuditCandidate[],
  monthlyAllowance: number = 2000000,
  referenceDate: Date = new Date()
): LeakAuditSummary {
  const detectedItems: MicroLeakItem[] = [];

  for (const exp of expenses) {
    // Only this month's expenses count toward the monthly leak total (undated = today, as below)
    const date = exp.createdAt ? parseDate(exp.createdAt) : referenceDate;
    if (!date || !isSameLocalMonth(date, referenceDate)) continue;

    const name = (exp.itemName || "").toLowerCase();
    const cat = (exp.category || "").toLowerCase();
    const amount = exp.amount || 0;

    let matched = false;

    // Check specific patterns
    for (const { pattern, regexes } of LEAK_MATCHERS) {
      const isKeywordMatch = regexes.some((re) => re.test(name) || re.test(cat));

      if (isKeywordMatch && amount <= pattern.maxAmount) {
        detectedItems.push({
          id: exp.id || `leak-${Math.random().toString(36).substring(2, 7)}`,
          name: exp.itemName || pattern.label,
          amount,
          category: pattern.category,
          categoryLabel: pattern.label,
          date: exp.createdAt || new Date().toISOString(),
          count: 1,
          frequency: "recurring",
          substitutionTip: pattern.tip,
        });
        matched = true;
        break;
      }
    }

    // Generic micro expense: <= 12,000 in 'Other' or 'Shopping' without large description
    const essential = ESSENTIAL_CATEGORY.test(cat) || ESSENTIAL_ITEM.test(name);
    if (!matched && !essential && amount <= 12000 && amount > 0) {
      if (cat.includes("other") || cat.includes("shopping") || cat.includes("food") || name.length <= 15) {
        detectedItems.push({
          id: exp.id || `leak-${Math.random().toString(36).substring(2, 7)}`,
          name: exp.itemName || "Pengeluaran Receh",
          amount,
          category: "other_leak",
          categoryLabel: "Pengeluaran Receh Tanpa Terasa",
          date: exp.createdAt || new Date().toISOString(),
          count: 1,
          frequency: "recurring",
          substitutionTip: "Catat setiap uang kembalian dan kumpulkan dalam celengan koin anak kost.",
        });
      }
    }
  }

  const totalLeakedAmount = detectedItems.reduce((sum, item) => sum + item.amount, 0);
  const wartegEquivalence = Math.round(totalLeakedAmount / 15000); // Rp 15.000 / porsi warteg
  const percentageOfAllowance = monthlyAllowance > 0
    ? Math.round((totalLeakedAmount / monthlyAllowance) * 100)
    : 0;

  // Group by category
  const groupMap: Record<string, { label: string; amount: number; count: number }> = {};
  for (const item of detectedItems) {
    if (!groupMap[item.category]) {
      groupMap[item.category] = { label: item.categoryLabel, amount: 0, count: 0 };
    }
    groupMap[item.category].amount += item.amount;
    groupMap[item.category].count += 1;
  }

  const leaksByCategory = Object.entries(groupMap).map(([cat, val]) => ({
    category: cat as LeakCategory,
    label: val.label,
    amount: val.amount,
    percentage: totalLeakedAmount > 0 ? Math.round((val.amount / totalLeakedAmount) * 100) : 0,
    count: val.count,
  })).sort((a, b) => b.amount - a.amount);

  let shockMessage = "Pola pengeluaran mikro kamu masih sangat terkontrol dan efisien.";
  if (totalLeakedAmount >= 100000) {
    shockMessage = `Perhatian! Kamu menghabiskan ${formatRupiah(totalLeakedAmount)} bulan ini hanya untuk kebocoran halus (admin, parkir, jajan receh). Ini setara dengan ${wartegEquivalence} porsi nasi warteg komplit.`;
  } else if (totalLeakedAmount >= 50000) {
    shockMessage = `Ada ${formatRupiah(totalLeakedAmount)} uang saku yang menguap dari transaksi kecil tanpa disadari. Setara dengan ${wartegEquivalence} porsi nasi warteg kampus.`;
  }

  const actionChecklist = leaksByCategory.map((l) => CHECKLIST[l.category]);

  return {
    totalLeakedAmount,
    leakCount: detectedItems.length,
    percentageOfAllowance,
    wartegEquivalence,
    leaksByCategory,
    items: detectedItems,
    shockMessage,
    actionChecklist,
  };
}
