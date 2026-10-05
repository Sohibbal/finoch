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
import { TrendingUp } from "lucide-react";

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
      <div className="p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/5 dark:ring-white/10">
        <div className="bg-white dark:bg-[#070E1A] rounded-[calc(2rem-0.375rem)] p-6 text-center py-16 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <p className="text-sm font-medium text-navy-500 dark:text-cream-400">Belum ada riwayat transaksi untuk tren belanja.</p>
        </div>
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
    <div className="group relative h-full">
      {/* Outer Shell (Double-Bezel) */}
      <div className="h-full p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
        
        {/* Inner Core */}
        <div className="relative h-full bg-white dark:bg-[#070E1A] rounded-[calc(2rem-0.375rem)] p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
          
          <div className="flex items-start justify-between pb-6 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 dark:bg-white/5 border border-navy-900/10 dark:border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-navy-600 dark:text-cream-300">
                <TrendingUp className="w-3 h-3" />
                <span>Analitik</span>
              </div>
              <h3 className="text-xl font-black text-navy-950 dark:text-white tracking-tight mt-2">
                Tren Pengeluaran
              </h3>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[250px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
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
                  itemStyle={{
                    paddingTop: "4px"
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "16px", fontWeight: "600", color: "#888" }}
                  formatter={(value) => {
                    if (value === "food") return "Food & Drinks";
                    if (value === "transport") return "Transportation";
                    if (value === "bills") return "Bills & Utilities";
                    if (value === "shopping") return "Shopping & Lifestyle";
                    if (value === "other") return "Other";
                    return value;
                  }}
                />
                {/* Premium Bar Styling */}
                <Bar dataKey="food" stackId="a" fill="#0B192C" name="food" radius={[0, 0, 4, 4]} />
                <Bar dataKey="transport" stackId="a" fill="#1C3C68" name="transport" />
                <Bar dataKey="bills" stackId="a" fill="#275490" name="bills" />
                <Bar dataKey="shopping" stackId="a" fill="#BDAC8D" name="shopping" />
                <Bar dataKey="other" stackId="a" fill="#D6C9B0" radius={[4, 4, 0, 0]} name="other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
