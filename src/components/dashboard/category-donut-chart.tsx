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
      <div className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 border border-cream-300 dark:border-navy-800 text-center py-12">
        <p className="text-xs text-navy-500 dark:text-cream-400">Belum ada pengeluaran berdasarkan kategori.</p>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 shadow-sm border border-cream-300 dark:border-navy-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
            Distribusi Kategori
          </h3>
          <p className="text-xs text-navy-600 dark:text-cream-300/70">
            Total Pengeluaran: Rp {total.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [
                `Rp ${Number(value).toLocaleString("id-ID")}`,
                "Nominal",
              ]}
              contentStyle={{
                backgroundColor: "#070E1A",
                borderRadius: "12px",
                border: "1px solid #1E2D4A",
                color: "#FAF8F5",
                fontSize: "12px",
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
