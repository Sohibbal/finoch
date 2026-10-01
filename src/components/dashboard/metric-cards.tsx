"use client";

import React from "react";
import { TrendingDown, Calendar, Wallet } from "lucide-react";
import type { Expense } from "@/lib/types/expense";
import { formatRupiah } from "../expense/parsed-expense-list";

export interface ExpenseMetrics {
  totalMonth: number;
  totalToday: number;
  totalWeek: number;
  primerTotal: number;
  bocorHalusTotal: number;
  primerPercentage: number;
  bocorHalusPercentage: number;
}

export function calculateMetrics(expenses: Expense[]): ExpenseMetrics {
  if (!expenses || expenses.length === 0) {
    return {
      totalMonth: 0,
      totalToday: 0,
      totalWeek: 0,
      primerTotal: 0,
      bocorHalusTotal: 0,
      primerPercentage: 0,
      bocorHalusPercentage: 0,
    };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Start of current week (assuming Monday as start)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let totalMonth = 0;
  let totalToday = 0;
  let totalWeek = 0;
  let primerTotal = 0;
  let bocorHalusTotal = 0;

  for (const exp of expenses) {
    if (exp.isDeleted) continue;
    const expTime = new Date(exp.createdAt).getTime();

    // Check month
    if (expTime >= startOfMonth) {
      totalMonth += exp.amount;
      if (exp.category === "primer") {
        primerTotal += exp.amount;
      } else {
        bocorHalusTotal += exp.amount;
      }
    }

    // Check week
    if (expTime >= startOfWeek) {
      totalWeek += exp.amount;
    }

    // Check today
    if (expTime >= startOfDay) {
      totalToday += exp.amount;
    }
  }

  const combined = primerTotal + bocorHalusTotal;
  const primerPercentage = combined > 0 ? Math.round((primerTotal / combined) * 100) : 0;
  const bocorHalusPercentage = combined > 0 ? 100 - primerPercentage : 0;

  return {
    totalMonth,
    totalToday,
    totalWeek,
    primerTotal,
    bocorHalusTotal,
    primerPercentage,
    bocorHalusPercentage,
  };
}

interface MetricCardsProps {
  expenses: Expense[];
}

export function MetricCards({ expenses }: MetricCardsProps) {
  const metrics = calculateMetrics(expenses);

  return (
    <div className="space-y-3">
      {/* Primary month card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between text-indigo-200 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Pengeluaran Bulan Ini
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-indigo-100">
            {new Date().toLocaleDateString("id-ID", { month: "long" })}
          </span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-white">
          {formatRupiah(metrics.totalMonth)}
        </h2>

        <p className="text-xs text-indigo-300 mt-2">
          Primer: <span className="font-semibold text-emerald-300">{formatRupiah(metrics.primerTotal)}</span> • Bocor Halus: <span className="font-semibold text-amber-300">{formatRupiah(metrics.bocorHalusTotal)}</span>
        </p>
      </div>

      {/* Today and Week summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-indigo-500" />
            Hari Ini
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatRupiah(metrics.totalToday)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Minggu Ini
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatRupiah(metrics.totalWeek)}
          </p>
        </div>
      </div>
    </div>
  );
}
