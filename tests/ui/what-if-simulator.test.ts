import { describe, it, expect } from "vitest";

describe("What-If Simulator Page", () => {
  it("exports Simulator page component", async () => {
    const mod = await import("@/app/simulator/page");
    expect(mod.default).toBeDefined();
  });
});
