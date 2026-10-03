import { describe, it, expect } from "vitest";

describe("Copilot Page Component", () => {
  it("exports Copilot page component successfully", async () => {
    const mod = await import("@/app/copilot/page");
    expect(mod.default).toBeDefined();
  });
});
