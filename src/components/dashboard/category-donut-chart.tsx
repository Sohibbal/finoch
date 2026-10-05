"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface CategorySpending {
  name: string;
  value: number;
}

interface CategoryDonutChartProps {
  data: CategorySpending[];
}

const CATEGORY_COLORS = [
  "#0B192C", // Deep Navy
  "#1C3C68", // Navy
  "#275490", // Royal Navy
  "#BDAC8D", // Warm Sand
  "#D6C9B0", // Light Sand
  "#0F223B", // Navy Accent
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#64748b", // Slate
];

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/5 dark:ring-white/10">
        <div className="bg-white dark:bg-[#070E1A] rounded-[calc(2rem-0.375rem)] p-6 text-center py-16 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <p className="text-sm font-medium text-navy-500 dark:text-cream-400">Belum ada pengeluaran berdasarkan kategori.</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="group relative h-full">
      {/* Outer Shell (Double-Bezel) */}
      <div className="h-full p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
        
        {/* Inner Core */}
        <div className="relative h-full bg-white dark:bg-[#070E1A] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
          
          {/* Subtle Glow inside the chart container */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/5 dark:bg-blue-400/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="flex items-start justify-between pb-6 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 dark:bg-white/5 border border-navy-900/10 dark:border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-navy-600 dark:text-cream-300">
                <PieIcon className="w-3 h-3" />
                <span>Distribusi</span>
              </div>
              <h3 className="text-xl font-black text-navy-950 dark:text-white tracking-tight mt-2">
                Porsi Kategori
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-navy-500 dark:text-cream-400/60 block">Total</span>
              <span className="text-lg font-black text-navy-900 dark:text-white">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[250px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [
                    `Rp ${Number(value).toLocaleString("id-ID")}`,
                    "Nominal",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(7, 14, 26, 0.9)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    padding: "12px 16px"
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "24px", fontWeight: "600", color: "#888" }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
