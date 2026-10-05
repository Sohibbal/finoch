import { describe, it, expect } from "vitest";
import {
  calculateSplitBill,
  formatWhatsAppSplitBillMessage,
  generateWhatsAppShareUrl,
} from "@/lib/financial/split-bill-engine";
import { Participant, SplitItem, SplitBillConfig } from "@/types/split-bill-types";

describe("Split Bill Engine", () => {
  const mockParticipants: Participant[] = [
    { id: "p1", name: "Saya", isUser: true },
    { id: "p2", name: "Budi", isUser: false },
    { id: "p3", name: "Siti", isUser: false },
  ];

  it("calculates equal split correctly with PB1 and service charge", () => {
    const items: SplitItem[] = [
      { id: "i1", name: "Paket Nasi Liwet", price: 90000, quantity: 1, assignedParticipantIds: [] },
    ];

    const config: SplitBillConfig = {
      restaurantName: "Waroeng Spesial Sambal",
      date: "2026-10-05",
      mode: "equal",
      taxPercentage: 10, // 9.000
      servicePercentage: 5, // 4.500
      discountAmount: 0,
      rounding: 0,
    };

    const result = calculateSplitBill(items, mockParticipants, config);

    expect(result.subtotal).toBe(90000);
    expect(result.totalTax).toBe(9000);
    expect(result.totalService).toBe(4500);
    expect(result.grandTotal).toBe(103500);
    expect(result.shares).toHaveLength(3);

    // 103.500 / 3 = 34.500 each
    result.shares.forEach((share) => {
      expect(share.subtotal).toBe(30000);
      expect(share.taxAmount).toBe(3000);
      expect(share.serviceAmount).toBe(1500);
      expect(share.finalAmount).toBe(34500);
    });
  });

  it("calculates itemized split proportionally with shared items and rounding", () => {
    const items: SplitItem[] = [
      { id: "i1", name: "Ayam Penyet", price: 25000, quantity: 1, assignedParticipantIds: ["p1"] }, // Saya
      { id: "i2", name: "Bebek Goreng", price: 35000, quantity: 1, assignedParticipantIds: ["p2"] }, // Budi
      { id: "i3", name: "Soto Ayam", price: 20000, quantity: 1, assignedParticipantIds: ["p3"] }, // Siti
      { id: "i4", name: "Tahu Tempe Goreng", price: 10000, quantity: 1, assignedParticipantIds: ["p1", "p2"] }, // Saya & Budi (5.000 each)
    ];

    const config: SplitBillConfig = {
      restaurantName: "Bebek Sinjay",
      date: "2026-10-05",
      mode: "itemized",
      taxPercentage: 10,
      servicePercentage: 0,
      discountAmount: 10000, // Diskon 10.000
      rounding: 500, // Bulatkan ke kelipatan 500 terdekat
    };

    // Subtotals:
    // p1 (Saya): 25.000 + 5.000 = 30.000 (33.33%)
    // p2 (Budi): 35.000 + 5.000 = 40.000 (44.44%)
    // p3 (Siti): 20.000 = 20.000 (22.22%)
    // Total Subtotal = 90.000
    // Total Tax (10%) = 9.000
    // Total Discount = 10.000
    // Net Grand Total = 90.000 + 9.000 - 10.000 = 89.000

    const result = calculateSplitBill(items, mockParticipants, config);

    expect(result.subtotal).toBe(90000);
    expect(result.totalTax).toBe(9000);
    expect(result.totalDiscount).toBe(10000);
    expect(result.grandTotal).toBe(89000);

    const sayaShare = result.shares.find((s) => s.participantId === "p1")!;
    const budiShare = result.shares.find((s) => s.participantId === "p2")!;
    const sitiShare = result.shares.find((s) => s.participantId === "p3")!;

    expect(sayaShare.subtotal).toBe(30000);
    expect(budiShare.subtotal).toBe(40000);
    expect(sitiShare.subtotal).toBe(20000);

    // Raw:
    // Saya: 30000 + 3000 - 3333.33 = 29666.67 -> Round up to 500 = 30000
    expect(sayaShare.finalAmount).toBe(30000);

    // Budi: 40000 + 4000 - 4444.44 = 39555.56 -> Round up to 500 = 40000
    expect(budiShare.finalAmount).toBe(40000);

    // Siti: 20000 + 2000 - 2222.22 = 19777.78 -> Round up to 500 = 20000
    expect(sitiShare.finalAmount).toBe(20000);
  });

  it("handles edge case when participants or items are empty without NaN or division by zero", () => {
    const config: SplitBillConfig = {
      restaurantName: "Test Cafe",
      date: "2026-10-05",
      mode: "itemized",
      taxPercentage: 10,
      servicePercentage: 5,
      discountAmount: 0,
      rounding: 0,
    };

    const emptyResult = calculateSplitBill([], [], config);
    expect(emptyResult.subtotal).toBe(0);
    expect(emptyResult.grandTotal).toBe(0);
    expect(emptyResult.shares).toHaveLength(0);
  });

  it("formats WhatsApp bill message clearly with Indonesian greetings and payment info", () => {
    const config: SplitBillConfig = {
      restaurantName: "Kopi Kenangan Kampus",
      date: "2026-10-05",
      mode: "itemized",
      taxPercentage: 10,
      servicePercentage: 0,
      discountAmount: 0,
      rounding: 0,
      paymentNote: "BCA 1234567890 a.n Diki / GoPay 081234567890",
    };

    const result = calculateSplitBill(
      [
        { id: "i1", name: "Kopi Kenangan Mantan", price: 22000, quantity: 1, assignedParticipantIds: ["p1"] },
        { id: "i2", name: "Avocado Coffee", price: 28000, quantity: 1, assignedParticipantIds: ["p2"] },
      ],
      mockParticipants.slice(0, 2),
      config
    );

    const message = formatWhatsAppSplitBillMessage(result, config);

    expect(message).toContain("Kopi Kenangan Kampus");
    expect(message).toContain("Budi");
    expect(message).toContain("Saya");
    expect(message).toContain("BCA 1234567890 a.n Diki");
    expect(message).toContain("finoch.id");

    const shareUrl = generateWhatsAppShareUrl(message);
    expect(shareUrl).toContain("https://wa.me/?text=");
  });
});
