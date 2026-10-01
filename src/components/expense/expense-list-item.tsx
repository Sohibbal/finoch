"use client";

import React from "react";
import { Trash2, Tag, Clock } from "lucide-react";
import type { Expense } from "@/lib/types/expense";
import { formatRupiah } from "./parsed-expense-list";

interface ExpenseListItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

export function ExpenseListItem({ expense, onDelete }: ExpenseListItemProps) {
  const isPrimer = expense.category === "primer";
  const dateFormatted = new Date(expense.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {expense.itemName}
          </h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isPrimer
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            }`}
          >
            {isPrimer ? "Primer" : "Bocor Halus"}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {dateFormatted}
          </span>
          {expense.syncStatus === "pending" && (
            <span className="text-[10px] text-amber-500 font-medium">
              • Menunggu sinkronisasi
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {formatRupiah(expense.amount)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(expense.id)}
          aria-label={`Hapus ${expense.itemName}`}
          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
