"use client";

import React, { useState } from "react";
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  TrendingDown,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from "lucide-react";
import { FinancialRunwayResult } from "@/lib/financial/runway-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface FinancialRunwayCardProps {
  runway: FinancialRunwayResult;
}

export function FinancialRunwayCard({ runway }: FinancialRunwayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status visual configurations
  const statusConfig = {
    safe: {
      badge: "🟢 Aman Lewat Akhir Bulan",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30",
      accentText: "text-emerald-700 dark:text-emerald-400",
      barColor: "bg-emerald-500",
      icon: CheckCircle2,
    },
    warning: {
      badge: "🟡 Waspada Tanggal Tua",
      bgColor: "bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/30",
      accentText: "text-amber-700 dark:text-amber-400",
      barColor: "bg-amber-500",
      icon: Flame,
    },
    critical: {
      badge: "🔴 Bahaya Krisis Tanggal Tua",
      bgColor: "bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30",
      accentText: "text-rose-700 dark:text-rose-400",
      barColor: "bg-rose-500",
      icon: AlertTriangle,
    },
  }[runway.status];

  const StatusIcon = statusConfig.icon;
  const progressPercentage = Math.min(
    100,
    Math.round((runway.runwayDays / runway.daysRemainingInMonth) * 100)
  );

  return (
    <div
      className={`rounded-3xl border p-4 sm:p-6 transition-all duration-300 shadow-sm ${statusConfig.bgColor}`}
    >
      {/* ========================================================================= */}
      {/* MOBILE PWA VIEW (Touch Ergonomic, Glanceable: md:hidden) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3.5">
        {/* Top Header Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StatusIcon className={`w-4 h-4 ${statusConfig.accentText}`} />
            <span className="text-[11px] font-black uppercase tracking-wider text-navy-800 dark:text-cream-200">
              Runway Saldo Kost
            </span>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.bgColor} ${statusConfig.accentText}`}
          >
            {statusConfig.badge}
          </span>
        </div>

        {/* Big Number Headline */}
        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-navy-500 dark:text-cream-300/60 block">
              Uangmu Bertahan:
            </span>
            <span className={`text-2xl font-black tracking-tight ${statusConfig.accentText}`}>
              {runway.runwayDays} Hari Lagi
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-navy-500 dark:text-cream-300/60 block">
              Estimasi Habis:
            </span>
            <span className="text-xs font-bold text-navy-900 dark:text-cream-50">
              {runway.survivalDateText}
            </span>
          </div>
        </div>

        {/* Gauge Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-cream-200 dark:bg-navy-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${statusConfig.barColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-navy-500 dark:text-cream-300/60 font-medium">
            <span>Sisa {runway.daysRemainingInMonth} hari bulan ini</span>
            <span>{progressPercentage}% tercukupi</span>
          </div>
        </div>

        {/* Mobile Stat Pills */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-navy-900/60 border border-cream-200/80 dark:border-navy-800/80">
            <span className="text-[10px] text-navy-500 dark:text-cream-300/60 block">
              Laju Bakar Harian
            </span>
            <span className="text-xs font-bold text-navy-950 dark:text-cream-50">
              {formatRupiah(runway.currentBurnRate)}/hari
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-navy-900/60 border border-cream-200/80 dark:border-navy-800/80">
            <span className="text-[10px] text-navy-500 dark:text-cream-300/60 block">
              Target Laju Aman
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(runway.targetDailyToSurvive)}/hari
            </span>
          </div>
        </div>

        {/* Advice Accordion */}
        <div className="pt-1 border-t border-cream-200/60 dark:border-navy-800/60">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-navy-700 dark:text-cream-300 py-1"
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Saran Bertahan Hidup</span>
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {isExpanded && (
            <p className="text-[11px] text-navy-600 dark:text-cream-300/80 leading-relaxed pt-1.5 animate-fade-in">
              {runway.advice}
            </p>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP BENTO VIEW (Wide Screen Analytics: hidden md:block) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-4">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl bg-white/60 dark:bg-navy-900/60 border border-cream-200 dark:border-navy-800 ${statusConfig.accentText}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                Financial Runway & Burn Rate (Hari Bertahan Anak Kost)
              </h3>
              <p className="text-xs text-navy-600 dark:text-cream-300/70">
                Kalkulasi ketahanan uang saku berdasarkan laju pengeluaran riil harian
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.accentText}`}
          >
            {statusConfig.badge}
          </span>
        </div>

        {/* Desktop 3-Card Stat Metrics Grid */}
        <div className="grid grid-cols-12 gap-4 pt-1">
          {/* Col 1: Big Runway Days (4 cols) */}
          <div className="col-span-4 p-4 rounded-2xl bg-white/70 dark:bg-navy-900/70 border border-cream-200 dark:border-navy-800 space-y-1">
            <span className="text-[11px] uppercase font-bold text-navy-500 dark:text-cream-300/60">
              Uangmu Bertahan Selama:
            </span>
            <div className={`text-3xl font-black tracking-tight ${statusConfig.accentText}`}>
              {runway.runwayDays} Hari
            </div>
            <p className="text-xs text-navy-700 dark:text-cream-300 flex items-center gap-1 pt-1">
              <Calendar className="w-3.5 h-3.5 text-navy-400 dark:text-cream-400" />
              <span>Proyeksi Habis: <strong>{runway.survivalDateText}</strong></span>
            </p>
          </div>

          {/* Col 2: Burn Rate vs Target (4 cols) */}
          <div className="col-span-4 p-4 rounded-2xl bg-white/70 dark:bg-navy-900/70 border border-cream-200 dark:border-navy-800 space-y-2">
            <span className="text-[11px] uppercase font-bold text-navy-500 dark:text-cream-300/60">
              Laju Bakar Harian (Burn Rate):
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-navy-950 dark:text-cream-50">
                {formatRupiah(runway.currentBurnRate)}
              </span>
              <span className="text-xs text-navy-500 dark:text-cream-300/60">/hari</span>
            </div>
            <div className="text-[11px] text-navy-600 dark:text-cream-300/70 flex items-center justify-between border-t border-cream-200 dark:border-navy-800 pt-1.5">
              <span>Target Laju Aman:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(runway.targetDailyToSurvive)}/hari
              </span>
            </div>
          </div>

          {/* Col 3: Gauge & Surplus (4 cols) */}
          <div className="col-span-4 p-4 rounded-2xl bg-white/70 dark:bg-navy-900/70 border border-cream-200 dark:border-navy-800 space-y-2.5">
            <span className="text-[11px] uppercase font-bold text-navy-500 dark:text-cream-300/60 flex items-center justify-between">
              <span>Ketahanan Bulan Ini</span>
              <span>{progressPercentage}%</span>
            </span>
            <div className="w-full h-2.5 rounded-full bg-cream-200 dark:bg-navy-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${statusConfig.barColor}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-navy-600 dark:text-cream-300/70 flex items-center justify-between">
              <span>Sisa Waktu Bulan:</span>
              <span className="font-bold text-navy-900 dark:text-cream-100">
                {runway.daysRemainingInMonth} Hari
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Recommendation Bar */}
        <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-cream-200/80 dark:border-navy-800/80 flex items-center gap-3">
          <Info className={`w-4 h-4 shrink-0 ${statusConfig.accentText}`} />
          <p className="text-xs text-navy-800 dark:text-cream-200 leading-relaxed">
            <strong>Analisis Finoch: </strong>
            {runway.advice}
          </p>
        </div>
      </div>
    </div>
  );
}
