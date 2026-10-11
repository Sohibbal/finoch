"use client";

import React, { useState } from "react";
import { Mic, ScanLine, PencilLine, Trash2, Search, Inbox } from "lucide-react";
import { rupiah } from "@/lib/format";
import type { LocalTransaction } from "@/lib/storage/transaction-storage";

interface TransactionHistoryTableProps {
  transactions: LocalTransaction[];
  type: "income" | "expense";
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function TransactionHistoryTable({
  transactions,
  type,
  onDelete,
  isLoading = false,
}: TransactionHistoryTableProps) {
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.itemName.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "voice":
        return <Mic className="w-3.5 h-3.5 text-blue-500" strokeWidth={2} title="Dicatat via Bicara" />;
      case "ocr":
        return <ScanLine className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} title="Dicatat via Scan" />;
      default:
        return <PencilLine className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} title="Dicatat Manual" />;
    }
  };

  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="w-full space-y-4">
      {/* Search & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari ${type === "income" ? "pemasukan" : "pengeluaran"}...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ink/20 dark:border-navy-700 bg-paper-sheet dark:bg-navy-900 text-body text-ink dark:text-white placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>

        <div className="text-meta font-medium text-ink-soft dark:text-navy-300">
          Total ({filtered.length} item):{" "}
          <span className={`font-semibold money ${type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-ink dark:text-white"}`}>
            {type === "income" ? "+" : "-"} {rupiah(totalAmount)}
          </span>
        </div>
      </div>

      {/* Table / List Container */}
      {isLoading ? (
        <div className="p-12 text-center text-body text-ink-soft">Memuat riwayat...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-ink/20 dark:border-navy-700 bg-paper-sheet/50 dark:bg-navy-900/50">
          <Inbox className="w-10 h-10 mx-auto text-ink-soft/60 mb-2" strokeWidth={1.5} />
          <p className="text-body font-medium text-ink-soft">
            {search ? "Tidak ada transaksi yang cocok" : `Belum ada catatan ${type === "income" ? "pemasukan" : "pengeluaran"}.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/15 dark:border-navy-800 bg-paper-sheet dark:bg-navy-900 shadow-sm">
          <div className="divide-y divide-ink/10 dark:divide-navy-800">
            {filtered.map((item) => {
              const dateStr = new Date(item.transactionDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-ink/5 dark:hover:bg-navy-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-paper-deep dark:bg-navy-800 border border-ink/10 dark:border-navy-700 shrink-0">
                      {getSourceIcon(item.source)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body font-semibold text-ink dark:text-white truncate">
                        {item.itemName}
                      </p>
                      <div className="flex items-center gap-2 text-meta text-ink-soft dark:text-navy-400">
                        <span className="px-1.5 py-0.5 rounded bg-ink/5 dark:bg-navy-800 text-[11px] font-medium">
                          {item.category}
                        </span>
                        <span>·</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`font-semibold money text-body ${
                        type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-ink dark:text-white"
                      }`}
                    >
                      {type === "income" ? "+" : "-"} {rupiah(item.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg text-ink-soft hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
