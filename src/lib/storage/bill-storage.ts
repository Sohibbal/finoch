import { RecurringBill, BillSummary } from "@/types/bill-types";

const BILLS_STORAGE_KEY = "finoch_recurring_bills";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

const DEFAULT_STUDENT_BILLS: RecurringBill[] = [
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
    createdAt: "2026-10-01T00:00:00.000Z",
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
    createdAt: "2026-10-01T00:00:00.000Z",
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
    createdAt: "2026-10-01T00:00:00.000Z",
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
    createdAt: "2026-10-01T00:00:00.000Z",
  },
];

export function getBills(): RecurringBill[] {
  const storage = getStorage();
  if (!storage) return DEFAULT_STUDENT_BILLS;
  try {
    const raw = storage.getItem(BILLS_STORAGE_KEY);
    if (!raw) {
      storage.setItem(BILLS_STORAGE_KEY, JSON.stringify(DEFAULT_STUDENT_BILLS));
      return DEFAULT_STUDENT_BILLS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca storage tagihan:", err);
    return DEFAULT_STUDENT_BILLS;
  }
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
  const bills = getBills();
  const currentDay = currentDate.getDate();

  let totalMonthlyBills = 0;
  let paidAmountThisMonth = 0;
  let unpaidAmountThisMonth = 0;
  let unpaidCount = 0;
  let paidCount = 0;
  const criticalUpcomingBills: RecurringBill[] = [];

  bills.forEach((bill) => {
    totalMonthlyBills += bill.amount;
    if (bill.isPaidThisMonth) {
      paidAmountThisMonth += bill.amount;
      paidCount += 1;
    } else {
      unpaidAmountThisMonth += bill.amount;
      unpaidCount += 1;

      // Check if bill is due soon: within reminderDaysBefore or today/past
      const daysUntilDue = bill.dueDay - currentDay;
      if (daysUntilDue >= 0 && daysUntilDue <= (bill.reminderDaysBefore || 3)) {
        criticalUpcomingBills.push(bill);
      } else if (daysUntilDue < 0) {
        // Overdue!
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
  };
}
