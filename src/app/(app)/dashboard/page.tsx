"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Info,
  ArrowRight,
  MoreHorizontal,
  ChevronRight,
  Calendar,
  Sparkles,
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
import { StreakWidget } from "@/components/dashboard/streak-widget";

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top 4 Metric Cards (Clean Treehouse QA Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Saldo Bersih */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Saldo Bersih
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

            <div className="pt-2">
              <Link
                href="/pemasukan"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Total Pemasukan */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Pemasukan
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

            <div className="pt-2">
              <Link
                href="/pemasukan"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <span>+ Catat Masuk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Total Pengeluaran */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Pengeluaran
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

            <div className="pt-2">
              <Link
                href="/pengeluaran"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <span>- Catat Keluar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Streak Hemat */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Streak Hemat
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

            <div className="pt-2 flex items-center justify-between">
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

        {/* Main Content Grid (Split 2:1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gen-Z Daily Insight Card */}
            <GenZInsightCard nickname={nickname} insight={financialData.insight} />

            {/* Riwayat Transaksi Card (Treehouse List Style) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
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
                <div className="py-10 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium">Belum ada transaksi tercatat</p>
                  <p className="text-xs mt-1 text-slate-400">
                    Mulai catat lewat menu Pemasukan atau Pengeluaran!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {financialData.recentTx.map((tx) => {
                    const isInc = tx.type === "income";
                    return (
                      <div
                        key={tx.id}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                      >
                        {/* Transaction Name & Date */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-[40%]">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isInc
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {isInc ? "+" : "-"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {tx.itemName}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              {shortDate(tx.transactionDate)}
                            </p>
                          </div>
                        </div>

                        {/* Status Pill (Treehouse QA Passing Pill style) */}
                        <div className="hidden sm:flex items-center justify-center flex-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
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
                            className={`text-sm font-bold money ${
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
            </div>

            {/* Quick Feature Navigation Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/pemasukan"
                className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Pemasukan
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Bicara / Scan / Manual
                </p>
              </Link>

              <Link
                href="/pengeluaran"
                className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 shadow-sm transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Pengeluaran
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Bicara / Scan / Manual
                </p>
              </Link>

              <Link
                href="/wishlist"
                className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 shadow-sm transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Wishlist
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Target & Proyeksi
                </p>
              </Link>

              <Link
                href="/copilot"
                className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 shadow-sm transition-all text-center group"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  FinBot Copilot
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Tanya Duit Lo
                </p>
              </Link>
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Circular Donut Ring: Status Jatah Harian */}
            <DailyAllowanceRing
              dailyAllowance={financialData.dailyAllowance}
              todaySpent={financialData.todaySpent}
            />

            {/* Top Wishlist Highlight Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
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
                              ? "Tertunda (Rem Belanja Dulu) ⏳"
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
      </div>
    </>
  );
}
