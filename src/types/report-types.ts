export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyReportSummary {
  month: number; // 1-12
  year: number;
  monthName: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  runwayDays: number;
  topCategories: CategoryBreakdown[];
  totalTransactions: number;
}

export type ReportRecipientType = "parents" | "scholarship" | "personal";

export interface WhatsAppReportOptions {
  recipientType: ReportRecipientType;
  studentName?: string;
  campusName?: string;
  customNote?: string;
  includeDetails?: boolean;
}
