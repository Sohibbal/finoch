"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export interface MonthlyCategorySpendingData {
  month: string;
  food: number;
  transport: number;
  bills: number;
  shopping: number;
  other: number;
}

interface SpendingTrendChartProps {
  data: MonthlyCategorySpendingData[];
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 border border-cream-300 dark:border-navy-800 text-center py-12">
        <p className="text-xs text-navy-500 dark:text-cream-400">Belum ada riwayat transaksi untuk tren belanja.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} jt`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)} rb`;
    }
    return String(value);
  };

  return (
    <div className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 shadow-sm border border-cream-300 dark:border-navy-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
            Tren Pengeluaran Finansial
          </h3>
          <p className="text-xs text-navy-600 dark:text-cream-300/70">Histori pengeluaran berdasarkan kategori per bulan</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                const labelMap: Record<string, string> = {
                  food: "Food & Drinks",
                  transport: "Transportation",
                  bills: "Bills & Utilities",
                  shopping: "Shopping & Lifestyle",
                  other: "Other",
                };
                return [
                  `Rp ${Number(value).toLocaleString("id-ID")}`,
                  labelMap[name] || name,
                ];
              }}
              contentStyle={{
                backgroundColor: "#070E1A",
                borderRadius: "12px",
                border: "1px solid #1E2D4A",
                color: "#FAF8F5",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value) => {
                if (value === "food") return "Food & Drinks";
                if (value === "transport") return "Transportation";
                if (value === "bills") return "Bills & Utilities";
                if (value === "shopping") return "Shopping & Lifestyle";
                if (value === "other") return "Other";
                return value;
              }}
            />
            <Bar dataKey="food" stackId="a" fill="#1C3C68" name="food" />
            <Bar dataKey="transport" stackId="a" fill="#D6C9B0" name="transport" />
            <Bar dataKey="bills" stackId="a" fill="#275490" name="bills" />
            <Bar dataKey="shopping" stackId="a" fill="#BDAC8D" name="shopping" />
            <Bar dataKey="other" stackId="a" fill="#0B192C" radius={[4, 4, 0, 0]} name="other" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
