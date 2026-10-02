"use client";

import React from "react";
import { TrendingUp, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { DigitalTwinMetrics } from "@/types/financial-types";

interface DigitalTwinCardProps {
  metrics: DigitalTwinMetrics;
}

export function DigitalTwinCard({ metrics }: DigitalTwinCardProps) {
  const {
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    savingsRate,
    needsAmount,
    wantsAmount,
    savingsAmount,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    needsStatus,
    wantsStatus,
    savingsStatus,
  } = metrics;

  const getStatusBadge = (status: "optimal" | "warning" | "danger", label: string) => {
    switch (status) {
      case "optimal":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label || "Ideal"}
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            {label || "Perlu Perhatian"}
          </span>
        );
      case "danger":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            {label || "Berisiko"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Top Banner / Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Digital Twin Finansial (Model 50/30/20)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulasi kondisi riil anggaran Anda terhadap rasio sehat benchmark keuangan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500">Savings Rate</div>
            <div
              className={`text-xl font-black ${
                savingsRate >= 20
                  ? "text-emerald-600 dark:text-emerald-400"
                  : savingsRate >= 10
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {savingsRate.toFixed(1)}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="text-right">
            <div className="text-xs text-slate-500">Tabungan Bersih</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Rp {netSavings.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Tracks: Needs (50%), Wants (30%), Savings (20%) */}
      <div className="space-y-5">
        {/* Track 1: Needs (50%) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Kebutuhan (Needs)
              </span>
              <span className="text-xs text-slate-400">Target Maks 50%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Rp {needsAmount.toLocaleString("id-ID")} ({needsPercentage.toFixed(1)}%)
              </span>
              {getStatusBadge(needsStatus, needsStatus === "optimal" ? "Sehat" : "Overbudget")}
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                needsPercentage <= 50
                  ? "bg-emerald-500"
                  : needsPercentage <= 65
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, needsPercentage)}%` }}
            />
          </div>
        </div>

        {/* Track 2: Wants (30%) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Keinginan (Wants)
              </span>
              <span className="text-xs text-slate-400">Target Maks 30%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Rp {wantsAmount.toLocaleString("id-ID")} ({wantsPercentage.toFixed(1)}%)
              </span>
              {getStatusBadge(wantsStatus, wantsStatus === "optimal" ? "Terkendali" : "Tinggi")}
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                wantsPercentage <= 30
                  ? "bg-emerald-500"
                  : wantsPercentage <= 45
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, wantsPercentage)}%` }}
            />
          </div>
        </div>

        {/* Track 3: Savings (20%) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Tabungan & Investasi (Savings)
              </span>
              <span className="text-xs text-slate-400">Target Min 20%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Rp {savingsAmount.toLocaleString("id-ID")} ({savingsPercentage.toFixed(1)}%)
              </span>
              {getStatusBadge(savingsStatus, savingsStatus === "optimal" ? "Optimal" : "Kurang")}
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                savingsPercentage >= 20
                  ? "bg-blue-500"
                  : savingsPercentage >= 10
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.max(0, Math.min(100, savingsPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Metrics Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">Pemasukan</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Rp {monthlyIncome.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">Pengeluaran</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Rp {monthlyExpenses.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">Beban Tetap (Needs)</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Rp {needsAmount.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 font-medium">Gaya Hidup (Wants)</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            Rp {wantsAmount.toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </div>
  );
}
