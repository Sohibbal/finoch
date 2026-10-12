"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { rupiah } from "@/lib/format";

export interface CategoryDataPoint {
  category: string;
  amount: number;
  count?: number;
}

interface CategoryPieChartProps {
  title: string;
  subtitle: string;
  data: CategoryDataPoint[];
  type: "income" | "expense";
  className?: string;
}

// Consistent Signature Palette: Biru, Hijau Tosca, Putih & Ice accents
const TOSCA_BLUE_PALETTE = [
  "#14B8A6", // Teal 500 (Hijau Tosca Utama)
  "#2563EB", // Blue 600 (Biru Utama)
  "#0D9488", // Teal 600 (Tosca Tua)
  "#38BDF8", // Sky 400 (Biru Cerah)
  "#2DD4BF", // Teal 400 (Tosca Muda)
  "#1D4ED8", // Blue 700 (Navy Blue)
  "#06B6D4", // Cyan 500 (Cyan Tosca)
  "#60A5FA", // Blue 400 (Soft Blue)
];

export function CategoryPieChart({
  title,
  subtitle,
  data,
  type,
  className = "",
}: CategoryPieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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
        count: item.count,
        percentage,
        color: TOSCA_BLUE_PALETTE[index % TOSCA_BLUE_PALETTE.length],
        strokeDasharray: `${strokeLength.toFixed(2)} ${strokeGap.toFixed(2)}`,
        strokeDashoffset: strokeDashoffset.toFixed(2),
      };
    });
  }, [sortedData, totalAmount, circumference]);

  const activeItem = useMemo(() => {
    if (!hoveredCategory) return null;
    return slices.find((s) => s.category === hoveredCategory) || null;
  }, [hoveredCategory, slices]);

  return (
    <div
      className={`rounded-[2rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 glass-sheen relative overflow-hidden group ${className}`}
    >
      {type === "income" ? (
        <ArrowUpRight
          className="absolute -right-3 -bottom-3 w-28 h-28 text-teal-500/5 dark:text-teal-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
          strokeWidth={1.5}
        />
      ) : (
        <ArrowDownRight
          className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
          strokeWidth={1.5}
        />
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                type === "income" ? "bg-teal-500" : "bg-blue-600"
              }`}
            />
            <span>{title}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            type === "income"
              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-500/20"
              : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20"
          }`}
        >
          {type === "income" ? "+" : "-"}
          {rupiah(totalAmount)}
        </span>
      </div>

      {/* SVG Donut Graphic with Non-blocking Center Label */}
      <div className="flex items-center justify-center py-2 animate-content-in relative z-10">
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
              slices.map((slice) => {
                const isHovered = hoveredCategory === slice.category;
                const isDimmed = hoveredCategory !== null && !isHovered;

                return (
                  <circle
                    key={slice.category}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? 13 : 10.5}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    onMouseEnter={() => setHoveredCategory(slice.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`transition-all duration-200 cursor-pointer ${
                      isDimmed ? "opacity-35" : "opacity-100"
                    }`}
                  >
                    <title>
                      {slice.category}: {rupiah(slice.amount)} ({slice.percentage.toFixed(0)}%)
                      {slice.count ? ` • ${slice.count} transaksi` : ""}
                    </title>
                  </circle>
                );
              })
            )}
          </svg>

          {/* Inner Center Label - Safely positioned inside donut hole without covering chart ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2 transition-all duration-200">
            {activeItem ? (
              <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 truncate max-w-[105px]">
                  {activeItem.category}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white money truncate max-w-[105px]">
                  {rupiah(activeItem.amount)}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {activeItem.percentage.toFixed(0)}%
                  {activeItem.count ? ` (${activeItem.count}x)` : ""}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                  {type === "income" ? "Total Masuk:" : "Total Keluar:"}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white money truncate max-w-[105px]">
                  {totalAmount > 0 ? rupiah(totalAmount) : "Rp 0"}
                </span>
                <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                  {sortedData.length} Kategori
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend Pills with Hover Connection to Center Label */}
      {slices.length === 0 ? (
        <p className="text-[11px] text-slate-400 text-center py-1">
          Belum ada transaksi {type === "income" ? "pemasukan" : "pengeluaran"} tercatat
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1 relative z-10">
          {slices.slice(0, 6).map((slice) => {
            const isHovered = hoveredCategory === slice.category;

            return (
              <button
                key={slice.category}
                type="button"
                onMouseEnter={() => setHoveredCategory(slice.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  isHovered
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-teal-500/50"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate max-w-[90px]">{slice.category}</span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {slice.percentage.toFixed(0)}%
                </span>
              </button>
            );
          })}
          {slices.length > 6 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{slices.length - 6} lainnya
            </span>
          )}
        </div>
      )}
    </div>
  );
}
