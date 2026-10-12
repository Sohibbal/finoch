"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, Layers, Calendar } from "lucide-react";
import { rupiah } from "@/lib/format";
import type { LocalTransaction } from "@/lib/storage/transaction-storage";
import { EXPENSE_CATEGORIES } from "@/components/transaction/manual-transaction-modal";

interface CategoryBarItem {
  kind: "category";
  label: string;
  amount: number;
  count: number;
}

interface MonthlyBarItem {
  kind: "monthly";
  label: string;
  monthFull: string;
  amount: number;
  count: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    count: number;
  }[];
}

type BarItem = CategoryBarItem | MonthlyBarItem;

interface TransactionBarChartProps {
  transactions: LocalTransaction[];
  className?: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const MONTH_FULL_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function TransactionBarChart({
  transactions,
  className = "",
}: TransactionBarChartProps) {
  const [viewMode, setViewMode] = useState<"category" | "monthly">("category");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter only expenses
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === "expense");
  }, [transactions]);

  // Aggregate Category Data
  const categoryData = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    for (const cat of EXPENSE_CATEGORIES) {
      map[cat] = { amount: 0, count: 0 };
    }

    for (const tx of expenseTransactions) {
      const cat = tx.category || "Lainnya";
      if (!map[cat]) {
        map[cat] = { amount: 0, count: 0 };
      }
      map[cat].amount += tx.amount;
      map[cat].count += 1;
    }

    const items: CategoryBarItem[] = Object.entries(map).map(([category, val]) => ({
      kind: "category",
      label: category,
      amount: val.amount,
      count: val.count,
    }));

    const maxAmount = Math.max(...items.map((i) => i.amount), 1);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    return {
      items,
      maxAmount,
      totalAmount,
    };
  }, [expenseTransactions]);

  // Aggregate Monthly Data with category breakdown per month
  const monthlyData = useMemo(() => {
    const monthlyItems: MonthlyBarItem[] = MONTH_NAMES.map((mName, idx) => {
      const monthNumberStr = String(idx + 1).padStart(2, "0");
      const monthPrefix = `${selectedYear}-${monthNumberStr}`;

      let amount = 0;
      let count = 0;
      const categoryMap: Record<string, { amount: number; count: number }> = {};

      for (const tx of expenseTransactions) {
        if (tx.transactionDate && tx.transactionDate.startsWith(monthPrefix)) {
          amount += tx.amount;
          count += 1;
          const cat = tx.category || "Lainnya";
          if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, count: 0 };
          categoryMap[cat].amount += tx.amount;
          categoryMap[cat].count += 1;
        }
      }

      const categoryBreakdown = Object.entries(categoryMap)
        .map(([category, val]) => ({
          category,
          amount: val.amount,
          count: val.count,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        kind: "monthly" as const,
        label: mName,
        monthFull: `${MONTH_FULL_NAMES[idx]} ${selectedYear}`,
        amount,
        count,
        categoryBreakdown,
      };
    });

    const maxAmount = Math.max(...monthlyItems.map((m) => m.amount), 1);
    const totalAmount = monthlyItems.reduce((sum, m) => sum + m.amount, 0);

    return {
      items: monthlyItems,
      maxAmount,
      totalAmount,
    };
  }, [expenseTransactions, selectedYear]);

  const currentDataset = viewMode === "category" ? categoryData : monthlyData;

  return (
    <div
      className={`rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xs space-y-5 flex flex-col justify-between glass-sheen relative overflow-hidden group min-h-[460px] lg:h-[460px] ${className}`}
    >
      {/* Watermark */}
      <BarChart3
        className="absolute -right-3 -bottom-3 w-32 h-32 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
        strokeWidth={1.5}
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {viewMode === "category"
                ? "Pengeluaran per Kategori"
                : `Tren Pengeluaran Bulanan (${selectedYear})`}
            </h3>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white money">
              {rupiah(currentDataset.totalAmount)}
            </span>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              {currentDataset.items.reduce((acc, i) => acc + i.count, 0)} total transaksi
            </span>
          </div>
        </div>

        {/* View Mode & Year Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category vs 12-Month Switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setViewMode("category");
                setHoveredIndex(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
                viewMode === "category"
                  ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Per Kategori</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("monthly");
                setHoveredIndex(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
                viewMode === "monthly"
                  ? "bg-white dark:bg-[#1E293B] text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Tren 12 Bulan</span>
            </button>
          </div>

          {/* Year selector (only in monthly mode) */}
          {viewMode === "monthly" && (
            <div className="flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedYear("2025")}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedYear === "2025"
                    ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                2025
              </button>
              <button
                type="button"
                onClick={() => setSelectedYear("2026")}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedYear === "2026"
                    ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                2026
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="relative pt-6 pb-2 animate-content-in">
        {/* Horizontal Guide Lines */}
        <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
        </div>

        {/* Y-Axis & Bars */}
        <div className="flex items-end gap-2 sm:gap-3 h-60 sm:h-64 w-full relative z-10">
          {/* Y-Axis Scale Reference */}
          <div className="flex flex-col justify-between h-full text-[10px] font-semibold text-slate-400 pr-1 pb-6 shrink-0 select-none">
            <span>{rupiah(currentDataset.maxAmount)}</span>
            <span>{rupiah(Math.round(currentDataset.maxAmount * 0.75))}</span>
            <span>{rupiah(Math.round(currentDataset.maxAmount * 0.5))}</span>
            <span>{rupiah(Math.round(currentDataset.maxAmount * 0.25))}</span>
            <span>Rp 0</span>
          </div>

          {/* Bars Container */}
          <div className="flex-1 h-full flex items-end justify-between gap-1 sm:gap-2 pb-6">
            {currentDataset.items.map((item, idx) => {
              const hasData = item.amount > 0;
              const heightPercent = hasData
                ? Math.max(12, Math.round((item.amount / currentDataset.maxAmount) * 100))
                : 0;
              const isHovered = hoveredIndex === idx;

              // Safe horizontal alignment for floating tooltip
              const isFirst = idx <= 1;
              const isLast = idx >= currentDataset.items.length - 2;
              const tooltipAlignClass = isFirst
                ? "left-0"
                : isLast
                ? "right-0"
                : "left-1/2 -translate-x-1/2";

              // Safe vertical alignment for floating tooltip
              const tooltipVerticalClass =
                heightPercent > 45
                  ? "top-1"
                  : `bottom-[calc(${heightPercent}%+14px)]`;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer relative group"
                >
                  {/* Floating Tooltip Card (Professional interactive popover) */}
                  {isHovered && (
                    <div
                      className={`absolute z-40 pointer-events-none ${tooltipAlignClass} ${tooltipVerticalClass} min-w-[190px] sm:min-w-[220px] max-w-[270px] p-3 rounded-2xl bg-slate-900/95 dark:bg-[#080E1A]/95 text-white shadow-2xl backdrop-blur-xl border border-slate-700/80 dark:border-slate-700/80 animate-in fade-in zoom-in-95 duration-150`}
                    >
                      {/* Tooltip Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700/70 pb-1.5">
                        <span className="font-bold text-xs text-teal-400 flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                          <span className="truncate">
                            {item.kind === "monthly" ? item.monthFull : item.label}
                          </span>
                        </span>
                        {hasData && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-950 text-teal-300 font-semibold border border-teal-500/30 shrink-0">
                            {item.count}x
                          </span>
                        )}
                      </div>

                      {/* Tooltip Body */}
                      {hasData ? (
                        <div className="pt-2 space-y-2">
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">Total:</span>
                            <span className="font-extrabold text-white money text-sm">
                              {rupiah(item.amount)}
                            </span>
                          </div>

                          {/* Breakdown per Category for 12-Month Mode */}
                          {item.kind === "monthly" && item.categoryBreakdown.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-800 space-y-1">
                              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Rincian Kategori:
                              </div>
                              <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                                {item.categoryBreakdown.map((c) => (
                                  <div
                                    key={c.category}
                                    className="flex items-center justify-between text-[10px] gap-2"
                                  >
                                    <span className="text-slate-300 truncate max-w-[110px]">
                                      • {c.category}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0 text-right">
                                      <span className="font-semibold text-white money">
                                        {rupiah(c.amount)}
                                      </span>
                                      <span className="text-[9px] text-teal-400 font-semibold">
                                        ({c.count}x)
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Share Percentage for Category Mode */}
                          {item.kind === "category" && (
                            <div className="text-[10px] text-slate-400 flex items-center justify-between">
                              <span>Porsi pengeluaran:</span>
                              <span className="font-bold text-teal-300">
                                {Math.round(
                                  (item.amount / currentDataset.totalAmount) * 100
                                )}
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-1 text-[11px] text-slate-400 italic">
                          {item.kind === "monthly"
                            ? "Tidak ada transaksi di bulan ini"
                            : "Tidak ada transaksi di kategori ini"}
                        </div>
                      )}

                      {/* Small Caret indicator pointing to bar when floating above */}
                      {heightPercent <= 45 && (
                        <div
                          className={`absolute -bottom-1 w-2 h-2 rotate-45 bg-slate-900 dark:bg-[#080E1A] border-b border-r border-slate-700/80 ${
                            isFirst
                              ? "left-5"
                              : isLast
                              ? "right-5"
                              : "left-1/2 -translate-x-1/2"
                          }`}
                        />
                      )}
                    </div>
                  )}

                  {/* Subtle Column Highlight on hover */}
                  <div
                    className={`absolute inset-x-0 inset-y-0 rounded-xl transition-colors pointer-events-none ${
                      isHovered
                        ? "bg-teal-500/10 dark:bg-teal-400/5"
                        : "transparent"
                    }`}
                  />

                  {/* Bar Element */}
                  <div className="w-full max-w-[42px] h-full flex items-end justify-center relative z-10">
                    {hasData ? (
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 relative border-t-2 border-x border-teal-200/40 dark:border-teal-400/30 ${
                          isHovered
                            ? "bg-gradient-to-t from-blue-600 via-teal-500 to-teal-300 shadow-lg shadow-teal-500/30 scale-105"
                            : "bg-gradient-to-t from-blue-600/90 via-teal-600/90 to-teal-400/80 hover:brightness-110"
                        }`}
                      >
                        {/* Crisp Top Cap Accent */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-white/80 dark:bg-white rounded-t-xl shadow-xs" />
                      </div>
                    ) : (
                      /* Zero/No Transaction Bar representation */
                      <div
                        className={`w-full h-2 rounded-t-md border border-dashed transition-all ${
                          isHovered
                            ? "border-teal-400 bg-teal-50/50 dark:bg-teal-950/30"
                            : "border-slate-300/80 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-800/40"
                        }`}
                        title="Tidak ada transaksi"
                      />
                    )}
                  </div>

                  {/* X-Axis Label */}
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold mt-2 truncate max-w-[48px] text-center transition-colors relative z-10 ${
                      isHovered
                        ? "text-teal-600 dark:text-teal-400 font-bold"
                        : hasData
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
