"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mic,
  Camera,
  Plus,
  Compass,
  Target,
  Bot,
  ArrowUpRight,
  TrendingDown,
  ShoppingBag,
  History,
  Loader2,
  Lightbulb,
  Receipt,
  CalendarClock,
  Wallet,
  Hourglass,
  Flame,
  Handshake,
  CreditCard,
  Zap,
  Utensils,
  GraduationCap,
  FileSpreadsheet,
} from "lucide-react";
import { DigitalTwinCard } from "@/components/dashboard/digital-twin-card";
import { DailySafeToSpendCard } from "@/components/dashboard/daily-safe-to-spend-card";
import { FinancialRunwayCard } from "@/components/dashboard/financial-runway-card";
import { SurvivalModeCard } from "@/components/dashboard/survival-mode-card";
import { calculateFinancialRunway } from "@/lib/financial/runway-engine";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { getBillSummary } from "@/lib/storage/bill-storage";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { syncManager } from "@/lib/sync/sync-manager";
import {
  calculateCashflowSummary,
  calculateDigitalTwinSplit,
  calculateDailySafeToSpend,
} from "@/lib/financial/financial-engine";
import {
  DigitalTwinMetrics,
  TransactionCandidate,
} from "@/types/financial-types";
import type { ExpenseCategory } from "@/lib/types/expense";

export default function DashboardPage() {
  const router = useRouter();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isProfileChecking, setIsProfileChecking] = useState(true);

  const [profile, setProfile] = useState<{
    monthlyIncome: number;
    currentSavings: number;
    monthlyFixedExpenses: number;
  }>({
    monthlyIncome: 3500000,
    currentSavings: 1500000,
    monthlyFixedExpenses: 1200000,
  });

  const [transactions, setTransactions] = useState<TransactionCandidate[]>([]);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.expenses) && data.expenses.length > 0) {
          const mapped: TransactionCandidate[] = data.expenses.map(
            (e: {
              id: string;
              itemName: string;
              amount: number;
              category: string;
              createdAt?: string;
            }) => ({
              id: e.id,
              merchant: e.itemName,
              amount: e.amount,
              category: e.category || "Other",
              spendingType: ["Food & Drinks", "Food", "Bills & Utilities", "Housing & Bills", "Bills", "Transportation"].includes(e.category) ? "needs" : "wants",
              date: e.createdAt
                ? new Date(e.createdAt).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              source: "manual",
            })
          );
          setTransactions(mapped);
          return;
        }
      }

      // Fallback to local storage (IndexedDB)
      const local = await expenseStorage.getExpenses();
      if (local && local.length > 0) {
        const mapped: TransactionCandidate[] = local.map((e) => ({
          id: e.id,
          merchant: e.itemName,
          amount: e.amount,
          category: e.category || "Other",
          spendingType: ["Food & Drinks", "Food", "Bills & Utilities", "Housing & Bills", "Bills", "Transportation"].includes(e.category) ? "needs" : "wants",
          date: e.createdAt
            ? new Date(e.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          source: "voice",
        }));
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn("Could not load expenses:", err);
    }
  }, []);

  // Check authentication & load profile from API
  useEffect(() => {
    let isMounted = true;

    async function initDashboard() {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (!data?.profile) {
            router.push("/onboarding");
            return;
          }
          if (isMounted) {
            setProfile({
              monthlyIncome: data.profile.monthlyIncome,
              currentSavings: data.profile.currentSavings,
              monthlyFixedExpenses: data.profile.monthlyFixedExpenses,
            });
          }
        }
      } catch (err) {
        console.warn("Profile fetch error:", err);
      } finally {
        if (isMounted) {
          setIsProfileChecking(false);
        }
      }

      await loadTransactions();
    }

    initDashboard();

    const unsubscribe = syncManager.subscribe((status) => {
      if (status === "synced") {
        loadTransactions();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, loadTransactions]);

  const todayDateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const currentMonthPrefix = useMemo(() => todayDateStr.slice(0, 7), [todayDateStr]);

  // Compute live Digital Twin metrics
  const totalNeeds = useMemo(() => {
    return transactions
      .filter((t) => t.spendingType === "needs")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalWants = useMemo(() => {
    return transactions
      .filter((t) => t.spendingType !== "needs")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpensesThisMonth = useMemo(() => {
    return transactions
      .filter((t) => !t.date || t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthPrefix]);

  const totalExpenses = totalExpensesThisMonth > 0 ? totalExpensesThisMonth : totalNeeds + totalWants;

  // Compute today's spending
  const todaySpent = useMemo(() => {
    return transactions
      .filter((t) => t.date === todayDateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayDateStr]);

  // Recurring bills state
  const [billSummary, setBillSummary] = useState(() => getBillSummary());

  useEffect(() => {
    setBillSummary(getBillSummary());
  }, []);

  // Daily Safe-to-Spend calculation for Anak Kost
  const safeToSpendResult = useMemo(() => {
    const effectiveFixedExpenses = Math.max(
      profile.monthlyFixedExpenses,
      billSummary.unpaidAmountThisMonth
    );
    return calculateDailySafeToSpend({
      monthlyIncome: profile.monthlyIncome,
      totalExpensesThisMonth,
      monthlyFixedExpenses: effectiveFixedExpenses,
      todaySpent,
    });
  }, [profile.monthlyIncome, totalExpensesThisMonth, profile.monthlyFixedExpenses, billSummary.unpaidAmountThisMonth, todaySpent]);

  // Financial Runway calculation (Hari Bertahan Anak Kost)
  const financialRunway = useMemo(() => {
    return calculateFinancialRunway({
      totalIncome: profile.monthlyIncome,
      totalExpensesThisMonth,
    });
  }, [profile.monthlyIncome, totalExpensesThisMonth]);

  const cashflow = calculateCashflowSummary({
    income: profile.monthlyIncome,
    expenses: totalExpenses,
  });

  const twinSplit = calculateDigitalTwinSplit({
    income: profile.monthlyIncome,
    needs: totalNeeds,
    wants: totalWants,
    netSavings: cashflow.netSavings,
  });

  const metrics: DigitalTwinMetrics = {
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: totalExpenses,
    netSavings: cashflow.netSavings,
    savingsRate: cashflow.savingsRate,
    needsAmount: totalNeeds,
    wantsAmount: totalWants,
    savingsAmount: Math.max(0, cashflow.netSavings),
    needsPercentage: twinSplit.needsPercentage,
    wantsPercentage: twinSplit.wantsPercentage,
    savingsPercentage: twinSplit.savingsPercentage,
    needsStatus: twinSplit.needsStatus,
    wantsStatus: twinSplit.wantsStatus,
    savingsStatus:
      cashflow.savingsRate >= 20
        ? "optimal"
        : cashflow.savingsRate >= 10
        ? "warning"
        : "danger",
  };

  const handleOpenManualEntry = () => {
    setCurrentCandidate({
      merchant: "",
      amount: 0,
      category: "Food & Drinks",
      spendingType: "wants",
      date: new Date().toISOString().split("T")[0],
      source: "manual",
    });
    setIsConfirmModalOpen(true);
  };

  const handleOcrCandidateReceived = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmTransaction = async (candidate: TransactionCandidate) => {
    const newTx: TransactionCandidate = {
      ...candidate,
      id: candidate.id || `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setIsConfirmModalOpen(false);

    try {
      await expenseStorage.saveExpense({
        itemName: candidate.merchant || candidate.description || "Pengeluaran",
        amount: candidate.amount,
        category: candidate.category || "Other",
        createdAt: candidate.date
          ? new Date(candidate.date).toISOString()
          : new Date().toISOString(),
      });
      syncManager.triggerSync();
      await loadTransactions();
    } catch (err) {
      console.warn("Could not persist transaction:", err);
    }
  };

  // Category breakdown for current transactions
  const currentFood = transactions
    .filter((t) => t.category === "Food & Drinks" || t.category === "Food")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentTransport = transactions
    .filter((t) => t.category === "Transportation")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBills = transactions
    .filter((t) => t.category === "Bills & Utilities" || t.category === "Housing & Bills" || t.category === "Bills")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentShopping = transactions
    .filter((t) => t.category === "Shopping & Lifestyle" || t.category === "Shopping & Clothing" || t.category === "Entertainment & Leisure")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentOther = transactions
    .filter((t) => !["Food & Drinks", "Food", "Transportation", "Bills & Utilities", "Housing & Bills", "Bills", "Shopping & Lifestyle", "Shopping & Clothing", "Entertainment & Leisure"].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly category spending trend data
  const trendData = [
    {
      month: "Jul",
      food: 950000,
      transport: 300000,
      bills: 450000,
      shopping: 280000,
      other: 120000,
    },
    {
      month: "Agu",
      food: 1100000,
      transport: 350000,
      bills: 450000,
      shopping: 400000,
      other: 150000,
    },
    {
      month: "Sep",
      food: 1020000,
      transport: 280000,
      bills: 450000,
      shopping: 310000,
      other: 140000,
    },
    {
      month: "Okt (Ini)",
      food: currentFood,
      transport: currentTransport,
      bills: currentBills,
      shopping: currentShopping,
      other: currentOther,
    },
  ];

  // Group transactions by category for Donut Chart
  const categoryMap = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Simulate an AI insight based on spending data
  const smartInsight = useMemo(() => {
    if (totalExpenses === 0) return "Mulailah mencatat pengeluaran Anda untuk melihat analisis cerdas di sini.";
    if (currentFood > currentBills + currentShopping) {
      return "Pengeluaran makan Anda mendominasi bulan ini. Mengurangi pesanan online bisa menambah surplus tabungan secara signifikan.";
    }
    if (cashflow.netSavings < 0) {
      return "Anda berada di zona defisit. Tahan pengeluaran untuk 'Wants' (Keinginan) dalam minggu ini untuk memulihkan arus kas.";
    }
    return "Pola pengeluaran Anda cukup stabil. Anda berada pada jalur yang tepat menuju target finansial bulan ini.";
  }, [totalExpenses, currentFood, currentBills, currentShopping, cashflow.netSavings]);

  return (
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header - Floating Glass Pill Style */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 pb-2">
          <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2 sm:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-1.5 pl-2">
                <span className="text-sm font-black tracking-tight text-navy-950 dark:text-white">
                  finoch<span className="text-emerald-500">.id</span>
                </span>
              </div>
              <div className="hidden md:flex items-center pl-2">
                <Breadcrumbs />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeToggle />
              
              <button
                onClick={() => router.push("/split-bill")}
                className="w-10 h-10 sm:w-auto sm:px-4 sm:py-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] group"
                aria-label="Split Bill Resto"
                title="Kalkulator Split Bill & Talangan Resto"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="hidden sm:inline">Split Bill</span>
              </button>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-10 h-10 sm:w-auto sm:px-4 sm:py-2.5 rounded-full border border-navy-900/10 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-navy-50 dark:hover:bg-white/10 text-navy-800 dark:text-cream-200 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] group"
                aria-label="Scan Struk"
              >
                <div className="w-6 h-6 rounded-full bg-navy-900/5 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline">Scan Struk</span>
              </button>
              
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="w-10 h-10 sm:w-auto sm:px-4 sm:py-2.5 rounded-full bg-navy-950 dark:bg-white hover:bg-navy-900 dark:hover:bg-cream-100 text-white dark:text-navy-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96] group"
                aria-label="Bicara"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline tracking-wide">Bicara</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Container - Macro Whitespace (py-8 to py-12) */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] fill-mode-both">
          
          {/* MOBILE ONLY: Rapid Input Bar (Input-First Focus) */}
          <div className="md:hidden rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
                Pusat Input Cepat (PWA)
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                1-Tap Langsung Catat
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="min-h-[48px] py-3 px-3 rounded-xl bg-navy-950 dark:bg-cream-100 text-white dark:text-navy-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
              >
                <Mic className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Bicara Suara</span>
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="min-h-[48px] py-3 px-3 rounded-xl bg-cream-100 dark:bg-navy-900 border border-cream-300 dark:border-navy-800 text-navy-800 dark:text-cream-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4 text-navy-600 dark:text-cream-400" />
                <span>Foto Struk</span>
              </button>
            </div>
          </div>

          {/* Daily Safe-to-Spend Widget (Anak Kost Survival & Jatah Jajan) */}
          <DailySafeToSpendCard
            result={safeToSpendResult}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />

          {/* Mode Darurat Akhir Bulan (Survival Mode) */}
          <SurvivalModeCard
            currentBalance={cashflow.netSavings}
            daysLeftInMonth={financialRunway.daysRemainingInMonth}
          />

          {/* Fixed Expense Shield Alert (Beban Kost Guard) */}
          {billSummary.unpaidCount > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-100 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950 dark:text-amber-100">
                    Fixed Expense Shield: {billSummary.unpaidCount} Tagihan Kost Bulan Ini Belum Dibayar
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70">
                    Uang {formatRupiah(billSummary.unpaidAmountThisMonth)} otomatis dikunci agar tidak terpakai jajan harian.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/bills")}
                className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all shrink-0 active:scale-95"
              >
                Lihat Tagihan
              </button>
            </div>
          )}

          {/* Financial Runway & Burn Rate (Hari Bertahan Anak Kost) */}
          <FinancialRunwayCard runway={financialRunway} />

          {/* Student Hub: Complete 10-Item Feature Hub Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Pusat Fitur Mahasiswa &amp; Anak Kost</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                10 Modul Siap Pakai
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. Dompet Akun */}
              <button
                type="button"
                onClick={() => router.push("/wallets")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Dompet Akun</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-emerald-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Tunai, Bank, E-Wallet
                  </p>
                </div>
              </button>

              {/* 2. Streak Hemat */}
              <button
                type="button"
                onClick={() => router.push("/streak")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Streak Hemat</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-amber-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Puasa jajan &amp; kalender
                  </p>
                </div>
              </button>

              {/* 3. Amplop Anggaran */}
              <button
                type="button"
                onClick={() => router.push("/budget")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-teal-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Wallet className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Amplop Pos</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-teal-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Pos makan, kos, bensin
                  </p>
                </div>
              </button>

              {/* 4. Bocor Halus */}
              <button
                type="button"
                onClick={() => router.push("/audit")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-rose-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Flame className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Bocor Halus</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-rose-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Audit admin &amp; jajan kopi
                  </p>
                </div>
              </button>

              {/* 5. Buku Kasbon */}
              <button
                type="button"
                onClick={() => router.push("/debts")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Handshake className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Buku Kasbon</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-blue-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Talangan teman &amp; utang
                  </p>
                </div>
              </button>

              {/* 6. Tagihan Kost */}
              <button
                type="button"
                onClick={() => router.push("/bills")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <CalendarClock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Tagihan Kost</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-indigo-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Sewa kost, WiFi, listrik
                  </p>
                </div>
              </button>

              {/* 7. Split Bill Resto */}
              <button
                type="button"
                onClick={() => router.push("/split-bill")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Receipt className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Split Bill</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-emerald-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Bagi bill resto &amp; teks WA
                  </p>
                </div>
              </button>

              {/* 8. Wishlist Tunda */}
              <button
                type="button"
                onClick={() => router.push("/wishlist")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Hourglass className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Wishlist Tunda</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-purple-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Aturan cooling-off 7 hari
                  </p>
                </div>
              </button>

              {/* 9. Masak vs Warteg */}
              <button
                type="button"
                onClick={() => router.push("/meal-calc")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-orange-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Utensils className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Masak vs Warteg</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-orange-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Kalkulator hemat &amp; hybrid
                  </p>
                </div>
              </button>

              {/* 10. Tabungan UKT */}
              <button
                type="button"
                onClick={() => router.push("/ukt-savings")}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm hover:border-cyan-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 flex items-center justify-between">
                    <span>Tabungan UKT</span>
                    <ArrowUpRight className="w-3 h-3 text-navy-400 group-hover:text-cyan-500" />
                  </h3>
                  <p className="text-[10px] text-navy-600 dark:text-cream-400 mt-0.5 line-clamp-1">
                    Sinking fund semesteran
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Smart Insight Banner */}
          <div className="flex items-start sm:items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-0.5">Insight AI</p>
              <p className="text-sm font-medium leading-relaxed">{smartInsight}</p>
            </div>
          </div>

          {/* Digital Twin Card */}
          <DigitalTwinCard metrics={metrics} />

          {/* Desktop Only: Heavy Analytical Charts Row */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8">
              <SpendingTrendChart data={trendData} />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <CategoryDonutChart data={categoryChartData} />
            </div>
          </div>

          {/* Transaction History & Feed - Double Bezel Architecture */}
          <div className="group relative">
            <div className="p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
              <div className="bg-white dark:bg-[#070E1A] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.2)]">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-900/5 dark:border-white/5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 dark:bg-white/5 border border-navy-900/10 dark:border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-navy-600 dark:text-cream-300">
                      <History className="w-3 h-3" />
                      <span>Log Aktivitas</span>
                    </div>
                    <h3 className="text-xl font-black text-navy-950 dark:text-white tracking-tight mt-2">
                      Transaksi Terbaru
                    </h3>
                  </div>
                  <button
                    onClick={handleOpenManualEntry}
                    className="self-start sm:self-auto px-4 py-2 rounded-full border border-navy-900/10 dark:border-white/10 bg-transparent hover:bg-navy-50 dark:hover:bg-white/5 text-navy-800 dark:text-cream-200 font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Manual</span>
                  </button>
                </div>

                <div className="mt-6">
                  {transactions.length === 0 ? (
                    <div className="py-16 text-center text-navy-400 dark:text-cream-400/60 space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-navy-50 dark:bg-white/5 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-navy-300 dark:text-cream-400/40 opacity-60" />
                      </div>
                      <p className="text-sm font-bold text-navy-950 dark:text-cream-50 tracking-wide">
                        Belum ada transaksi
                      </p>
                      <p className="text-xs text-navy-600 dark:text-cream-300/70 max-w-xs mx-auto leading-relaxed">
                        Gunakan tombol Bicara, Scan Struk, atau Catat Manual untuk merekam pengeluaran Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 flex items-center justify-between hover:bg-navy-50 dark:hover:bg-white/[0.03] rounded-2xl transition-all duration-300 group/tx border border-transparent hover:border-navy-900/5 dark:hover:border-white/5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-navy-100 dark:bg-white/10 text-navy-800 dark:text-white flex items-center justify-center shrink-0 group-hover/tx:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-navy-950 dark:text-white tracking-wide">
                                {tx.merchant}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-navy-500 dark:text-cream-400/60">{tx.date}</span>
                                <span className="w-1 h-1 rounded-full bg-navy-300 dark:bg-white/20" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-600 dark:text-cream-300/80">
                                  {tx.category || "Lainnya"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black text-navy-950 dark:text-white tracking-tight">
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </div>
                            <div className="text-[10px] font-medium uppercase tracking-wider text-navy-400 dark:text-cream-400/50 mt-1">
                              via {tx.source}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation for screens < md */}
      <BottomNav onOpenVoice={() => setIsVoiceOpen(true)} />

      {/* Voice Expense Sheet */}
      <VoiceExpenseSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExpenseSaved={() => {
          setIsVoiceOpen(false);
          loadTransactions();
        }}
      />

      {/* Hybrid Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleOcrCandidateReceived}
      />

      {/* Unified Confirmation Modal */}
      <UnifiedConfirmationModal
        isOpen={isConfirmModalOpen}
        candidate={currentCandidate}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmTransaction}
      />
    </div>
  );
}
