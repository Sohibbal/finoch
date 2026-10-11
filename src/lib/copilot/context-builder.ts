import { prisma } from "@/lib/prisma";
import { jakartaDate } from "@/app/api/validation";

export interface UserFinancialSnapshot {
  nickname: string;
  netBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  topExpenseCategory?: string;
  topExpenseItem?: string;
  wishlistSummary?: string;
  streakDays?: number;
}

export function formatFinancialContextForLLM(snapshot: UserFinancialSnapshot): string {
  const rupiah = (n: number) => `Rp${(n || 0).toLocaleString("id-ID")}`;

  return `DATA FAKTA KEUANGAN LIVE PENGGUNA (DARI DATABASE PRIBADI):
- Nama Panggilan: ${snapshot.nickname || "Teman"}
- Saldo Bersih: ${rupiah(snapshot.netBalance)}
- Total Pemasukan Bulan Ini: ${rupiah(snapshot.monthlyIncome)}
- Total Pengeluaran Bulan Ini: ${rupiah(snapshot.monthlyExpense)}
- Pos Pengeluaran Terbesar: ${snapshot.topExpenseCategory || "Belum ada catatan"}
- Transaksi Terbesar: ${snapshot.topExpenseItem || "Belum ada catatan"}
- Daftar Wishlist Aktif: ${snapshot.wishlistSummary || "Belum ada wishlist"}
- Streak Hemat Disiplin: ${snapshot.streakDays || 0} hari`;
}

/**
 * Builds live database financial snapshot for a specific user.
 * Queries PostgreSQL via Prisma Client with zero hallucination.
 * Seamlessly handles unified Transaction/Wishlist models and legacy models.
 */
export async function buildUserFinancialSnapshot(userId: string): Promise<UserFinancialSnapshot> {
  const defaultSnapshot: UserFinancialSnapshot = {
    nickname: "Teman",
    netBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    topExpenseCategory: "Belum ada catatan",
    topExpenseItem: "Belum ada",
    wishlistSummary: "Belum ada wishlist aktif",
    streakDays: 0,
  };

  if (!userId) return defaultSnapshot;

  try {
    let nickname = "Teman";

    // 1. Check Profile
    if (prisma.profile) {
      const p = await prisma.profile.findUnique({ where: { userId } }).catch(() => null);
      if (p?.nickname) nickname = p.nickname;
    }

    // 2. Query Transactions
    let txList: { type: string; amount: number; itemName: string; category: string }[] = [];
    if (prisma.transaction) {
      txList = await prisma.transaction.findMany({
        where: { userId, isDeleted: false },
        orderBy: { transactionDate: "desc" },
      }).catch(() => []);
    }

    // 3. Fallback to legacy models if unified table has no rows
    if (txList.length === 0 && prisma.expense) {
      const [year, month] = jakartaDate().split("-").map(Number);
      const monthStart = new Date(Date.UTC(year, month - 1, 1) - 7 * 60 * 60 * 1000);
      const nextMonth = new Date(Date.UTC(year, month, 1) - 7 * 60 * 60 * 1000);

      const legacyExpenses = await prisma.expense.findMany({
        where: { userId, isDeleted: false, createdAt: { gte: monthStart, lt: nextMonth } },
      }).catch(() => []);

      txList = legacyExpenses.map((e: any) => ({
        type: "expense",
        amount: e.amount,
        itemName: e.itemName,
        category: e.category,
      }));
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseCategoryMap: Record<string, number> = {};
    let highestExpenseItem: { name: string; amount: number } | null = null;

    for (const t of txList) {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else if (t.type === "expense") {
        totalExpense += t.amount;
        expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount;

        if (!highestExpenseItem || t.amount > highestExpenseItem.amount) {
          highestExpenseItem = { name: t.itemName, amount: t.amount };
        }
      }
    }

    // If total income not from unified transactions, check financialProfile
    if (totalIncome === 0 && (prisma as any).financialProfile) {
      const fp = await (prisma as any).financialProfile.findUnique({ where: { userId } }).catch(() => null);
      if (fp?.monthlyIncome) totalIncome = fp.monthlyIncome;
    }

    // 4. Query Wishlists or Goals
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

    if (!wishlistSummary && (prisma as any).financialGoal) {
      const goals = await (prisma as any).financialGoal.findMany({
        where: { userId },
        orderBy: [{ targetDate: "asc" }, { id: "asc" }],
      }).catch(() => []);

      if (goals.length > 0) {
        wishlistSummary = goals[0].name;
      }
    }

    // Top Category
    const sortedCats = Object.entries(expenseCategoryMap).sort((a, b) => b[1] - a[1]);
    const topCatString = sortedCats.length > 0
      ? `${sortedCats[0][0]} (Rp${sortedCats[0][1].toLocaleString("id-ID")})`
      : undefined;

    const topItemString = highestExpenseItem
      ? `${highestExpenseItem.name} (Rp${highestExpenseItem.amount.toLocaleString("id-ID")})`
      : undefined;

    return {
      nickname,
      netBalance: totalIncome - totalExpense,
      monthlyIncome: totalIncome,
      monthlyExpense: totalExpense,
      topExpenseCategory: topCatString,
      topExpenseItem: topItemString,
      wishlistSummary,
      streakDays: 0,
    };
  } catch (err) {
    console.error("Error building financial snapshot for Copilot:", err);
    return defaultSnapshot;
  }
}
