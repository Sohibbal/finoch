import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/streak",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Streak & No-Spend Challenge Components", () => {
  it("exports StreakPage component successfully", async () => {
    const StreakPageModule = await import("@/app/streak/page");
    expect(StreakPageModule.default).toBeDefined();
    expect(typeof StreakPageModule.default).toBe("function");
  });

  it("exports StreakBadgeCard, StreakStripMobile, and StreakCalendarDesktop", async () => {
    const BadgeModule = await import("@/components/streak/streak-badge-card");
    const StripModule = await import("@/components/streak/streak-strip-mobile");
    const CalendarModule = await import("@/components/streak/streak-calendar-desktop");

    expect(BadgeModule.StreakBadgeCard).toBeDefined();
    expect(StripModule.StreakStripMobile).toBeDefined();
    expect(CalendarModule.StreakCalendarDesktop).toBeDefined();
  });
});
