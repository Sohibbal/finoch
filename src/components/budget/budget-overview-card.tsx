"use client";

import React from "react";
import {
  Wallet,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { BudgetSummary, ReallocationSuggestion } from "@/types/budget-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BudgetOverviewCardProps {
  summary: BudgetSummary;
  suggestions?: ReallocationSuggestion[];
  onApplySuggestion?: (sug: ReallocationSuggestion) => void;
}

export function BudgetOverviewCard({
  summary,
  suggestions = [],
  onApplySuggestion,
}: BudgetOverviewCardProps) {
  const topSuggestion = suggestions.length > 0 ? suggestions[0] : null;

  return (
    <div className="space-y-4">
      {/* Mobile Card Layout (md:hidden) */}
      <div className="md:hidden rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-cream-50 p-4 shadow-lg border border-navy-800">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cream-400">
                Amplop Digital Mahasiswa
              </span>
              <h2 className="text-sm font-bold text-white">Ringkasan Anggaran</h2>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {summary.envelopeCount} Pos
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <span className="text-[11px] text-cream-400 block">Total Jatah:</span>
            <span className="text-sm font-bold text-white">
              {formatRupiah(summary.totalAllocated)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-cream-400 block">Total Terpakai:</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatRupiah(summary.totalSpent)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-cream-400 block">Sisa Dana Keseluruhan:</span>
            <span className="text-base font-black text-white">
              {formatRupiah(summary.totalRemaining)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-cream-400 block">Kapasitas:</span>
            <span
              className={`text-xs font-bold ${
                summary.status === "exceeded"
                  ? "text-rose-400"
                  : summary.status === "warning"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {summary.overallPercentage}% terpakai
            </span>
          </div>
        </div>

        {summary.overbudgetCount > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Perhatian: <strong>{summary.overbudgetCount} pos anggaran</strong> telah melebihi batas limit!
            </span>
          </div>
        )}
      </div>

      {/* Desktop Bento Row (hidden md:grid) */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {/* Box 1: Total Allocated */}
        <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Total Anggaran Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-cream-200 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(summary.totalAllocated)}
            </div>
            <div className="text-xs text-navy-600 dark:text-cream-400 mt-1 flex items-center gap-1.5">
              <span>{summary.envelopeCount} amplop pos terdaftar</span>
            </div>
          </div>
        </div>

        {/* Box 2: Total Spent & Remaining */}
        <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Realisasi & Sisa Dana
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatRupiah(summary.totalRemaining)}
            </div>
            <div className="text-xs text-navy-600 dark:text-cream-400 mt-1 flex items-center justify-between">
              <span>Terpakai {formatRupiah(summary.totalSpent)}</span>
              <span className="font-bold text-navy-800 dark:text-cream-200">
                {summary.overallPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Box 3: Health Status & Overbudget Count */}
        <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Status Disiplin Anggaran
            </span>
            {summary.status === "exceeded" ? (
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            ) : summary.status === "warning" ? (
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="text-xl font-black text-navy-950 dark:text-cream-50">
              {summary.status === "exceeded"
                ? `${summary.overbudgetCount} Pos Defisit`
                : summary.status === "warning"
                ? "Mendekati Batas"
                : "Anggaran Terkendali"}
            </div>
            <div className="text-xs text-navy-600 dark:text-cream-400 mt-1">
              {summary.status === "exceeded"
                ? "Segera pindahkan dana dari pos surplus"
                : summary.status === "warning"
                ? "Waspadai pos makan & hiburan minggu ini"
                : "Pengeluaran mahasiswa berjalan sehat"}
            </div>
          </div>
        </div>
      </div>

      {/* Intelligent AI Reallocation Nudge Banner */}
      {topSuggestion && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wide">
                Rekomendasi AI Finoch: Seimbangkan Amplop
              </h4>
              <p className="text-xs text-navy-700 dark:text-cream-300 mt-0.5">
                {topSuggestion.message}
              </p>
            </div>
          </div>

          {onApplySuggestion && (
            <button
              onClick={() => onApplySuggestion(topSuggestion)}
              className="px-3.5 py-2 rounded-xl bg-navy-950 dark:bg-cream-100 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shrink-0 hover:opacity-90 active:scale-95 transition-all"
            >
              <span>Seimbangkan Otomatis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
