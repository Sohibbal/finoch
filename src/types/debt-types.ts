export type DebtType = "receivable" | "payable";
export type DebtStatus = "unpaid" | "paid";

export interface DebtItem {
  id: string;
  type: DebtType; // 'receivable' = teman berhutang ke saya; 'payable' = saya berhutang ke teman
  personName: string;
  amount: number;
  description: string;
  dueDate?: string;
  phone?: string;
  status: DebtStatus;
  settledAt?: string;
  createdAt: string;
}

export interface DebtSummary {
  totalReceivable: number;
  totalPayable: number;
  netBalance: number;
  unpaidReceivablesCount: number;
  unpaidPayablesCount: number;
}
