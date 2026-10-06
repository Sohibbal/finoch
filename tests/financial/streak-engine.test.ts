import { describe, it, expect } from "vitest";
import { calculateStreakMetrics } from "@/lib/financial/streak-engine";

describe("Streak & No-Spend Engine", () => {
  it("calculates daily points, green/yellow/red days, and current streak accurately", () => {
    const fixedDate = new Date("2026-10-06T12:00:00Z");

    const mockExpenses = [
      // Day 1: normal food, no wants -> green
      { itemName: "Warteg", amount: 15000, category: "Food & Drinks", createdAt: "2026-10-01T12:00:00Z" },
      // Day 2: normal food -> green
      { itemName: "Nasi Uduk", amount: 12000, category: "Food & Drinks", createdAt: "2026-10-02T08:00:00Z" },
      // Day 3: shopping over daily limit (60k > 50k) -> red
      { itemName: "Baju Kaos", amount: 75000, category: "Shopping", createdAt: "2026-10-03T14:00:00Z" },
      // Day 4: warteg only -> green
      { itemName: "Warteg", amount: 15000, category: "Food", createdAt: "2026-10-04T12:00:00Z" },
      // Day 5: coffee within daily limit (20k < 50k) -> yellow
      { itemName: "Kopi", amount: 20000, category: "Entertainment", createdAt: "2026-10-05T15:00:00Z" },
      // Day 6 (today): no wants -> green
      { itemName: "Makan Siang", amount: 15000, category: "Food", createdAt: "2026-10-06T12:00:00Z" },
    ];

    const result = calculateStreakMetrics(mockExpenses, 50000, fixedDate);

    expect(result.monthlyPoints.length).toBe(31); // October has 31 days
    expect(result.totalDaysEvaluated).toBe(6);

    // Days 4 (green), 5 (yellow), 6 (green) are all disciplined -> streak of 3
    expect(result.currentStreak).toBe(3);
    expect(result.badge.level).toBe("fighter");
    expect(result.badge.title).toBe("Pejuang Tanggal Muda");
  });

  it("assigns warrior and master badges when streak is high", () => {
    const fixedDate = new Date("2026-10-08T12:00:00Z");
    // All 8 days zero wants
    const result = calculateStreakMetrics([], 50000, fixedDate);
    expect(result.currentStreak).toBe(8);
    expect(result.badge.level).toBe("master");
    expect(result.badge.emoji).toBe("🏆");
  });
});
