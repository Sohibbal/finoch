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
      <div className="flex items-center justify-between text-xs font-medium text-navy-600 dark:text-cream-300/80 px-1">
        <span>{items.length} transaksi ditemukan</span>
        <span>Tap kategori untuk ubah</span>
      </div>

      {items.map((item) => {
        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 shadow-sm"
          >
            <div className="flex-1 min-w-0 pr-3">
              <h4 className="text-sm font-bold text-navy-950 dark:text-cream-50 truncate">
                {item.itemName}
              </h4>
              <p className="text-base font-black text-navy-900 dark:text-cream-100 mt-0.5">
                {formatRupiah(item.amount)}
              </p>

              {/* Category chip */}
              <button
                type="button"
                onClick={() => onToggleCategory(item.id)}
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cream-200/80 text-navy-900 dark:bg-navy-800 dark:text-cream-200 border border-cream-300 dark:border-navy-700 hover:opacity-80 transition"
              >
                <Tag className="w-3 h-3" />
                {item.category || "Other"}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                aria-label="Edit transaksi"
                className="p-2 text-navy-500 hover:text-navy-950 dark:text-cream-400 dark:hover:text-cream-50 rounded-xl hover:bg-cream-200/60 dark:hover:bg-navy-800 transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label="Hapus transaksi"
                className="p-2 text-navy-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
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
