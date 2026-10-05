import {
  Participant,
  SplitItem,
  SplitBillConfig,
  ParticipantShare,
  SplitBillResult,
  ItemShareDetail,
} from "@/types/split-bill-types";

/**
 * Rounds up an amount to the nearest rounding interval (e.g., nearest 100, 500, or 1000 IDR)
 */
export function applyRounding(amount: number, rounding: number): number {
  if (!rounding || rounding <= 0) {
    return Math.round(amount);
  }
  return Math.ceil(amount / rounding) * rounding;
}

/**
 * Calculate proportional or equal split bill including taxes, service charge, and discounts.
 */
export function calculateSplitBill(
  items: SplitItem[],
  participants: Participant[],
  config: SplitBillConfig
): SplitBillResult {
  if (!participants.length || !items.length) {
    return {
      subtotal: 0,
      totalTax: 0,
      totalService: 0,
      totalDiscount: 0,
      grandTotal: 0,
      shares: [],
    };
  }

  // Calculate base item totals
  const totalSubtotal = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const totalTax = Math.round((totalSubtotal * (config.taxPercentage || 0)) / 100);
  const totalService = Math.round((totalSubtotal * (config.servicePercentage || 0)) / 100);
  const totalDiscount = Math.min(config.discountAmount || 0, totalSubtotal + totalTax + totalService);
  const grandTotal = Math.max(0, totalSubtotal + totalTax + totalService - totalDiscount);

  if (config.mode === "equal") {
    // Equal split among all participants
    const participantCount = participants.length;
    const subtotalPerPerson = Math.round(totalSubtotal / participantCount);
    const taxPerPerson = Math.round(totalTax / participantCount);
    const servicePerPerson = Math.round(totalService / participantCount);
    const discountPerPerson = Math.round(totalDiscount / participantCount);
    const rawPerPerson = Math.max(0, (grandTotal / participantCount));
    const finalPerPerson = applyRounding(rawPerPerson, config.rounding);

    const shares: ParticipantShare[] = participants.map((p) => ({
      participantId: p.id,
      name: p.name,
      isUser: p.isUser,
      subtotal: subtotalPerPerson,
      taxAmount: taxPerPerson,
      serviceAmount: servicePerPerson,
      discountDeduction: discountPerPerson,
      rawAmount: rawPerPerson,
      finalAmount: finalPerPerson,
      items: [
        {
          itemName: "Bagi Rata Keseluruhan",
          portionPrice: subtotalPerPerson,
          quantity: 1,
        },
      ],
    }));

    return {
      subtotal: totalSubtotal,
      totalTax,
      totalService,
      totalDiscount,
      grandTotal,
      shares,
    };
  }

  // Itemized calculation
  // Track personal subtotal and consumed items for each participant
  const participantSubtotals: Record<string, number> = {};
  const participantItems: Record<string, ItemShareDetail[]> = {};

  participants.forEach((p) => {
    participantSubtotals[p.id] = 0;
    participantItems[p.id] = [];
  });

  items.forEach((item) => {
    const itemTotal = item.price * (item.quantity || 1);
    const assigned = item.assignedParticipantIds && item.assignedParticipantIds.length > 0
      ? item.assignedParticipantIds
      : participants.map((p) => p.id); // Default to all if none specifically checked

    const sharePrice = itemTotal / assigned.length;

    assigned.forEach((pid) => {
      if (participantSubtotals[pid] !== undefined) {
        participantSubtotals[pid] += sharePrice;
        participantItems[pid].push({
          itemName: item.name,
          portionPrice: sharePrice,
          quantity: item.quantity,
        });
      }
    });
  });

  const shares: ParticipantShare[] = participants.map((p) => {
    const pSubtotal = participantSubtotals[p.id] || 0;
    const ratio = totalSubtotal > 0 ? pSubtotal / totalSubtotal : 1 / participants.length;

    const pTax = ratio * totalTax;
    const pService = ratio * totalService;
    const pDiscount = ratio * totalDiscount;
    const rawAmount = Math.max(0, pSubtotal + pTax + pService - pDiscount);
    const finalAmount = applyRounding(rawAmount, config.rounding);

    return {
      participantId: p.id,
      name: p.name,
      isUser: p.isUser,
      subtotal: Math.round(pSubtotal),
      taxAmount: Math.round(pTax),
      serviceAmount: Math.round(pService),
      discountDeduction: Math.round(pDiscount),
      rawAmount,
      finalAmount,
      items: participantItems[p.id] || [],
    };
  });

  return {
    subtotal: totalSubtotal,
    totalTax,
    totalService,
    totalDiscount,
    grandTotal,
    shares,
  };
}

/**
 * Format currency to Indonesian Rupiah representation
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate formatted WhatsApp message for friends
 */
export function formatWhatsAppSplitBillMessage(
  result: SplitBillResult,
  config: SplitBillConfig
): string {
  const lines: string[] = [];

  lines.push(`🧾 *Rincian Patungan Makan - ${config.restaurantName || "Makan Bareng"}*`);
  if (config.date) {
    lines.push(`📅 Tanggal: ${config.date}`);
  }
  lines.push(`💰 Total Tagihan: *${formatRupiah(result.grandTotal)}*`);

  if (result.totalTax > 0 || result.totalService > 0 || result.totalDiscount > 0) {
    const details: string[] = [];
    if (result.totalTax > 0) details.push(`PB1: ${formatRupiah(result.totalTax)}`);
    if (result.totalService > 0) details.push(`Service: ${formatRupiah(result.totalService)}`);
    if (result.totalDiscount > 0) details.push(`Diskon: -${formatRupiah(result.totalDiscount)}`);
    lines.push(`   _(${details.join(" · ")})_`);
  }

  lines.push("");
  lines.push(`👥 *Rincian per Orang:*`);

  result.shares.forEach((share, index) => {
    const isSelf = share.isUser ? " (Saya)" : "";
    lines.push(`${index + 1}. *${share.name}${isSelf}*: *${formatRupiah(share.finalAmount)}*`);
    if (config.mode === "itemized" && share.items.length > 0) {
      share.items.forEach((item) => {
        lines.push(`   • ${item.itemName} (${formatRupiah(item.portionPrice)})`);
      });
    }
  });

  if (config.paymentNote) {
    lines.push("");
    lines.push(`💳 *Transfer ke:*`);
    lines.push(`${config.paymentNote}`);
  }

  lines.push("");
  lines.push(`_Dihitung rapi otomatis via finoch.id 🚀_`);

  return lines.join("\n");
}

/**
 * Generates https://wa.me/?text= url
 */
export function generateWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
