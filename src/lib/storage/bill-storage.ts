import { RecurringBill, BillSummary } from "@/types/bill-types";
import { getStorage, isDemoMode, readArray } from "@/lib/storage/local-storage";
import { isSameLocalMonth, parseDate } from "@/lib/date";

const BILLS_STORAGE_KEY = "finoch_recurring_bills";

// Fresh objects per call so callers mutating the result never corrupt the defaults.
const createDefaultStudentBills = (createdAt: string): RecurringBill[] => [
  {
    id: "bill_default_kos",
    name: "Kamar Kos Bulanan",
    category: "kos",
    amount: 850000,
    dueDay: 1,
    frequency: "monthly",
    isPaidThisMonth: false,
    reminderDaysBefore: 5,
    note: "Transfer ke rekening Bu Kos (BCA)",
    createdAt,
  },
  {
    id: "bill_default_wifi",
    name: "Patungan WiFi Kos",
    category: "utilities",
    amount: 45000,
    dueDay: 10,
    frequency: "monthly",
    isPaidThisMonth: false,
    reminderDaysBefore: 3,
    note: "Bayar ke ketua lorong kos",
    createdAt,
  },
  {
    id: "bill_default_listrik",
    name: "Token Listrik Kamar",
    category: "utilities",
    amount: 60000,
    dueDay: 15,
    frequency: "monthly",
    isPaidThisMonth: false,
    reminderDaysBefore: 2,
    note: "Beli via e-wallet",
    createdAt,
  },
  {
    id: "bill_default_spotify",
    name: "Spotify Premium Family",
    category: "subscription",
    amount: 25000,
    dueDay: 25,
    frequency: "monthly",
    isPaidThisMonth: false,
    reminderDaysBefore: 2,
    note: "Patungan berlima sama temen sekelas",
    createdAt,
  },
];

/**
 * Paid status is only valid for the month it was paid in. Derived from lastPaidDate so
 * it resets automatically each month; old records without lastPaidDate keep their flag.
 */
export function isBillPaidInMonth(bill: RecurringBill, currentDate: Date = new Date()): boolean {
  const paidAt = parseDate(bill.lastPaidDate);
  return paidAt ? isSameLocalMonth(paidAt, currentDate) : !!bill.isPaidThisMonth;
}

/** Due day clamped to the month length (dueDay 31 in February -> 28/29). */
export function getEffectiveDueDay(bill: RecurringBill, currentDate: Date = new Date()): number {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  return Math.min(Math.max(1, bill.dueDay), daysInMonth);
}

/** Monthly cost: weekly bills are charged once per occurrence of their due weekday in the month. */
export function getMonthlyBillAmount(bill: RecurringBill, currentDate: Date = new Date()): number {
  if (bill.frequency !== "weekly") return bill.amount;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstOccurrence = ((getEffectiveDueDay(bill, currentDate) - 1) % 7) + 1;
  const weeks = Math.floor((daysInMonth - firstOccurrence) / 7) + 1;
  return bill.amount * weeks;
}

export function getBills(currentDate: Date = new Date()): RecurringBill[] {
  // Sample bills only in demo mode; a real user starts with an empty list.
  let bills = readArray<RecurringBill>(BILLS_STORAGE_KEY);
  if (!bills) {
    bills = isDemoMode() ? createDefaultStudentBills(new Date().toISOString()) : [];
    if (bills.length > 0) saveBills(bills);
  }
  return bills.map((bill) => ({ ...bill, isPaidThisMonth: isBillPaidInMonth(bill, currentDate) }));
}

export function saveBills(bills: RecurringBill[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
  } catch (err) {
    console.error("Gagal menyimpan storage tagihan:", err);
  }
}

export function addBill(
  input: Omit<RecurringBill, "id" | "isPaidThisMonth" | "createdAt">
): RecurringBill {
  const bills = getBills();
  const newBill: RecurringBill = {
    ...input,
    id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    isPaidThisMonth: false,
    createdAt: new Date().toISOString(),
  };

  bills.push(newBill);
  saveBills(bills);
  return newBill;
}

export function updateBill(id: string, updates: Partial<RecurringBill>): void {
  const bills = getBills();
  const index = bills.findIndex((b) => b.id === id);
  if (index !== -1) {
    bills[index] = { ...bills[index], ...updates };
    saveBills(bills);
  }
}

export function deleteBill(id: string): void {
  const bills = getBills();
  const filtered = bills.filter((b) => b.id !== id);
  saveBills(filtered);
}

export function markBillAsPaid(id: string): void {
  const bills = getBills();
  const index = bills.findIndex((b) => b.id === id);
  if (index !== -1) {
    bills[index].isPaidThisMonth = true;
    bills[index].lastPaidDate = new Date().toISOString();
    saveBills(bills);
  }
}

export function getBillSummary(currentDate: Date = new Date()): BillSummary {
  const bills = getBills(currentDate);
  const currentDay = currentDate.getDate();

  let totalMonthlyBills = 0;
  let paidAmountThisMonth = 0;
  let unpaidAmountThisMonth = 0;
  let unpaidCount = 0;
  let paidCount = 0;
  const criticalUpcomingBills: RecurringBill[] = [];
  const overdueBills: RecurringBill[] = [];

  bills.forEach((bill) => {
    const monthlyAmount = getMonthlyBillAmount(bill, currentDate);
    totalMonthlyBills += monthlyAmount;
    if (bill.isPaidThisMonth) {
      paidAmountThisMonth += monthlyAmount;
      paidCount += 1;
    } else {
      unpaidAmountThisMonth += monthlyAmount;
      unpaidCount += 1;

      // Due soon: within reminderDaysBefore (incl. today). Past due day: overdue.
      const daysUntilDue = getEffectiveDueDay(bill, currentDate) - currentDay;
      if (daysUntilDue < 0) {
        overdueBills.push(bill);
      } else if (daysUntilDue <= (bill.reminderDaysBefore || 3)) {
        criticalUpcomingBills.push(bill);
      }
    }
  });

  return {
    totalMonthlyBills,
    paidAmountThisMonth,
    unpaidAmountThisMonth,
    unpaidCount,
    paidCount,
    criticalUpcomingBills,
    overdueBills,
  };
}
