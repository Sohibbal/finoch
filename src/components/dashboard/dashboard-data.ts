import type { TransactionCandidate, TransactionSource } from "@/types/financial-types";
import type { MonthlyCategorySpendingData } from "./spending-trend-chart";
import { localDateKey, parseDate } from "@/lib/date";

interface ExpenseRow {
  id: string;
  itemName: string;
  amount: number;
  category: string;
  walletId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type Bucket = Exclude<keyof MonthlyCategorySpendingData, "month">;

const NEEDS_CATEGORIES = ["Food & Drinks", "Food", "Bills & Utilities", "Housing & Bills", "Bills", "Transportation"];

const BUCKETS: Record<string, Bucket> = {
  "Food & Drinks": "food",
  Food: "food",
  Transportation: "transport",
  "Bills & Utilities": "bills",
  "Housing & Bills": "bills",
  Bills: "bills",
  "Shopping & Lifestyle": "shopping",
  "Shopping & Clothing": "shopping",
  "Entertainment & Leisure": "shopping",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const time = (iso?: string) => parseDate(iso)?.getTime() ?? 0;
const monthPrefix = (d: Date) => `${localDateKey(d).slice(0, 7)}-`;

/** Server rows plus local rows the server hasn't seen yet; for the same id the newer updatedAt wins. */
export function mergeExpenses<T extends ExpenseRow>(server: T[], local: T[]): T[] {
  const byId = new Map<string, T>();
  for (const e of [...server, ...local]) {
    const prev = byId.get(e.id);
    if (!prev || time(e.updatedAt) > time(prev.updatedAt)) byId.set(e.id, e);
  }
  return [...byId.values()].sort((a, b) => time(b.createdAt) - time(a.createdAt));
}

export function toTransaction(e: ExpenseRow, source: TransactionSource): TransactionCandidate {
  const created = parseDate(e.createdAt);
  return {
    id: e.id,
    merchant: e.itemName,
    amount: e.amount,
    category: e.category || "Other",
    spendingType: NEEDS_CATEGORIES.includes(e.category) ? "needs" : "wants",
    // Local calendar day; undated rows stay undated so they never count as "this month".
    date: created ? localDateKey(created) : "",
    source,
  };
}

export function categoryBucket(category: string): Bucket {
  return BUCKETS[category] ?? "other";
}

/** Transactions dated in `now`'s local month. */
export function currentMonthTransactions(txs: TransactionCandidate[], now: Date = new Date()): TransactionCandidate[] {
  const prefix = monthPrefix(now);
  return txs.filter((t) => t.date.startsWith(prefix));
}

export function splitNeedsWants(txs: TransactionCandidate[]): { needs: number; wants: number } {
  let needs = 0;
  let wants = 0;
  for (const t of txs) {
    if (t.spendingType === "needs") needs += t.amount;
    else wants += t.amount;
  }
  return { needs, wants };
}

export function sumByBucket(txs: TransactionCandidate[]): Record<Bucket, number> {
  const sums: Record<Bucket, number> = { food: 0, transport: 0, bills: 0, shopping: 0, other: 0 };
  for (const t of txs) sums[categoryBucket(t.category)] += t.amount;
  return sums;
}

/** Category totals for the last `months` local months (oldest first); empty when they hold nothing. */
export function buildMonthlyTrend(
  txs: TransactionCandidate[],
  now: Date = new Date(),
  months = 4
): MonthlyCategorySpendingData[] {
  const rows: MonthlyCategorySpendingData[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTH_LABELS[month.getMonth()] + (i === 0 ? " (Ini)" : "");
    rows.push({ month: label, ...sumByBucket(currentMonthTransactions(txs, month)) });
  }
  const hasData = rows.some((r) => r.food + r.transport + r.bills + r.shopping + r.other > 0);
  return hasData ? rows : [];
}
