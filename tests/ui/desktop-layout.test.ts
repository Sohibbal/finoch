// tests/ui/desktop-layout.test.ts
import { describe, it, expect } from "vitest";

describe("Desktop Layout & Top Navigation", () => {
  it("exports TopNav component for desktop navigation", async () => {
    const module = await import("@/components/layout/top-nav");
    expect(module.TopNav).toBeDefined();
  });
});
