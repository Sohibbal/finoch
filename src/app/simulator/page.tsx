"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { ScenarioSlider } from "@/components/simulator/scenario-slider";
import { SimulationResultCard } from "@/components/simulator/simulation-result-card";
import { simulateWhatIfScenario } from "@/lib/financial/financial-engine";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function SimulatorPage() {
  const router = useRouter();

  // Baseline financial state
  const baselineMonthlyIncome = 3500000;
  const baselineMonthlyExpense = 2300000;
  const baselineNetSavings = baselineMonthlyIncome - baselineMonthlyExpense; // 1.200.000

  // Interactive scenario variables
  const [expenseCuts, setExpenseCuts] = useState(200000); // hemat jajan 200rb
  const [incomeAddition, setIncomeAddition] = useState(0); // lembur/freelance
  const [goalAmount, setGoalAmount] = useState(12000000); // Dana darurat / Laptop

  // Fast scenario presets
  const applyPreset = (preset: "default" | "cut_jajan" | "income_drop" | "extra_rent") => {
    switch (preset) {
      case "default":
        setExpenseCuts(0);
        setIncomeAddition(0);
        break;
      case "cut_jajan":
        setExpenseCuts(300000);
        setIncomeAddition(0);
        break;
      case "income_drop":
        setExpenseCuts(0);
        setIncomeAddition(-700000);
        break;
      case "extra_rent":
        setExpenseCuts(-500000); // Pengeluaran bertambah 500rb
        setIncomeAddition(0);
        break;
    }
  };

  // Run deterministic calculation
  const simulation = simulateWhatIfScenario({
    currentMonthlyIncome: baselineMonthlyIncome,
    currentMonthlyExpense: baselineMonthlyExpense,
    expenseCuts,
    incomeAddition,
    remainingGoalAmount: goalAmount,
  });

  const baselineMonthsToGoal =
    baselineNetSavings > 0
      ? Math.ceil(goalAmount / baselineNetSavings)
      : Infinity;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex min-h-screen sticky top-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0c1322]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0f274a] dark:bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Compass className="w-4 h-4 text-blue-300 dark:text-white" />
                </div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  What-If Simulator
                </h1>
                <p className="text-[11px] text-slate-500">
                  Simulasikan dampak penyesuaian anggaran terhadap target finansial Anda
                </p>
              </div>
            </div>

            {/* Right: Theme Toggle & Reset Action */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => applyPreset("default")}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Skenario</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Simulator Keuangan Interaktif
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lihat proyeksi finansial Anda secara real-time. Geser kontrol untuk melihat dampak nyata terhadap waktu pencapaian target.
            </p>
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Skenario Cepat (Preset Templates)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => applyPreset("default")}
                className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-xs font-semibold"
              >
                <div className="font-bold text-slate-900 dark:text-white">Pola Saat Ini</div>
                <div className="text-slate-500 mt-0.5 text-[11px]">Tanpa penyesuaian</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("cut_jajan")}
                className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-xs font-semibold"
              >
                <div className="font-bold text-slate-900 dark:text-white">Pangkas Jajan 25%</div>
                <div className="text-slate-500 mt-0.5 text-[11px]">Hemat Rp300.000/bln</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("income_drop")}
                className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-xs font-semibold"
              >
                <div className="font-bold text-slate-900 dark:text-white">Penghasilan Turun 20%</div>
                <div className="text-slate-500 mt-0.5 text-[11px]">Turun Rp700.000/bln</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("extra_rent")}
                className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-xs font-semibold"
              >
                <div className="font-bold text-slate-900 dark:text-white">Kos Naik 500rb</div>
                <div className="text-slate-500 mt-0.5 text-[11px]">Beban tetap meningkat</div>
              </button>
            </div>
          </div>

          {/* Sliders Grid & Live Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sliders Column */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Variabel Simulasi Anggaran
              </h3>

              <ScenarioSlider
                label="Efisiensi / Pemangkasan Pengeluaran"
                description="Nominal pengeluaran yang dihemat (misal: kurangi jajan kafe atau langganan)"
                value={expenseCuts}
                min={-1000000}
                max={1500000}
                step={50000}
                onChange={setExpenseCuts}
              />

              <ScenarioSlider
                label="Penyesuaian Penghasilan Bulanan"
                description="Pendapatan tambahan sampingan atau antisipasi penurunan income"
                value={incomeAddition}
                min={-1500000}
                max={2500000}
                step={100000}
                onChange={setIncomeAddition}
              />

              <ScenarioSlider
                label="Target Nominal Goal Finansial"
                description="Besar dana darurat atau barang yang ingin Anda capai"
                value={goalAmount}
                min={1000000}
                max={30000000}
                step={500000}
                onChange={setGoalAmount}
              />
            </div>

            {/* Results Column */}
            <div className="lg:col-span-6">
              <SimulationResultCard
                result={simulation}
                baselineNetSavings={baselineNetSavings}
                baselineMonthsToGoal={baselineMonthsToGoal}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} />
    </div>
  );
}
