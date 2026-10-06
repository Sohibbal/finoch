export type LeakCategory =
  | "admin_fee"
  | "platform_fee"
  | "parking"
  | "cheap_snack"
  | "subscription"
  | "other_leak";

export interface MicroLeakItem {
  id: string;
  name: string;
  amount: number;
  category: LeakCategory;
  categoryLabel: string;
  date: string;
  count: number;
  frequency: "daily" | "weekly" | "recurring" | "one_time";
  substitutionTip: string;
}

export interface LeakAuditSummary {
  totalLeakedAmount: number;
  leakCount: number;
  percentageOfAllowance: number;
  wartegEquivalence: number; // e.g. 340,000 / 15,000 = 22 porsi nasi warteg
  leaksByCategory: Array<{
    category: LeakCategory;
    label: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  items: MicroLeakItem[];
  shockMessage: string;
  actionChecklist: string[];
}
