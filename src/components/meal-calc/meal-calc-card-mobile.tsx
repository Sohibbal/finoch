"use client";

import React, { useState } from "react";
import {
  Utensils,
  Store,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  HelpCircle,
  PiggyBank,
} from "lucide-react";
import { MealCalcConfig, MealCalcResult } from "@/types/meal-calc-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface MealCalcMobileProps {
  config: MealCalcConfig;
  result: MealCalcResult;
  onChangeMealsPerDay: (count: number) => void;
  onChangeOutsideCost: (cost: number) => void;
}

export function MealCalcCardMobile({
  config,
  result,
  onChangeMealsPerDay,
  onChangeOutsideCost,
}: MealCalcMobileProps) {
  const [activeStrategy, setActiveStrategy] = useState<"hybrid" | "cook" | "warteg">("hybrid");

  return (
    <div className="space-y-4">
      {/* 1. Top Impact Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-navy-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Potensi Hemat Masak Sendiri
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
            {result.savingsPercentageCooking}% Lebih Murah
          </span>
        </div>

        <div className="text-3xl font-black tracking-tight text-white mb-1">
          {formatRupiah(result.monthlySavingsCooking)}
          <span className="text-xs font-normal text-white/80"> /bulan</span>
        </div>

        <p className="text-xs text-white/90 leading-relaxed mb-3">
          Setara hemat <strong className="text-amber-200 font-bold">{formatRupiah(result.annualSavingsCooking)}</strong> per tahun!
        </p>

        {/* 3 Strategy Cost Mini Bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 text-center text-xs">
          <div className="p-2 rounded-2xl bg-white/10">
            <span className="text-[9px] text-white/70 block uppercase font-semibold">100% Warteg</span>
            <span className="font-bold text-white block mt-0.5">
              {formatRupiah(result.outsideCostPerMeal)}
            </span>
            <span className="text-[8px] text-white/60">/porsi</span>
          </div>

          <div className="p-2 rounded-2xl bg-amber-400/20 border border-amber-300/40">
            <span className="text-[9px] text-amber-200 block uppercase font-black">Hybrid Kost</span>
            <span className="font-bold text-amber-100 block mt-0.5">
              {formatRupiah(result.hybridCostPerMeal)}
            </span>
            <span className="text-[8px] text-amber-200/80">/porsi</span>
          </div>

          <div className="p-2 rounded-2xl bg-emerald-400/20 border border-emerald-300/40">
            <span className="text-[9px] text-emerald-200 block uppercase font-black">100% Masak</span>
            <span className="font-bold text-emerald-100 block mt-0.5">
              {formatRupiah(result.cookCostPerMeal)}
            </span>
            <span className="text-[8px] text-emerald-200/80">/porsi</span>
          </div>
        </div>
      </div>

      {/* 2. Rapid Interactive Input Controls (Input-First Ergonomics) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-200 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wider">
          Sesuaikan Pola Makan Anda:
        </h3>

        {/* Meals per day chips */}
        <div>
          <label className="text-xs font-medium text-navy-700 dark:text-cream-300 block mb-2">
            Frekuensi Makan per Hari:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChangeMealsPerDay(num)}
                className={`min-h-[48px] rounded-2xl text-xs font-bold border transition-all ${
                  config.mealsPerDay === num
                    ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                    : "bg-cream-50 dark:bg-navy-900 border-cream-200 dark:border-navy-800 text-navy-700 dark:text-cream-300"
                }`}
              >
                {num}x Sehari
              </button>
            ))}
          </div>
        </div>

        {/* Warteg Price Presets */}
        <div>
          <label className="text-xs font-medium text-navy-700 dark:text-cream-300 block mb-2">
            Rata-rata Harga Beli Makan Warteg/Luar (Rp/porsi):
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[12000, 16000, 22000].map((cost) => (
              <button
                key={cost}
                type="button"
                onClick={() => onChangeOutsideCost(cost)}
                className={`min-h-[48px] rounded-2xl text-xs font-bold border transition-all ${
                  config.outsideMealCost === cost
                    ? "bg-emerald-600 text-white border-transparent shadow-sm"
                    : "bg-cream-50 dark:bg-navy-900 border-cream-200 dark:border-navy-800 text-navy-700 dark:text-cream-300"
                }`}
              >
                {cost === 12000 ? "Rp 12k (Warteg)" : cost === 16000 ? "Rp 16k (Standar)" : "Rp 22k (Geprek/Kafe)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Tactical Hack: "Strategi Hybrid Anak Kost" */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
          <Flame className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Taktik Cerdas: Strategi Hybrid Anak Kost</span>
        </div>
        <p className="text-[11px] text-navy-800 dark:text-cream-200 leading-relaxed">
          Malas cuci wajan tapi ingin hemat? <strong>Cukup masak nasi di magic com sendiri</strong> di kamar kost (hemat Rp 4.000/porsi dari harga nasi warteg), lalu beli lauk/sayur di warteg tanpa nasi. Anda tetap menghemat <strong>{formatRupiah(result.monthlySavingsHybrid)}/bulan</strong> tanpa perlu repot memasak lauk!
        </p>
      </div>

      {/* 4. Tactical Advice Box */}
      <div className="p-4 rounded-2xl bg-cream-100/70 dark:bg-navy-900/60 border border-cream-300 dark:border-navy-800 text-xs text-navy-700 dark:text-cream-300 leading-relaxed flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-navy-500 shrink-0 mt-0.5" />
        <p className="text-[11px]">{result.tacticalAdvice}</p>
      </div>
    </div>
  );
}
