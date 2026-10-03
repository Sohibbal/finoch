"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { DigitalTwinCard } from "@/components/dashboard/digital-twin-card";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import {
  calculateCashflowSummary,
  calculateDigitalTwinSplit,
} from "@/lib/financial/financial-engine";
import {
  DigitalTwinMetrics,
  TransactionCandidate,
} from "@/types/financial-types";

export default function DashboardPage() {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);

  const [profile, setProfile] = useState<{
    monthlyIncome: number;
    currentSavings: number;
    monthlyFixedExpenses: number;
  }>({
    monthlyIncome: 3500000,
    currentSavings: 1500000,
    monthlyFixedExpenses: 1200000,
  });

  const [transactions, setTransactions] = useState<TransactionCandidate[]>([
    {
      id: "tx-1",
      merchant: "Mie Gacoan",
      amount: 38000,
      category: "Food",
      spendingType: "wants",
      date: new Date().toISOString().split("T")[0],
      source: "ocr",
    },
    {
      id: "tx-2",
      merchant: "Sewa Kos Bulanan",
      amount: 900000,
      category: "Housing",
      spendingType: "needs",
      date: new Date().toISOString().split("T")[0],
      source: "manual",
    },
    {
      id: "tx-3",
      merchant: "Superindo Sembako",
      amount: 250000,
      category: "Groceries",
      spendingType: "needs",
      date: new Date().toISOString().split("T")[0],
      source: "voice",
    },
    {
      id: "tx-4",
      merchant: "Kopi Kenangan",
      amount: 22000,
      category: "Food",
      spendingType: "wants",
      date: new Date().toISOString().split("T")[0],
      source: "voice",
    },
  ]);

  // Load profile from API
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          setProfile({
            monthlyIncome: data.profile.monthlyIncome,
            currentSavings: data.profile.currentSavings,
            monthlyFixedExpenses: data.profile.monthlyFixedExpenses,
          });
        }
      })
      .catch(() => {});
  }, []);

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

  const handleConfirmTransaction = (candidate: TransactionCandidate) => {
    setTransactions((prev) => [
      { ...candidate, id: `tx-${Date.now()}` },
      ...prev,
    ]);
    setIsConfirmModalOpen(false);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#091124]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#0f274a] dark:bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/20">
                <Sparkles className="w-5 h-5 text-blue-300 dark:text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  Digital Twin
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="text-blue-700 dark:text-blue-400">
              Dashboard
            </Link>
            <Link href="/simulator" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              What-If Simulator
            </Link>
            <Link href="/goals" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
              Goals
            </Link>
            <Link href="/copilot" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-500" />
              AI Copilot
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/20"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Bicara</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Scan Struk</span>
            </button>
            <button
              onClick={handleOpenManualEntry}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Catat Manual</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
                      <span className="text-[10px] px-2 py-0.2 rounded-md font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tx.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-md font-bold uppercase ${
                          tx.spendingType === "needs"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {tx.spendingType === "needs" ? "Needs (50%)" : "Wants (30%)"}
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
        </div>
      </main>

      {/* Voice Expense Sheet */}
      <VoiceExpenseSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExpenseSaved={() => {
          setIsVoiceOpen(false);
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
