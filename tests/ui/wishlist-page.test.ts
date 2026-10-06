import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/wishlist",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "test@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Wishlist Anti-Impulsif Components", () => {
  it("exports WishlistPage component successfully", async () => {
    const WishlistPageModule = await import("@/app/wishlist/page");
    expect(WishlistPageModule.default).toBeDefined();
    expect(typeof WishlistPageModule.default).toBe("function");
  });

  it("exports WishlistCardMobile and WishlistCardDesktop components", async () => {
    const MobileModule = await import("@/components/wishlist/wishlist-card-mobile");
    const DesktopModule = await import("@/components/wishlist/wishlist-card-desktop");
    const TrophyModule = await import("@/components/wishlist/wishlist-trophy-card");

    expect(MobileModule.WishlistCardMobile).toBeDefined();
    expect(DesktopModule.WishlistCardDesktop).toBeDefined();
    expect(TrophyModule.WishlistTrophyCard).toBeDefined();
  });
});
