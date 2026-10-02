import { describe, it, expect } from "vitest";

describe("Financial Profile API Validation", () => {
  it("validates required onboarding fields", async () => {
    const { validateOnboardingProfile } = await import("@/app/api/profile/validator");
    const valid = validateOnboardingProfile({
      monthlyIncome: 3000000,
      incomeType: "salary",
      currentSavings: 2500000,
      monthlyFixedExpenses: 1200000,
      financialPriority: "saving",
    });
    expect(valid.success).toBe(true);

    const invalid = validateOnboardingProfile({
      monthlyIncome: -100,
      incomeType: "",
    });
    expect(invalid.success).toBe(false);
  });
});
