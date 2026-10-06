"use client";

import React from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { RecurringBill } from "@/types/bill-types";

interface BillCalendarMatrixProps {
  bills: RecurringBill[];
  currentDay: number;
  totalDaysInMonth?: number;
}

export function BillCalendarMatrix({
  bills,
  currentDay,
  totalDaysInMonth = 31,
}: BillCalendarMatrixProps) {
  // Map day (1-31) to array of bills due on that day
  const dueMap: Record<number, RecurringBill[]> = {};
  bills.forEach((bill) => {
    const d = Math.max(1, Math.min(31, bill.dueDay));
    if (!dueMap[d]) dueMap[d] = [];
    dueMap[d].push(bill);
  });

  const days = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 transition-colors">
      <div className="flex items-center justify-between border-b border-cream-200 dark:border-navy-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wider">
            Matriks Jatuh Tempo Bulan Ini
          </h2>
        </div>
        <span className="text-[11px] text-navy-500 dark:text-cream-300/60 font-semibold">
          Hari ini: Tgl {currentDay}
        </span>
      </div>

      {/* Grid of days 1 to 31 */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {days.map((day) => {
          const isToday = day === currentDay;
          const billsOnDay = dueMap[day] || [];
          const hasBills = billsOnDay.length > 0;
          const hasUnpaid = billsOnDay.some((b) => !b.isPaidThisMonth);
          const isPast = day < currentDay;

          return (
            <div
              key={day}
              title={
                hasBills
                  ? `Tgl ${day}: ${billsOnDay.map((b) => b.name).join(", ")}`
                  : `Tgl ${day}`
              }
              className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all ${
                isToday
                  ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent font-black shadow-sm ring-2 ring-emerald-500/40"
                  : hasBills
                  ? hasUnpaid
                    ? isPast
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200 font-bold"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                  : "bg-cream-50/50 dark:bg-navy-950/40 border-cream-200/60 dark:border-navy-800/60 text-navy-600 dark:text-cream-300/60 text-xs"
              }`}
            >
              <span className="text-xs">{day}</span>
              {hasBills && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {billsOnDay.map((b, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        b.isPaidThisMonth
                          ? "bg-emerald-500"
                          : day < currentDay
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-navy-500 dark:text-cream-300/60 pt-2 border-t border-cream-200 dark:border-navy-800 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Akan Datang</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Telat / Overdue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Lunas</span>
        </div>
      </div>
    </div>
  );
}
