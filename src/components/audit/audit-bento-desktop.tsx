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
  ArrowRight,
} from "lucide-react";
import { LeakAuditSummary, LeakCategory } from "@/types/audit-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface AuditBentoDesktopProps {
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

export function AuditBentoDesktop({ summary }: AuditBentoDesktopProps) {
  return (
    <div className="space-y-6">
      {/* 3-Box Top Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Box 1: Total Shock Value */}
        <div className="rounded-3xl bg-gradient-to-br from-rose-950/20 via-white to-white dark:from-rose-950/40 dark:via-[#070E1A] dark:to-[#070E1A] border border-rose-500/30 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Total Uang Jajan Siluman
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {formatRupiah(summary.totalLeakedAmount)}
              </div>
              <p className="text-xs text-navy-600 dark:text-cream-400 mt-1">
                Mengambil {summary.percentageOfAllowance}% dari total uang saku bulanan
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-500/20">
            <span className="text-[11px] font-bold text-navy-500 dark:text-cream-400 block mb-1">
              Setara Dengan:
            </span>
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-800 dark:text-rose-200">
              🍲 {summary.wartegEquivalence} Porsi Nasi Warteg Komplit (Nasi + Lauk + Sayur)
            </div>
          </div>
        </div>

        {/* Box 2: Category Breakdown */}
        <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
                Distribusi Kebocoran
              </span>
              <span className="text-xs font-bold text-navy-600 dark:text-cream-300">
                {summary.leakCount} Transaksi
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {summary.leaksByCategory.slice(0, 3).map((cat) => {
                const Icon = CATEGORY_ICONS[cat.category] || Flame;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-navy-500 dark:text-cream-400" />
                        <span className="font-semibold text-navy-800 dark:text-cream-200">
                          {cat.label}
                        </span>
                      </div>
                      <span className="font-bold text-navy-950 dark:text-cream-50">
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
              })}
            </div>
          </div>

          <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-4 pt-3 border-t border-cream-200 dark:border-navy-800">
            Audit otomatis mendeteksi transaksi &le; Rp 15.000 dan langganan aplikasi.
          </p>
        </div>

        {/* Box 3: Strategic Checklist */}
        <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-navy-950 dark:text-cream-50">
                Rekomendasi Tindakan Mahasiswa
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {summary.actionChecklist.slice(0, 3).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-navy-700 dark:text-cream-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cream-200 dark:border-navy-800">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Potensi hemat s.d {formatRupiah(summary.totalLeakedAmount)} per bulan!
            </span>
          </div>
        </div>
      </div>

      {/* Detected Leak Table */}
      <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950 dark:text-cream-50">
            Daftar Transaksi Bocor Halus yang Terdeteksi
          </h3>
          <span className="text-xs font-semibold text-navy-500 dark:text-cream-400">
            {summary.items.length} item ditemukan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream-100 dark:bg-navy-900 text-navy-700 dark:text-cream-300 font-bold border-b border-cream-200 dark:border-navy-800">
              <tr>
                <th className="py-2.5 px-3">Nama Transaksi</th>
                <th className="py-2.5 px-3">Kategori Kebocoran</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
                <th className="py-2.5 px-3">Saran Pengganti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-navy-900">
              {summary.items.slice(0, 10).map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-3 font-semibold text-navy-950 dark:text-cream-50">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-navy-600 dark:text-cream-400">
                    {item.categoryLabel}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                    {formatRupiah(item.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-navy-600 dark:text-cream-300 text-[11px]">
                    {item.substitutionTip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
