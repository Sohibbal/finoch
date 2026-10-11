import type { TransactionCandidate, TransactionSource } from "@/types/financial-types";
import type { RecurringBill } from "@/types/bill-types";
import { localDateKey, parseDate } from "@/lib/date";
import { monthLedger, type MonthFigures } from "@/lib/financial/month-ledger";

interface ExpenseRow {
  id: string;
  itemName: string;
  amount: number;
  category: string;
  walletId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export type Bucket = "food" | "transport" | "bills" | "shopping" | "other";

/** Stored category each bucket is labelled by (see categoryLabel in lib/format). */
export const BUCKET_CATEGORY: Record<Bucket, string> = {
  food: "Food & Drinks",
  transport: "Transportation",
  bills: "Bills & Utilities",
  shopping: "Shopping & Lifestyle",
  other: "Other",
};

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

const time = (iso?: string) => parseDate(iso)?.getTime() ?? 0;
const monthPrefix = (d: Date) => `${localDateKey(d).slice(0, 7)}-`;

/** Server rows plus local rows the server hasn't seen yet; for the same id the newer updatedAt wins, and a winning delete hides the row. */
export function mergeExpenses<T extends ExpenseRow>(server: T[], local: T[]): T[] {
  const byId = new Map<string, T>();
  for (const e of [...server, ...local]) {
    const prev = byId.get(e.id);
    if (!prev || time(e.updatedAt) > time(prev.updatedAt)) byId.set(e.id, e);
  }
  return [...byId.values()].filter((e) => !e.isDeleted).sort((a, b) => time(b.createdAt) - time(a.createdAt));
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

export interface DailyJatah {
  /** Today's allowance: fixed for the whole day, so logging never moves it. */
  jatah: number;
  spentToday: number;
  /** jatah − spentToday; negative once today went past the jatah. */
  sisaHariIni: number;
  /** month.remaining: income − fixed costs − everything spent this month, today included. */
  sisaBulanIni: number;
  /** Days left in the month, today included. */
  daysLeft: number;
  status: "aman" | "mepet" | "habis";
  /** The month ledger the jatah is cut from, so its figures print with their scope. */
  month: MonthFigures;
}

/**
 * The one "jatah hari ini" number the app shows, cut from the month ledger:
 * (spendable this month − spent before today) / days left including today.
 * Status comes from the same number: Habis once today's jatah is used up, Mepet from 80%.
 */
export function dailyJatah(params: {
  monthlyIncome: number;
  /** The profile's fixed costs; the Tagihan total replaces it when `bills` is non-empty. */
  monthlyFixedExpenses: number;
  bills?: RecurringBill[];
  transactions: TransactionCandidate[];
  now?: Date;
}): DailyJatah {
  const month = monthLedger({
    monthlyIncome: params.monthlyIncome,
    profileFixedCosts: params.monthlyFixedExpenses,
    bills: params.bills,
    transactions: params.transactions,
    now: params.now,
  });
  const { spentToday, daysLeft } = month;
  const jatah = Math.max(0, Math.round((month.spendable - month.spentBefore) / daysLeft));
  const sisaHariIni = jatah - spentToday;
  const status = sisaHariIni <= 0 ? "habis" : spentToday >= jatah * 0.8 ? "mepet" : "aman";
  return { jatah, spentToday, sisaHariIni, sisaBulanIni: month.remaining, daysLeft, status, month };
}
