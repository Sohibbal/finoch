"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowRightLeft, Plus, RotateCcw, Wallet } from "lucide-react";
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
  getOverallBudgetSummary,
  syncExpensesToEnvelopes,
  findReallocationSuggestions,
} from "@/lib/financial/budget-engine";
import { monthLedger } from "@/lib/financial/month-ledger";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { getBills } from "@/lib/storage/bill-storage";
import { mergeExpenses, toTransaction } from "@/components/dashboard/dashboard-data";
import { rupiah } from "@/lib/format";
import type { RecurringBill } from "@/types/bill-types";

import { BudgetAmplop } from "@/components/budget/budget-amplop";
import { BudgetOverviewCard } from "@/components/budget/budget-overview-card";
import { BudgetTransferModal } from "@/components/budget/budget-transfer-modal";
import { BudgetFormModal } from "@/components/budget/budget-form-modal";
import { BudgetTransferHistory } from "@/components/budget/budget-transfer-history";
import { EMPTY_ACTION_CLASS, EmptyState, PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { isDemoMode } from "@/lib/storage/local-storage";

const PRIMARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet text-body font-semibold transition-colors";
const SECONDARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5 transition-colors";

type ExpenseRow = { id: string; itemName: string; category: string; amount: number; createdAt?: string; updatedAt?: string };

export default function BudgetPage() {
  const profile = useFinancialProfile();
  const allowance = profile.monthlyIncome;
  const profileFixed = profile.fixedExpenses ?? 0;

  const [rawEnvelopes, setRawEnvelopes] = useState<BudgetEnvelope[]>([]);
  const [loaded, setLoaded] = useState(false);
  const hasEnvelopes = rawEnvelopes.length > 0;
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [transfers, setTransfers] = useState<EnvelopeTransferRecord[]>([]);

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedDonorEnvelope, setSelectedDonorEnvelope] = useState<BudgetEnvelope | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<BudgetEnvelope | null>(null);

  // Envelopes split what the month can spend after fixed costs (the ledger's spendable), so wait for the profile.
  const loadData = useCallback(async () => {
    if (!allowance) return;
    const currentBills = getBills();
    setBills(currentBills);
    const { spendable } = monthLedger({ monthlyIncome: allowance, profileFixedCosts: profileFixed, bills: currentBills, transactions: [] });
    setRawEnvelopes(getEnvelopes(Math.max(0, spendable)));
    setLoaded(true);
    setTransfers(getTransferHistory());

    // Server rows plus local ones not synced yet: the same rows the dashboard reads.
    const [server, local] = await Promise.all([
      // Demo mode shows only local demo rows; the server holds the real expenses.
      isDemoMode()
        ? []
        : fetch("/api/expenses")
            .then(async (res) => (res.ok ? (await res.json()).expenses : []))
            .catch(() => []),
      expenseStorage.getExpenses().catch(() => []),
    ]);
    setExpenses(mergeExpenses(Array.isArray(server) ? server : [], local));
  }, [allowance, profileFixed]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Envelopes synced with real expenses
  const envelopes = useMemo(() => {
    return syncExpensesToEnvelopes(rawEnvelopes, expenses);
  }, [rawEnvelopes, expenses]);

  // The month ledger every page prints "sisa bulan ini" from.
  const month = useMemo(
    () =>
      monthLedger({
        monthlyIncome: allowance ?? 0,
        profileFixedCosts: profileFixed,
        bills,
        transactions: expenses.map((e) => toTransaction(e, "manual")),
      }),
    [allowance, profileFixed, bills, expenses]
  );
  const spendable = Math.max(0, month.spendable);

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
      `Saran Finoch: ${sug.fromEnvelope.name} ke ${sug.toEnvelope.name}`
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
      const reset = resetEnvelopesToDefault(spendable);
      setRawEnvelopes(reset);
      setTransfers(getTransferHistory());
    }
  };

  return (
    <>
      <PageHeader
        title="Amplop Anggaran"
        subtitle="Uang saku setelah tagihan dibagi ke amplop biar nggak ludes di awal bulan"
        actions={
          hasEnvelopes ? (
            // Icon-only on phones so the title keeps one line; the label returns from sm up.
            <button type="button" onClick={() => handleOpenTransfer()} aria-label="Pindah isi amplop" className={PRIMARY_ACTION}>
              <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Pindah isi</span>
            </button>
          ) : null
        }
      />

      <ProfileGate profile={profile}>
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-8">
          {!hasEnvelopes ? (
            loaded && (
              <EmptyState
                icon={Wallet}
                title="Belum ada amplop"
                action={
                  <>
                    <button
                      type="button"
                      onClick={() => setRawEnvelopes(resetEnvelopesToDefault(spendable))}
                      className={EMPTY_ACTION_CLASS}
                    >
                      Pakai Preset Mahasiswa
                    </button>
                    <button type="button" onClick={handleOpenCreate} className={SECONDARY_ACTION}>
                      Buat Amplop Sendiri
                    </button>
                  </>
                }
              >
                Bagi {rupiah(spendable)} yang bisa dibelanjakan bulan ini (uang saku dikurangi pengeluaran tetap) ke amplop
                makan, kebutuhan kos, transport, nongkrong, dan dana darurat, atau buat amplop sendiri.
              </EmptyState>
            )
          ) : (
            <>
              <BudgetOverviewCard summary={summary} month={month} suggestions={suggestions} onApplySuggestion={handleApplySuggestion} />

              <section aria-labelledby="amplop-list-title" className="space-y-3">
                <h2 id="amplop-list-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
                  {envelopes.length} amplop bulan ini
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {envelopes.map((env) => (
                    <BudgetAmplop
                      key={env.id}
                      envelope={env}
                      onTransfer={handleOpenTransfer}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteEnvelope}
                    />
                  ))}
                  <li className="list-none">
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="w-full h-full min-h-40 flex flex-col items-center justify-center gap-2 border border-ink/30 bg-paper-sheet text-ink hover:bg-paper-deep transition-colors p-5"
                    >
                      <Plus className="w-6 h-6" aria-hidden="true" />
                      <span className="text-body font-semibold">Tambah amplop</span>
                      <span className="text-meta text-ink-soft">Misalnya buku, hobi, atau tabungan mudik.</span>
                    </button>
                  </li>
                </ul>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-8 items-start">
                <div className="lg:col-span-2">
                  <BudgetTransferHistory transfers={transfers} />
                </div>

                <section aria-labelledby="cara-kerja-title" className="space-y-3">
                  <h2 id="cara-kerja-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
                    Cara kerja amplop
                  </h2>
                  <p className="text-body text-ink">
                    Di awal bulan, sewa dan tagihan rutin disisihkan dulu. Sisanya dibagi ke amplop-amplop terpisah. Tiap kali kamu catat pengeluaran (suara,
                    foto struk, atau ketik), isi amplop yang cocok berkurang sendiri.
                  </p>
                  <p className="text-body text-ink">
                    <span className="font-semibold">Aturan emas anak kost:</span> amplop nongkrong habis berarti libur
                    nongkrong, kecuali kamu rela memindahkan isi dari amplop lain.
                  </p>
                  <button type="button" onClick={handleResetDefaults} className={SECONDARY_ACTION}>
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    Pulihkan preset mahasiswa
                  </button>
                </section>
              </div>
            </>
          )}
        </main>
      </ProfileGate>

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
    </>
  );
}
