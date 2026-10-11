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
