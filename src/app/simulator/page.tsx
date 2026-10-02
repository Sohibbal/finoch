"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Sliders,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Bot,
  Zap,
} from "lucide-react";
import { ScenarioSlider } from "@/components/simulator/scenario-slider";
import { SimulationResultCard } from "@/components/simulator/simulation-result-card";
import { simulateWhatIfScenario } from "@/lib/financial/financial-engine";

export default function SimulatorPage() {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                  What-If Simulator
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/simulator" className="text-purple-600 dark:text-purple-400">
              What-If Simulator
            </Link>
            <Link href="/goals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Goals
            </Link>
            <Link href="/copilot" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-500" />
              AI Copilot
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Simulator Keuangan Interaktif (What-If)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat masa depan finansial Anda sebelum menjalaninya. Geser slider untuk melihat dampak nyata terhadap target hidup.
          </p>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Skenario Cepat (Preset Templates)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => applyPreset("default")}
              className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 transition-all text-xs font-semibold"
            >
              <div className="font-bold text-slate-900 dark:text-white">Pola Saat Ini</div>
              <div className="text-slate-500 mt-0.5">Tanpa penyesuaian</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("cut_jajan")}
              className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 transition-all text-xs font-semibold"
            >
              <div className="font-bold text-slate-900 dark:text-white">Pangkas Jajan 25%</div>
              <div className="text-slate-500 mt-0.5">Hemat Rp300.000/bln</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("income_drop")}
              className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 transition-all text-xs font-semibold"
            >
              <div className="font-bold text-slate-900 dark:text-white">Penghasilan Turun 20%</div>
              <div className="text-slate-500 mt-0.5">Turun Rp700.000/bln</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("extra_rent")}
              className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 transition-all text-xs font-semibold"
            >
              <div className="font-bold text-slate-900 dark:text-white">Kos Naik 500rb</div>
              <div className="text-slate-500 mt-0.5">Beban tetap meningkat</div>
            </button>
          </div>
        </div>

        {/* Sliders Grid & Live Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders Column */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              Variabel Simulasi Anggaran
            </h2>

            <ScenarioSlider
              label="Efisiensi / Pemangkasan Pengeluaran"
              description="Nominal pengeluaran yang dihemat (misal: kurangi kafe / langganan)"
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
  );
}
