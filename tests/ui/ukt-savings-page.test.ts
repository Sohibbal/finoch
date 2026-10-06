import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/ukt-savings",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("UKT Sinking Fund Components", () => {
  it("exports UktSavingsPage component successfully", async () => {
    const UktModule = await import("@/app/ukt-savings/page");
    expect(UktModule.default).toBeDefined();
    expect(typeof UktModule.default).toBe("function");
  });

  it("exports UktCardMobile, UktBentoDesktop, and UktModal", async () => {
    const MobileMod = await import("@/components/ukt/ukt-card-mobile");
    const DesktopMod = await import("@/components/ukt/ukt-bento-desktop");
    const ModalMod = await import("@/components/ukt/ukt-modal");

    expect(MobileMod.UktCardMobile).toBeDefined();
    expect(DesktopMod.UktBentoDesktop).toBeDefined();
    expect(ModalMod.UktModal).toBeDefined();
  });
});
