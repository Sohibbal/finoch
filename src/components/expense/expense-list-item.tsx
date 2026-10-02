"use client";

import React from "react";
import { Trash2, Clock } from "lucide-react";
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
    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0e1526]/60 border border-slate-200/90 dark:border-white/[0.06] hover:border-blue-500/40 backdrop-blur-md shadow-sm transition group">
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {expense.itemName}
          </h4>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isPrimer
                ? "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
            }`}
          >
            {isPrimer ? "Primer" : "Bocor Halus"}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {dateFormatted}
          </span>
          {expense.syncStatus === "pending" && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              (Lokal, belum sinkron)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
          {formatRupiah(expense.amount)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(expense.id)}
          aria-label={`Hapus ${expense.itemName}`}
          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
