"use client";

import React from "react";
import {
  Flame,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Coffee,
  Car,
  Receipt,
  Tv,
  Zap,
} from "lucide-react";
import { LeakAuditSummary, LeakCategory } from "@/types/audit-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface AuditCardMobileProps {
  summary: LeakAuditSummary;
}

const CATEGORY_ICONS: Record<LeakCategory, React.ElementType> = {
  admin_fee: Zap,
  platform_fee: Receipt,
  parking: Car,
  cheap_snack: Coffee,
  subscription: Tv,
  other_leak: Flame,
};

export function AuditCardMobile({ summary }: AuditCardMobileProps) {
  return (
    <div className="space-y-4">
      {/* Shock Value Banner (Double-Bezel Hardware aesthetic) */}
      <div className="rounded-[1.75rem] bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Detektor Bocor Halus
            </span>
            <h2 className="text-sm font-bold text-navy-950 dark:text-cream-50 leading-snug">
              Total Uang Jajan Siluman: {formatRupiah(summary.totalLeakedAmount)}
            </h2>
          </div>
        </div>

        {/* Warteg Equivalence Pill */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900/80 border border-rose-500/20 text-xs text-navy-800 dark:text-cream-200 leading-relaxed">
          <p className="font-semibold text-rose-700 dark:text-rose-300">
            {summary.shockMessage}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-navy-500 dark:text-cream-400">
            <span>{summary.leakCount} transaksi terdeteksi</span>
            <span>{summary.percentageOfAllowance}% dari total uang saku</span>
          </div>
        </div>
      </div>

      {/* Leaks by Category */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400 px-1">
          Kategori Pengeluaran Siluman
        </span>

        {summary.leaksByCategory.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 text-center text-xs text-navy-500">
            Tidak ada transaksi bocor halus terdeteksi bulan ini! Pertahankan! 🌟
          </div>
        ) : (
          summary.leaksByCategory.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.category] || Flame;
            return (
              <div
                key={cat.category}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cream-100 dark:bg-navy-900 text-navy-700 dark:text-cream-300 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-navy-950 dark:text-cream-50">
                        {cat.label}
                      </h4>
                      <span className="text-[10px] text-navy-500 dark:text-cream-400">
                        {cat.count}x transaksi ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
                    {formatRupiah(cat.amount)}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-cream-200 dark:bg-navy-900 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Checklist for Students */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-cream-50">
            Strategi Penghematan Cerdas
          </h4>
        </div>

        <div className="space-y-2">
          {summary.actionChecklist.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-navy-700 dark:text-cream-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
