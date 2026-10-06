import { GroceryItem, MealCalcConfig, MealCalcResult } from "@/types/meal-calc-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

export const DEFAULT_STUDENT_GROCERIES: GroceryItem[] = [
  {
    id: "g-beras",
    name: "Beras Berkualitas (5 kg)",
    price: 75000,
    unit: "karung 5kg",
    servingsYield: 30, // ~Rp 2.500 per porsi nasi
    category: "pokok",
  },
  {
    id: "g-telur",
    name: "Telur Ayam Negeri (1 kg)",
    price: 28000,
    unit: "kg (~16 butir)",
    servingsYield: 16, // ~Rp 1.750 per butir
    category: "protein",
  },
  {
    id: "g-tempe",
    name: "Tempe & Tahu Segar",
    price: 12000,
    unit: "papan besar",
    servingsYield: 8, // ~Rp 1.500 per porsi
    category: "protein",
  },
  {
    id: "g-sayur",
    name: "Sayur Sop / Kangkung / Bayam",
    price: 8000,
    unit: "2 ikat",
    servingsYield: 4, // ~Rp 2.000 per porsi sayur
    category: "sayur",
  },
  {
    id: "g-minyak",
    name: "Minyak Goreng & Bumbu Dapur",
    price: 25000,
    unit: "paket masak",
    servingsYield: 25, // ~Rp 1.000 per porsi
    category: "bumbu",
  },
  {
    id: "g-ayam",
    name: "Ayam Potong / Filet (500 gr)",
    price: 24000,
    unit: "500 gram",
    servingsYield: 6, // ~Rp 4.000 per porsi
    category: "protein",
  },
];

export const DEFAULT_MEAL_CONFIG: MealCalcConfig = {
  mealsPerDay: 2,
  daysPerWeek: 7,
  outsideMealCost: 16000, // Rp 16.000 rata-rata makan warteg/geprek
  ricePortionOutsideCost: 4000, // Rp 4.000 harga porsi nasi putih di warung
  items: DEFAULT_STUDENT_GROCERIES,
};

/**
 * Calculates financial comparison between cooking at kost, eating at warteg, and hybrid strategy.
 */
export function calculateMealMetrics(config: MealCalcConfig = DEFAULT_MEAL_CONFIG): MealCalcResult {
  const { mealsPerDay, daysPerWeek, outsideMealCost, ricePortionOutsideCost, items } = config;

  // Calculate home cooking cost per meal based on active items
  let totalCostPerPortion = 0;
  let homeRiceCost = 2500; // default rice cost

  for (const item of items) {
    if (item.servingsYield > 0 && item.price > 0) {
      const perServing = Math.round(item.price / item.servingsYield);
      totalCostPerPortion += perServing;
      if (item.id === "g-beras" || item.category === "pokok") {
        homeRiceCost = perServing;
      }
    }
  }

  // Ensure reasonable baseline if items list is customized
  const cookCostPerMeal = Math.max(3000, totalCostPerPortion);
  const outsideCostPerMeal = Math.max(5000, outsideMealCost);

  // Hybrid Strategy: Masak nasi di magic com kost (hemat Rp 4.000 nasi warteg), tapi beli lauk di warteg
  // Biaya = (harga warteg tanpa nasi) + harga beras magic com
  const wartegLaukOnlyCost = Math.max(3000, outsideCostPerMeal - ricePortionOutsideCost);
  const hybridCostPerMeal = wartegLaukOnlyCost + homeRiceCost;

  const mealsPerWeek = Math.max(1, mealsPerDay * daysPerWeek);

  const weeklyCookSpend = cookCostPerMeal * mealsPerWeek;
  const weeklyOutsideSpend = outsideCostPerMeal * mealsPerWeek;
  const weeklyHybridSpend = hybridCostPerMeal * mealsPerWeek;

  const WEEKS_PER_MONTH = 4.3;
  const monthlyCookSpend = Math.round(weeklyCookSpend * WEEKS_PER_MONTH);
  const monthlyOutsideSpend = Math.round(weeklyOutsideSpend * WEEKS_PER_MONTH);
  const monthlyHybridSpend = Math.round(weeklyHybridSpend * WEEKS_PER_MONTH);

  const monthlySavingsCooking = Math.max(0, monthlyOutsideSpend - monthlyCookSpend);
  const monthlySavingsHybrid = Math.max(0, monthlyOutsideSpend - monthlyHybridSpend);

  const annualSavingsCooking = monthlySavingsCooking * 12;
  const annualSavingsHybrid = monthlySavingsHybrid * 12;

  const savingsPercentageCooking = monthlyOutsideSpend > 0
    ? Math.round((monthlySavingsCooking / monthlyOutsideSpend) * 100)
    : 0;

  const savingsPercentageHybrid = monthlyOutsideSpend > 0
    ? Math.round((monthlySavingsHybrid / monthlyOutsideSpend) * 100)
    : 0;

  // Generate actionable tactical advice for Indonesian anak kost
  let tacticalAdvice = "";
  if (monthlySavingsCooking >= 400000) {
    tacticalAdvice = `Masak sendiri menghemat ${formatRupiah(monthlySavingsCooking)}/bulan (setara biaya bayar sewa kost 2-3 bulan dalam setahun!). Jika tidak sempat masak lauk tiap hari, terapkan Strategi Hybrid: cukup masak nasi di magic com kost dan beli lauk sayur di warteg untuk hemat ${formatRupiah(monthlySavingsHybrid)}/bulan tanpa repot mencuci wajan!`;
  } else if (monthlySavingsCooking >= 200000) {
    tacticalAdvice = `Masak sendiri menghemat ${formatRupiah(monthlySavingsCooking)}/bulan. Cukup luangkan waktu meal prep di akhir pekan (goreng tempe, rebus telur, tumis kangkung) untuk mengamankan uang saku hingga akhir bulan.`;
  } else {
    tacticalAdvice = `Selisih biaya makan tergolong seimbang. Anda bisa memadukan masak sarapan sederhana di kost dan beli makan siang bersama teman di kampus.`;
  }

  return {
    cookCostPerMeal,
    outsideCostPerMeal,
    hybridCostPerMeal,
    weeklyCookSpend,
    weeklyOutsideSpend,
    weeklyHybridSpend,
    monthlyCookSpend,
    monthlyOutsideSpend,
    monthlyHybridSpend,
    monthlySavingsCooking,
    monthlySavingsHybrid,
    annualSavingsCooking,
    annualSavingsHybrid,
    savingsPercentageCooking,
    savingsPercentageHybrid,
    tacticalAdvice,
  };
}
