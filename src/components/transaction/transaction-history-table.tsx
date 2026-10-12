"use client";

import React, { useState } from "react";
import { Mic, ScanLine, PencilLine, Trash2, Search, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { rupiah } from "@/lib/format";
import type { LocalTransaction } from "@/lib/storage/transaction-storage";

interface TransactionHistoryTableProps {
  transactions: LocalTransaction[];
  type: "income" | "expense";
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function TransactionHistoryTable({
  transactions,
  type,
  onDelete,
  isLoading = false,
}: TransactionHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.itemName.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "voice":
        return (
          <span title="Dicatat via Bicara">
            <Mic className="w-3.5 h-3.5 text-blue-500" strokeWidth={2} />
          </span>
        );
      case "ocr":
        return (
          <span title="Dicatat via Scan">
            <ScanLine className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
          </span>
        );
      default:
        return (
          <span title="Dicatat Manual">
            <PencilLine className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
          </span>
        );
    }
  };

  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="w-full flex-1 flex flex-col justify-between space-y-4">
      {/* Search & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={`Cari ${type === "income" ? "pemasukan" : "pengeluaran"}...`}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#111C2E] text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
          />
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Total ({filtered.length} item):{" "}
          <span
            className={`font-semibold money ${
              type === "income"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {type === "income" ? "+" : "-"} {rupiah(totalAmount)}
          </span>
        </div>
      </div>

      {/* Table / List Container */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat riwayat...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111C2E]/50">
          <Inbox className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600 mb-2" strokeWidth={1.5} />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {search ? "Tidak ada transaksi yang cocok" : `Belum ada catatan ${type === "income" ? "pemasukan" : "pengeluaran"}.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111C2E] shadow-xs flex-1 flex flex-col justify-between">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedItems.map((item) => {
              const dateStr = new Date(item.transactionDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getSourceIcon(item.source)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {item.itemName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                        <span>·</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`font-semibold money text-sm ${
                        type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {type === "income" ? "+" : "-"} {rupiah(item.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Hapus"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span className="text-[11px]">
                Menampilkan {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} data
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#111C2E] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Halaman sebelumnya"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#111C2E] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Halaman berikutnya"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
