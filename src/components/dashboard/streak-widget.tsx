"use client";

import React from "react";
import { Flame, ShieldCheck, AlertCircle } from "lucide-react";
import { rupiah } from "@/lib/format";

interface StreakWidgetProps {
  streakDays: number;
  dailyAllowance: number;
  todaySpent: number;
}

export function StreakWidget({ streakDays, dailyAllowance, todaySpent }: StreakWidgetProps) {
  const isOverspent = todaySpent > dailyAllowance;
  const sisa = Math.max(0, dailyAllowance - todaySpent);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isOverspent
                ? "bg-rose-500/10 text-rose-500"
                : streakDays > 0
                ? "bg-amber-500/10 text-amber-500"
                : "bg-ink/5 dark:bg-navy-800 text-ink-soft"
            }`}
          >
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-body font-bold text-ink dark:text-white">Streak Hemat</h3>
              <span
                className={`text-meta font-semibold px-2 py-0.5 rounded-full ${
                  isOverspent
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isOverspent ? "Jatah Terlewati" : "On Track"}
              </span>
            </div>
            <p className="text-meta text-ink-soft dark:text-navy-400">
              Disiplin di bawah jatah harian
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-display font-black text-ink dark:text-white money">
            {streakDays}
          </span>
          <span className="text-meta text-ink-soft dark:text-navy-400 block -mt-1">
            Hari
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-ink/10 dark:border-navy-800 flex items-center justify-between text-meta">
        <div className="flex items-center gap-1.5 text-ink-soft dark:text-navy-400">
          {isOverspent ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          )}
          <span>
            {isOverspent
              ? `Boncos ${rupiah(todaySpent - dailyAllowance)} hari ini`
              : `Sisa jatah hari ini: ${rupiah(sisa)}`}
          </span>
        </div>
        <span className="font-medium text-ink dark:text-navy-200">
          Batas: {rupiah(dailyAllowance)}/hari
        </span>
      </div>
    </div>
  );
}
