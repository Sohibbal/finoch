"use client";

import React, { useState, useEffect } from "react";
import { Mic, ShieldCheck, Sparkles, PlusCircle, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";
import { useExpenses } from "@/hooks/use-expenses";
import { MetricCards, calculateMetrics } from "@/components/dashboard/metric-cards";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { SyncIndicator } from "@/components/dashboard/sync-indicator";
import { ExpenseListItem } from "@/components/expense/expense-list-item";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopNav } from "@/components/layout/top-nav";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";

export default function DashboardPage() {
  const [userId, setUserId] = useState("guest");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const { expenses, isLoading, refreshExpenses, deleteExpense } = useExpenses(userId);
  const metrics = calculateMetrics(expenses);

  // Check auth session
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-12 transition-colors">
      {/* Top Header - Spanning Full Width with Top-Right Desktop Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Top-Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-black text-sm tracking-tighter">
              VC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  VoiCash
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                  Mahasiswa
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Catat pengeluaran cukup dengan bicara
              </p>
            </div>
          </div>

          {/* Top-Right Desktop Navigation (hidden on mobile, visible md+) */}
          <TopNav
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            userEmail={userEmail}
          />

          {/* Mobile Right Indicator (only visible on mobile) */}
          <div className="md:hidden flex items-center gap-2">
            <SyncIndicator />
          </div>
        </div>
      </header>

      {/* Main Responsive Grid Layout (Max-w-6xl for Desktop, clean 2-column) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Financial Metrics & Transactions Feed (8 cols on lg, 7 on md) */}
          <div className="md:col-span-7 lg:col-span-8 space-y-5">
            {/* Metric Cards: 3 Cards across on desktop */}
            <MetricCards expenses={expenses} />

            {/* Category Breakdown Ratio Bar with Emerald Green accent */}
            <CategoryBreakdown metrics={metrics} />

            {/* Mobile Voice Trigger Banner (visible on mobile only) */}
            <div
              onClick={() => setIsVoiceOpen(true)}
              role="button"
              tabIndex={0}
              className="md:hidden p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between cursor-pointer hover:shadow-md transition group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Punya pengeluaran baru?
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tekan di sini lalu katakan apa yang Anda beli.
                  </p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>

            {/* Recent Transactions List */}
            <section className="bg-white dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Riwayat Transaksi Terakhir
                  </h2>
                  <p className="text-xs text-slate-400">
                    {expenses.length} pengeluaran tersimpan lokal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Tambah Catatan
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Memuat data pengeluaran mahasiswa...
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Belum ada transaksi dicatat
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Mulai dengan menekan tombol mikrofon dan katakan misalnya: <em>&ldquo;beli ayam geprek lima belas ribu sama es teh lima ribu&rdquo;</em>.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {expenses.map((expense) => (
                    <ExpenseListItem
                      key={expense.id}
                      expense={expense}
                      onDelete={deleteExpense}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Dedicated Desktop Voice Studio & Student Budget Insights (4 cols on lg, 5 on md) */}
          <div className="hidden md:block md:col-span-5 lg:col-span-4 space-y-5">
            {/* Desktop Voice Quick Recording Studio */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Studio Suara Cepat
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  Web Speech id-ID
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Bicara langsung di sini. Suara Anda diproses secara lokal tanpa diunggah ke server.
              </p>

              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition active:scale-95 group"
              >
                <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Mulai Bicara Pengeluaran
              </button>
            </div>

            {/* Student Budget Tips & Highlights */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/60 to-slate-50 dark:from-slate-900 dark:to-slate-900/60 border border-emerald-100/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Tips Hemat Mahasiswa
                </h4>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Primer</strong> adalah makan sehari-hari, bensin, kos, dan fotokopi kuliah.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bocor Halus</strong> adalah kopi kekinian, nongkrong, top up game, dan snack impulsif.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Pertahankan rasio Primer di atas <strong>65%</strong> agar uang saku bulanan aman.
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Privasi 100% terjaga</span>
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Pelajari selengkapnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Nav for Mobile Screens only */}
      <BottomNav
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        userEmail={userEmail}
      />

      {/* Voice Expense Recording Sheet / Modal */}
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
