import { describe, it, expect } from "vitest";

describe("Financial Runway Card Component", () => {
  it("exports FinancialRunwayCard component successfully", async () => {
    const mod = await import("@/components/dashboard/financial-runway-card");
    expect(mod.FinancialRunwayCard).toBeDefined();
    expect(typeof mod.FinancialRunwayCard).toBe("function");
  });
});
