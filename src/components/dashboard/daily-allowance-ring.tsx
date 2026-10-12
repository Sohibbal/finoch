"use client";

import React from "react";
import { Info, Coins } from "lucide-react";
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

  // SVG circular geometry with comfortable breathing room
  const radius = 56;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; // ~351.85
  const spentOffset = circumference - (circumference * Math.min(100, spentPercent)) / 100;

  return (
    <div
      className={`p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group ${className}`}
    >
      <Coins
        className="absolute -right-3 -bottom-3 w-28 h-28 text-teal-500/5 dark:text-teal-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
        strokeWidth={1.5}
      />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Status Jatah Harian
          </h3>
          <span
            title="Batas aman pengeluaran per hari agar streak dan tabungan terjaga"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
          >
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isOverspent
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              : "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-500/20"
          }`}
        >
          {isOverspent ? "Overbudget" : `${100 - spentPercent}% Aman`}
        </span>
      </div>

      {/* Ring / Donut Chart with ample space */}
      <div className="flex flex-col items-center justify-center relative py-1 z-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
            {/* Background Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />

            {/* Spent Arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={isOverspent ? "#EF4444" : "#14B8A6"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={spentOffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
            <span
              className={`text-lg sm:text-xl font-extrabold tracking-tight money ${
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

      {/* Legend Dots */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-y-2 text-xs relative z-10">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOverspent ? "bg-rose-500" : "bg-blue-600"
            }`}
          />
          <span className="truncate">Terpakai ({rupiah(todaySpent)})</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full shrink-0 bg-teal-500" />
          <span className="truncate">Sisa ({rupiah(remaining)})</span>
        </div>

        <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <span>Target Jatah:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 money">
            {rupiah(dailyAllowance)} / hari
          </span>
        </div>
      </div>
    </div>
  );
}
