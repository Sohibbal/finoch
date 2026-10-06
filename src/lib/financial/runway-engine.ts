export interface FinancialRunwayParams {
  totalIncome: number;
  totalExpensesThisMonth: number;
  currentDate?: Date;
}

export interface FinancialRunwayResult {
  runwayDays: number;
  remainingCash: number;
  currentBurnRate: number;
  targetDailyToSurvive: number;
  dailyCutNeeded: number;
  daysPassed: number;
  daysRemainingInMonth: number;
  totalDaysInMonth: number;
  status: "safe" | "warning" | "critical";
  isSurvivingMonth: boolean;
  survivalDateText: string;
  advice: string;
}

export function calculateFinancialRunway(params: {
  totalIncome: number;
  totalExpensesThisMonth: number;
  currentDate?: Date;
}): FinancialRunwayResult {
  const date =
    params.currentDate instanceof Date && !isNaN(params.currentDate.getTime())
      ? params.currentDate
      : new Date();

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysPassed = Math.max(1, day);
  const daysRemainingInMonth = Math.max(1, totalDaysInMonth - day + 1);

  const remainingCash = Math.max(0, params.totalIncome - params.totalExpensesThisMonth);

  // If deficit
  if (remainingCash <= 0) {
    return {
      runwayDays: 0,
      remainingCash: 0,
      currentBurnRate: Math.round(params.totalExpensesThisMonth / daysPassed),
      targetDailyToSurvive: 0,
      dailyCutNeeded: Math.round(params.totalExpensesThisMonth / daysPassed),
      daysPassed,
      daysRemainingInMonth,
      totalDaysInMonth,
      status: "critical",
      isSurvivingMonth: false,
      survivalDateText: "Sudah Habis Hari Ini",
      advice: "Darurat: Saldo Anda sudah habis/defisit. Segera tahan seluruh pengeluaran dan hubungi orang tua atau gunakan talangan darurat.",
    };
  }

  // Calculate burn rate per day
  let currentBurnRate = 0;
  if (params.totalExpensesThisMonth > 0) {
    currentBurnRate = Math.round(params.totalExpensesThisMonth / daysPassed);
  } else {
    // If no expenses yet, estimate based on expected uniform monthly pace
    currentBurnRate = Math.round(params.totalIncome / totalDaysInMonth);
  }

  // Avoid division by zero
  const safeBurnRate = Math.max(1, currentBurnRate);
  const rawRunwayDays = remainingCash / safeBurnRate;
  const runwayDays = Math.floor(rawRunwayDays);

  // Target daily budget to survive until end of month
  const targetDailyToSurvive = Math.round(remainingCash / daysRemainingInMonth);
  const dailyCutNeeded = Math.max(0, currentBurnRate - targetDailyToSurvive);

  // Calculate estimated exhaustion date
  const exhaustionDate = new Date(date);
  exhaustionDate.setDate(date.getDate() + runwayDays);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  let survivalDateText = "";
  if (runwayDays >= daysRemainingInMonth) {
    survivalDateText = `Lewat Akhir Bulan (> ${totalDaysInMonth} ${monthNames[month]})`;
  } else {
    survivalDateText = `${exhaustionDate.getDate()} ${monthNames[exhaustionDate.getMonth()]} ${exhaustionDate.getFullYear()}`;
  }

  // Determine status:
  // If runwayDays >= daysRemainingInMonth: Safe (funds will last until next month)
  // If runwayDays >= daysRemainingInMonth - 5: Warning (danger around week 3 / early week 4)
  // Else: Critical (will run out way too early)
  let status: "safe" | "warning" | "critical" = "safe";
  let isSurvivingMonth = true;
  let advice = "";

  if (runwayDays >= daysRemainingInMonth) {
    status = "safe";
    isSurvivingMonth = true;
    advice = `Laju pengeluaran Anda terkendali (Rp${currentBurnRate.toLocaleString("id-ID")}/hari). Uang diproyeksikan bertahan sampai kiriman bulan depan.`;
  } else if (runwayDays >= daysRemainingInMonth - 5) {
    status = "warning";
    isSurvivingMonth = false;
    advice = `Waspada tanggal tua: Uang diproyeksikan habis di tgl ${survivalDateText}. Kurangi jajan Rp${dailyCutNeeded.toLocaleString("id-ID")}/hari agar bertahan aman sampai akhir bulan.`;
  } else {
    status = "critical";
    isSurvivingMonth = false;
    advice = `Peringatan krisis: Laju pengeluaran terlalu cepat! Uang diprediksi habis pada ${survivalDateText} (${daysRemainingInMonth - runwayDays} hari sebelum akhir bulan).`;
  }

  return {
    runwayDays,
    remainingCash,
    currentBurnRate,
    targetDailyToSurvive,
    dailyCutNeeded,
    daysPassed,
    daysRemainingInMonth,
    totalDaysInMonth,
    status,
    isSurvivingMonth,
    survivalDateText,
    advice,
  };
}
