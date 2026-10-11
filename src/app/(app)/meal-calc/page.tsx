"use client";

import React, { useState, useMemo } from "react";
import { MealCalcConfig } from "@/types/meal-calc-types";
import {
  DEFAULT_MEAL_CONFIG,
  calculateMealMetrics,
} from "@/lib/financial/meal-calc-engine";

import { MealCompare } from "@/components/meal-calc/meal-compare";
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
      <PageHeader title="Masak vs Warteg" subtitle="Nota warteg dibanding belanja masak sendiri, dihitung per bulan" />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-10">
        <MealCompare
          config={config}
          result={result}
          onChangeMealsPerDay={handleChangeMealsPerDay}
          onChangeOutsideCost={handleChangeOutsideCost}
        />
      </main>
    </>
  );
}
