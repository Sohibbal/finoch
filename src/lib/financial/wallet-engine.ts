import { StudentWallet, WalletSummary, WalletTransferRecord, WalletWithBalance } from "@/types/wallet-types";
import type { Expense } from "@/lib/types/expense";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

/**
 * Live balance = saldo awal + transfers in - transfers out - admin fees - spending charged to the wallet.
 * Derived on every read so sync pulls, edits and deletes of expenses can never double-count.
 */
export function computeWalletBalances(
  wallets: StudentWallet[],
  transfers: WalletTransferRecord[],
  expenses: Expense[]
): WalletWithBalance[] {
  const delta = new Map<string, number>();
  const add = (id: string | null | undefined, amount: number) => {
    if (id) delta.set(id, (delta.get(id) ?? 0) + amount);
  };
  for (const t of transfers) {
    add(t.fromWalletId, -(t.amount + (t.adminFee || 0)));
    add(t.toWalletId, t.amount);
  }
  for (const e of expenses) {
    if (!e.isDeleted) add(e.walletId, -e.amount);
  }
  return wallets.map((w) => ({ ...w, balance: (w.openingBalance || 0) + (delta.get(w.id) ?? 0) }));
}

/** The wallet new expenses are charged to: the flagged default, else the first cash wallet, else the first wallet. */
export function getDefaultWalletId(wallets: StudentWallet[]): string | null {
  const wallet = wallets.find((w) => w.isDefault) ?? wallets.find((w) => w.type === "cash") ?? wallets[0];
  return wallet?.id ?? null;
}

/**
 * Calculates aggregated balance metrics across cash, banks, and e-wallets.
 */
export function calculateWalletSummary(wallets: WalletWithBalance[]): WalletSummary {
  let cashBalance = 0;
  let bankBalance = 0;
  let ewalletBalance = 0;
  const criticalWallets: WalletWithBalance[] = [];

  for (const w of wallets) {
    const bal = Math.max(0, w.balance || 0);

    if (w.type === "cash") {
      cashBalance += bal;
    } else if (w.type === "bank") {
      bankBalance += bal;
    } else if (w.type === "ewallet") {
      ewalletBalance += bal;
    }

    if (bal < 20000) {
      criticalWallets.push(w);
    }
  }

  const totalBalance = cashBalance + bankBalance + ewalletBalance;

  return {
    totalBalance,
    cashBalance,
    bankBalance,
    ewalletBalance,
    criticalWallets,
  };
}

/**
 * Produces actionable warnings if any wallet has critically low balance.
 */
export function detectCriticalBalances(wallets: WalletWithBalance[], threshold: number = 20000): string[] {
  const warnings: string[] = [];

  for (const w of wallets) {
    if (w.balance < threshold) {
      if (w.type === "cash") {
        warnings.push(`Uang tunai di dompet fisik tersisa ${formatRupiah(w.balance)}. Siapkan uang pecahan kecil untuk bayar warteg, galon, atau parkir.`);
      } else if (w.type === "ewallet") {
        warnings.push(`Saldo ${w.name} menipis (${formatRupiah(w.balance)}). Waspadai gagal bayar ojek online atau pesanan makanan.`);
      } else {
        warnings.push(`Saldo rekening ${w.name} menipis (${formatRupiah(w.balance)}).`);
      }
    }
  }

  return warnings;
}
