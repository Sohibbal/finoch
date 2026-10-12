"use client";

import React from "react";
import { Info, MoreHorizontal, Coins } from "lucide-react";
import { rupiah } from "@/lib/format";

interface DailyAllowanceRingProps {
  dailyAllowance: number;
  todaySpent: number;
  className?: string;
}

export function DailyAllowanceRing({
  dailyAllowance,
  todaySpent,
  className = "",
}: DailyAllowanceRingProps) {
  const isOverspent = todaySpent > dailyAllowance;
  const remaining = Math.max(0, dailyAllowance - todaySpent);
  const overspentAmount = isOverspent ? todaySpent - dailyAllowance : 0;

  // Percentage calculations
  const spentPercent = dailyAllowance > 0
    ? Math.min(100, Math.round((todaySpent / dailyAllowance) * 100))
    : 100;
  const remainingPercent = Math.max(0, 100 - spentPercent);

  // SVG circular geometry
  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const spentOffset = circumference - (circumference * Math.min(100, spentPercent)) / 100;

  return (
    <div
      className={`p-6 rounded-3xl bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6 glass-sheen relative overflow-hidden ${className}`}
    >
      <Coins
        className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none"
        strokeWidth={1.5}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Status Jatah Harian
          </h3>
          <span
            title="Batas aman pengeluaran per hari agar streak dan tabungan terjaga"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
          >
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>
        <button
          type="button"
          aria-label="Menu jatah harian"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Ring / Donut Chart */}
      <div className="flex flex-col items-center justify-center relative py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />

            {/* Spent Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={isOverspent ? "#EF4444" : "#2563EB"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={spentOffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span
              className={`text-xl font-extrabold tracking-tight money ${
                isOverspent
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {isOverspent ? `+${rupiah(overspentAmount)}` : rupiah(remaining)}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {isOverspent ? "Jatah Terlewati" : "Sisa Jatah Hari Ini"}
            </span>
          </div>
        </div>
      </div>

      {/* Legend Dots (Inspired by Treehouse QA Chart Legend) */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOverspent ? "bg-rose-500" : "bg-blue-600 dark:bg-blue-500"
            }`}
          />
          <span className="truncate">Terpakai ({rupiah(todaySpent)})</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
          <span className="truncate">Sisa ({rupiah(remaining)})</span>
        </div>

        <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <span>Target Harian:</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 money">
            {rupiah(dailyAllowance)} / hari
          </span>
        </div>
      </div>
    </div>
  );
}
