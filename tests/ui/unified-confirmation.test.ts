import { describe, it, expect } from "vitest";

describe("Unified Confirmation Modal Exports", () => {
  it("exports UnifiedConfirmationModal component", async () => {
    const mod = await import("@/components/transaction/unified-confirmation-modal");
    expect(mod.UnifiedConfirmationModal).toBeDefined();
  });
});
