"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowRightLeft, Plus } from "lucide-react";
import { StudentWallet, WalletTransferRecord, WalletType, WalletWithBalance } from "@/types/wallet-types";
import type { Expense } from "@/lib/types/expense";
import {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
  transferWalletFunds,
  getWalletTransferHistory,
} from "@/lib/storage/wallet-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { computeWalletBalances, detectCriticalBalances } from "@/lib/financial/wallet-engine";
import { rupiah } from "@/lib/format";
import { printDate } from "@/components/press/print-date";

import { WalletNote, WALLET_TYPE_LABEL, walletTotals } from "@/components/wallets/wallet-note";
import { WalletFormModal } from "@/components/wallets/wallet-form-modal";
import { WalletTransferModal } from "@/components/wallets/wallet-transfer-modal";
import { PageHeader } from "@/components/layout/page-header";
import { Cap } from "@/components/press/denom";

const FILTERS: { id: "all" | WalletType; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "cash", label: "Tunai" },
  { id: "bank", label: "Bank" },
  { id: "ewallet", label: "Digital" },
];

const PRIMARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet text-body font-semibold transition-colors";

export default function WalletsPage() {
  const [storedWallets, setStoredWallets] = useState<StudentWallet[]>([]);
  const [transfers, setTransfers] = useState<WalletTransferRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterType, setFilterType] = useState<"all" | WalletType>("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletWithBalance | null>(null);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSourceWallet, setTransferSourceWallet] = useState<WalletWithBalance | null>(null);

  const loadData = useCallback(() => {
    setStoredWallets(getWallets());
    setTransfers(getWalletTransferHistory());
  }, []);

  useEffect(() => {
    loadData();
    expenseStorage.getExpenses().then(setExpenses).catch((err) => {
      console.error("Gagal memuat pengeluaran:", err);
    });
  }, [loadData]);

  // Balances are derived: saldo awal + transfers - admin fees - spending charged to each wallet.
  const wallets: WalletWithBalance[] = useMemo(
    () => computeWalletBalances(storedWallets, transfers, expenses),
    [storedWallets, transfers, expenses]
  );

  const totals = useMemo(() => walletTotals(wallets), [wallets]);

  const filteredWallets = useMemo(() => {
    if (filterType === "all") return wallets;
    return wallets.filter((w) => w.type === filterType);
  }, [wallets, filterType]);

  const warnings = useMemo(() => detectCriticalBalances(wallets), [wallets]);

  // Handlers
  const handleSaveWallet = (data: Omit<StudentWallet, "id" | "updatedAt">) => {
    if (editingWallet) {
      updateWallet(editingWallet.id, data);
    } else {
      addWallet(data);
    }
    loadData();
  };

  const handleDeleteWallet = (id: string) => {
    deleteWallet(id);
    loadData();
  };

  const handleTransfer = (fromId: string, toId: string, amount: number, adminFee: number, reason: string) => {
    transferWalletFunds(fromId, toId, amount, adminFee, reason, expenses);
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (wallet: WalletWithBalance) => {
    setEditingWallet(wallet);
    setIsFormOpen(true);
  };

  const handleOpenTransfer = (source?: WalletWithBalance) => {
    setTransferSourceWallet(source || null);
    setIsTransferOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Dompet"
        subtitle="Tunai, rekening bank, dan dompet digital"
        actions={
          <button type="button" onClick={() => handleOpenTransfer()} className={PRIMARY_ACTION}>
            <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
            Pindah saldo
          </button>
        }
      />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-8 items-start">
        <div className="lg:col-span-2 space-y-5">
          {/* Ledger line: the total and where it sits, summed from the real balances. */}
          <section aria-labelledby="total-title" className="border-y border-ink/20 py-4 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id="total-title" className="text-body text-ink-soft">
                Total di {wallets.length} dompet
              </h2>
              <p className="font-display text-head font-bold text-ink money">{rupiah(totals.total)}</p>
            </div>
            <dl className="grid grid-cols-3 gap-3 border-t border-ink/10 pt-3">
              {(Object.keys(WALLET_TYPE_LABEL) as WalletType[]).map((type) => (
                <div key={type} className="min-w-0">
                  <dt className="text-meta text-ink-soft">{WALLET_TYPE_LABEL[type]}</dt>
                  <dd className="money text-body font-semibold text-ink break-words">{rupiah(totals.byType[type])}</dd>
                </div>
              ))}
            </dl>
          </section>

          {warnings.length > 0 && (
            <section aria-label="Saldo menipis" className="flex items-start gap-3 border border-mepet-ink/40 bg-paper-sheet p-4">
              <Cap tone="mepet" tilt={-4} className="mt-0.5">
                Mepet
              </Cap>
              <ul className="space-y-1 text-body text-ink min-w-0">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
          )}

          <div role="group" aria-label="Saring jenis dompet" className="flex flex-wrap gap-2">
            {FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={filterType === tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`min-h-11 px-4 rounded-full border text-body font-semibold transition-colors ${
                  filterType === tab.id ? "bg-ink text-paper-sheet border-ink" : "border-ink/30 text-ink hover:bg-ink/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWallets.map((wallet) => (
              <WalletNote
                key={wallet.id}
                wallet={wallet}
                onTransfer={handleOpenTransfer}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteWallet}
              />
            ))}
            <li className="list-none">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full h-full min-h-40 flex flex-col items-center justify-center gap-2 border border-ink/30 bg-paper-sheet text-ink hover:bg-paper-deep transition-colors p-5"
              >
                <Plus className="w-6 h-6" aria-hidden="true" />
                <span className="text-body font-semibold">Tambah dompet</span>
                <span className="text-meta text-ink-soft">
                  {filteredWallets.length === 0 ? "Belum ada dompet jenis ini." : "Rekening, e-wallet, atau uang tunai."}
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* Every move between wallets, as serial-numbered stubs. */}
        <section aria-labelledby="mutasi-title" className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/20 pb-2">
            <h2 id="mutasi-title" className="font-display text-head font-bold text-ink">
              Riwayat pindah saldo
            </h2>
            {transfers.length > 0 && <p className="text-meta text-ink-soft">{transfers.length} kali</p>}
          </div>
          {transfers.length === 0 ? (
            <p className="text-body text-ink-soft py-2">
              Belum ada. Tarik tunai atau top-up e-wallet? Catat lewat Pindah saldo biar semua dompet tetap cocok.
            </p>
          ) : (
            <ol className="space-y-2">
              {transfers.map((t) => (
                <li key={t.id} className="relative pl-4 pr-3 py-3 bg-paper-sheet border border-ink/15">
                  <span aria-hidden="true" className="absolute left-1.5 top-2 bottom-2 border-l border-dotted border-ink/40" />
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-body font-semibold text-ink break-words min-w-0">
                      {t.fromWalletName} <span aria-hidden="true">→</span>
                      <span className="sr-only">ke</span> {t.toWalletName}
                    </p>
                    <p className="money text-body font-bold text-ink whitespace-nowrap">{rupiah(t.amount)}</p>
                  </div>
                  <p className="text-meta text-ink-soft break-words">
                    {[t.reason, t.adminFee > 0 && `admin ${rupiah(t.adminFee)}`, printDate(new Date(t.createdAt))]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>

      {/* Modals */}
      <WalletFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveWallet}
        initialWallet={editingWallet}
      />

      <WalletTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        wallets={wallets}
        sourceWallet={transferSourceWallet}
        onTransfer={handleTransfer}
      />
    </>
  );
}
