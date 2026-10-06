export type MealStrategy = "cook_all" | "warteg_all" | "hybrid";

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  servingsYield: number; // Berapa porsi makan yang dihasilkan
  category: "pokok" | "protein" | "sayur" | "bumbu";
}

export interface MealCalcConfig {
  mealsPerDay: number; // e.g. 2 or 3
  daysPerWeek: number; // e.g. 7
  outsideMealCost: number; // e.g. Rp 15.000 per porsi warteg
  ricePortionOutsideCost: number; // e.g. Rp 4.000 jika beli nasi putih di warung
  items: GroceryItem[];
}

export interface MealCalcResult {
  cookCostPerMeal: number;
  outsideCostPerMeal: number;
  hybridCostPerMeal: number; // Masak nasi magic com sendiri, lauk beli warteg
  weeklyCookSpend: number;
  weeklyOutsideSpend: number;
  weeklyHybridSpend: number;
  monthlyCookSpend: number;
  monthlyOutsideSpend: number;
  monthlyHybridSpend: number;
  monthlySavingsCooking: number;
  monthlySavingsHybrid: number;
  annualSavingsCooking: number;
  annualSavingsHybrid: number;
  savingsPercentageCooking: number;
  savingsPercentageHybrid: number;
  tacticalAdvice: string;
}
