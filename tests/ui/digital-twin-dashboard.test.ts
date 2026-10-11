import { describe, it, expect, vi } from "vitest";

describe("Digital Twin Dashboard Components", () => {
  it("exports DigitalTwinCard component", async () => {
    const mod = await import("@/components/dashboard/digital-twin-card");
    expect(mod.DigitalTwinCard).toBeDefined();
  });
});

describe("DigitalTwinCard SSR", () => {
  it("renders the same markup regardless of the server clock (no hydration mismatch)", async () => {
    const React = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { DigitalTwinCard } = await import("@/components/dashboard/digital-twin-card");
    const metrics = {
      monthlyIncome: 3_000_000,
      monthlyExpenses: 500_000,
      netSavings: 2_500_000,
      savingsRate: 83,
      needsAmount: 300_000,
      wantsAmount: 200_000,
      savingsAmount: 2_500_000,
      needsPercentage: 10,
      wantsPercentage: 7,
      savingsPercentage: 83,
      needsStatus: "optimal",
      wantsStatus: "optimal",
      savingsStatus: "optimal",
    } as const;
    const render = (iso: string) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(iso));
      try {
        return renderToString(React.createElement(DigitalTwinCard, { metrics }));
      } finally {
        vi.useRealTimers();
      }
    };
    expect(render("2026-10-02T10:00:00")).toBe(render("2026-10-28T10:00:00"));
  });
});
