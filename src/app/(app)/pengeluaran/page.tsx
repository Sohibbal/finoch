"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mic, ScanLine, Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rupiah } from "@/lib/format";
import {
  getTransactions,
  saveTransaction,
  deleteTransaction,
  type LocalTransaction,
} from "@/lib/storage/transaction-storage";
import { TransactionHistoryTable } from "@/components/transaction/transaction-history-table";
import { ManualTransactionModal } from "@/components/transaction/manual-transaction-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { VoiceTransactionModal } from "@/components/transaction/voice-transaction-modal";
import type { TransactionCandidate } from "@/types/financial-types";

export default function PengeluaranPage() {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal controls
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions(undefined, "expense");
      setTransactions(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualSave = async (data: {
    itemName: string;
    amount: number;
    category: string;
    transactionDate: string;
  }) => {
    const saved = await saveTransaction({
      type: "expense",
      itemName: data.itemName,
      amount: data.amount,
      category: data.category,
      source: "manual",
      transactionDate: data.transactionDate,
    });
    setTransactions((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
    await loadData();
  };

  const handleVoiceSave = async (data: {
    itemName: string;
    amount: number;
    category: string;
    transactionDate: string;
  }) => {
    const saved = await saveTransaction({
      type: "expense",
      itemName: data.itemName,
      amount: data.amount,
      category: data.category,
      source: "voice",
      transactionDate: data.transactionDate,
    });
    setTransactions((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
    await loadData();
  };

  const handleScanConfirmed = async (candidate: TransactionCandidate) => {
    const saved = await saveTransaction({
      type: "expense",
      itemName: candidate.merchant || candidate.description || candidate.items?.[0]?.name || "Belanja Struk",
      amount: candidate.amount,
      category: candidate.category || "Makanan & Minuman",
      source: "ocr",
      transactionDate: candidate.date,
    });
    setTransactions((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
    await loadData();
  };

  const handleDelete = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await deleteTransaction(id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:transaction-changed"));
    }
    await loadData();
  };

  const totalThisMonth = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <PageHeader
        title="Pengeluaran"
        subtitle="Pantau dan kontrol seluruh uang keluar via suara, scan struk, atau manual"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Metric Card & Action Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Pengeluaran</p>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white money mt-1">
                -{rupiah(totalThisMonth)}
              </h2>
            </div>

            {/* 3 Input Method Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-xs transition-colors"
              >
                <Mic className="w-4 h-4" strokeWidth={2} />
                <span>Bicara</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScanOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-semibold text-xs transition-colors"
              >
                <ScanLine className="w-4 h-4" strokeWidth={2} />
                <span>Scan Struk</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManualOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Catat Manual</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-head font-bold text-ink dark:text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
              <span>Riwayat Pengeluaran</span>
            </h3>
          </div>

          <TransactionHistoryTable
            type="expense"
            transactions={transactions}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </section>
      </div>

      {/* Modals */}
      <ManualTransactionModal
        isOpen={isManualOpen}
        type="expense"
        onClose={() => setIsManualOpen(false)}
        onSave={handleManualSave}
      />

      <ReceiptScannerModal
        isOpen={isScanOpen}
        type="expense"
        onClose={() => setIsScanOpen(false)}
        onConfirm={handleScanConfirmed}
      />

      <VoiceTransactionModal
        isOpen={isVoiceOpen}
        type="expense"
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleVoiceSave}
      />
    </>
  );
}
