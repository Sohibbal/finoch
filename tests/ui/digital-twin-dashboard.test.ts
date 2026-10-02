import { describe, it, expect } from "vitest";

describe("Digital Twin Dashboard Components", () => {
  it("exports DigitalTwinCard component", async () => {
    const mod = await import("@/components/dashboard/digital-twin-card");
    expect(mod.DigitalTwinCard).toBeDefined();
  });
});
