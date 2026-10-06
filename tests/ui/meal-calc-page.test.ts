import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/meal-calc",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Meal Calc Components (Cooking vs Warteg)", () => {
  it("exports MealCalcPage component successfully", async () => {
    const MealCalcModule = await import("@/app/meal-calc/page");
    expect(MealCalcModule.default).toBeDefined();
    expect(typeof MealCalcModule.default).toBe("function");
  });

  it("exports MealCalcCardMobile and MealCalcBentoDesktop", async () => {
    const MobileMod = await import("@/components/meal-calc/meal-calc-card-mobile");
    const DesktopMod = await import("@/components/meal-calc/meal-calc-bento-desktop");

    expect(MobileMod.MealCalcCardMobile).toBeDefined();
    expect(DesktopMod.MealCalcBentoDesktop).toBeDefined();
  });
});
