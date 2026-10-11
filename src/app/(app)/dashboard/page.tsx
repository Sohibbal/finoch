"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Info,
  ArrowRight,
  ChevronRight,
  Calendar,
  MoreHorizontal,
  Wallet,
  TrendingUp,
  TrendingDown,
  Flame,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rupiah, shortDate } from "@/lib/format";
import { localDateKey } from "@/lib/date";
import { useAuthContext } from "@/components/layout/auth-provider";
import { getTransactions, type LocalTransaction } from "@/lib/storage/transaction-storage";
import { getWishlistItems, type LocalWishlist } from "@/lib/storage/wishlist-storage";
import { calculateStreakMetrics } from "@/lib/financial/streak-engine";
import { generateDailyGenZInsight } from "@/lib/financial/genz-insight-engine";
import { calculateWishlistProjection } from "@/lib/financial/wishlist-engine";
import { GenZInsightCard } from "@/components/dashboard/genz-insight-card";
import { DailyAllowanceRing } from "@/components/dashboard/daily-allowance-ring";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";

// Shared lightning glass & wallet accent card styles
const BENTO_CARD_CLASS =
  "relative overflow-hidden rounded-3xl p-5 sm:p-6 backdrop-blur-xl bg-white/80 dark:bg-[#111C2E]/80 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.08] dark:before:via-white/[0.03] before:to-transparent before:pointer-events-none after:absolute after:top-0 after:left-7 after:w-10 after:h-1 after:rounded-b-md after:bg-slate-300/80 dark:after:bg-slate-700/80 after:shadow-sm";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [nickname, setNickname] = useState("Kawan");
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [wishlists, setWishlists] = useState<LocalWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load nickname from local storage or profile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("finoch_user_nickname");
      if (stored && stored.trim()) {
        setNickname(stored.trim());
      } else if (user?.email) {
        setNickname(user.email.split("@")[0]);
      }
    }
  }, [user]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txData, wData] = await Promise.all([
        getTransactions(),
        getWishlistItems(),
      ]);
      setTransactions(txData);
      setWishlists(wData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Re-sync immediately when transactions or sync updates occur
    const handleUpdate = () => loadData();
    window.addEventListener("finoch:transaction-changed", handleUpdate);
    window.addEventListener("finoch:data-pulled", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("finoch:transaction-changed", handleUpdate);
      window.removeEventListener("finoch:data-pulled", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadData]);

  // Compute Financial Aggregates
  const financialData = useMemo(() => {
    let income = 0;
    let expense = 0;
    const todayKey = localDateKey(new Date());
    let todaySpent = 0;

    const streakCandidates = [];

    for (const tx of transactions) {
      if (tx.type === "income") {
        income += tx.amount;
      } else if (tx.type === "expense") {
        expense += tx.amount;
        streakCandidates.push({
          id: tx.id,
          itemName: tx.itemName,
          amount: tx.amount,
          category: tx.category,
          createdAt: tx.transactionDate,
        });

        if (tx.transactionDate.startsWith(todayKey)) {
          todaySpent += tx.amount;
        }
      }
    }

    const netBalance = income - expense;
    // Default standard allowance: Rp50.000 / day
    const dailyAllowance = 50000;

    const streakSummary = calculateStreakMetrics(streakCandidates, dailyAllowance);

    const activeWishlists = wishlists.filter((w) => !w.isAchieved);
    const topWishlist = activeWishlists[0] || null;

    const insight = generateDailyGenZInsight({
      nickname,
      todaySpent,
      dailyAllowance,
      topWishlistName: topWishlist?.name,
      streakDays: streakSummary.currentStreak,
    });

    const recentTx = transactions.slice(0, 5);

    return {
      income,
      expense,
      netBalance,
      todaySpent,
      dailyAllowance,
      streakDays: streakSummary.currentStreak,
      topWishlist,
      insight,
      recentTx,
    };
  }, [transactions, wishlists, nickname]);

  // Income categories distribution for Pie Chart
  const incomeCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "income") {
        const cat = tx.category || "Lainnya";
        map[cat] = (map[cat] || 0) + tx.amount;
      }
    }
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [transactions]);

  // Expense categories distribution for Pie Chart
  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "expense") {
        const cat = tx.category || "Lainnya";
        map[cat] = (map[cat] || 0) + tx.amount;
      }
    }
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [transactions]);

  const topProjection = useMemo(() => {
    if (!financialData.topWishlist) return null;
    const net = Math.max(0, financialData.netBalance);
    const dailyRate = Math.max(0, Math.round(net / 30)) || 25000;
    return calculateWishlistProjection(
      financialData.topWishlist.targetPrice,
      net,
      dailyRate
    );
  }, [financialData.topWishlist, financialData.netBalance]);

  return (
    <>
      <PageHeader
        title={`Halo, ${nickname}! 👋`}
        subtitle="Dashboard finansial & insight santai buat kawal masa depan lo."
        actions={
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Semua sistem normal</span>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Bento Row 1: KPI & Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Bento Cell 1: Saldo Bersih */}
          <div className={`${BENTO_CARD_CLASS} flex flex-col justify-between space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-blue-500" />
                <span>Saldo Bersih</span>
              </span>
              <span
                title="Akumulasi seluruh pemasukan dikurangi pengeluaran"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
              >
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight money ${
                  financialData.netBalance >= 0
                    ? "text-slate-900 dark:text-white"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {rupiah(financialData.netBalance)}
              </h2>
            </div>

            <div className="pt-1">
              <Link
                href="/pemasukan"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Cell 2: Total Pemasukan */}
          <div className={`${BENTO_CARD_CLASS} flex flex-col justify-between space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Total Pemasukan</span>
              </span>
              <span
                title="Total uang masuk yang sudah tercatat"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
              >
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 money">
                +{rupiah(financialData.income)}
              </h2>
            </div>

            <div className="pt-1">
              <Link
                href="/pemasukan"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <span>+ Catat Masuk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Cell 3: Total Pengeluaran */}
          <div className={`${BENTO_CARD_CLASS} flex flex-col justify-between space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                <span>Total Pengeluaran</span>
              </span>
              <span
                title="Total uang keluar yang sudah tercatat"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
              >
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white money">
                -{rupiah(financialData.expense)}
              </h2>
            </div>

            <div className="pt-1">
              <Link
                href="/pengeluaran"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <span>- Catat Keluar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Cell 4: Streak Hemat */}
          <div className={`${BENTO_CARD_CLASS} flex flex-col justify-between space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak Hemat</span>
              </span>
              <span
                title="Hari beruntun disiplin tanpa melebihi jatah harian"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
              >
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white money">
                {financialData.streakDays}
              </h2>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Hari
              </span>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  financialData.todaySpent > financialData.dailyAllowance
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>
                  {financialData.todaySpent > financialData.dailyAllowance
                    ? "Jatah Terlewati"
                    : "On Track"}
                </span>
              </span>

              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pertahankan! →
              </span>
            </div>
          </div>
        </div>

        {/* Bento Row 2: Category Pie Charts (Pemasukan vs Pengeluaran) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pie Chart Pemasukan */}
          <CategoryPieChart
            title="Pemasukan per Kategori"
            subtitle="Distribusi sumber dana dan pendapatan kamu"
            data={incomeCategoryData}
            type="income"
          />

          {/* Pie Chart Pengeluaran */}
          <CategoryPieChart
            title="Pengeluaran per Kategori"
            subtitle="Distribusi pos belanja dan konsumsi kamu"
            data={expenseCategoryData}
            type="expense"
          />
        </div>

        {/* Bento Row 3: FinBot Insight & Jatah Ring Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* FinBot Daily Insight Bento (2 cols) */}
          <div className="lg:col-span-2">
            <GenZInsightCard nickname={nickname} insight={financialData.insight} />
          </div>

          {/* Daily Allowance Ring Bento (1 col) */}
          <div className="lg:col-span-1">
            <DailyAllowanceRing
              dailyAllowance={financialData.dailyAllowance}
              todaySpent={financialData.todaySpent}
            />
          </div>
        </div>

        {/* Bento Row 4: Recent Transactions & Priority Wishlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Riwayat Transaksi Terbaru (2 cols) */}
          <div className={`lg:col-span-2 ${BENTO_CARD_CLASS} space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Transaksi Terbaru
                </h3>
                <span
                  title="Riwayat transaksi terkini yang tercatat"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
              </div>

              <Link
                href="/pengeluaran"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table Column Header Labels */}
            <div className="hidden sm:grid grid-cols-12 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 py-1">
              <div className="col-span-5">Transaksi</div>
              <div className="col-span-3 text-center">Status</div>
              <div className="col-span-2 text-center">Kategori</div>
              <div className="col-span-2 text-right">Nominal</div>
            </div>

            {/* Transactions List */}
            {financialData.recentTx.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold">Belum ada transaksi tercatat</p>
                <p className="text-[11px] mt-0.5 text-slate-400">
                  Mulai catat lewat menu Pemasukan atau Pengeluaran!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {financialData.recentTx.map((tx) => {
                  const isInc = tx.type === "income";
                  return (
                    <div
                      key={tx.id}
                      className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      {/* Transaction Name & Date */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-[40%]">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isInc
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {isInc ? "+" : "-"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {tx.itemName}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                            {shortDate(tx.transactionDate)}
                          </p>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className="hidden sm:flex items-center justify-center flex-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1.5 ${
                            isInc
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{isInc ? "Pemasukan" : "Pengeluaran"}</span>
                        </span>
                      </div>

                      {/* Category */}
                      <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 text-center flex-1 truncate">
                        {tx.category}
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-bold money ${
                            isInc
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {isInc ? "+" : "-"}
                          {rupiah(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Feature Navigation Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <Link
                href="/pemasukan"
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500/50 shadow-xs transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Pemasukan
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Bicara / Scan / Manual
                </p>
              </Link>

              <Link
                href="/pengeluaran"
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-rose-500/50 shadow-xs transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Pengeluaran
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Bicara / Scan / Manual
                </p>
              </Link>

              <Link
                href="/wishlist"
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-500/50 shadow-xs transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Wishlist
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Target & Proyeksi
                </p>
              </Link>

              <Link
                href="/copilot"
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-500/50 shadow-xs transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  FinBot Copilot
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Tanya Finansial
                </p>
              </Link>
            </div>
          </div>

          {/* Wishlist Prioritas Highlight Bento (1 col) */}
          <div className={`lg:col-span-1 ${BENTO_CARD_CLASS} flex flex-col justify-between space-y-4`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Wishlist Prioritas
                  </h3>
                  <span
                    title="Target barang impian yang sedang dikawal tabungannya"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Menu wishlist"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {financialData.topWishlist ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {financialData.topWishlist.name}
                    </h4>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white money mt-0.5">
                      {rupiah(financialData.topWishlist.targetPrice)}
                    </p>
                  </div>

                  {topProjection && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          {topProjection.status === "achievable_now"
                            ? "Tabungan Sudah Cukup! 🎉"
                            : topProjection.status === "delayed"
                            ? "Tertunda (Rem Belanja Dulu)"
                            : `Estimasi ~${topProjection.estimatedDays} hari lagi 🎯`}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {topProjection.status === "delayed"
                          ? "Pengeluaran melebihi laju tabungan"
                          : "Berdasarkan saldo akumulasi & laju tabungan"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 dark:text-slate-500 space-y-1.5">
                  <p className="text-xs font-medium">Belum ada target wishlist</p>
                  <p className="text-[11px]">
                    Catat barang impian lo biar FinBot bantu hitung target ketercapaiannya!
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/wishlist"
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors block"
            >
              Buka Wishlist
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
