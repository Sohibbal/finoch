"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Handshake,
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

import { DebtCardMobile } from "@/components/debts/debt-card-mobile";
import { DebtTableDesktop } from "@/components/debts/debt-table-desktop";
import { DebtFormModal } from "@/components/debts/debt-form-modal";
import { PageHeader } from "@/components/layout/page-header";
import { ACTION_BAR_BOTTOM } from "@/components/layout/insets";

export default function DebtsPage() {

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
    <>
      <PageHeader
        title="Buku Kasbon & Hutang Piutang"
        subtitle="Kelola pinjaman teman kost & kasbon warteg dengan pengingat ramah"
        actions={
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-navy-950 hover:bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 dark:hover:bg-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catat Kasbon Baru</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </>
        }
      />

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

      {/* MOBILE STICKY FLOATING DOCK (md:hidden) */}
      <div className={`md:hidden fixed ${ACTION_BAR_BOTTOM} left-0 right-0 z-30 px-4 pointer-events-none flex justify-center`}>
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

      {/* Form Modal */}
      <DebtFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddDebt}
      />
    </>
  );
}
