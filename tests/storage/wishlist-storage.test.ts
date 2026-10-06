import { describe, it, expect, beforeEach } from "vitest";
import {
  getWishlist,
  addWishlistItem,
  cancelAndSaveMoney,
  purchaseWishlistItem,
  deleteWishlistItem,
  getWishlistSummary,
} from "@/lib/storage/wishlist-storage";

describe("Wishlist Anti-Impulsive Storage Engine", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
      key: (i: number) => Object.keys(mockStore)[i] || null,
      get length() {
        return Object.keys(mockStore).length;
      },
    };

    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

    if (typeof window !== "undefined") {
      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  it("loads pre-populated student wishlist items when storage is empty", () => {
    const list = getWishlist();
    expect(list.length).toBeGreaterThanOrEqual(2);
    const names = list.map((i) => i.name);
    expect(names).toContain("Sepatu Sneakers Kuliah");
  });

  it("adds a new item with 7-day cooling date correctly", () => {
    const item = addWishlistItem({
      name: "Mechanical Keyboard RGB",
      price: 280000,
      category: "Gadget",
      priority: "medium",
      coolingDays: 7,
      note: "Diskon flash sale Shopee",
    });

    expect(item.id).toBeDefined();
    expect(item.status).toBe("cooling");
    expect(item.coolingEndDate).toBeDefined();

    const all = getWishlist();
    expect(all.some((i) => i.id === item.id)).toBe(true);
  });

  it("cancels item and tracks money saved from impulsive shopping", () => {
    const item = addWishlistItem({
      name: "Jaket Bomber Viral",
      price: 220000,
      category: "Fashion",
      priority: "low",
      coolingDays: 7,
    });

    cancelAndSaveMoney(item.id);

    const updated = getWishlist().find((i) => i.id === item.id);
    expect(updated?.status).toBe("saved_money");

    const summary = getWishlistSummary();
    expect(summary.totalMoneySaved).toBeGreaterThanOrEqual(220000);
    expect(summary.savedMoneyCount).toBeGreaterThanOrEqual(1);
  });

  it("marks item as purchased and sets purchasedAt", () => {
    const item = addWishlistItem({
      name: "Buku Pemrograman Web",
      price: 95000,
      category: "Buku & Edukasi",
      priority: "high",
      coolingDays: 7,
    });

    purchaseWishlistItem(item.id);

    const updated = getWishlist().find((i) => i.id === item.id);
    expect(updated?.status).toBe("purchased");
    expect(updated?.purchasedAt).toBeDefined();
  });

  it("deletes a wishlist item properly", () => {
    const item = addWishlistItem({
      name: "Gantungan Kunci Kpop",
      price: 35000,
      category: "Hobi",
      priority: "low",
      coolingDays: 7,
    });

    expect(getWishlist().some((i) => i.id === item.id)).toBe(true);
    deleteWishlistItem(item.id);
    expect(getWishlist().some((i) => i.id === item.id)).toBe(false);
  });
});
