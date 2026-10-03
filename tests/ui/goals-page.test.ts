import { describe, it, expect } from "vitest";

describe("Goals Page Component", () => {
  it("exports Goals page component successfully", async () => {
    const mod = await import("@/app/goals/page");
    expect(mod.default).toBeDefined();
  });
});
