"use client";

import React, { useState } from "react";
import { Calendar, CheckCircle2, AlertCircle, Info, Flame } from "lucide-react";
import { StreakSummary, DailyCashflowPoint } from "@/types/streak-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface StreakCalendarDesktopProps {
  summary: StreakSummary;
}

export function StreakCalendarDesktop({ summary }: StreakCalendarDesktopProps) {
  const [selectedDay, setSelectedDay] = useState<DailyCashflowPoint | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main 30-Day Calendar Grid */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
                Kalender Arus Kas 30 Hari
              </h3>
            </div>

            {/* Color Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-navy-600 dark:text-cream-400">Puasa Jajan (Rp 0 Wants)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-navy-600 dark:text-cream-400">Disiplin (&le; Jatah)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-navy-600 dark:text-cream-400">Overbudget</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid (7 columns) */}
          <div className="grid grid-cols-7 gap-2.5">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
              <div
                key={d}
                className="text-center font-bold text-[11px] uppercase tracking-wider text-navy-400 dark:text-cream-500 py-1"
              >
                {d}
              </div>
            ))}

            {summary.monthlyPoints.map((pt) => {
              const isSelected = selectedDay?.date === pt.date;
              return (
                <button
                  type="button"
                  key={pt.date}
                  onClick={() => setSelectedDay(pt)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between min-h-[70px] transition-all hover:scale-105 active:scale-95 ${
                    isSelected ? "ring-2 ring-navy-950 dark:ring-cream-100" : ""
                  } ${
                    pt.isFuture
                      ? "bg-cream-50 dark:bg-navy-950/40 border-cream-200 dark:border-navy-900 opacity-40 cursor-default"
                      : pt.status === "no_spend"
                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
                      : pt.status === "disciplined"
                      ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-900 dark:text-amber-100"
                      : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-900 dark:text-rose-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black">
                      {pt.dayNumber}
                    </span>
                    {pt.isToday && (
                      <span className="text-[9px] font-bold px-1 rounded bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  {!pt.isFuture && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold block truncate">
                        {pt.totalSpent > 0 ? formatRupiah(pt.totalSpent) : "Rp 0"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector / Details Panel */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-cream-200 dark:border-navy-800">
              <Info className="w-4 h-4 text-navy-600 dark:text-cream-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-cream-50">
                Detail Transaksi Harian
              </h4>
            </div>

            {selectedDay ? (
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-xs text-navy-500 dark:text-cream-400 block">
                    Tanggal Terpilih:
                  </span>
                  <div className="text-lg font-black text-navy-950 dark:text-cream-50">
                    {selectedDay.dayName}, {selectedDay.dayNumber} Oktober 2026
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedDay.status === "no_spend"
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : selectedDay.status === "disciplined"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {selectedDay.status === "no_spend"
                      ? "🟢 Hari Puasa Jajan (Zero Wants)"
                      : selectedDay.status === "disciplined"
                      ? "🟡 Pengeluaran Terkendali"
                      : "🔴 Melebihi Batas Jatah"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-cream-50 dark:bg-navy-900 border border-cream-200 dark:border-navy-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-navy-600 dark:text-cream-400">Total Pengeluaran:</span>
                    <span className="font-bold text-navy-950 dark:text-cream-50">
                      {formatRupiah(selectedDay.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-navy-600 dark:text-cream-400">Jajan Keinginan (Wants):</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {formatRupiah(selectedDay.wantsSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-navy-600 dark:text-cream-400">Frekuensi Belanja:</span>
                    <span className="font-bold text-navy-950 dark:text-cream-50">
                      {selectedDay.transactionsCount} transaksi
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-xs text-navy-500 dark:text-cream-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-navy-300 dark:text-cream-600" />
                <p>Klik salah satu tanggal di kalender untuk melihat rincian pengeluaran pada hari tersebut.</p>
              </div>
            )}
          </div>

          {/* Gamified Stat Pill */}
          <div className="mt-6 pt-4 border-t border-cream-200 dark:border-navy-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-600 dark:text-cream-400">Total Hari Puasa Jajan:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                {summary.greenDaysCount} Hari 🟢
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-navy-600 dark:text-cream-400">Rekor Streak Terpanjang:</span>
              <span className="font-black text-amber-600 dark:text-amber-400">
                {summary.longestStreak} Hari Berturut-turut 🔥
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
