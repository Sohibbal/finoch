import { describe, it, expect } from "vitest";

describe("Theme Toggle Component", () => {
  it("exports ThemeToggle component", async () => {
    const mod = await import("@/components/layout/theme-toggle");
    expect(mod.ThemeToggle).toBeDefined();
  });
});
