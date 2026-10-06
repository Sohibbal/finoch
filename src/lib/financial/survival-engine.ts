export interface EmergencyMeal {
  name: string;
  estimatedCost: number;
  description: string;
}

export interface SurvivalPlan {
  dailySurvivalRation: number;
  daysLeft: number;
  status: "critical" | "tight" | "moderate";
  headline: string;
  emergencyMeals: EmergencyMeal[];
  survivalRules: string[];
}

/**
 * Calculates student end-of-month survival daily ration and meal strategies.
 */
export function calculateSurvivalPlan(
  currentBalance: number,
  daysLeftInMonth: number
): SurvivalPlan {
  const safeDays = Math.max(1, daysLeftInMonth);
  const safeBalance = Math.max(0, currentBalance);
  const dailySurvivalRation = Math.floor(safeBalance / safeDays);

  let status: "critical" | "tight" | "moderate" = "moderate";
  let headline = "Kondisi keuangan tanggal tua kamu masih cukup terkendali.";

  if (dailySurvivalRation < 15000) {
    status = "critical";
    headline = "Kondisi Siaga 1! Uang saku sangat terbatas untuk sisa hari bulan ini.";
  } else if (dailySurvivalRation < 30000) {
    status = "tight";
    headline = "Mode Waspada: Rem pengeluaran jajan ekstra agar bisa bertahan sampai kiriman berikutnya.";
  }

  const emergencyMeals: EmergencyMeal[] = [
    {
      name: "Nasi Warteg Telur Dadar + Sayur",
      estimatedCost: 12000,
      description: "Porsi kenyang bernutrisi tanpa lauk daging/ikan mahal.",
    },
    {
      name: "Masak Nasi Kost + Lauk Tahu Tempe",
      estimatedCost: 7000,
      description: "Masak beras sendiri di rice cooker kost dan beli lauk tempe orek.",
    },
    {
      name: "Mie Rebus Komplit + Telur + Sayur",
      estimatedCost: 8000,
      description: "Solusi darurat malam hari dengan tambahan protein telur.",
    },
  ];

  const survivalRules = [
    "Kunci 100% pengeluaran kategori Keinginan (Wants = Rp 0).",
    "Bawa botol tumbler air minum sendiri saat ke kampus.",
    "Tagih piutang talangan teman kost yang belum lunas di Buku Kasbon.",
    "Masak nasi sendiri di rice cooker kamar kost untuk hemat 50% biaya makan.",
  ];

  return {
    dailySurvivalRation,
    daysLeft: safeDays,
    status,
    headline,
    emergencyMeals,
    survivalRules,
  };
}
