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
    <div className="bg-white dark:bg-[#070E1A] rounded-2xl p-5 sm:p-6 shadow-sm border border-cream-300 dark:border-navy-800 space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cream-200 dark:border-navy-800/80">
        <div>
          <h2 className="text-base font-bold text-navy-950 dark:text-cream-50">
            Ringkasan Finansial
          </h2>
          <p className="text-xs text-navy-600 dark:text-cream-300/70 mt-0.5">
            Posisi arus kas dan akumulasi pengeluaran Anda periode ini
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
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
        <div className="p-4 rounded-xl bg-cream-50/70 dark:bg-navy-900/50 border border-cream-200 dark:border-navy-800/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-navy-500 dark:text-cream-400">
            <span>Pemasukan Bulanan</span>
            <Wallet className="w-3.5 h-3.5 text-navy-400 dark:text-cream-400" />
          </div>
          <div className="text-lg font-black text-navy-950 dark:text-cream-50">
            Rp {monthlyIncome.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-navy-400 dark:text-cream-400/70">
            Penghasilan rutin
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 rounded-xl bg-cream-50/70 dark:bg-navy-900/50 border border-cream-200 dark:border-navy-800/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-navy-500 dark:text-cream-400">
            <span>Total Pengeluaran</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-lg font-black text-navy-950 dark:text-cream-50">
            Rp {monthlyExpenses.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-navy-400 dark:text-cream-400/70">
            {expenseRatio.toFixed(0)}% dari penghasilan
          </div>
        </div>

        {/* Arus Kas Bersih */}
        <div className="p-4 rounded-xl bg-cream-50/70 dark:bg-navy-900/50 border border-cream-200 dark:border-navy-800/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-navy-500 dark:text-cream-400">
            <span>Arus Kas Bersih</span>
            <ArrowUpRight className={`w-3.5 h-3.5 ${isSurplus ? "text-emerald-500" : "text-rose-500"}`} />
          </div>
          <div
            className={`text-lg font-black ${
              isSurplus ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            Rp {netSavings.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-navy-400 dark:text-cream-400/70">
            {isSurplus ? "Sisa siap ditabung" : "Kurang dari anggaran"}
          </div>
        </div>
      </div>

      {/* Clean Single Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-navy-600 dark:text-cream-400">
          <span>Kapasitas Anggaran Terpakai</span>
          <span className="font-semibold text-navy-800 dark:text-cream-200">
            {Math.min(100, expenseRatio).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-cream-200 dark:bg-navy-900 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              expenseRatio <= 70
                ? "bg-navy-900 dark:bg-cream-100"
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
