import type { RecurringBill } from "@/types/bill-types";
import type { TransactionCandidate } from "@/types/financial-types";
import { localDateKey } from "@/lib/date";

export function getMonthlyBillAmount(bill: RecurringBill, _now?: Date): number {
  return bill.amount || 0;
}

/** Item name prefix of the expense Tagihan records when a bill is marked paid. */
export const BILL_PAYMENT_PREFIX = "Bayar Tagihan: ";

/** Where this month's fixed costs come from: the Tagihan list, or the profile's single number. */
export type FixedCostSource = "tagihan" | "profil";

/** This month's money, every figure with one meaning. All pages print from this. */
export interface MonthFigures {
  /** Uang saku per bulan, from the profile. */
  income: number;
  fixedCosts: number;
  fixedCostSource: FixedCostSource;
  /** income − fixedCosts: what daily spending may use this month (negative when fixed costs exceed income). */
  spendable: number;
  /** Logged this month before today. */
  spentBefore: number;
  spentToday: number;
  /** spentBefore + spentToday. */
  spent: number;
  /** spendable − spent: "sisa bulan ini". */
  remaining: number;
  /** Days left in the month, today included. */
  daysLeft: number;
}

/** True for the expense Tagihan writes when a bill is paid; its money is already in fixedCosts. */
export function isBillPayment(t: Pick<TransactionCandidate, "merchant">): boolean {
  return Boolean(t.merchant?.startsWith(BILL_PAYMENT_PREFIX));
}

/**
 * The one month ledger.
 *
 * Fixed-cost rule: with at least one recurring bill in Tagihan, fixed costs are this month's bills
 * total (what Tagihan prints as "Total sebulan"); without bills, the profile's
 * "Pengeluaran tetap per bulan". Paying a bill logs an expense, which is skipped here so the bill
 * is never counted twice (once as a fixed cost, once as spending).
 */
export function monthLedger(params: {
  monthlyIncome: number;
  /** The profile's "Pengeluaran tetap per bulan"; used only when there are no bills. */
  profileFixedCosts: number;
  bills?: RecurringBill[];
  transactions: TransactionCandidate[];
  now?: Date;
}): MonthFigures {
  const now = params.now ?? new Date();
  const bills = params.bills ?? [];
  const fromBills = bills.length > 0;
  const fixedCosts = fromBills
    ? bills.reduce((sum, b) => sum + getMonthlyBillAmount(b, now), 0)
    : params.profileFixedCosts;

  const today = localDateKey(now);
  const monthPrefix = today.slice(0, 8);
  let spentBefore = 0;
  let spentToday = 0;
  for (const t of params.transactions) {
    // Undated rows have date "" and never match the month.
    if (!t.date.startsWith(monthPrefix) || isBillPayment(t)) continue;
    if (t.date === today) spentToday += t.amount;
    else if (t.date < today) spentBefore += t.amount;
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const spendable = params.monthlyIncome - fixedCosts;
  const spent = spentBefore + spentToday;
  return {
    income: params.monthlyIncome,
    fixedCosts,
    fixedCostSource: fromBills ? "tagihan" : "profil",
    spendable,
    spentBefore,
    spentToday,
    spent,
    remaining: spendable - spent,
    daysLeft: daysInMonth - now.getDate() + 1,
  };
}

/** "dari tagihan" / "dari profil": the label printed next to every fixed-cost figure. */
export function fixedCostScope(source: FixedCostSource): string {
  return source === "tagihan" ? "dari tagihan" : "dari profil";
}
