import { describe, it, expect } from "vitest";
import { parseReceiptText } from "@/lib/ocr/receipt-parser";

describe("Local Receipt Parser (Regex & Pattern Matcher)", () => {
  it("extracts merchant, total, date, and items from Indonesian receipt text", () => {
    const sampleOcrText = `
      MIE GACOAN TEBET
      JL. TEBET RAYA NO. 12
      02/10/2026 14:30
      ------------------------------
      MIE HOMPIMPA LV 1     18.000
      ES TEH MANIS           5.000
      ------------------------------
      SUBTOTAL              23.000
      PAJAK PB1 10%          2.300
      TOTAL                 25.300
      TUNAI                 50.000
      KEMBALI               24.700
    `;

    const candidate = parseReceiptText(sampleOcrText);
    expect(candidate.merchant).toBe("MIE GACOAN TEBET");
    expect(candidate.amount).toBe(25300);
    expect(candidate.date).toBe("2026-10-02");
    expect(candidate.category).toBe("Food & Drinks");
  });

  it("handles messy receipt text gracefully without throwing", () => {
    const candidate = parseReceiptText("TIDAK JELAS STRUK SOBEK");
    expect(candidate.amount).toBe(0);
    expect(candidate.merchant).toBe("Struk Belanja");
  });
});

describe("Receipt parser regressions", () => {
  it.each([
    ["TOKO A\nTotal Item 2\nTOTAL 25.000", 25000],
    ["TOKO A\nTotal Qty: 2\nTOTAL 25.000", 25000],
    ["TOKO A\nJumlah Item 3\nTOTAL 25.000", 25000],
    ["TOKO A\nTotal Belanja 45.000\nTotal Diskon 5.000\nTotal Bayar 40.000\nTunai 50.000", 40000],
    ["TOKO A\nTOTAL Rp 12.500,00", 12500],
    ["TOKO A\nTOTAL 25,000.00", 25000],
  ])("detects total in %j as %d", (text, expected) => {
    expect(parseReceiptText(text).amount).toBe(expected);
  });

  it("does not add PPN or service lines as items", () => {
    const candidate = parseReceiptText(
      "WARUNG KOPI\nKOPI SUSU 20.000\nPPN 11% 2.200\nSERVICE 5% 1.000\nTOTAL 23.200"
    );
    expect(candidate.items).toEqual([{ name: "KOPI SUSU", amount: 20000 }]);
  });

  it("supports 2-digit years and rejects invalid dates", () => {
    expect(parseReceiptText("TOKO A\n05/03/24\nTOTAL 10.000").date).toBe("2024-03-05");
    expect(parseReceiptText("TOKO A\n2024-03-05\nTOTAL 10.000").date).toBe("2024-03-05");
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const localToday = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    expect(parseReceiptText("TOKO A\n2024-13-45\nTOTAL 10.000").date).toBe(localToday);
  });

  it("matches category keywords as whole words", () => {
    expect(parseReceiptText("TOKO KOSMETIK CANTIK\nLIPSTIK 50.000\nTOTAL 50.000").category).toBe("Other");
    expect(parseReceiptText("BAYAR KOS BULANAN\nTOTAL 900.000").category).toBe("Bills & Utilities");
  });
});
