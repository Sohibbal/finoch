"use client";

import React from "react";
import { Edit3, Trash2, Tag } from "lucide-react";
import type { ParsedVoiceItem } from "@/lib/types/expense";

interface ParsedExpenseListProps {
  items: ParsedVoiceItem[];
  onToggleCategory: (id: string) => void;
  onEdit: (item: ParsedVoiceItem) => void;
  onDelete: (id: string) => void;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ParsedExpenseList({
  items,
  onToggleCategory,
  onEdit,
  onDelete,
}: ParsedExpenseListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        Belum ada transaksi terdeteksi. Silakan coba bicara atau ketik pengeluaran.
      </div>
    );
  }

  return (
    <div className="space-y-3 my-4">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
        <span>{items.length} transaksi ditemukan</span>
        <span>Tap kategori untuk ubah</span>
      </div>

      {items.map((item) => {
        const isPrimer = item.category === "primer";

        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="flex-1 min-w-0 pr-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {item.itemName}
              </h4>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {formatRupiah(item.amount)}
              </p>

              {/* Category chip button */}
              <button
                type="button"
                onClick={() => onToggleCategory(item.id)}
                className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  isPrimer
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                }`}
              >
                <Tag className="w-3 h-3" />
                {isPrimer ? "Primer (Pokok)" : "Bocor Halus"}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                aria-label="Edit transaksi"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label="Hapus transaksi"
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
