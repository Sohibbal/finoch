import { describe, it, expect } from "vitest";

describe("Profile Management Page", () => {
  it("exports Profile page component", async () => {
    const mod = await import("@/app/(app)/profile/page");
    expect(mod.default).toBeDefined();
  });
});
