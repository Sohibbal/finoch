"use client";

import React from "react";
import {
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Hourglass,
  PieChart,
} from "lucide-react";
import { MonthlyReportSummary } from "@/types/report-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface ReportSummaryCardProps {
  summary: MonthlyReportSummary;
}

export function ReportSummaryCard({ summary }: ReportSummaryCardProps) {
  const isSurplus = summary.netSavings >= 0;

  return (
    <div className="space-y-4">
      {/* MOBILE PWA CARD (md:hidden) */}
      <div className="md:hidden rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-cream-50 p-5 shadow-lg border border-navy-800">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cream-400">
                Rekap Arus Kas
              </span>
              <h2 className="text-sm font-bold text-white">
                {summary.monthName} {summary.year}
              </h2>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              isSurplus
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}
          >
            {isSurplus ? "Surplus Tabungan" : "Defisit"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3.5">
          <div>
            <span className="text-[11px] text-cream-400 block">Uang Saku / Masuk:</span>
            <span className="text-sm font-bold text-white">
              {formatRupiah(summary.totalIncome)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-cream-400 block">Total Belanja:</span>
            <span className="text-sm font-bold text-rose-400">
              {formatRupiah(summary.totalExpenses)}
            </span>
          </div>
        </div>

        <div className="mt-3.5 pt-3.5 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-cream-400 block">Sisa Saldo Kas:</span>
            <span className="text-base font-black text-white">
              {formatRupiah(summary.netSavings)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-cream-400 block">Tingkat Tabungan:</span>
            <span className="text-xs font-bold text-emerald-400">
              {summary.savingsRate}%
            </span>
          </div>
        </div>

        {/* 50-30-20 Mini Progress Bar */}
        <div className="mt-3.5 space-y-1">
          <div className="flex justify-between text-[10px] text-cream-400">
            <span>Kebutuhan {summary.needsPercentage}%</span>
            <span>Keinginan {summary.wantsPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
            <div
              className="bg-emerald-400 h-full"
              style={{ width: `${summary.needsPercentage}%` }}
              title={`Needs: ${summary.needsPercentage}%`}
            />
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${summary.wantsPercentage}%` }}
              title={`Wants: ${summary.wantsPercentage}%`}
            />
          </div>
        </div>
      </div>

      {/* DESKTOP BENTO ROW (hidden md:grid) */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {/* Box 1: Pemasukan / Uang Saku */}
        <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Uang Saku / Pemasukan
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(summary.totalIncome)}
            </div>
            <p className="text-xs text-navy-500 dark:text-cream-400 mt-1">
              Periode {summary.monthName} {summary.year}
            </p>
          </div>
        </div>

        {/* Box 2: Total Pengeluaran */}
        <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatRupiah(summary.totalExpenses)}
            </div>
            <p className="text-xs text-navy-500 dark:text-cream-400 mt-1">
              Dari {summary.totalTransactions} transaksi tercatat
            </p>
          </div>
        </div>

        {/* Box 3: Saldo Tabungan */}
        <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Sisa Saldo Kas
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${isSurplus ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatRupiah(summary.netSavings)}
            </div>
            <p className="text-xs text-navy-500 dark:text-cream-400 mt-1">
              {isSurplus ? `Surplus (Rasio Tabungan: ${summary.savingsRate}%)` : "Defisit anggaran"}
            </p>
          </div>
        </div>

        {/* Box 4: Runway / Hari Bertahan */}
        <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Hari Bertahan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              ±{summary.runwayDays} Hari
            </div>
            <p className="text-xs text-navy-500 dark:text-cream-400 mt-1">
              Berdasarkan rerata laju belanja harian
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
