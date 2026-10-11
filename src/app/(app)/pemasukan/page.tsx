"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mic, ScanLine, Plus, ArrowDownLeft } from "lucide-react";
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
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import type { TransactionCandidate } from "@/types/financial-types";

export default function PemasukanPage() {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal controls
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions(undefined, "income");
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
    await saveTransaction({
      type: "income",
      itemName: data.itemName,
      amount: data.amount,
      category: data.category,
      source: "manual",
      transactionDate: data.transactionDate,
    });
    await loadData();
  };

  const handleScanConfirmed = async (candidate: TransactionCandidate) => {
    await saveTransaction({
      type: "income",
      itemName: candidate.merchant || candidate.description || candidate.items?.[0]?.name || "Pemasukan Transfer",
      amount: candidate.amount,
      category: candidate.category || "Uang Saku",
      source: "ocr",
      transactionDate: candidate.date,
    });
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    await loadData();
  };

  const totalThisMonth = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <PageHeader
        title="Pemasukan"
        subtitle="Kelola seluruh uang masuk via suara, scan bukti, atau manual"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Metric Card & Action Bar */}
        <div className="p-6 rounded-2xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-meta font-medium text-ink-soft dark:text-navy-400">Total Pemasukan</p>
              <h2 className="text-display font-bold text-emerald-600 dark:text-emerald-400 money">
                +{rupiah(totalThisMonth)}
              </h2>
            </div>

            {/* 3 Input Method Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-meta transition-colors"
              >
                <Mic className="w-4 h-4" strokeWidth={2} />
                <span>Bicara</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScanOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-meta transition-colors"
              >
                <ScanLine className="w-4 h-4" strokeWidth={2} />
                <span>Scan Bukti</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManualOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-ink text-paper-sheet dark:bg-white dark:text-navy-950 font-semibold text-meta hover:opacity-90 transition-opacity"
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
              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
              <span>Riwayat Pemasukan</span>
            </h3>
          </div>

          <TransactionHistoryTable
            type="income"
            transactions={transactions}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </section>
      </div>

      {/* Modals */}
      <ManualTransactionModal
        isOpen={isManualOpen}
        type="income"
        onClose={() => setIsManualOpen(false)}
        onSave={handleManualSave}
      />

      <ReceiptScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onConfirm={handleScanConfirmed}
      />

      <VoiceExpenseSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExpenseSaved={loadData}
      />
    </>
  );
}
