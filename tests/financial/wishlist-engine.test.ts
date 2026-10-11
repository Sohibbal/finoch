import { describe, it, expect } from "vitest";
import { calculateWishlistProjection } from "@/lib/financial/wishlist-engine";

describe("Wishlist Projection Engine", () => {
  it("calculates accurate days remaining based on savings rate", () => {
    // Target Rp1.000.000, current savings Rp500.000, surplus savings rate Rp50.000/day
    const res = calculateWishlistProjection(1_000_000, 500_000, 50_000);
    expect(res.status).toBe("on_track");
    expect(res.estimatedDays).toBe(10);
  });

  it("marks as achievable now when current savings exceed target price", () => {
    const res = calculateWishlistProjection(500_000, 600_000, 20_000);
    expect(res.status).toBe("achievable_now");
    expect(res.estimatedDays).toBe(0);
  });

  it("handles negative or zero savings gracefully without NaN", () => {
    const res = calculateWishlistProjection(1_000_000, 0, 0);
    expect(res.status).toBe("delayed");
    expect(Number.isFinite(res.estimatedDays)).toBe(true);
  });
});
