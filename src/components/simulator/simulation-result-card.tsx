"use client";

import React from "react";
import {
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { WhatIfSimulationResult } from "@/lib/financial/financial-engine";

interface SimulationResultCardProps {
  result: WhatIfSimulationResult;
  baselineNetSavings: number;
  baselineMonthsToGoal: number;
}

export function SimulationResultCard({
  result,
  baselineNetSavings,
  baselineMonthsToGoal,
}: SimulationResultCardProps) {
  const { simulatedNetSavings, deltaMonthlySavings, simulatedMonthsToGoal } =
    result;

  const isPositiveDelta = deltaMonthlySavings >= 0;
  const isDeficit = simulatedNetSavings <= 0;
  const isInfinite = !isFinite(simulatedMonthsToGoal) || simulatedMonthsToGoal > 1200;

  const monthsDifference =
    isFinite(baselineMonthsToGoal) && !isInfinite
      ? baselineMonthsToGoal - simulatedMonthsToGoal
      : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hasil Simulasi Masa Depan
            </h3>
            <p className="text-xs text-slate-500">
              Dampak perubahan anggaran terhadap percepatan target finansial Anda
            </p>
          </div>
        </div>

        {isDeficit ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Defisit Anggaran
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Simulasi Sehat
          </span>
        )}
      </div>

      {/* Main Stats Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tabungan Bersih Bulanan */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-xs text-slate-500 font-medium">
            Proyeksi Tabungan Bersih per Bulan
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                isDeficit
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              Rp {simulatedNetSavings.toLocaleString("id-ID")}
            </span>
            <span
              className={`text-xs font-bold ${
                isPositiveDelta
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isPositiveDelta ? "+" : ""}
              Rp {deltaMonthlySavings.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Baseline saat ini: Rp {baselineNetSavings.toLocaleString("id-ID")}/bln
          </div>
        </div>

        {/* Waktu Mencapai Target Goal */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-xs text-slate-500 font-medium">
            Estimasi Waktu Capai Target
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {isInfinite ? "Tidak Tercapai" : `${simulatedMonthsToGoal} Bulan`}
            </span>
            {monthsDifference > 0 && !isInfinite && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {monthsDifference} Bulan Lebih Cepat!
              </span>
            )}
            {monthsDifference < 0 && !isInfinite && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {Math.abs(monthsDifference)} Bulan Lebih Lambat
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            Baseline estimasi:{" "}
            {isFinite(baselineMonthsToGoal)
              ? `${baselineMonthsToGoal} Bulan`
              : "Belum Ditentukan"}
          </div>
        </div>
      </div>

      {/* Visual Transformation Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-blue-500/10 border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-white rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {monthsDifference > 0
                ? `Strategi ini memajukan target finansial Anda ${monthsDifference} bulan!`
                : monthsDifference < 0
                ? "Waspada: Perubahan ini menunda tercapainya target finansial Anda."
                : "Anggaran berjalan seimbang dengan ritme saat ini."}
            </div>
            <div className="text-xs text-slate-500">
              Setiap rupiah yang dialihkan mempercepat kebebasan finansial Anda.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
