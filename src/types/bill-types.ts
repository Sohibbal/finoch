export type BillCategory =
  | "kos"
  | "utilities"
  | "subscription"
  | "education"
  | "other";

export interface RecurringBill {
  id: string;
  name: string;
  category: BillCategory;
  amount: number;
  dueDay: number; // 1 to 31
  frequency: "monthly" | "weekly";
  isPaidThisMonth: boolean;
  lastPaidDate?: string;
  reminderDaysBefore: number; // e.g. 3 days before
  note?: string;
  createdAt: string;
}

export interface BillSummary {
  totalMonthlyBills: number;
  paidAmountThisMonth: number;
  unpaidAmountThisMonth: number;
  unpaidCount: number;
  paidCount: number;
  criticalUpcomingBills: RecurringBill[]; // Due within <= 3 days
}
