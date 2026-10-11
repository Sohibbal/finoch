import { prisma } from "@/lib/prisma";

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
    const [profile, transactions, wishlists] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }).catch(() => null),
      prisma.transaction.findMany({
        where: { userId, isDeleted: false },
        orderBy: { transactionDate: "desc" },
      }).catch(() => []),
      prisma.wishlist.findMany({
        where: { userId, isDeleted: false },
        orderBy: { priority: "desc" },
      }).catch(() => []),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseCategoryMap: Record<string, number> = {};
    let highestExpenseItem: { name: string; amount: number } | null = null;

    for (const t of transactions) {
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

    // Top Category
    const sortedCats = Object.entries(expenseCategoryMap).sort((a, b) => b[1] - a[1]);
    const topCatString = sortedCats.length > 0
      ? `${sortedCats[0][0]} (Rp${sortedCats[0][1].toLocaleString("id-ID")})`
      : undefined;

    const topItemString = highestExpenseItem
      ? `${highestExpenseItem.name} (Rp${highestExpenseItem.amount.toLocaleString("id-ID")})`
      : undefined;

    // Wishlist Summary
    const activeWishlists = wishlists.filter((w) => !w.isAchieved);
    const wishlistSummary = activeWishlists.length > 0
      ? activeWishlists
          .slice(0, 3)
          .map((w, idx) => `${idx + 1}. ${w.name} (Rp${w.targetPrice.toLocaleString("id-ID")})`)
          .join(", ")
      : undefined;

    return {
      nickname: profile?.nickname || "Teman",
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
