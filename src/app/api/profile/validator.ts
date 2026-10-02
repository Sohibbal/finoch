export function validateOnboardingProfile(data: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data || typeof data.monthlyIncome !== "number" || data.monthlyIncome <= 0) {
    errors.push("Penghasilan bulanan harus lebih besar dari 0.");
  }
  if (!data || !data.incomeType) {
    errors.push("Tipe penghasilan wajib dipilih.");
  }
  if (!data || typeof data.currentSavings !== "number" || data.currentSavings < 0) {
    errors.push("Tabungan saat ini tidak valid.");
  }
  if (!data || typeof data.monthlyFixedExpenses !== "number" || data.monthlyFixedExpenses < 0) {
    errors.push("Pengeluaran wajib tidak valid.");
  }
  return { success: errors.length === 0, errors };
}
