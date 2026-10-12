"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Clock,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Gift,
  Receipt,
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

    return {
      allIncome,
      allExpense,
      displayBalance,
      displayIncome,
      displayExpense,
      todaySpent: todayExpense,
      dailyAllowance,
      streakDays: streakSummary.currentStreak,
      topWishlist,
      insight,
      recentTx,
    };
  }, [transactions, wishlists, nickname, saldoFilter]);

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
          
          {/* ROW 1: FinBot Daily Insight (Paling Atas, tinggi sama dengan card Saldo Bersih) */}
          <div className="w-full animate-content-in">
            <GenZInsightCard nickname={nickname} insight={financialData.insight} />
          </div>

          {/* Main 2-Column Split: Sisi Kiri Konten Utama & Sisi Kanan Widget Vertikal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* SISI KIRI (lg:col-span-8 space-y-6) */}
            <div className="lg:col-span-8 space-y-6">

              {/* BARIS METRIK: Saldo Bersih & Total Pemasukan di atas Total Pengeluaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* CARD 1: Saldo Bersih */}
                <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group min-h-[178px]">
                  {/* Transparent Watermark Icon */}
                  <Wallet
                    className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                    strokeWidth={1.5}
                  />

                  {/* Header with Saldo Filter Toggle */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Saldo Bersih
                      </h3>
                    </div>

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
                  </div>

                  {/* Metric Numeral */}
                  <div className="space-y-1 relative z-10 animate-content-in">
                    <h2
                      className={`text-2xl sm:text-3xl font-extrabold tracking-tight money ${
                        financialData.displayBalance >= 0
                          ? "text-slate-900 dark:text-white"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {rupiah(financialData.displayBalance)}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>+12%</span>
                      <span className="text-slate-400 font-normal">
                        {saldoFilter === "month" ? "vs bulan lalu" : "terakumulasi"}
                      </span>
                    </div>
                  </div>

                  {/* Context Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                    <span>Periode:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {saldoFilter === "month" ? "Bulan Berjalan" : "Semua Waktu"}
                    </span>
                  </div>
                </div>

                {/* CARD 2: Total Pemasukan */}
                <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group min-h-[178px]">
                  {/* Transparent Panah Naik Watermark */}
                  <ArrowUpRight
                    className="absolute -right-3 -bottom-3 w-28 h-28 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                    strokeWidth={1.5}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Total Pemasukan
                      </h3>
                    </div>
                    <Link
                      href="/pemasukan"
                      title="Lihat Detail Pemasukan"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Metric Numeral */}
                  <div className="space-y-1 relative z-10 animate-content-in">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight money text-emerald-600 dark:text-emerald-400">
                      +{rupiah(financialData.displayIncome)}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px]">
                        Aktif
                      </span>
                      <span className="text-slate-400 font-normal">
                        {incomeCategoryData.length} pos pendapatan
                      </span>
                    </div>
                  </div>

                  {/* Context Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                    <span>Status Arus Kas:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Positif & Bertambah
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 3: Total Pengeluaran (Tepat di Bawah Saldo Bersih & Total Pemasukan) */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group w-full">
                {/* Transparent Panah Turun Watermark */}
                <ArrowDownRight
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-rose-500/10 dark:text-rose-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />

                {/* Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Total Pengeluaran
                    </h3>
                  </div>
                  <Link
                    href="/pengeluaran"
                    title="Lihat Detail Pengeluaran"
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>
                </div>

                {/* Metric Numeral & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center relative z-10 animate-content-in">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight money text-slate-900 dark:text-white">
                      -{rupiah(financialData.displayExpense)}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                        Hari Ini
                      </span>
                      <span className="text-slate-400 font-normal">
                        {rupiah(financialData.todaySpent)} terpakai
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <p className="text-[11px] text-slate-400">Efisiensi Konsumsi:</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        financialData.todaySpent > financialData.dailyAllowance
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {financialData.todaySpent > financialData.dailyAllowance
                        ? "Melebihi Jatah"
                        : "Terkendali"}
                    </span>
                  </div>
                </div>

                {/* Context Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                  <span>Cakupan Periode:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {saldoFilter === "month" ? "Bulan Berjalan" : "Semua Waktu"}
                  </span>
                </div>
              </div>
              
              {/* CARD: 12-Month Bar Chart (MAU & Cohort Trends Style) */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xs space-y-5 flex flex-col justify-between glass-sheen relative overflow-hidden group">
                {/* Transparent BarChart3 Watermark */}
                <BarChart3
                  className="absolute -right-3 -bottom-3 w-32 h-32 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
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

              {/* CARD: Riwayat Transaksi Terbaru (Tepat di bawah dan ukuran lebar yang sama dengan tren transaksi) */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xs space-y-4 glass-sheen relative overflow-hidden group">
                {/* Transparent Receipt Watermark */}
                <Receipt
                  className="absolute -right-3 -bottom-3 w-32 h-32 text-slate-400/5 dark:text-slate-300/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />

                <div className="flex items-center justify-between relative z-10">
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
                  <div className="space-y-2.5 animate-content-in animate-content-delay-1 relative z-10">
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

            {/* SISI KANAN: Wishlist Prioritas, Jatah Harian, Pemasukan per Kategori, Pengeluaran per Kategori (lg:col-span-4 space-y-6) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* CARD: Wishlist Prioritas */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3 glass-sheen relative overflow-hidden group">
                {/* Transparent Gift Watermark */}
                <Gift
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-amber-500/5 dark:text-amber-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />

                <div className="flex items-center justify-between relative z-10">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Wishlist Prioritas
                  </h3>
                  <Link href="/wishlist" title="Buka Wishlist" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
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

              {/* CARD: Status Jatah Harian (Dipindahkan ke bawah card wishlist) */}
              <div className="animate-content-in animate-content-delay-1">
                <DailyAllowanceRing
                  dailyAllowance={financialData.dailyAllowance}
                  todaySpent={financialData.todaySpent}
                />
              </div>

              {/* CARD: Pemasukan per Kategori (styled like Distribusi Kategori Utama) */}
              <div className="animate-content-in animate-content-delay-2">
                <CategoryPieChart
                  title="Pemasukan per Kategori"
                  subtitle="Distribusi sumber pendapatan kamu"
                  data={incomeCategoryData}
                  type="income"
                />
              </div>

              {/* CARD: Pengeluaran per Kategori (styled like Distribusi Kategori Utama) */}
              <div className="animate-content-in animate-content-delay-3">
                <CategoryPieChart
                  title="Pengeluaran per Kategori"
                  subtitle="Distribusi pos belanja dan konsumsi kamu"
                  data={expenseCategoryData}
                  type="expense"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
