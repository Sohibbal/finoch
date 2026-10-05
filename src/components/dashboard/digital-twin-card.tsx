"use client";

import React, { useMemo } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
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

  // New Feature: Safe to Spend (Batas Aman Harian)
  const safeToSpendDaily = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - today.getDate() + 1);
    
    // Asumsikan target tabungan 20% dari income
    const targetSavings = monthlyIncome * 0.2;
    const availableBudget = monthlyIncome - targetSavings - monthlyExpenses;
    
    return Math.max(0, availableBudget / daysLeft);
  }, [monthlyIncome, monthlyExpenses]);

  return (
    <div className="group relative">
      {/* Outer Shell (Double-Bezel) */}
      <div className="p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
        
        {/* Inner Core */}
        <div className="relative bg-white dark:bg-[#070E1A] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-900/5 dark:border-white/5 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 dark:bg-white/5 border border-navy-900/10 dark:border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-navy-600 dark:text-cream-300">
                <Sparkles className="w-3 h-3" />
                <span>Digital Twin Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white tracking-tight mt-2">
                Kondisi Finansial
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-md ${
                  isSurplus
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {isSurplus ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Surplus Aman</span>
                  </>
                ) : (
                  "Perhatian: Defisit"
                )}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
            {/* Pemasukan */}
            <div className="p-5 rounded-2xl bg-navy-50/50 dark:bg-white/[0.02] border border-navy-900/5 dark:border-white/5 transition-all duration-500 hover:bg-navy-50 dark:hover:bg-white/[0.04]">
              <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-cream-400/70 mb-3">
                <span>Pemasukan</span>
                <Wallet className="w-4 h-4 text-navy-400" />
              </div>
              <div className="text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                Rp {monthlyIncome.toLocaleString("id-ID")}
              </div>
            </div>

            {/* Pengeluaran */}
            <div className="p-5 rounded-2xl bg-navy-50/50 dark:bg-white/[0.02] border border-navy-900/5 dark:border-white/5 transition-all duration-500 hover:bg-navy-50 dark:hover:bg-white/[0.04]">
              <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-cream-400/70 mb-3">
                <span>Pengeluaran</span>
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                Rp {monthlyExpenses.toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] font-medium text-navy-500 dark:text-cream-400/50 mt-1">
                {expenseRatio.toFixed(1)}% dari batas
              </div>
            </div>

            {/* Arus Kas */}
            <div className="p-5 rounded-2xl bg-navy-50/50 dark:bg-white/[0.02] border border-navy-900/5 dark:border-white/5 transition-all duration-500 hover:bg-navy-50 dark:hover:bg-white/[0.04]">
              <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-cream-400/70 mb-3">
                <span>Arus Kas</span>
                <ArrowUpRight className={`w-4 h-4 ${isSurplus ? "text-emerald-500" : "text-rose-500"}`} />
              </div>
              <div className={`text-2xl font-black tracking-tight ${
                isSurplus ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                Rp {netSavings.toLocaleString("id-ID")}
              </div>
            </div>

            {/* New Feature: Safe to Spend */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 dark:from-white/10 dark:to-white/5 border border-navy-800 dark:border-white/10 shadow-lg relative overflow-hidden group/safe">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/safe:opacity-100 transition-opacity duration-700" />
              <div className="flex items-center justify-between text-xs font-semibold text-cream-200 dark:text-cream-300/80 mb-3 relative z-10">
                <span>Batas Aman Harian</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight relative z-10">
                Rp {safeToSpendDaily.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] font-medium text-cream-300/60 mt-1 relative z-10">
                Sisa hari ini untuk tetap surplus
              </div>
            </div>
          </div>

          {/* Premium Progress Bar */}
          <div className="mt-8 space-y-2.5 relative z-10">
            <div className="flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wider">
              <span>Kapasitas Anggaran Terpakai</span>
              <span className="bg-navy-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                {Math.min(100, expenseRatio).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-navy-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] relative overflow-hidden ${
                  expenseRatio <= 70
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : expenseRatio <= 90
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-gradient-to-r from-rose-500 to-rose-600"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, expenseRatio))}%` }}
              >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
