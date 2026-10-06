"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Utensils, Sparkles } from "lucide-react";
import { MealCalcConfig } from "@/types/meal-calc-types";
import {
  DEFAULT_MEAL_CONFIG,
  calculateMealMetrics,
} from "@/lib/financial/meal-calc-engine";
import { useAuth } from "@/hooks/use-auth";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

import { MealCalcCardMobile } from "@/components/meal-calc/meal-calc-card-mobile";
import { MealCalcBentoDesktop } from "@/components/meal-calc/meal-calc-bento-desktop";

export default function MealCalcPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [config, setConfig] = useState<MealCalcConfig>(DEFAULT_MEAL_CONFIG);

  const result = useMemo(() => {
    return calculateMealMetrics(config);
  }, [config]);

  const handleChangeMealsPerDay = (mealsPerDay: number) => {
    setConfig((prev) => ({ ...prev, mealsPerDay }));
  };

  const handleChangeOutsideCost = (outsideMealCost: number) => {
    setConfig((prev) => ({ ...prev, outsideMealCost }));
  };

  return (
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 pb-2">
          <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-navy-700 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-white/10 transition-colors"
                aria-label="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <Breadcrumbs className="hidden md:flex mb-0.5" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide">
                  Kalkulator Masak Sendiri vs Warteg
                </h1>
                <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block">
                  Simulasi perbandingan biaya makan, strategi hybrid magic com & potensi hemat tahunan
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
          {/* MOBILE PWA VIEW (md:hidden) */}
          <div className="md:hidden">
            <MealCalcCardMobile
              config={config}
              result={result}
              onChangeMealsPerDay={handleChangeMealsPerDay}
              onChangeOutsideCost={handleChangeOutsideCost}
            />
          </div>

          {/* DESKTOP VIEW (hidden md:block) */}
          <div className="hidden md:block">
            <MealCalcBentoDesktop
              config={config}
              result={result}
              onChangeMealsPerDay={handleChangeMealsPerDay}
              onChangeOutsideCost={handleChangeOutsideCost}
            />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
    </div>
  );
}
