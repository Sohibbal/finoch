"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Utensils, Sparkles } from "lucide-react";
import { MealCalcConfig } from "@/types/meal-calc-types";
import {
  DEFAULT_MEAL_CONFIG,
  calculateMealMetrics,
} from "@/lib/financial/meal-calc-engine";

import { MealCalcCardMobile } from "@/components/meal-calc/meal-calc-card-mobile";
import { MealCalcBentoDesktop } from "@/components/meal-calc/meal-calc-bento-desktop";
import { PageHeader } from "@/components/layout/page-header";

export default function MealCalcPage() {

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
    <>
      <PageHeader
        title="Kalkulator Masak Sendiri vs Warteg"
        subtitle="Simulasi perbandingan biaya makan, strategi hybrid magic com & potensi hemat tahunan"
      />

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
    </>
  );
}
