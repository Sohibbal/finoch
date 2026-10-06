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
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function SimulatorPage() {
  const router = useRouter();

  // Baseline financial state untuk mahasiswa / anak kost
  const baselineMonthlyIncome = 2500000;
  const baselineMonthlyExpense = 1750000;
  const baselineNetSavings = baselineMonthlyIncome - baselineMonthlyExpense; // 750.000

  // Interactive scenario variables
  const [expenseCuts, setExpenseCuts] = useState(200000); // hemat jajan kopi/sore 200rb
  const [incomeAddition, setIncomeAddition] = useState(0); // job magang/freelance
  const [goalAmount, setGoalAmount] = useState(6000000); // Laptop Kuliah / Dana Darurat Kos

  // Fast scenario presets for students
  const applyPreset = (preset: "default" | "cut_coffee" | "internship" | "delayed_allowance" | "rent_hike") => {
    switch (preset) {
      case "default":
        setExpenseCuts(0);
        setIncomeAddition(0);
        break;
      case "cut_coffee":
        setExpenseCuts(200000);
        setIncomeAddition(0);
        break;
      case "internship":
        setExpenseCuts(0);
        setIncomeAddition(600000);
        break;
      case "delayed_allowance":
        setExpenseCuts(0);
        setIncomeAddition(-500000);
        break;
      case "rent_hike":
        setExpenseCuts(-150000);
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
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-navy-950 dark:text-cream-50">
                  finoch<span className="text-navy-600 dark:text-cream-300">.id</span>
                </span>
              </div>
              <div className="hidden md:block">
                <Breadcrumbs className="mb-1" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Finoch What-If Simulator
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70">
                  Simulasikan dampak uang kiriman, magang, dan pengeluaran kos mahasiswa
                </p>
              </div>
            </div>

            {/* Right: Theme Toggle & Reset Action */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => applyPreset("default")}
                className="px-3.5 py-2 rounded-full border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] text-navy-800 dark:text-cream-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-cream-100 dark:hover:bg-navy-900 transition-colors"
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
            <h2 className="text-xl font-black text-navy-950 dark:text-cream-50">
              Simulator Keuangan Mahasiswa & Anak Kost
            </h2>
            <p className="text-xs text-navy-600 dark:text-cream-300/70 mt-1">
              Simulasi cepat skenario riil mahasiswa: hemat nongkrong/kopi, pendapatan magang, hingga antisipasi kiriman ortu terlambat.
            </p>
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
              Skenario Cepat Mahasiswa (Preset Templates)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => applyPreset("cut_coffee")}
                className="p-3 text-left rounded-2xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] hover:border-navy-800 dark:hover:border-cream-300 transition-all text-xs font-semibold shadow-sm group"
              >
                <div className="font-bold text-navy-950 dark:text-cream-50 group-hover:text-navy-700 dark:group-hover:text-cream-200">
                  Pangkas Kopi & Jajanan Sore
                </div>
                <div className="text-navy-500 dark:text-cream-400 mt-0.5 text-[11px]">
                  Hemat Rp200.000/bln
                </div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("internship")}
                className="p-3 text-left rounded-2xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] hover:border-navy-800 dark:hover:border-cream-300 transition-all text-xs font-semibold shadow-sm group"
              >
                <div className="font-bold text-navy-950 dark:text-cream-50 group-hover:text-navy-700 dark:group-hover:text-cream-200">
                  Dapat Job Magang / Freelance
                </div>
                <div className="text-navy-500 dark:text-cream-400 mt-0.5 text-[11px]">
                  +Rp600.000/bln
                </div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("delayed_allowance")}
                className="p-3 text-left rounded-2xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] hover:border-navy-800 dark:hover:border-cream-300 transition-all text-xs font-semibold shadow-sm group"
              >
                <div className="font-bold text-navy-950 dark:text-cream-50 group-hover:text-navy-700 dark:group-hover:text-cream-200">
                  Uang Kiriman Ortu Terlambat
                </div>
                <div className="text-navy-500 dark:text-cream-400 mt-0.5 text-[11px]">
                  Survive 1 Minggu (-Rp500rb)
                </div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("rent_hike")}
                className="p-3 text-left rounded-2xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-[#070E1A] hover:border-navy-800 dark:hover:border-cream-300 transition-all text-xs font-semibold shadow-sm group"
              >
                <div className="font-bold text-navy-950 dark:text-cream-50 group-hover:text-navy-700 dark:group-hover:text-cream-200">
                  Sewa Kos Naik / Iuran WiFi
                </div>
                <div className="text-navy-500 dark:text-cream-400 mt-0.5 text-[11px]">
                  +Rp150.000/bln
                </div>
              </button>
            </div>
          </div>

          {/* Sliders Grid & Live Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sliders Column */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-navy-700 dark:text-cream-300" />
                Variabel Simulasi Anggaran Mahasiswa
              </h3>

              <ScenarioSlider
                label="Efisiensi / Penghematan Anak Kost"
                description="Nominal pengeluaran yang dihemat (misal: kurangi jajan kopi atau masak di kos)"
                value={expenseCuts}
                min={-500000}
                max={1000000}
                step={25000}
                onChange={setExpenseCuts}
              />

              <ScenarioSlider
                label="Penyesuaian Pemasukan Mahasiswa"
                description="Pendapatan tambahan dari magang/freelance atau antisipasi kiriman ortu tersendat"
                value={incomeAddition}
                min={-1000000}
                max={2000000}
                step={50000}
                onChange={setIncomeAddition}
              />

              <ScenarioSlider
                label="Target Goal / Tabungan Impian"
                description="Target nominal laptop kuliah, dana darurat kos, atau sertifikasi keahlian"
                value={goalAmount}
                min={500000}
                max={20000000}
                step={250000}
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
