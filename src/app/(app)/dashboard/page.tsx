"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Clock,
  ChevronRight,
  ChevronLeft,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  BarChart3,
  Gift,
  Receipt,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rupiah, shortDate } from "@/lib/format";
import { localDateKey } from "@/lib/date";
import { useAuthContext } from "@/components/layout/auth-provider";
import { getTransactions, saveTransaction, type LocalTransaction } from "@/lib/storage/transaction-storage";
import { getWishlistItems, type LocalWishlist } from "@/lib/storage/wishlist-storage";
import {
  getWishlistSavingsPercentage,
  WISHLIST_SETTINGS_CHANGED_EVENT,
} from "@/lib/storage/wishlist-settings";
import { calculateStreakMetrics } from "@/lib/financial/streak-engine";
import { generateDailyGenZInsight } from "@/lib/financial/genz-insight-engine";
import { calculateWishlistProjection } from "@/lib/financial/wishlist-engine";
import { GenZInsightCard } from "@/components/dashboard/genz-insight-card";
import { DailyAllowanceRing } from "@/components/dashboard/daily-allowance-ring";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { TransactionBarChart } from "@/components/dashboard/transaction-bar-chart";
import { TransactionActionCards } from "@/components/transaction/transaction-action-cards";
import { ManualTransactionModal } from "@/components/transaction/manual-transaction-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { VoiceTransactionModal } from "@/components/transaction/voice-transaction-modal";
import { OPEN_VOICE_EVENT } from "@/components/layout/app-shell";
import type { TransactionCandidate } from "@/types/financial-types";

const MAX_DASHBOARD_TX = 14;

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [nickname, setNickname] = useState("Kawan");
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [wishlists, setWishlists] = useState<LocalWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal controls
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  useEffect(() => {
    const handleOpenVoice = () => setIsVoiceOpen(true);
    window.addEventListener(OPEN_VOICE_EVENT, handleOpenVoice);
    return () => window.removeEventListener(OPEN_VOICE_EVENT, handleOpenVoice);
  }, []);

  // Card filter states
  const [saldoFilter, setSaldoFilter] = useState<"all" | "month" | "today">("all");
  const [savingsPercentage, setSavingsPercentage] = useState<number>(() => getWishlistSavingsPercentage());

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ percentage: number }>;
      if (customEvent.detail?.percentage) {
        setSavingsPercentage(customEvent.detail.percentage);
      } else {
        setSavingsPercentage(getWishlistSavingsPercentage());
      }
    };

    window.addEventListener(WISHLIST_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
    return () => {
      window.removeEventListener(WISHLIST_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
    };
  }, []);

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

  const handleVoiceSave = async (data: {
    itemName: string;
    amount: number;
    category: string;
    transactionDate: string;
  }) => {
    const saved = await saveTransaction({
      itemName: data.itemName,
      amount: data.amount,
      type: "expense",
      category: data.category,
      source: "voice",
      transactionDate: data.transactionDate,
    });
    setTransactions((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
    await loadData();
  };

  const handleScanConfirmed = async (candidate: TransactionCandidate) => {
    const saved = await saveTransaction({
      itemName: candidate.merchant || "Struk Belanja",
      amount: candidate.amount,
      type: "expense",
      category: candidate.category || "Makanan & Minuman",
      source: "ocr",
      transactionDate: candidate.date,
    });
    setTransactions((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
    await loadData();
  };

  const handleManualSave = async (data: {
    itemName: string;
    amount: number;
    category: string;
    transactionDate: string;
  }) => {
    const saved = await saveTransaction({
      itemName: data.itemName,
      amount: data.amount,
      type: "expense",
      category: data.category,
      source: "manual",
      transactionDate: data.transactionDate,
    });
    setTransactions((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
    await loadData();
  };

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

    // Calculate dynamic daily allowance from actual cashflow
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
    const spendableMonth = monthIncome - (monthExpense - todayExpense);
    const dailyAllowance = monthIncome > 0
      ? Math.max(10000, Math.round(spendableMonth / daysLeft))
      : allIncome > 0
      ? Math.max(10000, Math.round(allIncome / 30))
      : 50000;

    const streakSummary = calculateStreakMetrics(streakCandidates, dailyAllowance);

    const activeWishlists = wishlists.filter((w) => !w.isAchieved);
    const topWishlist = activeWishlists[0] || null;
    const topWishlists = activeWishlists.slice(0, 3);

    const insight = generateDailyGenZInsight({
      nickname,
      todaySpent: todayExpense,
      dailyAllowance,
      topWishlistName: topWishlist?.name,
      streakDays: streakSummary.currentStreak,
    });

    const recentTx = transactions.slice(0, MAX_DASHBOARD_TX);

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
      topWishlists,
      insight,
      recentTx,
    };
  }, [transactions, wishlists, nickname, saldoFilter]);

  const displayedTx = useMemo(() => {
    return transactions.slice(0, MAX_DASHBOARD_TX);
  }, [transactions]);

  const dailySavingsRate = useMemo(() => {
    return Math.max(1000, Math.round(financialData.dailyAllowance * (savingsPercentage / 100)));
  }, [financialData.dailyAllowance, savingsPercentage]);

  // Income categories distribution for Pie Chart
  const incomeCategoryData = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    for (const tx of transactions) {
      if (tx.type === "income") {
        const cat = tx.category || "Lainnya";
        if (!map[cat]) map[cat] = { amount: 0, count: 0 };
        map[cat].amount += tx.amount;
        map[cat].count += 1;
      }
    }
    return Object.entries(map).map(([category, val]) => ({
      category,
      amount: val.amount,
      count: val.count,
    }));
  }, [transactions]);

  // Expense categories distribution for Pie Chart
  const expenseCategoryData = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    for (const tx of transactions) {
      if (tx.type === "expense") {
        const cat = tx.category || "Lainnya";
        if (!map[cat]) map[cat] = { amount: 0, count: 0 };
        map[cat].amount += tx.amount;
        map[cat].count += 1;
      }
    }
    return Object.entries(map).map(([category, val]) => ({
      category,
      amount: val.amount,
      count: val.count,
    }));
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
        <div className="rounded-[2.25rem] bg-[#eaf0fd] dark:bg-[#0B101D] border border-blue-200/60 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
          
          {/* ROW 1: FinBot Daily Insight (Paling Atas, tinggi sama dengan card Saldo Bersih) */}
          <div className="w-full animate-content-in">
            <GenZInsightCard nickname={nickname} insight={financialData.insight} />
          </div>

          {/* ROW 2: 3 Action Cards (Bicara, Scan Struk, Catat Manual) */}
          <div className="w-full animate-content-in">
            <TransactionActionCards
              layout="grid"
              type="general"
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenScan={() => setIsScanOpen(true)}
              onOpenManual={() => setIsManualOpen(true)}
            />
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

              {/* CARD: Transaction Bar Chart (Kategori Pengeluaran & Tren 12 Bulan) */}
              <TransactionBarChart transactions={transactions} />

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
                {displayedTx.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold">Belum ada transaksi tercatat</p>
                    <p className="text-[11px] mt-0.5 text-slate-400">
                      Catat transaksi lewat menu Pemasukan atau Pengeluaran!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 animate-content-in animate-content-delay-1 relative z-10">
                    {displayedTx.map((tx) => {
                      const isInc = tx.type === "income";
                      return (
                        <div
                          key={tx.id}
                          className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-[40%]">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isInc
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isInc ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
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

                {/* Footer Riwayat Transaksi */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 relative z-10">
                  <span className="text-[11px] text-slate-400">
                    Menampilkan {Math.min(transactions.length, MAX_DASHBOARD_TX)} dari {transactions.length} transaksi
                  </span>
                  <Link
                    href="/pengeluaran"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Seluruh Riwayat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

            {/* SISI KANAN: Total Pengeluaran, Wishlist Prioritas, Jatah Harian, Pie Charts (lg:col-span-4 space-y-6) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* CARD: Total Pengeluaran (Dipindahkan ke posisi card wishlist sebelumnya) */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group min-h-[178px]">
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

                {/* Metric Numeral */}
                <div className="space-y-1 relative z-10 animate-content-in">
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

                {/* Context Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                  <span>Efisiensi:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {financialData.todaySpent > financialData.dailyAllowance
                      ? "Melebihi Jatah"
                      : "Terkendali"}
                  </span>
                </div>
              </div>

              {/* CARD: Top 3 Wishlist Impian (Tepat di bawah card Total Pengeluaran, tinggi sejajar dengan Tren Bar Chart) */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3.5 glass-sheen relative overflow-hidden group min-h-[460px] lg:h-[460px] flex flex-col justify-between">
                {/* Transparent Gift Watermark */}
                <Gift
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-amber-500/5 dark:text-amber-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />

                <div className="space-y-3.5 relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Top 3 Wishlist Impian
                      </h3>
                    </div>
                    <Link
                      href="/wishlist"
                      title="Buka Wishlist Lengkap"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Kelola</span>
                      <MoreHorizontal className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Subtitle Alokasi Tabungan */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Alokasi: <strong className="text-slate-700 dark:text-slate-300">{savingsPercentage}% Jatah</strong>
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      +{rupiah(dailySavingsRate)}/hari
                    </span>
                  </div>
                </div>

                {/* Wishlist Items List (Top 3) */}
                {financialData.topWishlists && financialData.topWishlists.length > 0 ? (
                  <div className="space-y-2.5 relative z-10 animate-content-in my-auto flex-1 flex flex-col justify-center">
                    {financialData.topWishlists.map((w, idx) => {
                      const remaining = Math.max(0, w.targetPrice - (w.savedAmount || 0));
                      const days = Math.ceil(remaining / dailySavingsRate);
                      const isReady = remaining <= 0;
                      const progress = Math.min(
                        100,
                        Math.round(((w.savedAmount || 0) / w.targetPrice) * 100)
                      );

                      return (
                        <div
                          key={w.id}
                          className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {w.name}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isReady
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              }`}
                            >
                              {isReady ? "Siap Dibeli! 🎉" : `~${days} hari lagi`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="money font-semibold text-slate-700 dark:text-slate-300">
                              {rupiah(w.targetPrice)}
                            </span>
                            <span className="text-[10px]">
                              {w.savedAmount ? `${rupiah(w.savedAmount)} (${progress}%)` : "Mulai menabung"}
                            </span>
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-500 transition-all duration-500"
                              style={{ width: `${Math.max(progress > 0 ? 5 : 0, progress)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-5 text-center space-y-2 relative z-10 animate-content-in my-auto flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400">Belum ada barang impian aktif.</p>
                    <Link
                      href="/wishlist"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Wishlist</span>
                    </Link>
                  </div>
                )}

                {/* Footer to perfectly anchor bottom */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                  <span>Target Prioritas:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {financialData.topWishlists?.[0]?.name || "Belum ada wishlist"}
                  </span>
                </div>
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

      {/* Modals */}
      <ManualTransactionModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        type="expense"
        onSave={handleManualSave}
      />

      <ReceiptScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onConfirm={handleScanConfirmed}
      />

      <VoiceTransactionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        type="expense"
        onSave={handleVoiceSave}
      />
    </>
  );
}
