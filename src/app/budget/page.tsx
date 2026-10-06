"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Plus,
  ArrowLeft,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Info,
} from "lucide-react";
import { BudgetEnvelope, EnvelopeTransferRecord, ReallocationSuggestion } from "@/types/budget-types";
import {
  getEnvelopes,
  addEnvelope,
  updateEnvelope,
  deleteEnvelope,
  transferFunds,
  getTransferHistory,
  resetEnvelopesToDefault,
} from "@/lib/storage/budget-storage";
import {
  calculateEnvelopeProgress,
  getOverallBudgetSummary,
  syncExpensesToEnvelopes,
  findReallocationSuggestions,
} from "@/lib/financial/budget-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";

import { BudgetEnvelopeMobile } from "@/components/budget/budget-envelope-mobile";
import { BudgetEnvelopeDesktop } from "@/components/budget/budget-envelope-desktop";
import { BudgetOverviewCard } from "@/components/budget/budget-overview-card";
import { BudgetTransferModal } from "@/components/budget/budget-transfer-modal";
import { BudgetFormModal } from "@/components/budget/budget-form-modal";
import { BudgetTransferHistory } from "@/components/budget/budget-transfer-history";

export default function BudgetPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [rawEnvelopes, setRawEnvelopes] = useState<BudgetEnvelope[]>([]);
  const [expenses, setExpenses] = useState<Array<{ category?: string; amount: number }>>([]);
  const [transfers, setTransfers] = useState<EnvelopeTransferRecord[]>([]);

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedDonorEnvelope, setSelectedDonorEnvelope] = useState<BudgetEnvelope | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<BudgetEnvelope | null>(null);

  // Load expenses and envelopes
  const loadData = useCallback(async () => {
    let allowance = 2000000;
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData?.profile?.monthlyIncome) {
          allowance = Number(pData.profile.monthlyIncome);
        }
      }
    } catch {
      // ignore
    }

    const envs = getEnvelopes(allowance);
    setRawEnvelopes(envs);
    setTransfers(getTransferHistory());

    // Load expenses from API or IndexedDB
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.expenses) && data.expenses.length > 0) {
          setExpenses(
            data.expenses.map((e: { category?: string; amount: number }) => ({
              category: e.category,
              amount: e.amount,
            }))
          );
          return;
        }
      }

      const local = await expenseStorage.getExpenses();
      if (local && local.length > 0) {
        setExpenses(
          local.map((e) => ({
            category: e.category,
            amount: e.amount,
          }))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Envelopes synced with real expenses
  const envelopes = useMemo(() => {
    return syncExpensesToEnvelopes(rawEnvelopes, expenses);
  }, [rawEnvelopes, expenses]);

  // Overall summary
  const summary = useMemo(() => {
    return getOverallBudgetSummary(envelopes);
  }, [envelopes]);

  // AI suggestions
  const suggestions = useMemo(() => {
    return findReallocationSuggestions(envelopes);
  }, [envelopes]);

  // Handlers
  const handleOpenTransfer = (env?: BudgetEnvelope) => {
    setSelectedDonorEnvelope(env || null);
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = (
    fromId: string,
    toId: string,
    amount: number,
    reason: string
  ) => {
    try {
      transferFunds(fromId, toId, amount, reason);
      setRawEnvelopes(getEnvelopes());
      setTransfers(getTransferHistory());
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal memindahkan dana");
    }
  };

  const handleApplySuggestion = (sug: ReallocationSuggestion) => {
    handleConfirmTransfer(
      sug.fromEnvelope.id,
      sug.toEnvelope.id,
      sug.recommendedAmount,
      `AI Nudge: Rebalancing ${sug.fromEnvelope.name} -> ${sug.toEnvelope.name}`
    );
  };

  const handleOpenCreate = () => {
    setEditingEnvelope(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (env: BudgetEnvelope) => {
    setEditingEnvelope(env);
    setIsFormModalOpen(true);
  };

  const handleSaveEnvelope = (data: {
    name: string;
    allocatedAmount: number;
    icon: string;
    color: string;
    categoryAliases: string[];
    rollover?: boolean;
    notes?: string;
  }) => {
    if (editingEnvelope) {
      updateEnvelope(editingEnvelope.id, data);
    } else {
      addEnvelope({ ...data, spentAmount: 0 });
    }
    setRawEnvelopes(getEnvelopes());
  };

  const handleDeleteEnvelope = (id: string) => {
    deleteEnvelope(id);
    setRawEnvelopes(getEnvelopes());
  };

  const handleResetDefaults = () => {
    if (confirm("Reset seluruh pos amplop ke preset standar mahasiswa?")) {
      const reset = resetEnvelopesToDefault();
      setRawEnvelopes(reset);
      setTransfers(getTransferHistory());
    }
  };

  return (
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 pb-2">
          <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
            {/* Left: Mobile Back Button & Title */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-navy-700 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
                aria-label="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="md:hidden shrink-0 flex items-center" aria-label="Finoch Beranda">
                <BrandLogo variant="symbol" className="w-5 h-5 shrink-0" />
              </Link>
              <div className="min-w-0">
                <Breadcrumbs className="hidden md:flex mb-0.5" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide truncate">
                  Amplop Anggaran Mahasiswa
                </h1>
                <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block">
                  Metode Amplop Digital: Pisahkan uang saku agar tidak ludes di awal bulan
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Desktop-only action buttons */}
              <button
                onClick={handleResetDefaults}
                className="hidden lg:flex px-3 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 text-navy-600 dark:text-cream-300 text-xs font-semibold hover:bg-cream-100 dark:hover:bg-navy-900 items-center gap-1.5 transition-all"
                title="Reset ke Preset Standar Mahasiswa"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Preset</span>
              </button>

              <button
                onClick={() => handleOpenTransfer()}
                className="hidden sm:flex px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200 text-xs font-bold hover:bg-cream-100 dark:hover:bg-navy-900 items-center gap-1.5 transition-all"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-navy-500 dark:text-cream-400" />
                <span>Transfer Dana</span>
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-4 py-1.5 rounded-full bg-navy-950 hover:bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 dark:hover:bg-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tambah Amplop</span>
                <span className="sm:hidden">Pos Baru</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
          {/* Overview Section */}
          <BudgetOverviewCard
            summary={summary}
            suggestions={suggestions}
            onApplySuggestion={handleApplySuggestion}
          />

          {/* MOBILE PWA VIEW (md:hidden) */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
                Daftar Pos Amplop ({envelopes.length})
              </span>
              <button
                onClick={() => handleOpenTransfer()}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Transfer Dana</span>
              </button>
            </div>

            <div className="space-y-3">
              {envelopes.map((env) => (
                <BudgetEnvelopeMobile
                  key={env.id}
                  envelope={env}
                  onTransfer={handleOpenTransfer}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteEnvelope}
                />
              ))}
            </div>

            {/* Mobile Transfer History */}
            <div className="pt-2">
              <BudgetTransferHistory transfers={transfers} />
            </div>
          </div>

          {/* DESKTOP BENTO GRID VIEW (hidden md:block) */}
          <div className="hidden md:block space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-navy-950 dark:text-cream-50 tracking-tight">
                  Pos Anggaran Aktif Mahasiswa
                </h3>
                <p className="text-xs text-navy-500 dark:text-cream-400">
                  Pantau batas limit setiap kebutuhan anak kost secara visual & presisi
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy-600 dark:text-cream-400 bg-cream-200/50 dark:bg-navy-900 px-3 py-1 rounded-full border border-cream-300 dark:border-navy-800">
                  Total {envelopes.length} Amplop Terpasang
                </span>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {envelopes.map((env) => (
                <BudgetEnvelopeDesktop
                  key={env.id}
                  envelope={env}
                  onTransfer={handleOpenTransfer}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteEnvelope}
                />
              ))}
            </div>

            {/* Bottom Row: Transfer History & Philosophy Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
              <div className="lg:col-span-2">
                <BudgetTransferHistory transfers={transfers} />
              </div>

              {/* Envelope Philosophy / Educational Guide */}
              <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-cream-50">
                      Cara Kerja Metode Amplop
                    </h4>
                  </div>
                  <p className="text-xs text-navy-600 dark:text-cream-300 leading-relaxed">
                    Di awal bulan, uang saku kamu dimasukkan ke amplop-amplop terpisah. Saat belanja, catat pengeluaran di Finoch (suara atau foto struk) dan jatah amplop terkait akan berkurang otomatis.
                  </p>
                  <div className="p-3 rounded-xl bg-cream-100 dark:bg-navy-900/60 border border-cream-200 dark:border-navy-800 text-xs text-navy-700 dark:text-cream-300">
                    <strong className="block mb-1 text-navy-950 dark:text-cream-50">
                      Aturan Emas Anak Kost:
                    </strong>
                    Jika amplop nongkrong habis, kamu dilarang nongkrong kecuali kamu rela memindahkan jatah dari amplop lain.
                  </div>
                </div>

                <button
                  onClick={handleResetDefaults}
                  className="w-full py-2.5 px-3 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 text-xs font-bold hover:bg-cream-100 dark:hover:bg-navy-800 flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pulihkan Preset Mahasiswa</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE STICKY FLOATING DOCK (md:hidden) */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-md bg-white/95 dark:bg-[#070E1A]/95 border border-cream-300 dark:border-navy-800 rounded-2xl shadow-xl p-2.5 flex items-center justify-between backdrop-blur-xl">
          <div className="pl-2">
            <span className="text-[10px] text-navy-500 dark:text-cream-400 block leading-tight">
              Sisa Dana Aman
            </span>
            <span className="text-sm font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(summary.totalRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleOpenTransfer()}
              className="min-h-[44px] px-3 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-100 dark:bg-navy-900 text-navy-800 dark:text-cream-200 font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Pindah</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="min-h-[44px] px-4 rounded-xl bg-navy-950 dark:bg-cream-100 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Pos Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />

      {/* Modals */}
      <BudgetTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        envelopes={envelopes}
        initialFromEnvelope={selectedDonorEnvelope}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <BudgetFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEnvelope(null);
        }}
        initialEnvelope={editingEnvelope}
        onSave={handleSaveEnvelope}
      />
    </div>
  );
}
