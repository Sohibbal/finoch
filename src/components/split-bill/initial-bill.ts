import type { Participant, SplitBillConfig, SplitItem } from "@/types/split-bill-types";
import { localDateKey } from "@/lib/date";

export const SELF: Participant = { id: "p_user", name: "Saya", isUser: true };

export interface InitialBill {
  participants: Participant[];
  items: SplitItem[];
  config: SplitBillConfig;
}

/**
 * Where a new split bill starts. A real account opens an empty nota (only "Saya", no menu),
 * so nothing on screen is made up; Mode Demo gets a full sample bill to present with.
 */
export function initialSplitBill(demo: boolean, today: Date = new Date()): InitialBill {
  const config: SplitBillConfig = {
    restaurantName: "",
    date: localDateKey(today),
    mode: "itemized",
    taxPercentage: 10,
    servicePercentage: 0,
    discountAmount: 0,
    rounding: 100,
    paymentNote: "",
  };
  if (!demo) return { participants: [SELF], items: [], config };

  return {
    participants: [SELF, { id: "p_budi", name: "Budi", isUser: false }, { id: "p_siti", name: "Siti", isUser: false }],
    items: [
      { id: "item_1", name: "Ayam Geprek Sambal Bawang", price: 18000, quantity: 1, assignedParticipantIds: ["p_user"] },
      { id: "item_2", name: "Nasi Goreng Spesial", price: 22000, quantity: 1, assignedParticipantIds: ["p_budi"] },
      { id: "item_3", name: "Mie Ayam Bakso", price: 19000, quantity: 1, assignedParticipantIds: ["p_siti"] },
      { id: "item_4", name: "Es Teh Manis Jumbo", price: 12000, quantity: 1, assignedParticipantIds: ["p_user", "p_budi", "p_siti"] },
    ],
    config: { ...config, restaurantName: "Warteg & Kopi Kampus", paymentNote: "BCA / GoPay / DANA" },
  };
}
