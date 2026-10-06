"use client";

import React, { useState } from "react";
import { Flame, Trophy, Zap, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { StreakSummary, DailyCashflowPoint } from "@/types/streak-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface StreakStripMobileProps {
  summary: StreakSummary;
}

export function StreakStripMobile({ summary }: StreakStripMobileProps) {
  const [selectedPoint, setSelectedPoint] = useState<DailyCashflowPoint | null>(null);

  // Take the last 7 days evaluated
  const last7Days = summary.monthlyPoints
    .filter((pt) => !pt.isFuture)
    .slice(-7);

  return (
    <div className="rounded-[1.75rem] bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/30 dark:via-[#070E1A] dark:to-[#070E1A] border border-amber-500/30 p-4 shadow-sm space-y-3">
      {/* Header with Flame Animation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-navy-950 dark:text-cream-50">
                {summary.currentStreak} Hari Streak Hemat
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                {summary.badge.title}
              </span>
            </div>
            <p className="text-[10px] text-navy-500 dark:text-cream-400">
              {summary.greenDaysCount} hari puasa jajan bulan ini 🟢
            </p>
          </div>
        </div>

        <span className="text-xl">{summary.badge.emoji}</span>
      </div>

      {/* Horizontal Swipeable Strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 pt-1 custom-scrollbar">
        {last7Days.map((pt) => {
          const isSelected = selectedPoint?.date === pt.date;
          return (
            <button
              type="button"
              key={pt.date}
              onClick={() => setSelectedPoint(isSelected ? null : pt)}
              className={`flex-1 min-w-[44px] min-h-[56px] py-2 px-1 rounded-2xl flex flex-col items-center justify-between border transition-all ${
                isSelected
                  ? "ring-2 ring-navy-950 dark:ring-cream-100 scale-105"
                  : ""
              } ${
                pt.status === "no_spend"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : pt.status === "disciplined"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
              }`}
            >
              <span className="text-[10px] font-semibold opacity-70">
                {pt.dayName}
              </span>
              <span className="text-xs font-black">
                {pt.dayNumber}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  pt.status === "no_spend"
                    ? "bg-emerald-500"
                    : pt.status === "disciplined"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Selected Day Drawer (Micro popup) */}
      {selectedPoint && (
        <div className="p-3 rounded-2xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 text-xs text-navy-800 dark:text-cream-200 flex items-center justify-between animate-in fade-in duration-200">
          <div>
            <span className="font-bold block">
              Tanggal {selectedPoint.dayNumber} ({selectedPoint.dayName})
            </span>
            <span className="text-[11px] text-navy-500 dark:text-cream-400">
              Total belanja: {formatRupiah(selectedPoint.totalSpent)} ({selectedPoint.transactionsCount} transaksi)
            </span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedPoint.status === "no_spend"
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : selectedPoint.status === "disciplined"
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {selectedPoint.status === "no_spend"
              ? "🟢 Puasa Jajan"
              : selectedPoint.status === "disciplined"
              ? "🟡 Disiplin"
              : "🔴 Melebihi Batas"}
          </span>
        </div>
      )}
    </div>
  );
}
