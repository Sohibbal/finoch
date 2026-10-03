"use client";

import React from "react";
import { Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { DigitalTwinMetrics } from "@/types/financial-types";

interface DigitalTwinCardProps {
  metrics: DigitalTwinMetrics;
}

export function DigitalTwinCard({ metrics }: DigitalTwinCardProps) {
  const {
    monthlyIncome,
    monthlyExpenses,
    netSavings,
  } = metrics;

  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
  const isSurplus = netSavings >= 0;

  return (
    <div className="bg-white dark:bg-[#0c1322] rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800/80 space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Ringkasan Finansial
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Posisi arus kas dan akumulasi pengeluaran Anda periode ini
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
              isSurplus
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
            }`}
          >
            {isSurplus ? "Arus Kas Sehat (Surplus)" : "Perhatian: Defisit"}
          </span>
        </div>
      </div>

      {/* 3 Metric Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pemasukan */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pemasukan Bulanan</span>
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">
            Rp {monthlyIncome.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-400">
            Penghasilan rutin
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Pengeluaran</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">
            Rp {monthlyExpenses.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-400">
            {expenseRatio.toFixed(0)}% dari penghasilan
          </div>
        </div>

        {/* Arus Kas Bersih */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Arus Kas Bersih</span>
            <ArrowUpRight className={`w-3.5 h-3.5 ${isSurplus ? "text-emerald-500" : "text-rose-500"}`} />
          </div>
          <div
            className={`text-lg font-extrabold ${
              isSurplus ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            Rp {netSavings.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-400">
            {isSurplus ? "Sisa siap ditabung" : "Kurang dari anggaran"}
          </div>
        </div>
      </div>

      {/* Clean Single Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Kapasitas Anggaran Terpakai</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {Math.min(100, expenseRatio).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              expenseRatio <= 70
                ? "bg-blue-600 dark:bg-blue-500"
                : expenseRatio <= 90
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, expenseRatio))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
