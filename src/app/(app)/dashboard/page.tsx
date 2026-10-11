"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
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
} from "lucide-react";
import { DigitalTwinCard } from "@/components/dashboard/digital-twin-card";
import { DailySafeToSpendCard } from "@/components/dashboard/daily-safe-to-spend-card";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { OPEN_VOICE_EVENT } from "@/components/layout/app-shell";
import {
  mergeExpenses,
  toTransaction,
  currentMonthTransactions,
  splitNeedsWants,
  sumByBucket,
  buildMonthlyTrend,
} from "@/components/dashboard/dashboard-data";
import { localDateKey } from "@/lib/date";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { getWallets } from "@/lib/storage/wallet-storage";
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
import { PageHeader } from "@/components/layout/page-header";
import { isDemoMode } from "@/lib/storage/local-storage";
import { loadFinancialProfile } from "@/hooks/use-financial-profile";

// Recharts measures the DOM: render the charts on the client only.
const SpendingTrendChart = dynamic(
  () => import("@/components/dashboard/spending-trend-chart").then((m) => m.SpendingTrendChart),
  { ssr: false }
);
const CategoryDonutChart = dynamic(
  () => import("@/components/dashboard/category-donut-chart").then((m) => m.CategoryDonutChart),
  { ssr: false }
);

interface FinancialProfileSummary {
  monthlyIncome: number;
  currentSavings: number;
  monthlyFixedExpenses: number;
}

// Used only when the profile can't be fetched (offline): never show made-up numbers.
const EMPTY_PROFILE: FinancialProfileSummary = { monthlyIncome: 0, currentSavings: 0, monthlyFixedExpenses: 0 };

export default function DashboardPage() {
  const router = useRouter();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isProfileChecking, setIsProfileChecking] = useState(true);

  const [loadedProfile, setLoadedProfile] = useState<FinancialProfileSummary | null>(null);
  const profile = loadedProfile ?? EMPTY_PROFILE;

  const [transactions, setTransactions] = useState<TransactionCandidate[]>([]);

  // Server rows plus local ones not synced yet, so a just-saved expense doesn't vanish until sync.
  const loadTransactions = useCallback(async () => {
    const [server, local] = await Promise.all([
      // Demo mode shows only sample data: the server holds the user's real expenses.
      isDemoMode()
        ? []
        : fetch("/api/expenses")
            .then(async (res) => (res.ok ? (await res.json()).expenses : []))
            .catch(() => []),
      expenseStorage.getExpenses().catch((err) => {
        console.warn("Could not load local expenses:", err);
        return [];
      }),
    ]);
    const merged = mergeExpenses(
      (Array.isArray(server) ? server : []).map((e) => ({ ...e, source: "manual" as const })),
      local.map((e) => ({ ...e, source: "voice" as const }))
    );
    const walletNames = new Map(getWallets().map((w) => [w.id, w.name]));
    setTransactions(
      merged.map((e) => ({
        ...toTransaction(e, e.source),
        paymentMethod: (e.walletId && walletNames.get(e.walletId)) || undefined,
      }))
    );
  }, []);

  // Check authentication & load profile from API
  useEffect(() => {
    let isMounted = true;

    async function initDashboard() {
      // Shared loader: one request per load, and the last good profile when offline.
      // Signed-out users never get here (middleware + app shell redirect them).
      try {
        const loaded = await loadFinancialProfile();
        if (!loaded) {
          router.push("/onboarding");
          return;
        }
        if (isMounted) {
          setLoadedProfile({
            monthlyIncome: loaded.monthlyIncome,
            currentSavings: loaded.savings,
            monthlyFixedExpenses: loaded.fixedExpenses,
          });
        }
      } catch (err) {
        console.warn("Profile fetch error:", err);
      }
      // Not reached on a redirect, so the skeleton stays up instead of flashing empty numbers.
      if (isMounted) {
        setIsProfileChecking(false);
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

  useEffect(() => {
    const openVoice = () => setIsVoiceOpen(true);
    window.addEventListener(OPEN_VOICE_EVENT, openVoice);
    return () => window.removeEventListener(OPEN_VOICE_EVENT, openVoice);
  }, []);

  const todayDateStr = useMemo(() => localDateKey(new Date()), []);

  // Everything below is this local month only; undated expenses never count.
  const monthTransactions = useMemo(() => currentMonthTransactions(transactions), [transactions]);
  const { needs: totalNeeds, wants: totalWants } = useMemo(() => splitNeedsWants(monthTransactions), [monthTransactions]);
  const totalExpensesThisMonth = totalNeeds + totalWants;
  const totalExpenses = totalExpensesThisMonth;

  // Compute today's spending
  const todaySpent = useMemo(() => {
    return transactions
      .filter((t) => t.date === todayDateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayDateStr]);

  // Daily Safe-to-Spend calculation for Anak Kost
  const safeToSpendResult = useMemo(() => {
    return calculateDailySafeToSpend({
      monthlyIncome: profile.monthlyIncome,
      totalExpensesThisMonth,
      monthlyFixedExpenses: profile.monthlyFixedExpenses,
      todaySpent,
    });
  }, [profile.monthlyIncome, totalExpensesThisMonth, profile.monthlyFixedExpenses, todaySpent]);

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
      date: localDateKey(new Date()),
      source: "manual",
    });
    setIsConfirmModalOpen(true);
  };

  const handleOcrCandidateReceived = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmTransaction = async (candidate: TransactionCandidate, walletId?: string) => {
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
        walletId,
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

  // Category breakdown for this month
  const {
    food: currentFood,
    bills: currentBills,
    shopping: currentShopping,
  } = sumByBucket(monthTransactions);

  // Monthly category spending trend from real expenses (empty state when there are none)
  const trendData = useMemo(() => buildMonthlyTrend(transactions), [transactions]);

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
    <>
      <PageHeader
        title="Dashboard Finansial"
        actions={
          <>
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
          </>
        }
      />

      {/* Skeleton until the real profile is known: never flash placeholder numbers */}
      {isProfileChecking ? (
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8" aria-busy="true" aria-label="Memuat dashboard">
          <div className="h-40 rounded-[2rem] bg-navy-900/5 dark:bg-white/5 animate-pulse" />
          <div className="h-16 rounded-2xl bg-navy-900/5 dark:bg-white/5 animate-pulse" />
          <div className="h-64 rounded-[2rem] bg-navy-900/5 dark:bg-white/5 animate-pulse" />
        </main>
      ) : (
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] fill-mode-both">
        {/* Daily Safe-to-Spend Widget (Anak Kost Survival & Jatah Jajan) */}
        <DailySafeToSpendCard
          result={safeToSpendResult}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />

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

        {/* Charts Row - Asymmetrical Bento layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                              {tx.paymentMethod && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-navy-300 dark:bg-white/20" />
                                  <span className="text-[10px] font-medium text-navy-500 dark:text-cream-400/70 truncate max-w-[96px]">
                                    {tx.paymentMethod}
                                  </span>
                                </>
                              )}
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
      )}

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
    </>
  );
}
