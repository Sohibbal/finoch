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
import { VoiceTransactionModal } from "@/components/transaction/voice-transaction-modal";
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
    const saved = await saveTransaction({
      type: "income",
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
      type: "income",
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
      type: "income",
      itemName: candidate.merchant || candidate.description || candidate.items?.[0]?.name || "Pemasukan Transfer",
      amount: candidate.amount,
      category: candidate.category || "Uang Saku",
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
        title="Pemasukan"
        subtitle="Kelola seluruh uang masuk via suara, scan bukti, atau manual"
      />

      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="rounded-[2.25rem] bg-[#F8FAFC] dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
          
          {/* Main 2-Column Split: Kiri 3 Button Persegi & Kanan Riwayat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* SISI KIRI: Summary Metric Card + 3 Button Persegi Berjejer ke Bawah (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Summary Card with Glass Sheen */}
              <div className="rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-2 glass-sheen relative overflow-hidden group min-h-[140px] flex flex-col justify-between">
                {/* Transparent Watermark Icon */}
                <ArrowDownLeft
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <div className="relative z-10 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Pemasukan
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 money">
                    +{rupiah(totalThisMonth)}
                  </h2>
                </div>
                <div className="relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                  {transactions.length} transaksi pemasukan tercatat
                </div>
              </div>

              {/* 3 Button Persegi Berjejer ke Bawah */}
              <div className="flex flex-col gap-3">
                {/* 1. Button Persegi: Bicara */}
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-full p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 hover:border-blue-400 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold transition-all flex items-center sm:flex-col justify-center gap-2 group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mic className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm font-bold">Bicara</p>
                    <p className="text-[11px] opacity-75 font-normal">Input cepat via suara</p>
                  </div>
                </button>

                {/* 2. Button Persegi: Scan */}
                <button
                  type="button"
                  onClick={() => setIsScanOpen(true)}
                  className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100 hover:border-emerald-400 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-semibold transition-all flex items-center sm:flex-col justify-center gap-2 group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ScanLine className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm font-bold">Scan</p>
                    <p className="text-[11px] opacity-75 font-normal">Scan struk / bukti transfer</p>
                  </div>
                </button>

                {/* 3. Button Persegi: Catat */}
                <button
                  type="button"
                  onClick={() => setIsManualOpen(true)}
                  className="w-full p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 hover:opacity-90 font-semibold transition-all flex items-center sm:flex-col justify-center gap-2 group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-slate-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm font-bold">Catat</p>
                    <p className="text-[11px] opacity-75 font-normal">Input manual nominal</p>
                  </div>
                </button>
              </div>
            </div>

            {/* SISI KANAN: Riwayat Pemasukan (8 cols) with 100% Height & Glass Sheen */}
            <div className="lg:col-span-8 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between glass-sheen relative overflow-hidden group h-full min-h-[460px]">
              <div className="flex items-center justify-between relative z-10 shrink-0 mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                  <span>Riwayat Pemasukan</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {transactions.length} data
                </span>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <TransactionHistoryTable
                  type="income"
                  transactions={transactions}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ManualTransactionModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        type="income"
        onSave={handleManualSave}
      />

      <ReceiptScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onConfirm={handleScanConfirmed}
      />

      <VoiceTransactionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        type="income"
        onSave={handleVoiceSave}
      />
    </>
  );
}
