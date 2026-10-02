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
  "#10b981", // Emerald - Food
  "#3b82f6", // Blue - Groceries
  "#f59e0b", // Amber - Transport
  "#8b5cf6", // Purple - Housing
  "#ec4899", // Pink - Entertainment
  "#06b6d4", // Cyan - Bills
  "#14b8a6", // Teal - Health
  "#f97316", // Orange - Shopping
  "#64748b", // Slate - Other
];

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center py-12">
        <p className="text-sm text-slate-500">Belum ada pengeluaran berdasarkan kategori.</p>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Distribusi Kategori
          </h3>
          <p className="text-xs text-slate-500">
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
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderRadius: "12px",
                border: "none",
                color: "#ffffff",
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
