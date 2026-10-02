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

interface MonthlySpendingData {
  month: string;
  needs: number;
  wants: number;
  savings: number;
}

interface SpendingTrendChartProps {
  data: MonthlySpendingData[];
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center py-12">
        <p className="text-sm text-slate-500">Belum ada riwayat transaksi untuk tren belanja.</p>
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Tren Pengeluaran Digital Twin
          </h3>
          <p className="text-xs text-slate-500">Perbandingan Kebutuhan, Keinginan, dan Tabungan</p>
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
              formatter={(value: any) => [
                `Rp ${Number(value).toLocaleString("id-ID")}`,
                "",
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
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              formatter={(value) => {
                if (value === "needs") return "Kebutuhan";
                if (value === "wants") return "Keinginan";
                if (value === "savings") return "Tabungan";
                return value;
              }}
            />
            <Bar dataKey="needs" fill="#10b981" radius={[4, 4, 0, 0]} name="needs" />
            <Bar dataKey="wants" fill="#f59e0b" radius={[4, 4, 0, 0]} name="wants" />
            <Bar dataKey="savings" fill="#3b82f6" radius={[4, 4, 0, 0]} name="savings" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
