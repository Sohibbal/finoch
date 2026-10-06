import { describe, it, expect } from "vitest";

describe("Survival Mode Card Component", () => {
  it("exports SurvivalModeCard successfully", async () => {
    const ComponentModule = await import("@/components/dashboard/survival-mode-card");
    expect(ComponentModule.SurvivalModeCard).toBeDefined();
    expect(typeof ComponentModule.SurvivalModeCard).toBe("function");
  });
});
