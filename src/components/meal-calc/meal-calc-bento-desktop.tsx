"use client";

import React from "react";
import {
  Utensils,
  Store,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { MealCalcConfig, MealCalcResult } from "@/types/meal-calc-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface MealCalcBentoDesktopProps {
  config: MealCalcConfig;
  result: MealCalcResult;
  onChangeMealsPerDay: (count: number) => void;
  onChangeOutsideCost: (cost: number) => void;
}

export function MealCalcBentoDesktop({
  config,
  result,
  onChangeMealsPerDay,
  onChangeOutsideCost,
}: MealCalcBentoDesktopProps) {
  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Monthly Savings */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-navy-900 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Hemat Masak Bulanan
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-white mb-1">
              {formatRupiah(result.monthlySavingsCooking)}
            </div>
            <p className="text-xs text-cream-200/80">
              {result.savingsPercentageCooking}% lebih hemat dibanding 100% beli makan
            </p>
          </div>
        </div>

        {/* Annual Compounding Savings */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Hemat Dalam 1 Tahun
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(result.annualSavingsCooking)}
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              Bisa untuk bayar UKT 1 semester atau sewa kost!
            </p>
          </div>
        </div>

        {/* Cost Per Meal Comparison */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Biaya Per Porsi Makan
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(result.cookCostPerMeal)}
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              vs Warteg {formatRupiah(result.outsideCostPerMeal)} /porsi
            </p>
          </div>
        </div>

        {/* Hybrid Savings */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Strategi Hybrid Kost
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(result.monthlySavingsHybrid)}
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              Masak nasi magic com + beli lauk warteg
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Bento Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: 3 Strategies Table & Grocery Breakdown (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3 Strategy Comparison Matrix */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
              Komparasi 3 Pola Makan Mahasiswa (Berdasarkan {config.mealsPerDay}x Makan Sehari)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-cream-200 dark:border-navy-800 text-navy-500 dark:text-cream-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Strategi Pola Makan</th>
                    <th className="py-3 px-3">Biaya /Porsi</th>
                    <th className="py-3 px-3">Pengeluaran /Bulan</th>
                    <th className="py-3 px-3">Penghematan</th>
                    <th className="py-3 px-3">Usaha & Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 dark:divide-navy-800/60">
                  {/* Warteg */}
                  <tr className="hover:bg-cream-50/50 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-navy-950 dark:text-cream-50 flex items-center gap-2">
                      <Store className="w-4 h-4 text-navy-400" />
                      <span>100% Beli Warteg / Luar</span>
                    </td>
                    <td className="py-3.5 px-3 text-navy-700 dark:text-cream-300">
                      {formatRupiah(result.outsideCostPerMeal)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-rose-600 dark:text-rose-400">
                      {formatRupiah(result.monthlyOutsideSpend)}
                    </td>
                    <td className="py-3.5 px-3 text-navy-400 dark:text-cream-500 font-medium">
                      Rp 0 (Baseline)
                    </td>
                    <td className="py-3.5 px-3 text-emerald-600 font-semibold">
                      0 menit (Praktis)
                    </td>
                  </tr>

                  {/* Hybrid */}
                  <tr className="bg-amber-500/5 hover:bg-amber-500/10 transition-colors font-medium">
                    <td className="py-3.5 px-3 font-bold text-navy-950 dark:text-cream-50 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Strategi Hybrid Anak Kost</span>
                    </td>
                    <td className="py-3.5 px-3 text-navy-700 dark:text-cream-300">
                      {formatRupiah(result.hybridCostPerMeal)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                      {formatRupiah(result.monthlyHybridSpend)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      + {formatRupiah(result.monthlySavingsHybrid)}/bln
                    </td>
                    <td className="py-3.5 px-3 text-navy-600 dark:text-cream-300">
                      5 menit (Nasi Magic Com)
                    </td>
                  </tr>

                  {/* 100% Cooking */}
                  <tr className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-navy-950 dark:text-cream-50 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-emerald-500" />
                      <span>100% Masak Mandiri</span>
                    </td>
                    <td className="py-3.5 px-3 text-navy-700 dark:text-cream-300">
                      {formatRupiah(result.cookCostPerMeal)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(result.monthlyCookSpend)}
                    </td>
                    <td className="py-3.5 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      + {formatRupiah(result.monthlySavingsCooking)}/bln
                    </td>
                    <td className="py-3.5 px-3 text-amber-600 font-semibold">
                      20-30 menit/hari
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grocery Basket Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Estimasi Keranjang Belanja Bahan Makanan Mahasiswa
              </h3>
              <span className="text-xs text-navy-500 dark:text-cream-400">
                Berdasarkan harga pasar tradisional & grosir mini
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.items.map((item) => {
                const perServing = Math.round(item.price / Math.max(1, item.servingsYield));
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-cream-50/70 dark:bg-navy-800/60 border border-cream-200 dark:border-navy-700 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-navy-950 dark:text-cream-50">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-navy-500 dark:text-cream-400">
                        {formatRupiah(item.price)} per {item.unit} ({item.servingsYield} porsi)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                        {formatRupiah(perServing)}
                      </span>
                      <span className="text-[9px] text-navy-400 dark:text-cream-500">
                        per porsi makan
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Simulators & Meal Prep Hacks (Span 1) */}
        <div className="space-y-6">
          {/* Interactive Controls */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
              Pengaturan Pola Makan Anda
            </h3>

            {/* Meals per day */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 flex justify-between">
                <span>Frekuensi Makan / Hari:</span>
                <span className="font-bold text-navy-950 dark:text-cream-50">{config.mealsPerDay}x sehari</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChangeMealsPerDay(num)}
                    className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all ${
                      config.mealsPerDay === num
                        ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                        : "bg-cream-50 dark:bg-navy-800 border-cream-200 dark:border-navy-700 text-navy-700 dark:text-cream-300 hover:bg-cream-100"
                    }`}
                  >
                    {num}x Makan
                  </button>
                ))}
              </div>
            </div>

            {/* Outside Cost */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 flex justify-between">
                <span>Rata-rata Harga Warteg / Luar:</span>
                <span className="font-bold text-navy-950 dark:text-cream-50">{formatRupiah(config.outsideMealCost)}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[12000, 16000, 22000].map((cost) => (
                  <button
                    key={cost}
                    type="button"
                    onClick={() => onChangeOutsideCost(cost)}
                    className={`min-h-[44px] rounded-xl text-xs font-bold border transition-all ${
                      config.outsideMealCost === cost
                        ? "bg-emerald-600 text-white border-transparent shadow-sm"
                        : "bg-cream-50 dark:bg-navy-800 border-cream-200 dark:border-navy-700 text-navy-700 dark:text-cream-300 hover:bg-cream-100"
                    }`}
                  >
                    {cost === 12000 ? "Rp 12k" : cost === 16000 ? "Rp 16k" : "Rp 22k"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tactical Advice Box */}
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Rekomendasi Taktis Finoch</span>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              {result.tacticalAdvice}
            </p>
          </div>

          {/* Meal Prep Weekend Hack */}
          <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wider">
              Trik Meal Prep 30 Menit Akhir Pekan
            </h4>
            <ul className="space-y-2 text-xs text-navy-700 dark:text-cream-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Masak nasi 1 cup beras setiap pagi di magic com kost.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Rebus 8 butir telur sekaligus dan simpan di kulkas kamar untuk sarapan instan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Beli sayur warteg tanpa nasi saat makan siang untuk gizi seimbang.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
