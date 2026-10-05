"use client";

import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Mic,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Coffee,
} from "lucide-react";
import type { DailySafeToSpendResult } from "@/types/financial-types";

export interface DailySafeToSpendCardProps {
  result: DailySafeToSpendResult;
  onOpenVoice?: () => void;
  className?: string;
}

export function DailySafeToSpendCard({
  result,
  onOpenVoice,
  className = "",
}: DailySafeToSpendCardProps) {
  const {
    dailyBudget = 0,
    todaySpent = 0,
    remainingToday = 0,
    daysRemaining = 1,
    status = "safe",
    headline = "Jatah Jajan Hari Ini Aman",
    advice = "Pengeluaran hari ini masih dalam batas aman terkendali.",
  } = result;

  const spentRatio = dailyBudget > 0 ? (todaySpent / dailyBudget) * 100 : 100;
  const progressPercent = Math.min(100, Math.max(0, spentRatio));

  // Status configuration
  const statusConfig = {
    safe: {
      label: "Aman",
      icon: ShieldCheck,
      badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      accentBg: "bg-emerald-500",
      barGradient: "from-emerald-400 to-emerald-500",
      glowColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      calloutBg: "bg-emerald-500/5 dark:bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-950 dark:text-emerald-200",
      calloutIconColor: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      label: "Waspada",
      icon: AlertTriangle,
      badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      accentBg: "bg-amber-500",
      barGradient: "from-amber-400 to-amber-500",
      glowColor: "bg-amber-500/10 dark:bg-amber-500/20",
      calloutBg: "bg-amber-500/5 dark:bg-amber-500/[0.03] border-amber-500/20 text-amber-950 dark:text-amber-200",
      calloutIconColor: "text-amber-600 dark:text-amber-400",
    },
    danger: {
      label: "Krisis Tanggal Tua",
      icon: AlertOctagon,
      badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
      accentBg: "bg-rose-500",
      barGradient: "from-rose-500 to-rose-600",
      glowColor: "bg-rose-500/10 dark:bg-rose-500/20",
      calloutBg: "bg-rose-500/5 dark:bg-rose-500/[0.03] border-rose-500/20 text-rose-950 dark:text-rose-200",
      calloutIconColor: "text-rose-600 dark:text-rose-400",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.safe;
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`group relative ${className}`}>
      {/* Outer Shell (Double-Bezel Architecture) */}
      <div className="p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
        
        {/* Inner Core */}
        <div className="relative bg-white dark:bg-[#070E1A] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div
            className={`absolute -top-32 -right-32 w-72 h-72 ${currentStatus.glowColor} blur-[110px] rounded-full pointer-events-none transition-colors duration-700`}
          />

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-900/5 dark:border-white/5 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900/5 dark:bg-white/5 border border-navy-900/10 dark:border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-navy-600 dark:text-cream-300">
                <Sparkles className="w-3 h-3 text-navy-600 dark:text-cream-300" />
                <span>Navigasi Jajan Anak Kost</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                {`Jatah Jajan Hari Ini: Rp ${dailyBudget.toLocaleString("id-ID")}`}
              </h2>
            </div>

            {/* Status Indicator & Days Left Badge */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-sm backdrop-blur-md transition-colors ${currentStatus.badgeBg}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{currentStatus.label}</span>
              </span>

              {/* Days Remaining Badge */}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-navy-900/5 dark:bg-white/5 border border-navy-900/10 dark:border-white/10 text-navy-700 dark:text-cream-300">
                <Calendar className="w-3.5 h-3.5 text-navy-500 dark:text-cream-400" />
                <span>{`${daysRemaining} hari tersisa sampai akhir bulan`}</span>
              </span>
            </div>
          </div>

          {/* Key Metrics Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 relative z-10">
            {/* 1. Jatah Harian */}
            <div className="p-4 sm:p-5 rounded-2xl bg-navy-50/50 dark:bg-white/[0.02] border border-navy-900/5 dark:border-white/5 transition-all duration-500 hover:bg-navy-50 dark:hover:bg-white/[0.04]">
              <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-cream-400/70 mb-2">
                <span>Jatah Harian</span>
                <Coffee className="w-4 h-4 text-navy-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                {`Rp ${dailyBudget.toLocaleString("id-ID")}`}
                <span className="text-xs font-medium text-navy-400 dark:text-cream-400/60 ml-1">/ hari</span>
              </div>
            </div>

            {/* 2. Terpakai Hari Ini */}
            <div className="p-4 sm:p-5 rounded-2xl bg-navy-50/50 dark:bg-white/[0.02] border border-navy-900/5 dark:border-white/5 transition-all duration-500 hover:bg-navy-50 dark:hover:bg-white/[0.04]">
              <div className="flex items-center justify-between text-xs font-semibold text-navy-500 dark:text-cream-400/70 mb-2">
                <span>Terpakai Hari Ini</span>
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                {`Rp ${todaySpent.toLocaleString("id-ID")}`}
              </div>
              <div className="text-[11px] font-medium text-navy-500 dark:text-cream-400/50 mt-1">
                {`${Math.round(spentRatio)}% dari jatah`}
              </div>
            </div>

            {/* 3. Sisa Hari Ini */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 dark:from-white/10 dark:to-white/5 border border-navy-800 dark:border-white/10 shadow-lg relative overflow-hidden group/sisa">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/sisa:opacity-100 transition-opacity duration-700" />
              <div className="flex items-center justify-between text-xs font-semibold text-cream-200 dark:text-cream-300/80 mb-2 relative z-10">
                <span>Sisa Hari Ini</span>
                <span className={`w-2 h-2 rounded-full ${currentStatus.accentBg}`} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight relative z-10">
                {`Rp ${remainingToday.toLocaleString("id-ID")}`}
              </div>
              <div className="text-[11px] font-medium text-cream-300/60 mt-1 relative z-10">
                {remainingToday > 0 ? "Bebas dipakai jajan" : "Jatah hari ini habis"}
              </div>
            </div>
          </div>

          {/* Progress Bar against Daily Allowance */}
          <div className="mt-6 space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wider">
              <span>Penggunaan Jatah Hari Ini</span>
              <span className="bg-navy-100 dark:bg-white/10 px-2 py-0.5 rounded-md text-[11px]">
                {`${Math.round(progressPercent)}%`}
              </span>
            </div>
            <div className="w-full h-3 bg-navy-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] relative overflow-hidden bg-gradient-to-r ${currentStatus.barGradient}`}
                style={{ width: `${progressPercent}%` }}
              >
                {/* Visual shine effect */}
                <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>

          {/* Student Relatable Advice & Action Callout */}
          <div className="mt-6 pt-5 border-t border-navy-900/5 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div
              className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border transition-colors ${currentStatus.calloutBg}`}
            >
              <div className="w-7 h-7 rounded-full bg-navy-900/10 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <StatusIcon className={`w-3.5 h-3.5 ${currentStatus.calloutIconColor}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold tracking-tight text-navy-950 dark:text-white">
                  {headline}
                </p>
                <p className="text-xs leading-relaxed opacity-90">
                  {advice}
                </p>
              </div>
            </div>

            {/* Quick-action Voice/Expense Button */}
            {onOpenVoice && (
              <button
                type="button"
                onClick={onOpenVoice}
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-navy-950 hover:bg-navy-900 dark:bg-white dark:hover:bg-cream-100 text-white dark:text-navy-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] group/cta shrink-0"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center group-hover/cta:scale-110 transition-transform">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span>Catat Pengeluaran (Bicara)</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover/cta:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
