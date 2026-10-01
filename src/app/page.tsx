"use client";

import React, { useState, useEffect } from "react";
import { Mic, ShieldCheck, Sparkles, PlusCircle } from "lucide-react";
import { useExpenses } from "@/hooks/use-expenses";
import { MetricCards, calculateMetrics } from "@/components/dashboard/metric-cards";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { SyncIndicator } from "@/components/dashboard/sync-indicator";
import { ExpenseListItem } from "@/components/expense/expense-list-item";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";

export default function DashboardPage() {
  const [userId, setUserId] = useState("guest");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const { expenses, isLoading, refreshExpenses, deleteExpense } = useExpenses(userId);
  const metrics = calculateMetrics(expenses);

  // Check auth status
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.id) {
          setUserId(data.user.id);
          setUserEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-black text-sm tracking-tighter">
              VC
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                VoiCash
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Catat pengeluaran cukup dengan bicara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SyncIndicator />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Metric Cards */}
        <MetricCards expenses={expenses} />

        {/* Primer vs Bocor Halus Category Ratio */}
        <CategoryBreakdown metrics={metrics} />

        {/* Quick Voice Callout Banner */}
        <div
          onClick={() => setIsVoiceOpen(true)}
          role="button"
          tabIndex={0}
          className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between cursor-pointer hover:bg-indigo-100/60 dark:hover:bg-indigo-950/60 transition group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Punya pengeluaran baru?
              </h3>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                Tekan di sini lalu katakan apa yang Anda beli.
              </p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Riwayat Transaksi ({expenses.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Catat
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Memuat data pengeluaran...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada transaksi
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Tekan tombol mikrofon di bawah lalu sebutkan pengeluaran Anda hari ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  onDelete={deleteExpense}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Nav */}
      <BottomNav
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        userEmail={userEmail}
      />

      {/* Voice Recording Modal Sheet */}
      <VoiceExpenseSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        userId={userId}
        onExpenseSaved={refreshExpenses}
      />

      {/* Privacy Explanation Dialog */}
      <PrivacyDialog
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
