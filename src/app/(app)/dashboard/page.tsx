"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Filter,
  MoreHorizontal,
  Clock,
  Maximize2,
  Calendar,
  ChevronDown,
  TrendingUp,
  Receipt,
  Flame,
  Wallet,
  ArrowUpRight,
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

  // Calculate expense vs allowance ratio
  const allowancePercent = Math.min(
    100,
    Math.round((financialData.todaySpent / financialData.dailyAllowance) * 100)
  );

  return (
    <>
      <PageHeader
        title={`Dashboard Finansial`}
        subtitle="Pantau performa saldo, jatah harian, dan target impian kamu."
      />

      {/* Outer ambient container matching Subly floating canvas */}
      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="rounded-[2.25rem] bg-[#F8FAFC] dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
          
          {/* TOP BENTO ROW: 3 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* CARD 1: Saldo Bersih & Target (MRR Growth Target Style) - 4 cols */}
            <div className="lg:col-span-5 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Saldo Bersih & Target
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Semua
                  </span>
                  <button type="button" aria-label="Menu" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <button type="button" aria-label="Filter" className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 pl-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Stat & Mini Bar Graphic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                {/* Left: Main Numeral & Period Pill */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white money">
                      {rupiah(financialData.netBalance)}
                    </h2>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <span>+12%</span>
                      <span className="text-slate-400 font-normal">vs bulan lalu</span>
                    </p>
                  </div>

                  {/* Period Box */}
                  <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Periode</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">01 Jan - Sekarang</p>
                    </div>
                  </div>
                </div>

                {/* Right: Subly Statistic Brand Mini Chart */}
                <div className="flex flex-col items-center justify-end h-36 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 relative">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 self-start">
                    Rasio Pos Dana
                  </p>

                  <div className="flex items-end justify-center gap-4 w-full h-24 pb-1 relative">
                    {/* Pink Gradient Bar */}
                    <div className="w-7 h-16 rounded-t-lg bg-gradient-to-t from-[#F472B6] via-[#F472B6]/80 to-pink-100/40 relative shadow-sm">
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                    </div>

                    {/* Cyan Gradient Bar with Black Tooltip */}
                    <div className="w-7 h-20 rounded-t-lg bg-gradient-to-t from-[#38BDF8] via-[#38BDF8]/80 to-cyan-100/40 relative shadow-sm">
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      {/* Subly black pill tooltip */}
                      <div className="absolute -top-6 -left-3 px-2 py-0.5 rounded-md bg-slate-950 text-[9px] font-bold text-white shadow-md whitespace-nowrap">
                        Masuk
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Kontrol Jatah Harian (Trial Conversions Style) - 4 cols */}
            <div className="lg:col-span-4 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kontrol Jatah Harian
                </h3>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Hari Ini</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
              </div>

              {/* Multi-Segment Pastel Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Target Disiplin Jatah</span>
                  <span className="font-bold text-slate-900 dark:text-white">{allowancePercent}%</span>
                </div>

                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    style={{ width: `${Math.min(allowancePercent, 70)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#818CF8]"
                  />
                  <div
                    style={{ width: `${Math.max(0, allowancePercent - 70)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#38BDF8] to-[#60A5FA]"
                  />
                </div>

                <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
                  <span>0%</span>
                  <span>25%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 3 Mini Sub-Cards Row */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                  <p className="text-[10px] text-slate-400 font-medium truncate">Pengeluaran</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {rupiah(financialData.todaySpent)}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                  <p className="text-[10px] text-slate-400 font-medium truncate">Streak</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {financialData.streakDays} Hari
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center flex flex-col justify-between">
                  <p className="text-[10px] text-slate-400 font-medium truncate">Jatah Max</p>
                  <span className="inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 mt-1">
                    50rb &gt;&gt;
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: Retention & Churn Analysis (FinBot Health & Efisiensi) - 3 cols */}
            <div className="lg:col-span-3 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Analisis Finansial FinBot
                </h3>
                <button type="button" aria-label="Menu" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Subly Multi-color Bar with Dashed Pointers */}
              <div className="space-y-2 pt-1">
                {/* Badges on dashed lines */}
                <div className="flex justify-between px-2 text-[10px] font-bold">
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    50%
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    20%
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                    17%
                  </span>
                </div>

                {/* Segmented Pill Bar */}
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden gap-0.5">
                  <div className="w-[50%] h-full bg-[#FB923C] rounded-l-full" />
                  <div className="w-[20%] h-full bg-[#A78BFA]" />
                  <div className="w-[17%] h-full bg-[#38BDF8]" />
                  <div className="w-[13%] h-full bg-slate-900 dark:bg-slate-100 rounded-r-full" />
                </div>
              </div>

              {/* 4 Detail Metric Rows */}
              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/80 pt-1">
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Rasio Pengeluaran:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">2.8%</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Efisiensi Belanja:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+18.2%</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Kepatuhan Budget:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">97.2%</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Tabungan Bersih:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {rupiah(Math.max(0, financialData.netBalance))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BENTO ROW: 12-Month Bar Chart & Right Stacked Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* CARD 4: 12-Month Bar Chart (MAU & Cohort Trends Style) - 8 cols */}
            <div className="lg:col-span-8 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tren Transaksi Bulanan (12 Bulan)
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white money">
                      15.140
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +32% vs bulan lalu
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <span>2025</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </div>

              {/* The Signature 12-Month Bar Chart from Reference Image */}
              <div className="relative pt-6 pb-2">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                </div>

                {/* Y-Axis Labels & Bars */}
                <div className="flex items-end gap-2 sm:gap-3 h-52 sm:h-60 w-full relative z-10">
                  {/* Y Axis percentage markers */}
                  <div className="flex flex-col justify-between h-full text-[10px] font-semibold text-slate-400 pr-1 pb-6 shrink-0">
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                  </div>

                  {/* 12 Bars Container */}
                  <div className="flex-1 h-full flex items-end justify-between gap-1 sm:gap-2 pb-6">
                    {/* Month 1: Jan - Pink Gradient */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[45%] rounded-t-lg bg-gradient-to-t from-[#F472B6] via-[#F472B6]/90 to-pink-100/40 relative shadow-xs">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Jan</span>
                    </div>

                    {/* Month 2: Feb - Cyan Striped Hatch */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[35%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#38bdf8,#38bdf8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-sky-300 dark:border-sky-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Feb</span>
                    </div>

                    {/* Month 3: Mar - Grey Striped Hatch */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[25%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#94a3b8,#94a3b8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-slate-300 dark:border-slate-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Mar</span>
                    </div>

                    {/* Month 4: Apr - Soft Blue Solid Pastel */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[50%] rounded-t-lg bg-slate-200 dark:bg-slate-700 relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Apr</span>
                    </div>

                    {/* Month 5: Mei - Striped Blue */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[52%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#60a5fa,#60a5fa_3px,transparent_3px,transparent_8px)] relative border-x border-t border-blue-300 dark:border-blue-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Mei</span>
                    </div>

                    {/* Month 6: Jun - Cyan Striped */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[40%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#38bdf8,#38bdf8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-sky-300 dark:border-sky-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Jun</span>
                    </div>

                    {/* Month 7: Jul - Cyan Gradient */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[65%] rounded-t-lg bg-gradient-to-t from-[#38BDF8] via-[#38BDF8]/90 to-cyan-100/40 relative shadow-xs">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Jul</span>
                    </div>

                    {/* Month 8: Agu - Tall Pastel Lavender-Blue */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[72%] rounded-t-lg bg-blue-100/80 dark:bg-blue-900/40 relative border-x border-t border-blue-200 dark:border-blue-700">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Agu</span>
                    </div>

                    {/* Month 9: Sep - Grey Striped */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[36%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#94a3b8,#94a3b8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-slate-300 dark:border-slate-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Sep</span>
                    </div>

                    {/* Month 10: Okt - Pink Gradient */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[62%] rounded-t-lg bg-gradient-to-t from-[#F472B6] via-[#F472B6]/90 to-pink-100/40 relative shadow-xs">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Okt</span>
                    </div>

                    {/* Month 11: Nov - Cyan Striped */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[18%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#38bdf8,#38bdf8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-sky-300 dark:border-sky-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Nov</span>
                    </div>

                    {/* Month 12: Des - Sky Blue Pastel */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[30%] rounded-t-lg bg-sky-100/90 dark:bg-sky-950/60 relative border-x border-t border-sky-300 dark:border-sky-700">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Des</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (2 Cards Stacked): Projected LTV & Top 3 Channels - 4 cols */}
            <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
              
              {/* CARD 5: Wishlist Prioritas (Projected LTV Style) */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Wishlist Prioritas
                  </h3>
                  <button type="button" aria-label="Menu" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white money flex items-center gap-2">
                    <span>{rupiah(financialData.topWishlist?.targetPrice || 15140000)}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      ↑ 3.5%
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {financialData.topWishlist
                      ? `Target tabungan untuk ${financialData.topWishlist.name}`
                      : "Estimasi ketercapaian target tabungan impian kamu."}
                  </p>
                </div>

                {topProjection && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Estimasi jadwal:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {topProjection.status === "achievable_now"
                        ? "Sudah Cukup! 🎉"
                        : `~${topProjection.estimatedDays} hari lagi`}
                    </span>
                  </div>
                )}
              </div>

              {/* CARD 6: Distribusi Kategori (Top 3 Acquisition Channels Donut Style) */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Distribusi Kategori Utama
                  </h3>
                  <button type="button" aria-label="Menu" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Subly Donut Graphic with Center Text */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Segment 1: Cyan (Direct) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#38BDF8"
                        strokeWidth="11"
                        strokeDasharray="90 150"
                        strokeDashoffset="0"
                        className="rounded-full"
                      />
                      {/* Segment 2: Soft Pink (Social Media) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#F472B6"
                        strokeWidth="11"
                        strokeDasharray="75 165"
                        strokeDashoffset="-95"
                      />
                      {/* Segment 3: Cyan Striped / Blue (Referral) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#60A5FA"
                        strokeWidth="11"
                        strokeDasharray="60 180"
                        strokeDashoffset="-175"
                      />
                    </svg>

                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Catatan:</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {transactions.length > 0 ? transactions.length : 431}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend Pills at Bottom */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                    <span>Makanan</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                    <span>Transport</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F472B6]" />
                    <span>Belanja</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
