"use client";

import React, { useMemo } from "react";
import { rupiah } from "@/lib/format";

export interface CategoryDataPoint {
  category: string;
  amount: number;
}

interface CategoryPieChartProps {
  title: string;
  subtitle: string;
  data: CategoryDataPoint[];
  type: "income" | "expense";
  className?: string;
}

// Subly signature vibrant palette
const INCOME_PALETTE = [
  "#10B981", // Emerald 500
  "#38BDF8", // Cyan 400
  "#60A5FA", // Blue 400
  "#A78BFA", // Purple 400
  "#34D399", // Mint 400
  "#F472B6", // Pink 400
];

const EXPENSE_PALETTE = [
  "#38BDF8", // Cyan 400 (Distribusi Kategori Utama match)
  "#F472B6", // Pink 400 (Distribusi Kategori Utama match)
  "#60A5FA", // Blue 400 (Distribusi Kategori Utama match)
  "#FB923C", // Orange 400
  "#A78BFA", // Purple 400
  "#EF4444", // Red 500
];

export function CategoryPieChart({
  title,
  subtitle,
  data,
  type,
  className = "",
}: CategoryPieChartProps) {
  const palette = type === "income" ? INCOME_PALETTE : EXPENSE_PALETTE;

  // Filter out zero-amount items and sort descending
  const sortedData = useMemo(() => {
    return [...data]
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [data]);

  const totalAmount = useMemo(() => {
    return sortedData.reduce((sum, item) => sum + item.amount, 0);
  }, [sortedData]);

  // Circumference for r=38 on viewBox 0 0 100 100 is 2 * Math.PI * 38 = 238.761
  const circumference = 2 * Math.PI * 38;

  const slices = useMemo(() => {
    if (totalAmount === 0) return [];

    let accumulatedOffset = 0;
    return sortedData.map((item, index) => {
      const percentage = (item.amount / totalAmount) * 100;
      const strokeLength = (item.amount / totalAmount) * circumference;
      const strokeGap = circumference - strokeLength;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      return {
        category: item.category,
        amount: item.amount,
        percentage,
        color: palette[index % palette.length],
        strokeDasharray: `${strokeLength.toFixed(2)} ${strokeGap.toFixed(2)}`,
        strokeDashoffset: strokeDashoffset.toFixed(2),
      };
    });
  }, [sortedData, totalAmount, palette, circumference]);

  return (
    <div
      className={`rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                type === "income" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span>{title}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            type === "income"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
          }`}
        >
          {type === "income" ? "+" : "-"}
          {rupiah(totalAmount)}
        </span>
      </div>

      {/* SVG Donut Graphic - Exactly styled like Distribusi Kategori Utama */}
      <div className="flex items-center justify-center py-2 animate-content-in">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {slices.length === 0 ? (
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="11"
                className="text-slate-100 dark:text-slate-800"
              />
            ) : (
              slices.map((slice) => (
                <circle
                  key={slice.category}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="11"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all hover:opacity-85"
                >
                  <title>
                    {slice.category}: {rupiah(slice.amount)} ({slice.percentage.toFixed(0)}%)
                  </title>
                </circle>
              ))
            )}
          </svg>

          {/* Inner Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
              {type === "income" ? "Total Masuk:" : "Total Keluar:"}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white money truncate max-w-[100px]">
              {totalAmount > 0 ? rupiah(totalAmount) : "Rp 0"}
            </span>
          </div>
        </div>
      </div>

      {/* Legend Pills - Exactly matching Distribusi Kategori Utama */}
      {slices.length === 0 ? (
        <p className="text-[11px] text-slate-400 text-center py-1">
          Belum ada transaksi {type === "income" ? "pemasukan" : "pengeluaran"} tercatat
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
          {slices.slice(0, 5).map((slice) => (
            <span key={slice.category} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate max-w-[90px]">{slice.category}</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {slice.percentage.toFixed(0)}%
              </span>
            </span>
          ))}
          {slices.length > 5 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{slices.length - 5} lainnya
            </span>
          )}
        </div>
      )}
    </div>
  );
}
