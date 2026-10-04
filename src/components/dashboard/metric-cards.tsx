"use client";

import React from "react";
import { Mic, Plus, MoreHorizontal, ShieldCheck, ChevronRight } from "lucide-react";
import type { Expense } from "@/lib/types/expense";
import { formatRupiah } from "../expense/parsed-expense-list";

export interface ExpenseMetrics {
  totalMonth: number;
  totalToday: number;
  totalWeek: number;
  topCategoryName: string;
  topCategoryTotal: number;
  topCategoryPercentage: number;
}

export function calculateMetrics(expenses: Expense[]): ExpenseMetrics {
  if (!expenses || expenses.length === 0) {
    return {
      totalMonth: 0,
      totalToday: 0,
      totalWeek: 0,
      topCategoryName: "Belum ada pengeluaran",
      topCategoryTotal: 0,
      topCategoryPercentage: 0,
    };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let totalMonth = 0;
  let totalToday = 0;
  let totalWeek = 0;
  const categoryTotals: Record<string, number> = {};

  for (const exp of expenses) {
    if (exp.isDeleted) continue;
    const expTime = new Date(exp.createdAt).getTime();

    if (expTime >= startOfMonth) {
      totalMonth += exp.amount;
      const cat = exp.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    }

    if (expTime >= startOfWeek) {
      totalWeek += exp.amount;
    }

    if (expTime >= startOfDay) {
      totalToday += exp.amount;
    }
  }

  let topCategoryName = "Belum ada pengeluaran";
  let topCategoryTotal = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topCategoryTotal) {
      topCategoryName = cat;
      topCategoryTotal = amt;
    }
  }

  const topCategoryPercentage = totalMonth > 0 ? Math.round((topCategoryTotal / totalMonth) * 100) : 0;

  return {
    totalMonth,
    totalToday,
    totalWeek,
    topCategoryName,
    topCategoryTotal,
    topCategoryPercentage,
  };
}

interface MetricCardsProps {
  expenses: Expense[];
  onOpenVoice?: () => void;
  onOpenManual?: () => void;
  onOpenPrivacy?: () => void;
}

export function MetricCards({ expenses, onOpenVoice, onOpenManual, onOpenPrivacy }: MetricCardsProps) {
  const metrics = calculateMetrics(expenses);

  return (
    <div className="space-y-4">
      {/* 1. Hero Total Balance Display with Quick Action Pills */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0e1526]/85 border border-slate-200/90 dark:border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-slate-200/60 dark:shadow-blue-950/50 transition-colors">
        {/* Subtle radial blue backdrop light */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
              Total Pengeluaran Bulan Ini
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatRupiah(metrics.totalMonth)}
              </h2>
            </div>
          </div>

          {/* Quick Action Pills Row */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenVoice}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs shadow-sm transition active:scale-95"
            >
              <Mic className="w-4 h-4 stroke-[2.2]" />
              <span>Bicara Suara</span>
              <span className="w-5 h-5 rounded-lg bg-navy-800 dark:bg-cream-200 text-cream-50 dark:text-navy-950 flex items-center justify-center text-xs font-black">
                +
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenManual || onOpenVoice}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cream-200/70 hover:bg-cream-200 dark:bg-navy-900 dark:hover:bg-navy-800 border border-cream-300 dark:border-navy-800 text-navy-950 dark:text-cream-50 font-semibold text-xs transition active:scale-95"
            >
              <span>Manual</span>
              <span className="w-5 h-5 rounded-lg bg-cream-300/80 dark:bg-navy-800 text-navy-900 dark:text-cream-100 flex items-center justify-center text-xs font-bold">
                +
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenPrivacy}
              aria-label="Komitmen Privasi"
              className="w-10 h-10 rounded-xl bg-cream-200/70 hover:bg-cream-200 dark:bg-navy-900 dark:hover:bg-navy-800 border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 flex items-center justify-center transition active:scale-95"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Status Banner Card */}
      <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-[#0e1526]/80 border border-blue-200/90 dark:border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-md shadow-blue-600/5 dark:shadow-blue-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        {/* Subtle decorative geometric watermark grid on the right */}
        <div className="absolute top-2 right-4 w-32 h-32 opacity-15 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.5">
            <rect x="5" y="5" width="40" height="40" rx="10" />
            <rect x="55" y="5" width="40" height="40" rx="10" />
            <rect x="5" y="55" width="40" height="40" rx="10" />
            <rect x="55" y="55" width="40" height="40" rx="10" />
          </svg>
        </div>

        <div className="relative z-10 flex items-start gap-4">
          {/* Scalloped bright blue badge with checkmark */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30 shrink-0">
            <ShieldCheck className="w-7 h-7 text-white stroke-[2.4]" />
          </div>

          <div className="space-y-1 pr-6 sm:pr-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Penyimpanan Lokal Aktif</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
              Data suara Anda diproses di peramban dan tersimpan aman di IndexedDB lokal tanpa pelacak.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPrivacy}
          aria-label="Lihat status privasi dan penyimpanan"
          className="relative z-10 w-10 h-10 rounded-full bg-white dark:bg-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.15] border border-slate-200 dark:border-white/[0.1] text-blue-600 dark:text-blue-400 flex items-center justify-center self-end sm:self-center transition active:scale-95 shrink-0 shadow-sm"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* 3. Analytics Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tren &amp; Kinerja Anggaran (7 Hari)
          </h3>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            Hari ini: {formatRupiah(metrics.totalToday)}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0b1222]/85 border border-slate-200/90 dark:border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-blue-950/40 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                Rp
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                    {metrics.topCategoryPercentage > 0 ? `${metrics.topCategoryPercentage}% Terbesar` : "Kategori Utama"}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatRupiah(metrics.topCategoryTotal || metrics.totalMonth)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {metrics.topCategoryName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                Minggu Ini
              </span>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {formatRupiah(metrics.totalWeek)}
              </p>
            </div>
          </div>

          {/* Area Sparkline Wave with Blue Neon Gradient */}
          <div className="relative pt-2">
            <svg
              className="w-full h-24 overflow-visible"
              viewBox="0 0 320 80"
              preserveAspectRatio="none"
              aria-label="Grafik tren pengeluaran"
            >
              <defs>
                <linearGradient id="sparklineAreaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#2563eb" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="sparklineStrokeGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>

              {/* Area Under Curve */}
              <path
                d="M 0,65 Q 40,55 80,68 T 160,35 T 240,42 T 320,20 L 320,80 L 0,80 Z"
                fill="url(#sparklineAreaGlow)"
              />

              {/* Radiant Blue Stroke */}
              <path
                d="M 0,65 Q 40,55 80,68 T 160,35 T 240,42 T 320,20"
                fill="none"
                stroke="url(#sparklineStrokeGlow)"
                strokeWidth="2.75"
              />

              {/* End Point Dot */}
              <circle
                cx="320"
                cy="20"
                r="4.5"
                fill="#3b82f6"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
