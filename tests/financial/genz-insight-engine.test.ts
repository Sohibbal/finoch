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

  it("produces varied phrasing across different variantIndex calls while maintaining consistent sentiment and facts", () => {
    const v1 = generateDailyGenZInsight({
      nickname: "Alex",
      todaySpent: 120000,
      dailyAllowance: 50000,
      topWishlistName: "Sepatu Vans",
      streakDays: 3,
      variantIndex: 0,
    });

    const v2 = generateDailyGenZInsight({
      nickname: "Alex",
      todaySpent: 120000,
      dailyAllowance: 50000,
      topWishlistName: "Sepatu Vans",
      streakDays: 3,
      variantIndex: 1,
    });

    expect(v1.mood).toBe("warning");
    expect(v2.mood).toBe("warning");
    expect(v1.body).toContain("Alex");
    expect(v2.body).toContain("Alex");
    expect(v1.body).toContain("Sepatu Vans");
    expect(v2.body).toContain("Sepatu Vans");
    expect(v1.headline).not.toBe(v2.headline);
    expect(v1.body).not.toBe(v2.body);
  });
});
