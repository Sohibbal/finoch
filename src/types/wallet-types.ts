export type WalletType = "cash" | "bank" | "ewallet";

export interface StudentWallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string; // 'emerald' | 'blue' | 'purple' | 'amber' | 'cyan'
  icon: string; // 'wallet' | 'landmark' | 'smartphone' | 'credit-card'
  accountNumber?: string;
  isPrimary?: boolean;
  notes?: string;
  updatedAt: string;
}

export interface WalletTransferRecord {
  id: string;
  fromWalletId: string;
  fromWalletName: string;
  toWalletId: string;
  toWalletName: string;
  amount: number;
  adminFee: number;
  reason: string;
  createdAt: string;
}

export interface WalletSummary {
  totalBalance: number;
  cashBalance: number;
  bankBalance: number;
  ewalletBalance: number;
  criticalWallets: StudentWallet[];
}
