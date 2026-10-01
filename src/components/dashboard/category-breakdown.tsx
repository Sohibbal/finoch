"use client";

import React from "react";
import type { ExpenseMetrics } from "./metric-cards";

interface CategoryBreakdownProps {
  metrics: ExpenseMetrics;
}

export function CategoryBreakdown({ metrics }: CategoryBreakdownProps) {
  const { primerPercentage, bocorHalusPercentage, totalMonth } = metrics;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm my-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Analisis Pengeluaran Mahasiswa
        </h3>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {totalMonth > 0 ? "Bulan Ini" : "Belum ada data"}
        </span>
      </div>

      {/* Progress split bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex my-2">
        <div
          style={{ width: `${primerPercentage}%` }}
          className="h-full bg-emerald-500 transition-all duration-500"
          title={`Primer: ${primerPercentage}%`}
        />
        <div
          style={{ width: `${bocorHalusPercentage}%` }}
          className="h-full bg-amber-500 transition-all duration-500"
          title={`Bocor Halus: ${bocorHalusPercentage}%`}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Primer: <strong className="text-slate-900 dark:text-slate-100">{primerPercentage}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Bocor Halus: <strong className="text-slate-900 dark:text-slate-100">{bocorHalusPercentage}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
