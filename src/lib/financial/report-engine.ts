import { MonthlyReportSummary, WhatsAppReportOptions, CategoryBreakdown } from "@/types/report-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

export const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const NEEDS_CATEGORIES = [
  "food & drinks",
  "food",
  "groceries",
  "bills & utilities",
  "bills",
  "housing & bills",
  "housing",
  "transportation",
  "transport",
  "health & personal care",
  "health",
  "education & career",
  "education",
];

const WANTS_CATEGORIES = [
  "shopping & lifestyle",
  "shopping",
  "entertainment & leisure",
  "entertainment",
  "social & family",
  "family",
  "other",
];

export interface ExpenseRecord {
  id?: string;
  itemName?: string;
  amount: number;
  category?: string;
  createdAt?: string;
}

/**
 * Calculates a comprehensive monthly report summary from expense list and allowance.
 */
export function generateMonthlyReport(
  expenses: ExpenseRecord[],
  monthlyAllowance: number,
  month: number, // 1 - 12
  year: number
): MonthlyReportSummary {
  // Filter expenses matching selected month and year
  const targetExpenses = expenses.filter((e) => {
    if (!e.createdAt) return true; // Include if untimed
    const d = new Date(e.createdAt);
    if (isNaN(d.getTime())) return true;
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const totalExpenses = targetExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncome = Math.max(0, monthlyAllowance);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // 50-30-20 Breakdown
  let needsAmount = 0;
  let wantsAmount = 0;
  let savingsAmount = 0;

  // Category map
  const catMap: Record<string, { total: number; count: number }> = {};

  for (const exp of targetExpenses) {
    const cat = (exp.category || "Other").trim();
    const catLower = cat.toLowerCase();

    if (!catMap[cat]) {
      catMap[cat] = { total: 0, count: 0 };
    }
    catMap[cat].total += exp.amount || 0;
    catMap[cat].count += 1;

    if (catLower.includes("saving") || catLower.includes("tabungan") || catLower.includes("invest")) {
      savingsAmount += exp.amount || 0;
    } else if (NEEDS_CATEGORIES.some((c) => catLower.includes(c) || c.includes(catLower))) {
      needsAmount += exp.amount || 0;
    } else {
      wantsAmount += exp.amount || 0;
    }
  }

  const needsPercentage = totalExpenses > 0 ? Math.round((needsAmount / totalExpenses) * 100) : 0;
  const wantsPercentage = totalExpenses > 0 ? Math.round((wantsAmount / totalExpenses) * 100) : 0;
  const savingsPercentage = totalExpenses > 0 ? Math.round((savingsAmount / totalExpenses) * 100) : 0;

  // Sort top categories
  const topCategories: CategoryBreakdown[] = Object.entries(catMap)
    .map(([category, info]) => ({
      category,
      amount: info.total,
      percentage: totalExpenses > 0 ? Math.round((info.total / totalExpenses) * 100) : 0,
      transactionCount: info.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Runway estimate (based on current average daily spend)
  const now = new Date();
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = (now.getMonth() + 1 === month && now.getFullYear() === year)
    ? Math.max(1, now.getDate())
    : daysInMonth;

  const dailyBurn = currentDay > 0 ? totalExpenses / currentDay : 0;
  const remainingAllowance = Math.max(0, netSavings);
  const runwayDays = dailyBurn > 0 ? Math.floor(remainingAllowance / dailyBurn) : 30;

  return {
    month,
    year,
    monthName: MONTH_NAMES_ID[month - 1] || "Bulan",
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    needsAmount,
    wantsAmount,
    savingsAmount,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    runwayDays,
    topCategories,
    totalTransactions: targetExpenses.length,
  };
}

/**
 * Formats a clean, respectful Indonesian message for WhatsApp export.
 */
export function formatWhatsAppReport(
  summary: MonthlyReportSummary,
  options: WhatsAppReportOptions
): string {
  const student = options.studentName || "Ananda";
  const campus = options.campusName ? ` (${options.campusName})` : "";
  const period = `${summary.monthName} ${summary.year}`;

  if (options.recipientType === "parents") {
    let msg = `*LAPORAN KEUANGAN BULANAN MAHASISWA*\n`;
    msg += `Periode: ${period}\n`;
    msg += `Pengirim: ${student}${campus}\n\n`;
    msg += `Assalamu'alaikum / Halo Ayah & Ibu,\n`;
    msg += `Berikut rincian transparansi keuangan dan uang saku ${student} selama bulan ${summary.monthName}:\n\n`;
    msg += `💵 *Uang Saku Diterima:* ${formatRupiah(summary.totalIncome)}\n`;
    msg += `💸 *Total Pengeluaran:* ${formatRupiah(summary.totalExpenses)}\n`;
    msg += `💰 *Sisa Saldo Tabungan:* ${formatRupiah(summary.netSavings)} (${summary.savingsRate >= 0 ? "Surplus" : "Defisit"})\n\n`;

    if (summary.topCategories.length > 0) {
      msg += `📊 *Pos Pengeluaran Terbesar:*\n`;
      summary.topCategories.slice(0, 4).forEach((cat, idx) => {
        msg += `${idx + 1}. ${cat.category}: ${formatRupiah(cat.amount)} (${cat.percentage}%)\n`;
      });
      msg += `\n`;
    }

    msg += `🛡️ *Kebutuhan Pokok (Needs):* ${summary.needsPercentage}% | *Keinginan (Wants):* ${summary.wantsPercentage}%\n`;
    msg += `⏱️ *Estimasi Hari Bertahan:* ±${summary.runwayDays} hari ke depan\n\n`;

    if (options.customNote) {
      msg += `📝 *Catatan Tambahan:*\n"${options.customNote}"\n\n`;
    }

    msg += `Terima kasih banyak atas doa dan dukungan Ayah & Ibu selama ini! ❤️\n`;
    msg += `_Dicatat rapi & transparan dengan finoch.id_`;
    return msg;
  }

  if (options.recipientType === "scholarship") {
    let msg = `*LAPORAN PERTANGGUNGJAWABAN BIAYA HIDUP MAHASISWA*\n`;
    msg += `Program Beasiswa / Bantuan Pendidikan\n`;
    msg += `Nama Mahasiswa: ${student}\n`;
    if (options.campusName) msg += `Perguruan Tinggi: ${options.campusName}\n`;
    msg += `Periode Pelaporan: ${period}\n`;
    msg += `-------------------------------------------\n\n`;

    msg += `*I. RINGKASAN ANGGARAN & REALISASI*\n`;
    msg += `• Dana Bantuan Diterima: ${formatRupiah(summary.totalIncome)}\n`;
    msg += `• Total Realisasi Pengeluaran: ${formatRupiah(summary.totalExpenses)}\n`;
    msg += `• Saldo Kas Akhir Periode: ${formatRupiah(summary.netSavings)}\n`;
    msg += `• Persentase Efisiensi Kas: ${summary.savingsRate}%\n\n`;

    msg += `*II. ALOKASI REALISASI BIAYA POKOK*\n`;
    summary.topCategories.forEach((cat) => {
      msg += `• ${cat.category}: ${formatRupiah(cat.amount)} (${cat.percentage}%)\n`;
    });
    msg += `\n`;

    msg += `*III. PERNYATAAN AKUNTABILITAS*\n`;
    msg += `Seluruh data keuangan di atas telah diverifikasi secara akurat dan transparan melalui sistem pencatatan finoch.id.\n\n`;
    if (options.customNote) {
      msg += `Keterangan: ${options.customNote}\n\n`;
    }
    msg += `Tertanda,\n${student}`;
    return msg;
  }

  // Personal self-audit
  let msg = `*EVALUASI ARUS KAS PRIBADI (${period})*\n`;
  msg += `Total Pemasukan: ${formatRupiah(summary.totalIncome)}\n`;
  msg += `Total Pengeluaran: ${formatRupiah(summary.totalExpenses)}\n`;
  msg += `Surplus/Sisa: ${formatRupiah(summary.netSavings)} (Tingkat Tabungan: ${summary.savingsRate}%)\n\n`;
  msg += `Breakdown 50/30/20:\n`;
  msg += `- Kebutuhan (Needs): ${summary.needsPercentage}% (${formatRupiah(summary.needsAmount)})\n`;
  msg += `- Keinginan (Wants): ${summary.wantsPercentage}% (${formatRupiah(summary.wantsAmount)})\n\n`;
  msg += `Generated with finoch.id`;
  return msg;
}

/**
 * Generates RFC 4180 CSV with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function generateCsvContent(expenses: ExpenseRecord[]): string {
  const header = ["Tanggal", "Kategori", "Nama Pengeluaran", "Nominal (IDR)"];
  const rows = expenses.map((e) => {
    const dateStr = e.createdAt ? new Date(e.createdAt).toISOString().split("T")[0] : "-";
    const category = `"${(e.category || "Other").replace(/"/g, '""')}"`;
    const name = `"${(e.itemName || "Pengeluaran").replace(/"/g, '""')}"`;
    const amount = e.amount || 0;
    return [dateStr, category, name, amount].join(",");
  });

  // UTF-8 BOM
  return "\uFEFF" + [header.join(","), ...rows].join("\r\n");
}

/**
 * Generates an Indonesian Academic LPJ (Laporan Pertanggungjawaban) Spreadsheet CSV
 * for scholarships (KIP-K/Djarum/Tanoto), student organizations, or parents.
 */
export function generateLpjSpreadsheetCsv(
  expenses: ExpenseRecord[],
  summary: MonthlyReportSummary,
  studentName: string = "Mahasiswa",
  institutionName: string = "Universitas"
): string {
  const metaRows = [
    `"LAPORAN PERTANGGUNGJAWABAN (LPJ) BIAYA HIDUP MAHASISWA"`,
    `"Nama Mahasiswa: ${studentName.replace(/"/g, '""')}"`,
    `"Perguruan Tinggi: ${institutionName.replace(/"/g, '""')}"`,
    `"Periode: ${summary.monthName} ${summary.year}"`,
    `"Total Dana Masuk / Beasiswa: Rp ${summary.totalIncome.toLocaleString("id-ID")}"`,
    `"Total Realisasi Pengeluaran: Rp ${summary.totalExpenses.toLocaleString("id-ID")}"`,
    `"Sisa Saldo Kas: Rp ${summary.netSavings.toLocaleString("id-ID")}"`,
    `""`, // blank line
  ];

  const header = [
    "No",
    "Tanggal Transaksi",
    "Pos Anggaran",
    "Uraian Pengeluaran",
    "Pemasukan (IDR)",
    "Pengeluaran (IDR)",
    "Saldo Berjalan (IDR)",
    "Keterangan / Verifikasi",
  ];

  let runningBalance = summary.totalIncome;

  const rows = expenses.map((e, index) => {
    const dateStr = e.createdAt ? new Date(e.createdAt).toISOString().split("T")[0] : "-";
    const category = `"${(e.category || "Kebutuhan Pokok").replace(/"/g, '""')}"`;
    const name = `"${(e.itemName || "Transaksi").replace(/"/g, '""')}"`;
    const expenseAmt = e.amount || 0;
    runningBalance -= expenseAmt;

    return [
      index + 1,
      dateStr,
      category,
      name,
      0,
      expenseAmt,
      runningBalance,
      `"Lunas / Terverifikasi"`,
    ].join(",");
  });

  return "\uFEFF" + [...metaRows, header.join(","), ...rows].join("\r\n");
}

