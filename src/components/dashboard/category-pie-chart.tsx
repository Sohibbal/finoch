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

// Accessible, distinct palette matching Finoch brand
const INCOME_PALETTE = [
  "#10B981", // Emerald 500
  "#06B6D4", // Cyan 500
  "#3B82F6", // Blue 500
  "#6366F1", // Indigo 500
  "#8B5CF6", // Purple 500
  "#14B8A6", // Teal 500
];

const EXPENSE_PALETTE = [
  "#EF4444", // Red 500
  "#F59E0B", // Amber 500
  "#EC4899", // Pink 500
  "#8B5CF6", // Purple 500
  "#3B82F6", // Blue 500
  "#6B7280", // Slate 500
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

  // Compute SVG slices for Donut / Pie
  const slices = useMemo(() => {
    if (totalAmount === 0) return [];

    let accumulatedAngle = 0;
    return sortedData.map((item, index) => {
      const percentage = (item.amount / totalAmount) * 100;
      const angle = (item.amount / totalAmount) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;

      // Coordinate math on a circle of radius 50 (viewBox 0 0 120 120, center 60,60)
      const radius = 42;
      const innerRadius = 26; // Donut hole
      const cx = 60;
      const cy = 60;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const ix1 = cx + innerRadius * Math.cos(endRad);
      const iy1 = cy + innerRadius * Math.sin(endRad);
      const ix2 = cx + innerRadius * Math.cos(startRad);
      const iy2 = cy + innerRadius * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      // Path data for donut arc
      const pathData =
        angle >= 359.99
          ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} M ${cx} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx - 0.01} ${cy - innerRadius} Z`
          : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

      return {
        category: item.category,
        amount: item.amount,
        percentage,
        color: palette[index % palette.length],
        pathData,
      };
    });
  }, [sortedData, totalAmount, palette]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 backdrop-blur-xl bg-white/80 dark:bg-[#111C2E]/80 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.08] dark:before:via-white/[0.03] before:to-transparent before:pointer-events-none after:absolute after:top-0 after:left-7 after:w-10 after:h-1 after:rounded-b-md after:bg-slate-300/80 dark:after:bg-slate-700/80 after:shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                type === "income" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span>{title}</span>
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            type === "income"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
          }`}
        >
          {type === "income" ? "+" : "-"}
          {rupiah(totalAmount)}
        </span>
      </div>

      {sortedData.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold">Belum ada data kategori</p>
          <p className="text-[11px] mt-0.5 text-slate-400">
            Transaksi {type === "income" ? "pemasukan" : "pengeluaran"} akan muncul di sini
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Graphic */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full transform -rotate-90 drop-shadow-sm"
              aria-label={`Grafik donat kategori ${title}`}
            >
              {slices.map((slice) => (
                <path
                  key={slice.category}
                  d={slice.pathData}
                  fill={slice.color}
                  className="transition-all hover:opacity-85 cursor-pointer"
                >
                  <title>
                    {slice.category}: {rupiah(slice.amount)} ({slice.percentage.toFixed(1)}%)
                  </title>
                </path>
              ))}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                {slices.length} Kategori
              </span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                100%
              </span>
            </div>
          </div>

          {/* Breakdown Legend List */}
          <div className="flex-1 w-full space-y-2 min-w-0">
            {slices.slice(0, 4).map((slice) => (
              <div
                key={slice.category}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {slice.category}
                  </span>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {rupiah(slice.amount)}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 w-9 text-right font-medium">
                    {slice.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}

            {slices.length > 4 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 text-right">
                +{slices.length - 4} kategori lainnya
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
