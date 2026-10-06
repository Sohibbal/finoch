"use client";

import React from "react";
import { Trophy, Flame, Zap, Shield, Sparkles } from "lucide-react";
import { StreakSummary } from "@/types/streak-types";

interface StreakBadgeCardProps {
  summary: StreakSummary;
}

export function StreakBadgeCard({ summary }: StreakBadgeCardProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-blue-500/15 border border-amber-500/30 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-navy-900 border border-amber-500/30 text-3xl flex items-center justify-center shrink-0 shadow-md">
          {summary.badge.emoji}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
              Pencapaian Mahasiswa
            </span>
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400">
              Level: {summary.badge.level.toUpperCase()}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-navy-950 dark:text-cream-50 mt-0.5">
            {summary.badge.title}
          </h3>
          <p className="text-xs text-navy-600 dark:text-cream-300 mt-0.5">
            {summary.badge.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/10 shrink-0">
        <div className="text-center px-3 py-1.5 rounded-xl bg-white/70 dark:bg-navy-900/70 border border-black/5">
          <span className="text-[10px] text-navy-500 dark:text-cream-400 block font-semibold">
            Streak Aktif
          </span>
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">
            🔥 {summary.currentStreak} Hari
          </span>
        </div>

        <div className="text-center px-3 py-1.5 rounded-xl bg-white/70 dark:bg-navy-900/70 border border-black/5">
          <span className="text-[10px] text-navy-500 dark:text-cream-400 block font-semibold">
            Puasa Jajan
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            🟢 {summary.greenDaysCount} Hari
          </span>
        </div>
      </div>
    </div>
  );
}
