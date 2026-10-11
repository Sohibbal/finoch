import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/ukt-savings",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("UKT Sinking Fund Components", () => {
  it("exports UktSavingsPage component successfully", async () => {
    const UktModule = await import("@/app/(app)/ukt-savings/page");
    expect(UktModule.default).toBeDefined();
    expect(typeof UktModule.default).toBe("function");
  });

  it("exports UktPlanNote and UktModal", async () => {
    const NoteMod = await import("@/components/ukt/ukt-plan-note");
    const ModalMod = await import("@/components/ukt/ukt-modal");

    expect(NoteMod.UktPlanNote).toBeDefined();
    expect(ModalMod.UktModal).toBeDefined();
  });

  it("prints every plan category in a denomination color with a personality line", async () => {
    const { UKT_DENOM, UKT_PERSONALITY } = await import("@/components/ukt/ukt-plan-note");
    for (const category of ["ukt", "praktikum", "kkn", "skripsi", "wisuda"] as const) {
      expect(UKT_DENOM[category]).toBeTruthy();
      expect(UKT_PERSONALITY[category]).toBeTruthy();
    }
  });
});
