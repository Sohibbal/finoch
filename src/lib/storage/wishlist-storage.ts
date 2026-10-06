import { WishlistItem, WishlistSummary } from "@/types/wishlist-types";

const WISHLIST_STORAGE_KEY = "finoch_student_wishlist";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

const DEFAULT_WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: "wish_sneakers",
    name: "Sepatu Sneakers Kuliah",
    price: 320000,
    category: "Fashion",
    priority: "high",
    coolingDays: 7,
    createdAt: "2026-10-02T10:00:00.000Z",
    // Cooling ends 7 days from Oct 2 = Oct 9
    coolingEndDate: "2026-10-09T10:00:00.000Z",
    status: "cooling",
    note: "Sepatu lama solnya sudah mulai tipis",
    linkUrl: "https://shopee.co.id",
  },
  {
    id: "wish_headset",
    name: "Headset Bluetooth ANC",
    price: 250000,
    category: "Gadget",
    priority: "medium",
    coolingDays: 7,
    createdAt: "2026-09-25T14:00:00.000Z",
    coolingEndDate: "2026-10-02T14:00:00.000Z", // Ended -> ready
    status: "ready",
    note: "Untuk belajar di kos biar nggak keganggu suara motor",
  },
  {
    id: "wish_kaos",
    name: "Kaos Oversize Streetwear",
    price: 110000,
    category: "Fashion",
    priority: "low",
    coolingDays: 7,
    createdAt: "2026-09-20T08:00:00.000Z",
    coolingEndDate: "2026-09-27T08:00:00.000Z",
    status: "saved_money",
    note: "Ternyata cuma FOMO lihat konten TikTok, dibatalkan!",
  },
];

export function getWishlist(): WishlistItem[] {
  const storage = getStorage();
  if (!storage) return DEFAULT_WISHLIST_ITEMS;
  try {
    const raw = storage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_WISHLIST_ITEMS));
      return DEFAULT_WISHLIST_ITEMS;
    }
    const items: WishlistItem[] = JSON.parse(raw);

    // Auto-update status from 'cooling' to 'ready' if coolingEndDate has passed
    const now = new Date();
    let hasChanges = false;
    const updated = items.map((item) => {
      if (item.status === "cooling" && new Date(item.coolingEndDate) <= now) {
        hasChanges = true;
        return { ...item, status: "ready" as const };
      }
      return item;
    });

    if (hasChanges) {
      storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
    }

    return updated;
  } catch (err) {
    console.error("Gagal membaca storage wishlist:", err);
    return DEFAULT_WISHLIST_ITEMS;
  }
}

export function saveWishlist(items: WishlistItem[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Gagal menyimpan storage wishlist:", err);
  }
}

export function addWishlistItem(
  input: Omit<WishlistItem, "id" | "createdAt" | "coolingEndDate" | "status" | "purchasedAt">
): WishlistItem {
  const items = getWishlist();
  const now = new Date();
  const coolingDays = input.coolingDays || 7;
  const coolingEndDate = new Date(now.getTime() + coolingDays * 24 * 60 * 60 * 1000).toISOString();

  const newItem: WishlistItem = {
    ...input,
    id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    coolingDays,
    createdAt: now.toISOString(),
    coolingEndDate,
    status: "cooling",
  };

  items.unshift(newItem);
  saveWishlist(items);
  return newItem;
}

export function cancelAndSaveMoney(id: string): void {
  const items = getWishlist();
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index].status = "saved_money";
    saveWishlist(items);
  }
}

export function purchaseWishlistItem(id: string): void {
  const items = getWishlist();
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index].status = "purchased";
    items[index].purchasedAt = new Date().toISOString();
    saveWishlist(items);
  }
}

export function deleteWishlistItem(id: string): void {
  const items = getWishlist();
  const filtered = items.filter((i) => i.id !== id);
  saveWishlist(filtered);
}

export function getWishlistSummary(): WishlistSummary {
  const items = getWishlist();

  let totalWishlistValue = 0;
  let coolingCount = 0;
  let readyCount = 0;
  let savedMoneyCount = 0;
  let purchasedCount = 0;
  let totalMoneySaved = 0;

  items.forEach((item) => {
    if (item.status === "cooling") {
      coolingCount += 1;
      totalWishlistValue += item.price;
    } else if (item.status === "ready") {
      readyCount += 1;
      totalWishlistValue += item.price;
    } else if (item.status === "saved_money") {
      savedMoneyCount += 1;
      totalMoneySaved += item.price;
    } else if (item.status === "purchased") {
      purchasedCount += 1;
    }
  });

  return {
    totalWishlistValue,
    coolingCount,
    readyCount,
    savedMoneyCount,
    purchasedCount,
    totalMoneySaved,
  };
}
