export type WalletType = "cash" | "bank" | "ewallet";

export interface StudentWallet {
  id: string;
  name: string;
  type: WalletType;
  /** Saldo awal. The live balance is derived (computeWalletBalances), never stored. */
  openingBalance: number;
  color: string; // 'emerald' | 'blue' | 'purple' | 'amber' | 'cyan'
  icon: string; // 'wallet' | 'landmark' | 'smartphone' | 'credit-card'
  accountNumber?: string;
  isPrimary?: boolean;
  /** New expenses are charged to this wallet unless the user picks another. */
  isDefault?: boolean;
  notes?: string;
  updatedAt: string;
}

export interface WalletWithBalance extends StudentWallet {
  balance: number;
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
  criticalWallets: WalletWithBalance[];
}
