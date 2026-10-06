import { UktPlan, UktMetrics } from "@/types/ukt-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

/**
 * Calculates academic sinking fund target metrics.
 */
export function calculateUktMetrics(
  plan: UktPlan,
  monthlyIncome: number = 2000000,
  referenceDate: Date = new Date()
): UktMetrics {
  const target = Math.max(1, plan.targetAmount);
  const saved = Math.max(0, plan.currentSaved);
  const remainingAmount = Math.max(0, target - saved);
  const isCompleted = saved >= target;

  const targetDate = new Date(plan.deadline);
  const diffTime = targetDate.getTime() - referenceDate.getTime();
  const rawDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(1, rawDays);

  const dailyTarget = isCompleted ? 0 : Math.ceil(remainingAmount / daysRemaining);
  const weeklyTarget = dailyTarget * 7;
  const progressPercentage = Math.min(100, Math.round((saved / target) * 100));

  const dailyAllowance = Math.max(10000, monthlyIncome / 30);
  const targetRatio = dailyTarget / dailyAllowance;

  let feasibilityStatus: "aman" | "moderat" | "berat" = "aman";
  let advice = "";

  if (isCompleted) {
    feasibilityStatus = "aman";
    advice = `Alhamdulillah! Dana ${plan.name} telah terkumpul 100%. Uang Anda aman dan siap dibayarkan saat jadwal dibuka.`;
  } else if (targetRatio <= 0.25) {
    feasibilityStatus = "aman";
    advice = `Target sangat aman dan realistis! Cukup sisihkan ${formatRupiah(dailyTarget)}/hari (${Math.round(targetRatio * 100)}% dari uang saku harian) untuk mencapai target tepat waktu.`;
  } else if (targetRatio <= 0.5) {
    feasibilityStatus = "moderat";
    advice = `Target butuh kedisiplinan. Sisihkan ${formatRupiah(dailyTarget)}/hari (${Math.round(targetRatio * 100)}% dari uang saku harian). Kurangi nongkrong kafe atau terapkan masak hemat di kost.`;
  } else {
    feasibilityStatus = "berat";
    advice = `Target cukup berat karena mengambil ${Math.round(targetRatio * 100)}% dari uang saku harian (${formatRupiah(dailyTarget)}/hari). Pertimbangkan mencari penghasilan tambahan (freelance, asisten lab) atau mengajukan cicilan/keringanan UKT kampus.`;
  }

  return {
    remainingAmount,
    daysRemaining,
    dailyTarget,
    weeklyTarget,
    progressPercentage,
    isCompleted,
    feasibilityStatus,
    advice,
  };
}
