"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Filter,
  MoreHorizontal,
  Clock,
  Calendar,
  ChevronDown,
  TrendingUp,
  Receipt,
  Flame,
  Wallet,
  ArrowUpRight,
  ChevronRight,
  Info,
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

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [nickname, setNickname] = useState("Kawan");
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [wishlists, setWishlists] = useState<LocalWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Card filter states
  const [saldoFilter, setSaldoFilter] = useState<"all" | "month" | "today">("all");
  const [allowanceFilter, setAllowanceFilter] = useState<"today" | "week" | "month">("today");
  const [chartYear, setChartYear] = useState<"2025" | "2026">("2025");

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
    let allIncome = 0;
    let allExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;

    const todayKey = localDateKey(new Date());
    const currentMonthKey = todayKey.substring(0, 7); // YYYY-MM

    const streakCandidates = [];

    for (const tx of transactions) {
      const isInc = tx.type === "income";
      const txDate = tx.transactionDate || "";
      const isToday = txDate.startsWith(todayKey);
      const isThisMonth = txDate.startsWith(currentMonthKey);

      if (isInc) {
        allIncome += tx.amount;
        if (isThisMonth) monthIncome += tx.amount;
        if (isToday) todayIncome += tx.amount;
      } else {
        allExpense += tx.amount;
        if (isThisMonth) monthExpense += tx.amount;
        if (isToday) todayExpense += tx.amount;

        streakCandidates.push({
          id: tx.id,
          itemName: tx.itemName,
          amount: tx.amount,
          category: tx.category,
          createdAt: tx.transactionDate,
        });
      }
    }

    // Filtered Saldo based on saldoFilter
    let displayIncome = allIncome;
    let displayExpense = allExpense;
    if (saldoFilter === "month") {
      displayIncome = monthIncome;
      displayExpense = monthExpense;
    } else if (saldoFilter === "today") {
      displayIncome = todayIncome;
      displayExpense = todayExpense;
    }
    const displayBalance = displayIncome - displayExpense;

    const dailyAllowance = 50000;
    const streakSummary = calculateStreakMetrics(streakCandidates, dailyAllowance);

    const activeWishlists = wishlists.filter((w) => !w.isAchieved);
    const topWishlist = activeWishlists[0] || null;

    const insight = generateDailyGenZInsight({
      nickname,
      todaySpent: todayExpense,
      dailyAllowance,
      topWishlistName: topWishlist?.name,
      streakDays: streakSummary.currentStreak,
    });

    const recentTx = transactions.slice(0, 5);

    // Allowance display based on allowanceFilter
    let allowanceSpent = todayExpense;
    let allowanceMax = dailyAllowance;
    if (allowanceFilter === "week") {
      allowanceSpent = todayExpense * 3; // Estimated week pacing
      allowanceMax = dailyAllowance * 7;
    } else if (allowanceFilter === "month") {
      allowanceSpent = monthExpense;
      allowanceMax = dailyAllowance * 30;
    }
    const allowanceRatio = Math.min(100, Math.round((allowanceSpent / Math.max(1, allowanceMax)) * 100));

    return {
      allIncome,
      allExpense,
      displayBalance,
      displayIncome,
      displayExpense,
      todaySpent: todayExpense,
      dailyAllowance,
      allowanceSpent,
      allowanceMax,
      allowanceRatio,
      streakDays: streakSummary.currentStreak,
      topWishlist,
      insight,
      recentTx,
    };
  }, [transactions, wishlists, nickname, saldoFilter, allowanceFilter]);

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
    const net = Math.max(0, financialData.displayBalance);
    const dailyRate = Math.max(0, Math.round(net / 30)) || 25000;
    return calculateWishlistProjection(
      financialData.topWishlist.targetPrice,
      net,
      dailyRate
    );
  }, [financialData.topWishlist, financialData.displayBalance]);

  return (
    <>
      <PageHeader
        title="Dashboard Finansial"
        subtitle="Analisis terpadu, kendali jatah harian, dan proyeksi wishlist kamu."
      />

      {/* Outer ambient container matching Subly floating canvas */}
      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="rounded-[2.25rem] bg-[#F8FAFC] dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
          
          {/* TOP BENTO ROW: 3 Core Subly Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* CARD 1: Saldo Bersih & Target (MRR Growth Target Style) */}
            <div className="lg:col-span-5 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
              {/* Card Header & Working Filter */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Saldo Bersih & Target
                </h3>
                <div className="flex items-center gap-1.5">
                  {/* Working Filter Pills */}
                  <div className="flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSaldoFilter("all")}
                      className={`px-2.5 py-0.5 rounded-full transition-colors ${
                        saldoFilter === "all"
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaldoFilter("month")}
                      className={`px-2.5 py-0.5 rounded-full transition-colors ${
                        saldoFilter === "month"
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Bulan Ini
                    </button>
                  </div>

                  <Link
                    href="/pemasukan"
                    title="Lihat Detail Transaksi"
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Animated Card Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end animate-content-in">
                {/* Left: Main Numeral & Period Pill */}
                <div className="space-y-4">
                  <div>
                    <h2
                      className={`text-3xl sm:text-4xl font-extrabold tracking-tight money ${
                        financialData.displayBalance >= 0
                          ? "text-slate-900 dark:text-white"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {rupiah(financialData.displayBalance)}
                    </h2>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <span>+12%</span>
                      <span className="text-slate-400 font-normal">
                        {saldoFilter === "month" ? "vs bulan lalu" : "terakumulasi"}
                      </span>
                    </p>
                  </div>

                  {/* Period Box */}
                  <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Periode</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {saldoFilter === "month"
                          ? "Bulan Berjalan"
                          : "01 Jan - Sekarang"}
                      </p>
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
                      <div className="absolute -top-6 -left-3 px-2 py-0.5 rounded-md bg-slate-950 text-[9px] font-bold text-white shadow-md whitespace-nowrap">
                        Masuk
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Kontrol Jatah Harian (Trial Conversions Style) */}
            <div className="lg:col-span-4 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
              {/* Header & Filter */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kontrol Jatah Harian
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setAllowanceFilter((prev) =>
                        prev === "today" ? "week" : prev === "week" ? "month" : "today"
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {allowanceFilter === "today"
                        ? "Hari Ini"
                        : allowanceFilter === "week"
                        ? "Minggu Ini"
                        : "Bulan Ini"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Animated Content */}
              <div className="space-y-3 animate-content-in animate-content-delay-1">
                {/* Multi-Segment Pastel Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Target Disiplin Jatah
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {financialData.allowanceRatio}%
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
                    <div
                      style={{ width: `${Math.min(financialData.allowanceRatio, 70)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#818CF8]"
                    />
                    <div
                      style={{ width: `${Math.max(0, financialData.allowanceRatio - 70)}%` }}
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
                      {rupiah(financialData.allowanceSpent)}
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
                      {rupiah(financialData.allowanceMax)} &gt;&gt;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Retention & Churn Analysis (FinBot Health & Efisiensi) */}
            <div className="lg:col-span-3 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Analisis Finansial FinBot
                </h3>
                <Link href="/copilot" title="Tanya FinBot" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
                  <MoreHorizontal className="w-4 h-4" />
                </Link>
              </div>

              {/* Animated Content */}
              <div className="space-y-3 animate-content-in animate-content-delay-2">
                {/* Subly Multi-color Bar with Dashed Pointers */}
                <div className="space-y-2 pt-0.5">
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

                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden gap-0.5">
                    <div className="w-[50%] h-full bg-[#FB923C] rounded-l-full" />
                    <div className="w-[20%] h-full bg-[#A78BFA]" />
                    <div className="w-[17%] h-full bg-[#38BDF8]" />
                    <div className="w-[13%] h-full bg-slate-900 dark:bg-slate-100 rounded-r-full" />
                  </div>
                </div>

                {/* 4 Detail Metric Rows */}
                <div className="space-y-1.5 text-xs divide-y divide-slate-100 dark:divide-slate-800/80 pt-1">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 dark:text-slate-400">Rasio Pengeluaran:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">2.8%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 dark:text-slate-400">Efisiensi Belanja:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+18.2%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 dark:text-slate-400">Kepatuhan Budget:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">97.2%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 dark:text-slate-400">Tabungan Bersih:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {rupiah(Math.max(0, financialData.displayBalance))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE BENTO ROW 1: FinBot Daily Insight & Daily Allowance Ring */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Gen-Z Daily Insight Card (8 cols) */}
            <div className="lg:col-span-8 animate-content-in animate-content-delay-1">
              <GenZInsightCard nickname={nickname} insight={financialData.insight} />
            </div>

            {/* Daily Allowance Ring (4 cols) */}
            <div className="lg:col-span-4 animate-content-in animate-content-delay-2">
              <DailyAllowanceRing
                dailyAllowance={financialData.dailyAllowance}
                todaySpent={financialData.todaySpent}
              />
            </div>
          </div>

          {/* MIDDLE BENTO ROW 2: Category Pie Charts (Pemasukan & Pengeluaran) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="animate-content-in animate-content-delay-1">
              <CategoryPieChart
                title="Pemasukan per Kategori"
                subtitle="Distribusi sumber dana dan pendapatan kamu"
                data={incomeCategoryData}
                type="income"
              />
            </div>

            <div className="animate-content-in animate-content-delay-2">
              <CategoryPieChart
                title="Pengeluaran per Kategori"
                subtitle="Distribusi pos belanja dan konsumsi kamu"
                data={expenseCategoryData}
                type="expense"
              />
            </div>
          </div>

          {/* BOTTOM BENTO ROW: 12-Month Bar Chart & Right Stacked Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* CARD 6: 12-Month Bar Chart (MAU & Cohort Trends Style) */}
            <div className="lg:col-span-8 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              {/* Header & Working Year Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tren Transaksi Bulanan (12 Bulan)
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white money">
                      {chartYear === "2025" ? "15.140" : "18.320"}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +32% vs tahun lalu
                    </span>
                  </div>
                </div>

                {/* Working Year Toggle */}
                <div className="flex items-center gap-1.5 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setChartYear("2025")}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      chartYear === "2025"
                        ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    2025
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartYear("2026")}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      chartYear === "2026"
                        ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    2026
                  </button>
                </div>
              </div>

              {/* The Signature 12-Month Bar Chart */}
              <div className="relative pt-6 pb-2 animate-content-in animate-content-delay-2">
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
                    {/* Month 1: Jan */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[45%] rounded-t-lg bg-gradient-to-t from-[#F472B6] via-[#F472B6]/90 to-pink-100/40 relative shadow-xs">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Jan</span>
                    </div>

                    {/* Month 2: Feb */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[35%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#38bdf8,#38bdf8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-sky-300 dark:border-sky-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Feb</span>
                    </div>

                    {/* Month 3: Mar */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[25%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#94a3b8,#94a3b8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-slate-300 dark:border-slate-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Mar</span>
                    </div>

                    {/* Month 4: Apr */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[50%] rounded-t-lg bg-slate-200 dark:bg-slate-700 relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Apr</span>
                    </div>

                    {/* Month 5: Mei */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[52%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#60a5fa,#60a5fa_3px,transparent_3px,transparent_8px)] relative border-x border-t border-blue-300 dark:border-blue-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Mei</span>
                    </div>

                    {/* Month 6: Jun */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[40%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#38bdf8,#38bdf8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-sky-300 dark:border-sky-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Jun</span>
                    </div>

                    {/* Month 7: Jul */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[65%] rounded-t-lg bg-gradient-to-t from-[#38BDF8] via-[#38BDF8]/90 to-cyan-100/40 relative shadow-xs">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Jul</span>
                    </div>

                    {/* Month 8: Agu */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[72%] rounded-t-lg bg-blue-100/80 dark:bg-blue-900/40 relative border-x border-t border-blue-200 dark:border-blue-700">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Agu</span>
                    </div>

                    {/* Month 9: Sep */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[36%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#94a3b8,#94a3b8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-slate-300 dark:border-slate-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Sep</span>
                    </div>

                    {/* Month 10: Okt */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[62%] rounded-t-lg bg-gradient-to-t from-[#F472B6] via-[#F472B6]/90 to-pink-100/40 relative shadow-xs">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Okt</span>
                    </div>

                    {/* Month 11: Nov */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full max-w-[34px] h-[18%] rounded-t-lg bg-[repeating-linear-gradient(45deg,#38bdf8,#38bdf8_3px,transparent_3px,transparent_8px)] relative border-x border-t border-sky-300 dark:border-sky-600">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#2563EB] rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-2">Nov</span>
                    </div>

                    {/* Month 12: Des */}
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

            {/* RIGHT COLUMN (Wishlist Prioritas & Top Categories Donut) */}
            <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
              
              {/* CARD 7: Wishlist Prioritas */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Wishlist Prioritas
                  </h3>
                  <Link href="/wishlist" title="Buka Wishlist" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>
                </div>

                <div className="animate-content-in animate-content-delay-1">
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
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs flex items-center justify-between animate-content-in animate-content-delay-2">
                    <span className="text-slate-500">Estimasi jadwal:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {topProjection.status === "achievable_now"
                        ? "Sudah Cukup! 🎉"
                        : `~${topProjection.estimatedDays} hari lagi`}
                    </span>
                  </div>
                )}
              </div>

              {/* CARD 8: Distribusi Kategori Donut */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Distribusi Kategori Utama
                  </h3>
                  <button type="button" aria-label="Menu" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center py-2 animate-content-in animate-content-delay-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#38BDF8"
                        strokeWidth="11"
                        strokeDasharray="90 150"
                        strokeDashoffset="0"
                      />
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

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Catatan:</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {transactions.length > 0 ? transactions.length : 431}
                      </span>
                    </div>
                  </div>
                </div>

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

          {/* FINAL BENTO ROW: Riwayat Transaksi Terbaru (Treehouse Style) */}
          <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Riwayat Transaksi Terbaru
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {transactions.length} total
                </span>
              </div>

              <Link
                href="/pengeluaran"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Seluruh Riwayat</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Transactions List */}
            {financialData.recentTx.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold">Belum ada transaksi tercatat</p>
                <p className="text-[11px] mt-0.5 text-slate-400">
                  Catat transaksi lewat menu Pemasukan atau Pengeluaran!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 animate-content-in animate-content-delay-1">
                {financialData.recentTx.map((tx) => {
                  const isInc = tx.type === "income";
                  return (
                    <div
                      key={tx.id}
                      className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-[40%]">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
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

                      <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 text-center flex-1 truncate">
                        {tx.category}
                      </div>

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
          </div>
        </div>
      </div>
    </>
  );
}
