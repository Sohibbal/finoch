export interface Participant {
  id: string;
  name: string;
  isUser: boolean; // Flag to identify current user ("Saya")
  phoneNumber?: string;
}

export interface SplitItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedParticipantIds: string[]; // List of participant IDs sharing this item
}

export interface SplitBillConfig {
  restaurantName: string;
  date: string;
  mode: "itemized" | "equal"; // Bagi per menu vs Bagi rata
  taxPercentage: number; // e.g. 10 or 11 (PB1)
  servicePercentage: number; // e.g. 0, 5, or custom
  discountAmount: number; // Flat discount nominal in IDR
  rounding: number; // 0, 100, 500, or 1000
  paymentNote?: string; // e.g. "BCA 1234567890 a.n Diki / GoPay 081234567890"
}

export interface ItemShareDetail {
  itemName: string;
  portionPrice: number;
  quantity: number;
}

export interface ParticipantShare {
  participantId: string;
  name: string;
  isUser: boolean;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  discountDeduction: number;
  rawAmount: number;
  finalAmount: number; // After rounding
  items: ItemShareDetail[];
}

export interface SplitBillResult {
  subtotal: number;
  totalTax: number;
  totalService: number;
  totalDiscount: number;
  grandTotal: number;
  shares: ParticipantShare[];
}

export interface TalanganRecord {
  id: string;
  restaurantName: string;
  date: string;
  friendName: string;
  amount: number;
  itemsSummary: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}
