import { describe, it, expect } from "vitest";
import { NAVIGATION_ITEMS } from "@/components/layout/navigation-items";

describe("Navigation Items Streamlined", () => {
  it("contains strictly the 6 core menus", () => {
    const hrefs = NAVIGATION_ITEMS.map((item) => item.href);
    expect(hrefs).toEqual([
      "/dashboard",
      "/pemasukan",
      "/pengeluaran",
      "/wishlist",
      "/copilot",
      "/profile",
    ]);
  });

  it("assigns valid Lucide icons and labels to each menu item", () => {
    for (const item of NAVIGATION_ITEMS) {
      expect(item.label).toBeDefined();
      expect(item.icon).toBeDefined();
      expect(typeof item.label).toBe("string");
    }
  });
});
