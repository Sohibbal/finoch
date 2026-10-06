import { StudentWallet, WalletSummary } from "@/types/wallet-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

/**
 * Calculates aggregated balance metrics across cash, banks, and e-wallets.
 */
export function calculateWalletSummary(wallets: StudentWallet[]): WalletSummary {
  let cashBalance = 0;
  let bankBalance = 0;
  let ewalletBalance = 0;
  const criticalWallets: StudentWallet[] = [];

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
export function detectCriticalBalances(wallets: StudentWallet[], threshold: number = 20000): string[] {
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
