import { describe, it, expect } from "vitest";
import { generateDailyGenZInsight } from "@/lib/financial/genz-insight-engine";

describe("Gen-Z Financial Insight Engine", () => {
  it("generates warning insight when daily expense overshoots budget and links wishlist delay", () => {
    const insight = generateDailyGenZInsight({
      nickname: "Alex",
      todaySpent: 120000,
      dailyAllowance: 50000,
      topWishlistName: "Sepatu Vans",
      streakDays: 3,
    });

    expect(insight.mood).toBe("warning");
    expect(insight.body).toContain("Alex");
    expect(insight.body).toContain("Sepatu Vans");
  });

  it("generates hyped encouraging insight when spending is under allowance", () => {
    const insight = generateDailyGenZInsight({
      nickname: "Salsa",
      todaySpent: 15000,
      dailyAllowance: 60000,
      topWishlistName: "AirPods",
      streakDays: 5,
    });

    expect(insight.mood).toBe("hype");
    expect(insight.body).toContain("Salsa");
    expect(insight.body).toContain("AirPods");
  });

  it("handles case where user has no wishlist item yet", () => {
    const insight = generateDailyGenZInsight({
      nickname: "Budi",
      todaySpent: 20000,
      dailyAllowance: 50000,
      streakDays: 2,
    });

    expect(insight.body).toContain("Budi");
    expect(insight.mood).toBe("hype");
  });
});
