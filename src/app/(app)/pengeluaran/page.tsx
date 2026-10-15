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
import { TransactionActionCards } from "@/components/transaction/transaction-action-cards";
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

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("finoch:transaction-changed", handleUpdate);
    window.addEventListener("finoch:data-pulled", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("finoch:transaction-changed", handleUpdate);
      window.removeEventListener("finoch:data-pulled", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
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
      itemName: candidate.merchant || candidate.description || candidate.items?.[0]?.name || "Pengeluaran",
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
        showBackButton={false}
      />

      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="rounded-2xl bg-[#eaf0fd] dark:bg-[#0B101D] border border-blue-200/60 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
          
          {/* Main 2-Column Split: Kiri 3 Button Persegi & Kanan Riwayat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* SISI KIRI: Summary Metric Card + 3 Button Persegi Berjejer ke Bawah (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Summary Card with Glass Sheen */}
              <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-2 glass-sheen relative overflow-hidden group min-h-[140px] flex flex-col justify-between">
                {/* Transparent Watermark Icon */}
                <ArrowUpRight
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-rose-500/10 dark:text-rose-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <div className="relative z-10 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Pengeluaran
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 money">
                    -{rupiah(totalThisMonth)}
                  </h2>
                </div>
                <div className="relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                  {transactions.length} transaksi pengeluaran tercatat
                </div>
              </div>

              {/* 3 Action Cards (Bicara, Scan, Catat) styled like Dashboard Cards */}
              <TransactionActionCards
                layout="vertical"
                type="expense"
                onOpenVoice={() => setIsVoiceOpen(true)}
                onOpenScan={() => setIsScanOpen(true)}
                onOpenManual={() => setIsManualOpen(true)}
              />
            </div>

            {/* SISI KANAN: Riwayat Pengeluaran (8 cols) with 100% Height & Glass Sheen */}
            <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between glass-sheen relative overflow-hidden group h-full min-h-[460px]">
              <div className="flex items-center justify-between relative z-10 shrink-0 mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-rose-500" />
                  <span>Riwayat Pengeluaran</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {transactions.length} data
                </span>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <TransactionHistoryTable
                  type="expense"
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
        type="expense"
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
        type="expense"
        onSave={handleVoiceSave}
      />
    </>
  );
}
