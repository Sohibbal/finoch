import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "test@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Dashboard Gen-Z Insight and Streak Integration", () => {
  it("exports DashboardPage component successfully", async () => {
    const DashModule = await import("@/app/(app)/dashboard/page");
    expect(DashModule.default).toBeDefined();
    expect(typeof DashModule.default).toBe("function");
  });

  it("renders GenZInsightCard with headline and body", async () => {
    const { GenZInsightCard } = await import("@/components/dashboard/genz-insight-card");

    const html = renderToString(
      React.createElement(GenZInsightCard, {
        nickname: "Budi",
        insight: {
          headline: "Gaya Finansial Lo On-Point, Budi! 🚀",
          body: "Keren banget Budi! Pengeluaran hari ini aman terkendali.",
          mood: "hype",
        },
      })
    );

    expect(html).toContain("Gaya Finansial Lo On-Point, Budi!");
    expect(html).toContain("FinBot Daily Insight");
    expect(html).toContain("Keren banget Budi!");
  });

  it("renders StreakWidget with streak count and remaining allowance", async () => {
    const { StreakWidget } = await import("@/components/dashboard/streak-widget");

    const html = renderToString(
      React.createElement(StreakWidget, {
        streakDays: 5,
        dailyAllowance: 50000,
        todaySpent: 20000,
      })
    );

    expect(html).toContain("5");
    expect(html).toContain("Hari");
    expect(html).toContain("Streak Hemat");
    expect(html).toContain("On Track");
  });
});
