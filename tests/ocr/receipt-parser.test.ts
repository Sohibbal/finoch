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
