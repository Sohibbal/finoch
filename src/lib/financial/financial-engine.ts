export interface CashflowSummary {
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
}

export function calculateCashflowSummary(params: {
  income: number;
  expenses: number;
}): CashflowSummary {
  const netSavings = params.income - params.expenses;
  const savingsRate =
    params.income > 0 ? (netSavings / params.income) * 100 : 0;
  return {
    income: params.income,
    expenses: params.expenses,
    netSavings,
    savingsRate: Math.max(-100, Math.min(100, savingsRate)),
  };
}

export interface DigitalTwinSplit {
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  needsStatus: "optimal" | "warning" | "danger";
  wantsStatus: "optimal" | "warning" | "danger";
}

export function calculateDigitalTwinSplit(params: {
  income: number;
  needs: number;
  wants: number;
  netSavings: number;
}): DigitalTwinSplit {
  const total = params.income > 0 ? params.income : params.needs + params.wants;
  const safeTotal = total > 0 ? total : 1;

  const needsPercentage = (params.needs / safeTotal) * 100;
  const wantsPercentage = (params.wants / safeTotal) * 100;
  const savingsPercentage = (params.netSavings / safeTotal) * 100;

  return {
    needsAmount: params.needs,
    wantsAmount: params.wants,
    savingsAmount: params.netSavings,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    needsStatus: needsPercentage <= 50 ? "optimal" : needsPercentage <= 65 ? "warning" : "danger",
    wantsStatus: wantsPercentage <= 30 ? "optimal" : wantsPercentage <= 45 ? "warning" : "danger",
  };
}

export interface GoalProjectionResult {
  remainingAmount: number;
  requiredMonthlySaving: number;
  estimatedMonthsToAchieve: number;
  status: "on_track" | "at_risk" | "behind_target" | "achieved";
}

export function calculateGoalProjection(params: {
  targetAmount: number;
  currentAmount: number;
  monthlySaving: number;
  targetMonths: number;
}): GoalProjectionResult {
  const remainingAmount = Math.max(0, params.targetAmount - params.currentAmount);
  if (remainingAmount === 0) {
    return {
      remainingAmount: 0,
      requiredMonthlySaving: 0,
      estimatedMonthsToAchieve: 0,
      status: "achieved",
    };
  }

  const safeMonths = Math.max(1, params.targetMonths);
  const requiredMonthlySaving = remainingAmount / safeMonths;

  if (params.monthlySaving <= 0) {
    return {
      remainingAmount,
      requiredMonthlySaving,
      estimatedMonthsToAchieve: Infinity,
      status: "behind_target",
    };
  }

  const estimatedMonthsToAchieve = Math.ceil(remainingAmount / params.monthlySaving);
  const ratio = params.monthlySaving / requiredMonthlySaving;

  let status: GoalProjectionResult["status"] = "behind_target";
  if (ratio >= 1.0) {
    status = "on_track";
  } else if (ratio >= 0.6) {
    status = "at_risk";
  }

  return {
    remainingAmount,
    requiredMonthlySaving,
    estimatedMonthsToAchieve,
    status,
  };
}

export interface WhatIfSimulationResult {
  simulatedNetSavings: number;
  deltaMonthlySavings: number;
  simulatedMonthsToGoal: number;
}

export function simulateWhatIfScenario(params: {
  currentMonthlyIncome: number;
  currentMonthlyExpense: number;
  expenseCuts: number;
  incomeAddition: number;
  remainingGoalAmount: number;
}): WhatIfSimulationResult {
  const newIncome = params.currentMonthlyIncome + params.incomeAddition;
  const newExpense = Math.max(0, params.currentMonthlyExpense - params.expenseCuts);
  const simulatedNetSavings = newIncome - newExpense;
  const currentNetSavings = params.currentMonthlyIncome - params.currentMonthlyExpense;
  const deltaMonthlySavings = simulatedNetSavings - currentNetSavings;

  const simulatedMonthsToGoal =
    simulatedNetSavings > 0
      ? Math.ceil(params.remainingGoalAmount / simulatedNetSavings)
      : Infinity;

  return {
    simulatedNetSavings,
    deltaMonthlySavings,
    simulatedMonthsToGoal,
  };
}

export type { DailySafeToSpendResult } from "@/types/financial-types";

export function calculateDailySafeToSpend(params: {
  monthlyIncome: number;
  totalExpensesThisMonth: number;
  monthlyFixedExpenses: number;
  todaySpent?: number;
  currentDate?: Date;
}): import("@/types/financial-types").DailySafeToSpendResult {
  const todaySpent = Math.max(0, params.todaySpent ?? 0);
  const date =
    params.currentDate instanceof Date && !isNaN(params.currentDate.getTime())
      ? params.currentDate
      : new Date();

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - day + 1);

  const netRemainingBudget =
    params.monthlyIncome - params.monthlyFixedExpenses - params.totalExpensesThisMonth;

  if (netRemainingBudget <= 0) {
    return {
      dailyBudget: 0,
      todaySpent,
      remainingToday: 0,
      daysRemaining,
      status: "danger",
      headline: "Krisis Tanggal Tua!",
      advice:
        "Budget bulan ini sudah habis. Aktifkan mode survival: masak di kos, tahan pengeluaran non-esensial, dan prioritaskan kebutuhan primer sampai kiriman berikutnya tiba.",
    };
  }

  const dailyBudget = Math.max(0, Math.round(netRemainingBudget / daysRemaining));
  const remainingToday = Math.max(0, dailyBudget - todaySpent);

  if (dailyBudget <= 0 || todaySpent > dailyBudget) {
    return {
      dailyBudget,
      todaySpent,
      remainingToday,
      daysRemaining,
      status: "danger",
      headline: "Melampaui Jatah Harian!",
      advice:
        "Pengeluaran hari ini sudah melebihi batas aman harian. Rem pengeluaran dan tahan jajan di luar agar tidak membebani hari-hari berikutnya.",
    };
  }

  const spendingRatio = dailyBudget > 0 ? todaySpent / dailyBudget : 0;

  if (spendingRatio >= 0.8) {
    return {
      dailyBudget,
      todaySpent,
      remainingToday,
      daysRemaining,
      status: "warning",
      headline: "Mendekati Batas Harian",
      advice:
        "Pengeluaran hari ini sudah mencapai 80%+ dari batas aman. Rem jajan sore dan nongkrong agar jatah hari ini tidak minus.",
    };
  }

  return {
    dailyBudget,
    todaySpent,
    remainingToday,
    daysRemaining,
    status: "safe",
    headline: "Jatah Jajan Hari Ini Aman",
    advice:
      "Pengeluaran hari ini masih dalam batas aman terkendali. Tetap bijak dan sisihkan sisa jatah harian untuk tabungan.",
  };
}
