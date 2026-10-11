import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/meal-calc",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Meal Calc Components (Cooking vs Warteg)", () => {
  it("exports MealCalcPage component successfully", async () => {
    const MealCalcModule = await import("@/app/(app)/meal-calc/page");
    expect(MealCalcModule.default).toBeDefined();
    expect(typeof MealCalcModule.default).toBe("function");
  });

  it("exports MealCompare", async () => {
    const Mod = await import("@/components/meal-calc/meal-compare");
    expect(Mod.MealCompare).toBeDefined();
  });
});
