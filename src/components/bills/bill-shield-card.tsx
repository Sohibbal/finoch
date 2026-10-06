"use client";

import React from "react";
import { ShieldCheck, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import { BillSummary } from "@/types/bill-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BillShieldCardProps {
  summary: BillSummary;
  monthlyIncome?: number;
  onOpenSafeToSpend?: () => void;
}

export function BillShieldCard({
  summary,
  monthlyIncome = 2500000,
  onOpenSafeToSpend,
}: BillShieldCardProps) {
  const percentageOfIncome =
    monthlyIncome > 0
      ? Math.round((summary.totalMonthlyBills / monthlyIncome) * 100)
      : 0;

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-navy-950 to-navy-900 text-cream-50 rounded-2xl p-5 border border-emerald-500/20 shadow-md space-y-4">
      {/* Top Shield Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-cream-50">
              Fixed Expense Shield (Proteksi Kos)
            </h3>
            <span className="text-[11px] text-cream-300/70">
              {percentageOfIncome}% uang kiriman dikunci untuk beban wajib
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
          Shield Aktif
        </span>
      </div>

      {/* Figures Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">
            Total Tagihan Wajib
          </span>
          <span className="text-sm sm:text-base font-black text-cream-50">
            {formatRupiah(summary.totalMonthlyBills)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] text-amber-300/80 uppercase font-bold tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" /> Saldo Terkunci
          </span>
          <span className="text-sm sm:text-base font-black text-amber-400">
            {formatRupiah(summary.unpaidAmountThisMonth)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-cream-300/70 font-semibold">
          <span>Sudah Dibayar: {formatRupiah(summary.paidAmountThisMonth)}</span>
          <span>{summary.paidCount} / {summary.unpaidCount + summary.paidCount} Tagihan</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{
              width: `${
                summary.totalMonthlyBills > 0
                  ? (summary.paidAmountThisMonth / summary.totalMonthlyBills) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Critical Banner if any bill is due <= 3 days */}
      {summary.criticalUpcomingBills.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200 leading-relaxed">
            <span className="font-bold">Perhatian Tanggal Tua: </span>
            Ada <strong>{summary.criticalUpcomingBills.length} tagihan</strong> yang mendekati jatuh tempo (
            {summary.criticalUpcomingBills.map((b) => b.name).join(", ")}). Saldo jatah jajan harian Anda otomatis diproteksi!
          </div>
        </div>
      )}
    </div>
  );
}
