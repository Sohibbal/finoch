"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, TrendingDown, Layers, Calendar } from "lucide-react";
import { rupiah } from "@/lib/format";
import type { LocalTransaction } from "@/lib/storage/transaction-storage";
import { EXPENSE_CATEGORIES } from "@/components/transaction/manual-transaction-modal";

interface TransactionBarChartProps {
  transactions: LocalTransaction[];
  className?: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
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

    const items = Object.entries(map).map(([category, val]) => ({
      label: category,
      amount: val.amount,
      count: val.count,
    }));

    // Find maximum amount for bar scaling
    const maxAmount = Math.max(...items.map((i) => i.amount), 1);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    return {
      items,
      maxAmount,
      totalAmount,
    };
  }, [expenseTransactions]);

  // Aggregate Monthly Data for selectedYear (strictly from real transactions, NO dummy data!)
  const monthlyData = useMemo(() => {
    const monthlyItems = MONTH_NAMES.map((mName, idx) => {
      const monthNumberStr = String(idx + 1).padStart(2, "0");
      const monthPrefix = `${selectedYear}-${monthNumberStr}`;

      let amount = 0;
      let count = 0;

      for (const tx of expenseTransactions) {
        if (tx.transactionDate && tx.transactionDate.startsWith(monthPrefix)) {
          amount += tx.amount;
          count += 1;
        }
      }

      return {
        label: mName,
        monthFull: `${mName} ${selectedYear}`,
        amount,
        count,
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
  const activeItem = hoveredIndex !== null ? currentDataset.items[hoveredIndex] : null;

  return (
    <div
      className={`rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-xs space-y-5 flex flex-col justify-between glass-sheen relative overflow-hidden group ${className}`}
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
                viewMode === "monthly"
                  ? "bg-white dark:bg-[#1E293B] text-teal-600 dark:text-teal-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Tren 12 Bulan</span>
            </button>
          </div>

          {/* Year selector (only visible in monthly mode) */}
          {viewMode === "monthly" && (
            <div className="flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedYear("2025")}
                className={`px-2.5 py-1 rounded-full transition-colors ${
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
                className={`px-2.5 py-1 rounded-full transition-colors ${
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

      {/* Floating Info Banner (Non-blocking label showing exact amount & quantity) */}
      <div className="min-h-[2.5rem] flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800/80 text-xs relative z-10 transition-all">
        {activeItem ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 animate-in fade-in duration-150">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>{activeItem.label}</span>
            </span>
            {activeItem.amount > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-600 dark:text-slate-300">
                  Jumlah:{" "}
                  <strong className="text-slate-900 dark:text-white font-extrabold money">
                    {rupiah(activeItem.amount)}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-500/20">
                  {activeItem.count} transaksi
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic text-[11px]">
                Tidak ada transaksi pada periode ini
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-slate-400 text-[11px]">
            <span>Arahkan kursor ke grafik batang untuk melihat rincian & jumlah transaksi</span>
            <span className="hidden sm:inline font-medium text-slate-500 dark:text-slate-400">
              Palet: Biru • Putih • Hijau Tosca
            </span>
          </div>
        )}
      </div>

      {/* Bar Chart Area */}
      <div className="relative pt-4 pb-2 animate-content-in">
        {/* Horizontal Guide Lines */}
        <div className="absolute inset-x-0 inset-y-4 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
          <div className="border-b border-slate-400 w-full" />
        </div>

        {/* Y-Axis & Bars */}
        <div className="flex items-end gap-2 sm:gap-3 h-52 sm:h-60 w-full relative z-10">
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
                ? Math.max(10, Math.round((item.amount / currentDataset.maxAmount) * 100))
                : 0;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                >
                  {/* Bar Element */}
                  <div className="w-full max-w-[42px] h-full flex items-end justify-center relative">
                    {hasData ? (
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 relative border-t-2 border-x border-teal-200/40 dark:border-teal-400/30 ${
                          isHovered
                            ? "bg-gradient-to-t from-blue-600 via-teal-500 to-teal-300 shadow-lg shadow-teal-500/25 scale-105"
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
                    className={`text-[10px] sm:text-[11px] font-semibold mt-2 truncate max-w-[48px] text-center transition-colors ${
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
