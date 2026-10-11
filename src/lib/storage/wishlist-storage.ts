import { WishlistItem, WishlistSummary } from "@/types/wishlist-types";
import { getStorage, isDemoMode, readArray, getDataScope } from "@/lib/storage/local-storage";
import { getDatabase } from "./indexed-db";
import { syncQueue } from "./sync-queue";

const WISHLIST_STORAGE_KEY = "finoch_student_wishlist";

const daysFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

const createDefaultWishlistItems = (): WishlistItem[] => [
  {
    id: "wish_sneakers",
    name: "Sepatu Sneakers Kuliah",
    price: 320000,
    category: "Fashion",
    priority: "high",
    coolingDays: 7,
    createdAt: daysFromNow(-2),
    coolingEndDate: daysFromNow(5),
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
    createdAt: daysFromNow(-10),
    coolingEndDate: daysFromNow(-3),
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
    createdAt: daysFromNow(-15),
    coolingEndDate: daysFromNow(-8),
    status: "saved_money",
    note: "Ternyata cuma FOMO lihat konten TikTok, dibatalkan!",
  },
];

export function getWishlist(): WishlistItem[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const items = readArray<WishlistItem>(WISHLIST_STORAGE_KEY);
    if (!items) {
      if (!isDemoMode()) return [];
      const defaults = createDefaultWishlistItems();
      storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

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
    return [];
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

// ==================== Local-First IndexedDB Core Engine ====================

export interface LocalWishlist {
  id: string;
  userId: string;
  name: string;
  targetPrice: number;
  savedAmount: number;
  priority: number;
  isAchieved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus?: "pending" | "synced" | "failed";
}

export async function saveWishlistItem(
  item: Omit<LocalWishlist, "id" | "userId" | "createdAt" | "updatedAt" | "isDeleted"> & {
    id?: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
  }
): Promise<LocalWishlist> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fullItem: LocalWishlist = {
    id: item.id || `wish-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: item.userId || getDataScope(),
    name: item.name.trim(),
    targetPrice: Math.round(item.targetPrice),
    savedAmount: Math.round(item.savedAmount || 0),
    priority: item.priority || 1,
    isAchieved: item.isAchieved ?? false,
    isDeleted: item.isDeleted ?? false,
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
    syncStatus: "pending",
  };

  await db.put("wishlists", fullItem);
  await syncQueue.enqueue("create", fullItem as any);
  return fullItem;
}

export async function getWishlistItems(userId: string = getDataScope()): Promise<LocalWishlist[]> {
  const db = await getDatabase();
  const all = await db.getAllFromIndex("wishlists", "by-user", userId);

  return all
    .filter((w) => !w.isDeleted)
    .sort((a, b) => b.priority - a.priority || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function toggleWishlistAchieved(id: string, userId: string = getDataScope()): Promise<LocalWishlist | null> {
  const db = await getDatabase();
  const existing = await db.get("wishlists", id);
  if (!existing || existing.userId !== userId) return null;

  const updated: LocalWishlist = {
    ...existing,
    isAchieved: !existing.isAchieved,
    updatedAt: new Date().toISOString(),
    syncStatus: "pending",
  };

  await db.put("wishlists", updated);
  await syncQueue.enqueue("update", updated as any);
  return updated;
}
