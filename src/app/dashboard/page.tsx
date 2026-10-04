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

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-navy-950 dark:text-cream-50">
                  voicash<span className="text-navy-600 dark:text-cream-300">.id</span>
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Dashboard Finansial
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70">
                  Pantau arus kas dan pencatatan pengeluaran Anda
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="px-3.5 py-2 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bicara</span>
              </button>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3.5 py-2 rounded-full border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] text-navy-800 dark:text-cream-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-cream-100 dark:hover:bg-navy-900 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scan Struk</span>
              </button>
              <button
                onClick={handleOpenManualEntry}
                className="px-3.5 py-2 rounded-full border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] text-navy-800 dark:text-cream-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-cream-100 dark:hover:bg-navy-900 transition-colors"
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
        <div className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 shadow-sm border border-cream-300 dark:border-navy-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800/80">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-navy-700 dark:text-cream-300" />
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Daftar Transaksi Terbaru
              </h3>
            </div>
            <span className="text-xs text-navy-500 dark:text-cream-400">
              Total {transactions.length} transaksi tercatat
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-navy-400 dark:text-cream-400/60 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-navy-300 dark:text-cream-400/40 opacity-60" />
              <p className="text-sm font-semibold text-navy-950 dark:text-cream-50">
                Belum ada transaksi tercatat
              </p>
              <p className="text-xs text-navy-600 dark:text-cream-300/70 max-w-sm mx-auto">
                Gunakan tombol Bicara, Scan Struk, atau Catat Manual di atas untuk mulai mencatat pengeluaran Anda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cream-100 dark:divide-navy-800/80">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-cream-50/80 dark:hover:bg-navy-900/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cream-100 dark:bg-navy-900 text-navy-800 dark:text-cream-200">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy-950 dark:text-cream-50">
                        {tx.merchant}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-navy-500 dark:text-cream-400">{tx.date}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-cream-100 dark:bg-navy-900 text-navy-700 dark:text-cream-300">
                          {tx.category || "Lainnya"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-navy-950 dark:text-cream-50">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[11px] text-navy-400 dark:text-cream-400/60 capitalize">
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
