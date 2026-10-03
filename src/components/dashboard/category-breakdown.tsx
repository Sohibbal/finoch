"use client";

import React from "react";
import type { ExpenseMetrics } from "./metric-cards";

interface CategoryBreakdownProps {
  metrics: ExpenseMetrics;
}

export function CategoryBreakdown({ metrics }: CategoryBreakdownProps) {
  const { topCategoryPercentage, topCategoryName, totalMonth } = metrics;
  const otherPercentage = 100 - topCategoryPercentage;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-blue-950/30 my-4 space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Distribusi Kategori Utama
        </h3>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
          {totalMonth > 0 ? "Bulan Ini" : "Simulasi Anggaran"}
        </span>
      </div>

      {/* Progress split bar with rounded ends and vibrant glow */}
      <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-blue-500/20 overflow-hidden flex p-0.5">
        <div
          style={{ width: `${topCategoryPercentage || 50}%` }}
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-l-full shadow-sm shadow-blue-500/50 transition-all duration-500"
          title={`${topCategoryName}: ${topCategoryPercentage}%`}
        />
        <div
          style={{ width: `${otherPercentage || 50}%` }}
          className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-r-full shadow-sm transition-all duration-500"
          title={`Kategori Lainnya: ${otherPercentage}%`}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm shadow-blue-500/50" />
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[160px]">
            {topCategoryName}: <strong className="text-blue-700 dark:text-blue-300 font-bold">{topCategoryPercentage}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Kategori Lainnya: <strong className="text-slate-700 dark:text-slate-300 font-bold">{otherPercentage}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
