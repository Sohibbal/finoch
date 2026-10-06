"use client";

import React, { useState } from "react";
import {
  AlertOctagon,
  Flame,
  CheckCircle2,
  Utensils,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { calculateSurvivalPlan, SurvivalPlan } from "@/lib/financial/survival-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import Link from "next/link";

interface SurvivalModeCardProps {
  currentBalance: number;
  daysLeftInMonth: number;
}

export function SurvivalModeCard({
  currentBalance,
  daysLeftInMonth,
}: SurvivalModeCardProps) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const plan: SurvivalPlan = calculateSurvivalPlan(currentBalance, daysLeftInMonth);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent border-amber-500/30 p-5 sm:p-6 shadow-md"
          : "bg-white dark:bg-[#070E1A] border-cream-300 dark:border-navy-800 p-4 shadow-sm"
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isActive
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse"
                : "bg-cream-100 dark:bg-navy-900 text-navy-500 dark:text-cream-400"
            }`}
          >
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-navy-950 dark:text-cream-50">
                Mode Darurat Tanggal Tua
              </h3>
              {isActive && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Aktif (Siaga)
                </span>
              )}
            </div>
            <p className="text-[11px] text-navy-600 dark:text-cream-400">
              {isActive
                ? `Protokol bertahan hidup: Jatah ${formatRupiah(plan.dailySurvivalRation)} / hari (${plan.daysLeft} hari sisa)`
                : "Aktifkan saat uang saku menipis untuk mengunci pengeluaran non-primer"}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isActive ? "bg-amber-500" : "bg-cream-300 dark:bg-navy-800"
          }`}
          role="switch"
          aria-checked={isActive}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Expanded Active Panel */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-navy-950/80 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Jatah Makan Maksimal Harian
              </span>
              <div className="text-xl font-black text-navy-950 dark:text-cream-50">
                {formatRupiah(plan.dailySurvivalRation)} <span className="text-xs font-normal text-navy-500">/ hari</span>
              </div>
            </div>

            <Link
              href="/debts"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <span>Tagih Kasbon Teman</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Toggle details accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-bold text-navy-700 dark:text-cream-300 flex items-center gap-1 hover:underline"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{showDetails ? "Sembunyikan Panduan Menu Hemat" : "Lihat Rekomendasi Menu Bertahan Hidup"}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {plan.emergencyMeals.map((meal, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-cream-50 dark:bg-navy-900/60 border border-cream-200 dark:border-navy-800 space-y-1"
                  >
                    <span className="font-bold text-xs text-navy-950 dark:text-cream-50 block">
                      {meal.name}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                      ±{formatRupiah(meal.estimatedCost)}
                    </span>
                    <p className="text-[10px] text-navy-500 dark:text-cream-400">
                      {meal.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
