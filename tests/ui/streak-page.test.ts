import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/streak",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Streak & No-Spend Challenge Components", () => {
  it("exports StreakPage component successfully", async () => {
    const StreakPageModule = await import("@/app/(app)/streak/page");
    expect(StreakPageModule.default).toBeDefined();
    expect(typeof StreakPageModule.default).toBe("function");
  });

  it("exports StreakBadgeCard and StreakPunchCard", async () => {
    const BadgeModule = await import("@/components/streak/streak-badge-card");
    const PunchModule = await import("@/components/streak/streak-punch-card");

    expect(BadgeModule.StreakBadgeCard).toBeDefined();
    expect(PunchModule.StreakPunchCard).toBeDefined();
  });
});

describe("punch card layout", () => {
  const point = (date: string, dayNumber: number) => ({
    date,
    dayNumber,
    dayName: "",
    totalSpent: 0,
    wantsSpent: 0,
    status: "no_spend" as const,
    transactionsCount: 0,
    isToday: false,
    isFuture: false,
  });

  it("puts each day under its weekday: October 2026 starts on a Thursday", async () => {
    const { punchCardCells } = await import("@/components/streak/streak-punch-card");
    const cells = punchCardCells([point("2026-10-01", 1), point("2026-10-02", 2)]);
    // Min, Sen, Sel, Rab blank; the 1st lands in the Kam column.
    expect(cells.slice(0, 4)).toEqual([null, null, null, null]);
    expect(cells[4]?.dayNumber).toBe(1);
  });

  it("names the month from the data instead of a fixed Oktober", async () => {
    const { punchCardMonth } = await import("@/components/streak/streak-punch-card");
    expect(punchCardMonth([point("2026-11-01", 1)])).toBe("November 2026");
    expect(punchCardMonth([point("2027-02-01", 1)])).toBe("Februari 2027");
  });
});
