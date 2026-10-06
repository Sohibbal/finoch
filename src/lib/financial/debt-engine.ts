import { DebtItem, DebtSummary } from "@/types/debt-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

/**
 * Calculates net debt balances and counts.
 */
export function calculateDebtSummary(debts: DebtItem[]): DebtSummary {
  const unpaid = debts.filter((d) => d.status === "unpaid");

  const totalReceivable = unpaid
    .filter((d) => d.type === "receivable")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const totalPayable = unpaid
    .filter((d) => d.type === "payable")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const unpaidReceivablesCount = unpaid.filter((d) => d.type === "receivable").length;
  const unpaidPayablesCount = unpaid.filter((d) => d.type === "payable").length;

  return {
    totalReceivable,
    totalPayable,
    netBalance: totalReceivable - totalPayable,
    unpaidReceivablesCount,
    unpaidPayablesCount,
  };
}

/**
 * Generates a casual, non-awkward WhatsApp reminder text for Indonesian students.
 */
export function generateWhatsAppDebtReminder(
  debt: DebtItem,
  senderName: string = "Temanmu",
  paymentInfo: string = "BCA / GoPay / ShopeePay"
): string {
  const amountStr = formatRupiah(debt.amount);
  const descStr = debt.description || "talangan kemarin";

  if (debt.type === "receivable") {
    let msg = `Halo ${debt.personName}! 👋\n\n`;
    msg += `Mau ngingetin santai nih soal ${descStr} sebesar *${amountStr}* yaa.\n`;
    msg += `Lagi butuh buat keperluan kost / makan nih hehe 🙏\n\n`;
    msg += `Bisa transfer santai ke rekening/e-wallet aku ya:\n💳 *${paymentInfo}*\n\n`;
    msg += `Kalo udah transfer kabarin yaa, makasih banyak bro/sis! ✨\n`;
    msg += `_Dicatat rapi lewat finoch.id_`;
    return msg;
  }

  // If payable: message to confirm payment to friend
  let msg = `Halo ${debt.personName}! 👋\n\n`;
  msg += `Mau konfirmasi soal pinjaman / talangan ${descStr} sebesar *${amountStr}* nih.\n`;
  msg += `Minta nomor rekening atau e-wallet (BCA/GoPay/Dana) kamu ya biar langsung aku transfer hari ini. Makasih banyak udah bantuin ya! 🙏\n`;
  msg += `_Dicatat rapi lewat finoch.id_`;
  return msg;
}
