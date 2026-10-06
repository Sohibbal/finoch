"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Handshake,
  ArrowLeft,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { DebtItem, DebtSummary, DebtType } from "@/types/debt-types";
import {
  getDebts,
  addDebt,
  markDebtAsPaid,
  deleteDebt,
  getDebtSummary,
} from "@/lib/storage/debt-storage";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";

import { DebtCardMobile } from "@/components/debts/debt-card-mobile";
import { DebtTableDesktop } from "@/components/debts/debt-table-desktop";
import { DebtFormModal } from "@/components/debts/debt-form-modal";

export default function DebtsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshDebts = () => {
    setDebts(getDebts());
  };

  useEffect(() => {
    refreshDebts();
  }, []);

  const summary: DebtSummary = useMemo(() => {
    return getDebtSummary();
  }, [debts]);

  const handleAddDebt = (data: {
    type: DebtType;
    personName: string;
    amount: number;
    description: string;
    dueDate?: string;
    phone?: string;
  }) => {
    addDebt(data);
    refreshDebts();
  };

  const handleTogglePaid = (id: string) => {
    markDebtAsPaid(id);
    refreshDebts();
  };

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id);
    refreshDebts();
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
              <Link href="/dashboard" className="md:hidden shrink-0" aria-label="Finoch Beranda">
                <BrandLogo variant="symbol" className="h-5 w-auto" />
              </Link>
              <div className="min-w-0">
                <Breadcrumbs className="hidden md:flex mb-0.5" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide truncate">
                  Buku Kasbon &amp; Hutang Piutang
                </h1>
                <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block">
                  Kelola pinjaman teman kost &amp; kasbon warteg dengan pengingat ramah
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-navy-950 hover:bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 dark:hover:bg-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catat Kasbon Baru</span>
                <span className="sm:hidden">Tambah</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
          {/* MOBILE PWA VIEW (md:hidden) */}
          <div className="md:hidden space-y-4">
            {/* Mobile Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-emerald-500/20 shadow-sm">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Piutang Saya</span>
                </div>
                <div className="text-sm font-black text-navy-950 dark:text-cream-50">
                  {formatRupiah(summary.totalReceivable)}
                </div>
                <span className="text-[10px] text-navy-500 dark:text-cream-400">
                  {summary.unpaidReceivablesCount} orang belum bayar
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-amber-500/20 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Hutang Saya</span>
                </div>
                <div className="text-sm font-black text-navy-950 dark:text-cream-50">
                  {formatRupiah(summary.totalPayable)}
                </div>
                <span className="text-[10px] text-navy-500 dark:text-cream-400">
                  {summary.unpaidPayablesCount} kewajiban aktif
                </span>
              </div>
            </div>

            {/* List of Debt Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
                  Semua Catatan ({debts.length})
                </span>
              </div>

              {debts.map((debt) => (
                <DebtCardMobile
                  key={debt.id}
                  debt={debt}
                  onTogglePaid={handleTogglePaid}
                  onDelete={handleDeleteDebt}
                />
              ))}
            </div>
          </div>

          {/* DESKTOP VIEW (hidden md:block) */}
          <div className="hidden md:block">
            <DebtTableDesktop
              debts={debts}
              summary={summary}
              onTogglePaid={handleTogglePaid}
              onDelete={handleDeleteDebt}
            />
          </div>
        </main>
      </div>

      {/* MOBILE STICKY FLOATING DOCK (md:hidden) */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-md bg-white/95 dark:bg-[#070E1A]/95 border border-cream-300 dark:border-navy-800 rounded-2xl shadow-xl p-2.5 flex items-center justify-between backdrop-blur-xl">
          <div className="pl-2">
            <span className="text-[10px] text-navy-500 dark:text-cream-400 block leading-tight">
              Saldo Bersih
            </span>
            <span
              className={`text-sm font-black ${
                summary.netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatRupiah(summary.netBalance)}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="min-h-[44px] px-4 rounded-xl bg-navy-950 dark:bg-cream-100 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Kasbon</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />

      {/* Form Modal */}
      <DebtFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddDebt}
      />
    </div>
  );
}
