import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

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

describe("Wishlist Dynamic Components Architecture", () => {
  it("exports WishlistPage component successfully", async () => {
    const WishlistPageModule = await import("@/app/(app)/wishlist/page");
    expect(WishlistPageModule.default).toBeDefined();
    expect(typeof WishlistPageModule.default).toBe("function");
  });

  it("exports WishlistItemCard, ManualWishlistModal, and VoiceWishlistModal", async () => {
    const CardModule = await import("@/components/wishlist/wishlist-item-card");
    const ManualModule = await import("@/components/wishlist/manual-wishlist-modal");
    const VoiceModule = await import("@/components/wishlist/voice-wishlist-modal");

    expect(CardModule.WishlistItemCard).toBeDefined();
    expect(ManualModule.ManualWishlistModal).toBeDefined();
    expect(VoiceModule.VoiceWishlistModal).toBeDefined();
  });

  it("renders WishlistItemCard with appropriate status badges", async () => {
    const { WishlistItemCard } = await import("@/components/wishlist/wishlist-item-card");
    const noop = () => {};

    const mockItem = {
      id: "w1",
      userId: "u1",
      name: "Sepatu Adidas Samba",
      targetPrice: 1500000,
      savedAmount: 0,
      priority: 3,
      isAchieved: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Achievable now
    const htmlAchievable = renderToString(
      React.createElement(WishlistItemCard, {
        item: mockItem,
        estimatedDays: 0,
        projectionStatus: "achievable_now",
        onToggleAchieved: noop,
        onDelete: noop,
      })
    );
    expect(htmlAchievable).toContain("Sepatu Adidas Samba");
    expect(htmlAchievable).toContain("Tercapai");

    // 2. Delayed
    const htmlDelayed = renderToString(
      React.createElement(WishlistItemCard, {
        item: mockItem,
        estimatedDays: 999,
        projectionStatus: "delayed",
        onToggleAchieved: noop,
        onDelete: noop,
      })
    );
    expect(htmlDelayed).toContain("Tertunda");

    // 3. On track
    const htmlOnTrack = renderToString(
      React.createElement(WishlistItemCard, {
        item: mockItem,
        estimatedDays: 14,
        projectionStatus: "on_track",
        onToggleAchieved: noop,
        onDelete: noop,
      })
    );
    expect(htmlOnTrack).toContain("~14 hari");

    // 4. Achieved
    const htmlAchieved = renderToString(
      React.createElement(WishlistItemCard, {
        item: { ...mockItem, isAchieved: true },
        estimatedDays: 0,
        projectionStatus: "achievable_now",
        onToggleAchieved: noop,
        onDelete: noop,
      })
    );
    expect(htmlAchieved).toContain("Tercapai");
    expect(htmlAchieved).toContain("Batalkan");
  });
});
