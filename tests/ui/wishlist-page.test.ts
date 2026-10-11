import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/wishlist",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "test@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Wishlist Anti-Impulsif Components", () => {
  it("exports WishlistPage component successfully", async () => {
    const WishlistPageModule = await import("@/app/(app)/wishlist/page");
    expect(WishlistPageModule.default).toBeDefined();
    expect(typeof WishlistPageModule.default).toBe("function");
  });

  it("exports WishlistTag and WishlistTrophyCard components", async () => {
    const TagModule = await import("@/components/wishlist/wishlist-tag");
    const TrophyModule = await import("@/components/wishlist/wishlist-trophy-card");

    expect(TagModule.WishlistTag).toBeDefined();
    expect(TrophyModule.WishlistTrophyCard).toBeDefined();
  });

  it("counts whole cooling-off days left for the countdown stamp, never below zero", async () => {
    const { coolingDaysLeft } = await import("@/components/wishlist/wishlist-tag");
    const now = new Date("2026-10-11T10:00:00");
    expect(coolingDaysLeft({ coolingEndDate: "2026-10-16T09:00:00" }, now)).toBe(5);
    expect(coolingDaysLeft({ coolingEndDate: "2026-10-11T11:00:00" }, now)).toBe(1);
    expect(coolingDaysLeft({ coolingEndDate: "2026-10-01T10:00:00" }, now)).toBe(0);
  });
});
