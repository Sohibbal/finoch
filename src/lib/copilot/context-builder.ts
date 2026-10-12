import { prisma } from "@/lib/prisma";
import { jakartaDate } from "@/app/api/validation";

export interface MonthlySummaryItem {
  monthKey: string;
  monthName: string;
  income: number;
  expense: number;
  topCategory?: string;
}

export interface CategorySummaryItem {
  category: string;
  amount: number;
  count: number;
}

export interface RecentTransactionItem {
  date: string;
  name: string;
  amount: number;
  type: string;
  category: string;
}

export interface UserFinancialSnapshot {
  nickname: string;
  netBalance: number;
  currentMonthName?: string;
  currentMonthIncome?: number;
  currentMonthExpense?: number;
  currentMonthBalance?: number;
  currentMonthTopCategory?: string;
  monthlyIncome: number;
  monthlyExpense: number;
  allTimeIncome?: number;
  allTimeExpense?: number;
  monthlyBreakdown?: MonthlySummaryItem[];
  categoryBreakdownAllTime?: CategorySummaryItem[];
  categoryBreakdownCurrentMonth?: CategorySummaryItem[];
  recentTransactions?: RecentTransactionItem[];
  topExpenseCategory?: string;
  topExpenseItem?: string;
  wishlistSummary?: string;
  streakDays?: number;
  todayExpense?: number;
  dailyAllowance?: number;
}

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function formatFinancialContextForLLM(snapshot: UserFinancialSnapshot): string {
  const rupiah = (n: number) => `Rp${(n || 0).toLocaleString("id-ID")}`;

  const currentMonth = snapshot.currentMonthName || "Bulan Berjalan";
  const curInc = snapshot.currentMonthIncome ?? snapshot.monthlyIncome ?? 0;
  const curExp = snapshot.currentMonthExpense ?? snapshot.monthlyExpense ?? 0;
  const allInc = snapshot.allTimeIncome ?? snapshot.monthlyIncome ?? 0;
  const allExp = snapshot.allTimeExpense ?? snapshot.monthlyExpense ?? 0;
  const todayExp = snapshot.todayExpense ?? 0;
  const allowance = snapshot.dailyAllowance && snapshot.dailyAllowance > 0 ? snapshot.dailyAllowance : 50000;
  const isOverspent = todayExp > allowance;
  const overspentAmount = isOverspent ? todayExp - allowance : 0;
  const remainingAllowance = isOverspent ? 0 : allowance - todayExp;

  let text = `DATA FAKTA KEUANGAN LIVE PENGGUNA (DARI DATABASE PRIBADI):
- Nama Panggilan: ${snapshot.nickname || "Teman"}
- Target Jatah Harian: ${rupiah(allowance)} / hari
- Total Pengeluaran Hari Ini: ${rupiah(todayExp)}
- Status Jatah Hari Ini: ${isOverspent ? `KURANG AMAN (MELEBIHI JATAH / OVERBUDGET sebesar ${rupiah(overspentAmount)})` : `AMAN (Sisa jatah hari ini: ${rupiah(remainingAllowance)})`}
- Saldo Bersih / Tabungan Total: ${rupiah(snapshot.netBalance)}
- Total Pemasukan Bulan Ini: ${rupiah(curInc)}
- Total Pengeluaran Bulan Ini: ${rupiah(curExp)}
- Pos Pengeluaran Terbesar: ${snapshot.currentMonthTopCategory || snapshot.topExpenseCategory || "Belum ada catatan"}
- Transaksi Terbesar: ${snapshot.topExpenseItem || "Belum ada catatan"}
- Daftar Wishlist Aktif: ${snapshot.wishlistSummary || "Belum ada wishlist"}
- Streak Hemat Disiplin: ${snapshot.streakDays || 0} hari

0. STATUS JATAH HARIAN & HARI INI:
- Target Jatah Harian (User Setting): ${rupiah(allowance)} / hari
- Pengeluaran Hari Ini: ${rupiah(todayExp)}
- Sisa Jatah Hari Ini: ${rupiah(remainingAllowance)}
- Status Evaluasi: ${isOverspent ? `KURANG AMAN (Melebihi target jatah harian lo sebesar ${rupiah(overspentAmount)}, tapi saldo tabungan masih ada ${rupiah(snapshot.netBalance)})` : `AMAN (Masih hemat dalam batas jatah harian, sisa jatah ${rupiah(remainingAllowance)})`}

1. RANGKUMAN BULAN INI (${currentMonth}):
- Total Pemasukan Bulan Ini: ${rupiah(curInc)}
- Total Pengeluaran Bulan Ini: ${rupiah(curExp)}
- Saldo Bersih Bulan Ini: ${rupiah(curInc - curExp)}
- Pos Pengeluaran Terbanyak Bulan Ini: ${snapshot.currentMonthTopCategory || "Belum ada transaksi di bulan ini"}

2. TOTAL SELAMA INI (AKUMULASI SEMUA TRANSAKSI):
- Total Seluruh Pemasukan Selama Ini: ${rupiah(allInc)}
- Total Seluruh Pengeluaran Selama Ini: ${rupiah(allExp)}
- Sisa Saldo Bersih Seluruh Waktu: ${rupiah(snapshot.netBalance)}`;

  if (snapshot.monthlyBreakdown && snapshot.monthlyBreakdown.length > 0) {
    text += `\n\n3. REKAP HISTORI PER BULAN:\n` +
      snapshot.monthlyBreakdown
        .map(
          (m) =>
            `- ${m.monthName}: Keluar ${rupiah(m.expense)}, Masuk ${rupiah(m.income)}${
              m.topCategory ? ` (Terbanyak: ${m.topCategory})` : ""
            }`
        )
        .join("\n");
  }

  if (snapshot.categoryBreakdownAllTime && snapshot.categoryBreakdownAllTime.length > 0) {
    text += `\n\n4. RINCIAN PENGELUARAN PER KATEGORI (SELURUH WAKTU):\n` +
      snapshot.categoryBreakdownAllTime
        .map((c) => `- ${c.category}: ${rupiah(c.amount)} (${c.count}x transaksi)`)
        .join("\n");
  }

  if (snapshot.recentTransactions && snapshot.recentTransactions.length > 0) {
    text += `\n\n5. TRANSAKSI TERAKHIR TERCATAT:\n` +
      snapshot.recentTransactions
        .slice(0, 8)
        .map((t) => `- ${t.date}: ${t.name} (${t.type === "income" ? "+" : "-"}${rupiah(t.amount)}) [${t.category}]`)
        .join("\n");
  }

  return text;
}

/**
 * Builds live database financial snapshot for a specific user.
 * Queries PostgreSQL via Prisma Client with zero hallucination.
 * Seamlessly handles unified Transaction/Wishlist models and client-provided facts.
 */
export async function buildUserFinancialSnapshot(
  userId: string,
  clientFacts?: {
    transactions?: {
      type: string;
      itemName?: string;
      name?: string;
      amount: number;
      category?: string;
      source?: string;
      date?: string;
      transactionDate?: string;
    }[];
    wishlists?: {
      name: string;
      targetPrice: number;
      savedAmount?: number;
      isAchieved?: boolean;
    }[];
    netBalance?: number;
    monthlyIncome?: number;
    monthlyExpense?: number;
    topExpenseCategory?: string;
    wishlistSummary?: string;
    streakDays?: number;
    dailyAllowance?: number;
    todayExpense?: number;
  }
): Promise<UserFinancialSnapshot> {
  const defaultSnapshot: UserFinancialSnapshot = {
    nickname: "Teman",
    netBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    todayExpense: 0,
    dailyAllowance: 50000,
    topExpenseCategory: "Belum ada catatan",
    topExpenseItem: "Belum ada",
    wishlistSummary: "Belum ada wishlist aktif",
    streakDays: 0,
    monthlyBreakdown: [],
    categoryBreakdownAllTime: [],
    categoryBreakdownCurrentMonth: [],
    recentTransactions: [],
  };

  if (!userId) return defaultSnapshot;

  try {
    let nickname = "Teman";

    // 1. Check Profile
    if (prisma.profile) {
      const p = await prisma.profile.findUnique({ where: { userId } }).catch(() => null);
      if (p?.nickname) nickname = p.nickname;
    }

    // 2. Query Transactions from DB or fallback to client facts
    let txList: { type: string; amount: number; itemName: string; category: string; transactionDate?: string }[] = [];
    if (prisma.transaction) {
      const dbTx = await prisma.transaction.findMany({
        where: { userId, isDeleted: false },
        orderBy: { transactionDate: "desc" },
      }).catch(() => []);
      if (dbTx.length > 0) {
        txList = dbTx.map((t) => ({
          type: t.type,
          amount: t.amount,
          itemName: t.itemName,
          category: t.category,
          transactionDate: t.transactionDate
            ? (t.transactionDate instanceof Date
                ? t.transactionDate.toISOString().slice(0, 10)
                : String(t.transactionDate).slice(0, 10))
            : undefined,
        }));
      }
    }

    if (txList.length === 0 && clientFacts?.transactions && clientFacts.transactions.length > 0) {
      txList = clientFacts.transactions.map((t) => ({
        type: t.type,
        amount: t.amount,
        itemName: t.itemName || t.name || "Transaksi",
        category: t.category || "Lainnya",
        transactionDate: t.transactionDate || t.date,
      }));
    }

    // Fallback to legacy models
    if (txList.length === 0 && (prisma as any).expense) {
      const [year, month] = jakartaDate().split("-").map(Number);
      const monthStart = new Date(Date.UTC(year, month - 1, 1) - 7 * 60 * 60 * 1000);
      const nextMonth = new Date(Date.UTC(year, month, 1) - 7 * 60 * 60 * 1000);

      const legacyExpenses = await (prisma as any).expense.findMany({
        where: { userId, isDeleted: false, createdAt: { gte: monthStart, lt: nextMonth } },
      }).catch(() => []);

      txList = legacyExpenses.map((e: any) => ({
        type: e.type || "expense",
        amount: e.amount,
        itemName: e.itemName,
        category: e.category,
        transactionDate: e.createdAt ? new Date(e.createdAt).toISOString().slice(0, 10) : undefined,
      }));
    }

    // Current Date identification
    const nowStr = jakartaDate();
    const [currYearStr, currMonthNumStr] = nowStr.split("-");
    const currMonthIdx = Math.max(0, Number(currMonthNumStr) - 1);
    const currentMonthKey = `${currYearStr}-${currMonthNumStr.padStart(2, "0")}`;
    const currentMonthName = `${MONTH_NAMES_ID[currMonthIdx] || "Bulan Ini"} ${currYearStr}`;

    let allTimeIncome = 0;
    let allTimeExpense = 0;
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    let todayExpense = 0;

    const monthlyMap: Record<string, { income: number; expense: number; catMap: Record<string, number> }> = {};
    const catMapAllTime: Record<string, { amount: number; count: number }> = {};
    const catMapCurrentMonth: Record<string, { amount: number; count: number }> = {};
    let highestExpenseItem: { name: string; amount: number } | null = null;

    for (const t of txList) {
      const txDateStr = t.transactionDate ? String(t.transactionDate).slice(0, 10) : "";
      const mKey = txDateStr ? txDateStr.slice(0, 7) : currentMonthKey;
      if (!monthlyMap[mKey]) {
        monthlyMap[mKey] = { income: 0, expense: 0, catMap: {} };
      }

      if (t.type === "income") {
        allTimeIncome += t.amount;
        monthlyMap[mKey].income += t.amount;
        if (mKey === currentMonthKey) {
          currentMonthIncome += t.amount;
        }
      } else if (t.type === "expense") {
        allTimeExpense += t.amount;
        monthlyMap[mKey].expense += t.amount;
        if (txDateStr === nowStr) {
          todayExpense += t.amount;
        }
        const cat = t.category || "Lainnya";
        monthlyMap[mKey].catMap[cat] = (monthlyMap[mKey].catMap[cat] || 0) + t.amount;

        if (!catMapAllTime[cat]) catMapAllTime[cat] = { amount: 0, count: 0 };
        catMapAllTime[cat].amount += t.amount;
        catMapAllTime[cat].count += 1;

        if (mKey === currentMonthKey) {
          currentMonthExpense += t.amount;
          if (!catMapCurrentMonth[cat]) catMapCurrentMonth[cat] = { amount: 0, count: 0 };
          catMapCurrentMonth[cat].amount += t.amount;
          catMapCurrentMonth[cat].count += 1;
        }

        if (!highestExpenseItem || t.amount > highestExpenseItem.amount) {
          highestExpenseItem = { name: t.itemName, amount: t.amount };
        }
      }
    }

    if (clientFacts?.todayExpense !== undefined && todayExpense === 0) {
      todayExpense = clientFacts.todayExpense;
    }
    const dailyAllowance = clientFacts?.dailyAllowance || 50000;

    if (allTimeIncome === 0 && currentMonthIncome === 0 && (prisma as any).financialProfile) {
      const fp = await (prisma as any).financialProfile.findUnique({ where: { userId } }).catch(() => null);
      if (fp?.monthlyIncome) {
        currentMonthIncome = fp.monthlyIncome;
        allTimeIncome += fp.monthlyIncome;
        if (!monthlyMap[currentMonthKey]) {
          monthlyMap[currentMonthKey] = { income: fp.monthlyIncome, expense: 0, catMap: {} };
        } else {
          monthlyMap[currentMonthKey].income = fp.monthlyIncome;
        }
      }
    }

    // Monthly breakdown list sorted descending
    const monthlyBreakdown: MonthlySummaryItem[] = Object.keys(monthlyMap)
      .sort()
      .reverse()
      .map((mKey) => {
        const parts = mKey.split("-");
        const y = parts[0];
        const m = Number(parts[1]);
        const mName = m >= 1 && m <= 12 ? `${MONTH_NAMES_ID[m - 1]} ${y}` : mKey;
        const sortedCats = Object.entries(monthlyMap[mKey].catMap).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCats[0]
          ? `${sortedCats[0][0]} (Rp${sortedCats[0][1].toLocaleString("id-ID")})`
          : undefined;

        return {
          monthKey: mKey,
          monthName: mName,
          income: monthlyMap[mKey].income,
          expense: monthlyMap[mKey].expense,
          topCategory,
        };
      });

    // Category breakdown all time
    const categoryBreakdownAllTime: CategorySummaryItem[] = Object.entries(catMapAllTime)
      .map(([category, val]) => ({ category, amount: val.amount, count: val.count }))
      .sort((a, b) => b.amount - a.amount);

    // Category breakdown current month
    const categoryBreakdownCurrentMonth: CategorySummaryItem[] = Object.entries(catMapCurrentMonth)
      .map(([category, val]) => ({ category, amount: val.amount, count: val.count }))
      .sort((a, b) => b.amount - a.amount);

    // 3. Wishlists
    let wishlistSummary: string | undefined = undefined;
    if (prisma.wishlist) {
      const activeWishlists = await prisma.wishlist.findMany({
        where: { userId, isDeleted: false, isAchieved: false },
        orderBy: { priority: "desc" },
      }).catch(() => []);

      if (activeWishlists.length > 0) {
        wishlistSummary = activeWishlists
          .slice(0, 3)
          .map((w: any, idx: number) => `${idx + 1}. ${w.name} (Rp${w.targetPrice.toLocaleString("id-ID")})`)
          .join(", ");
      }
    }

    if (!wishlistSummary && clientFacts?.wishlists && clientFacts.wishlists.length > 0) {
      const activeWls = clientFacts.wishlists.filter((w) => !w.isAchieved);
      if (activeWls.length > 0) {
        wishlistSummary = activeWls
          .slice(0, 3)
          .map((w, idx) => `${idx + 1}. ${w.name} (Rp${w.targetPrice.toLocaleString("id-ID")})`)
          .join(", ");
      }
    }

    if (!wishlistSummary && (prisma as any).financialGoal) {
      const goals = await (prisma as any).financialGoal.findMany({
        where: { userId },
        orderBy: [{ targetDate: "asc" }, { id: "asc" }],
      }).catch(() => []);

      if (goals.length > 0) {
        wishlistSummary = goals[0].name;
      }
    }

    const topCatString = categoryBreakdownAllTime.length > 0
      ? `${categoryBreakdownAllTime[0].category} (Rp${categoryBreakdownAllTime[0].amount.toLocaleString("id-ID")})`
      : undefined;

    const topItemString = highestExpenseItem
      ? `${highestExpenseItem.name} (Rp${highestExpenseItem.amount.toLocaleString("id-ID")})`
      : undefined;

    const currentMonthTopCategory = categoryBreakdownCurrentMonth.length > 0
      ? `${categoryBreakdownCurrentMonth[0].category} (Rp${categoryBreakdownCurrentMonth[0].amount.toLocaleString("id-ID")})`
      : undefined;

    const recentTransactions: RecentTransactionItem[] = txList.slice(0, 10).map((t) => ({
      date: t.transactionDate || "Hari ini",
      name: t.itemName,
      amount: t.amount,
      type: t.type,
      category: t.category,
    }));

    return {
      nickname,
      netBalance: allTimeIncome - allTimeExpense,
      currentMonthName,
      currentMonthIncome,
      currentMonthExpense,
      currentMonthBalance: currentMonthIncome - currentMonthExpense,
      currentMonthTopCategory,
      monthlyIncome: currentMonthIncome > 0 ? currentMonthIncome : allTimeIncome,
      monthlyExpense: currentMonthExpense > 0 ? currentMonthExpense : allTimeExpense,
      allTimeIncome,
      allTimeExpense,
      monthlyBreakdown,
      categoryBreakdownAllTime,
      categoryBreakdownCurrentMonth,
      recentTransactions,
      topExpenseCategory: topCatString,
      topExpenseItem: topItemString,
      wishlistSummary: wishlistSummary || clientFacts?.wishlistSummary,
      streakDays: clientFacts?.streakDays || 0,
      todayExpense,
      dailyAllowance,
    };
  } catch (err) {
    console.error("Error building financial snapshot for Copilot:", err);
    return defaultSnapshot;
  }
}
