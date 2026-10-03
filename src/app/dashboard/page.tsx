"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { DigitalTwinCard } from "@/components/dashboard/digital-twin-card";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import {
  calculateCashflowSummary,
  calculateDigitalTwinSplit,
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

  // Compute live Digital Twin metrics
  const totalNeeds = transactions
    .filter((t) => t.spendingType === "needs")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWants = transactions
    .filter((t) => t.spendingType === "wants")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = totalNeeds + totalWants;

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
      category: "Food",
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

  // Monthly mock trend data based on current transactions
  const trendData = [
    {
      month: "Jul",
      needs: 1200000,
      wants: 600000,
      savings: 700000,
    },
    {
      month: "Agu",
      needs: 1350000,
      wants: 750000,
      savings: 500000,
    },
    {
      month: "Sep",
      needs: 1100000,
      wants: 620000,
      savings: 800000,
    },
    {
      month: "Okt (Ini)",
      needs: totalNeeds,
      wants: totalWants,
      savings: Math.max(0, cashflow.netSavings),
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex min-h-screen sticky top-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0c1322]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0f274a] dark:bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-4 h-4 text-blue-300 dark:text-white" />
                </div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  Dashboard Finansial
                </h1>
                <p className="text-[11px] text-slate-500">
                  Pantau arus kas dan pencatatan pengeluaran Anda
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bicara</span>
              </button>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Scan Struk</span>
              </button>
              <button
                onClick={handleOpenManualEntry}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catat Manual</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Digital Twin Card */}
        <DigitalTwinCard metrics={metrics} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingTrendChart data={trendData} />
          <CategoryDonutChart data={categoryChartData} />
        </div>

        {/* Transaction History & Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Transaksi Terbaru
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Total {transactions.length} transaksi tercatat
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada transaksi tercatat
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Gunakan tombol Bicara, Scan Struk, atau Catat Manual di atas untuk mulai mencatat pengeluaran Anda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {tx.merchant}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{tx.date}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {tx.category || "Lainnya"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      via {tx.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation for screens < md */}
      <BottomNav onOpenVoice={() => setIsVoiceOpen(true)} />
    </div>

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
