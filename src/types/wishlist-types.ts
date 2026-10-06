export type WishlistPriority = "low" | "medium" | "high";

export type WishlistStatus =
  | "cooling" // In 7-day cooling-off rethink period
  | "ready" // Cooldown passed, ready to purchase if budget permits
  | "saved_money" // Cancelled by student, saved money!
  | "purchased"; // Executed and converted to transaction

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  category: string;
  priority: WishlistPriority;
  coolingDays: number; // Default 7 days
  createdAt: string;
  coolingEndDate: string;
  status: WishlistStatus;
  purchasedAt?: string;
  note?: string;
  linkUrl?: string;
}

export interface WishlistSummary {
  totalWishlistValue: number;
  coolingCount: number;
  readyCount: number;
  savedMoneyCount: number;
  purchasedCount: number;
  totalMoneySaved: number; // Gamified total of impulses averted!
}
