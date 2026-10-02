import {
  SpendingCategory,
  SpendingType,
  TransactionCandidate,
} from "@/types/financial-types";

function parseIndonesianNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function parseReceiptText(rawText: string): TransactionCandidate {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return {
      merchant: "Struk Belanja",
      amount: 0,
      category: "Other",
      spendingType: "wants",
      date: new Date().toISOString().split("T")[0],
      source: "ocr",
      confidence: 0,
      items: [],
    };
  }

  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Extract Merchant
  let merchant = "Struk Belanja";
  const ignorePatterns = [
    /jl\./i,
    /jalan/i,
    /telp/i,
    /phone/i,
    /npwp/i,
    /struk/i,
    /receipt/i,
    /selamat/i,
    /terima/i,
    /kasih/i,
    /---/,
    /===/,
  ];

  for (let i = 0; i < Math.min(lines.length, 4); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      !ignorePatterns.some((pattern) => pattern.test(line)) &&
      !/\d{4,}/.test(line)
    ) {
      // Check if it looks like a genuine merchant name
      if (line !== "TIDAK JELAS STRUK SOBEK") {
        merchant = line;
        break;
      }
    }
  }

  // 2. Extract Date
  let dateStr = new Date().toISOString().split("T")[0];
  const dateMatch = rawText.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (dateMatch) {
    const [, d, m, y] = dateMatch;
    dateStr = `${y}-${m}-${d}`;
  } else {
    const isoMatch = rawText.match(/(\d{4})[/-](\d{2})[/-](\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      dateStr = `${y}-${m}-${d}`;
    }
  }

  // 3. Extract Total Amount
  let amount = 0;
  let foundTotalLine = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    // Exclude payment lines and subtotal
    if (
      lower.includes("tunai") ||
      lower.includes("cash") ||
      lower.includes("kembali") ||
      lower.includes("change") ||
      lower.includes("subtotal") ||
      lower.includes("sub total")
    ) {
      continue;
    }

    if (
      lower.includes("total") ||
      lower.includes("tagihan") ||
      lower.includes("grand total") ||
      lower.includes("jumlah")
    ) {
      const numMatch = line.match(/(?:rp\.?\s*)?([\d.,]+)\s*$/i);
      if (numMatch) {
        const parsed = parseIndonesianNumber(numMatch[1]);
        if (parsed > 0) {
          amount = parsed;
          foundTotalLine = true;
          break;
        }
      }
    }
  }

  // Fallback: look for subtotal if total not found
  if (!foundTotalLine) {
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes("subtotal") || lower.includes("sub total")) {
        const numMatch = line.match(/(?:rp\.?\s*)?([\d.,]+)\s*$/i);
        if (numMatch) {
          const parsed = parseIndonesianNumber(numMatch[1]);
          if (parsed > 0) {
            amount = parsed;
            foundTotalLine = true;
            break;
          }
        }
      }
    }
  }

  // 4. Extract Items
  const items: Array<{ name: string; amount: number }> = [];
  for (const line of lines) {
    if (
      /---+|===+|total|subtotal|tunai|kembali|pajak|tax|cash/i.test(line)
    ) {
      continue;
    }
    const itemMatch = line.match(/^(.+?)\s+([\d.,]{3,})\s*$/);
    if (itemMatch && itemMatch[1].trim().length > 2) {
      const itemName = itemMatch[1].trim();
      const itemAmount = parseIndonesianNumber(itemMatch[2]);
      if (itemAmount > 0 && !/\d{2}\/\d{2}/.test(itemName)) {
        items.push({ name: itemName, amount: itemAmount });
      }
    }
  }

  // 5. Determine Category & Spending Type
  const lowerAll = rawText.toLowerCase();
  let category: SpendingCategory = "Other";
  let spendingType: SpendingType = "wants";

  if (
    lowerAll.includes("mie") ||
    lowerAll.includes("gacoan") ||
    lowerAll.includes("kopi") ||
    lowerAll.includes("resto") ||
    lowerAll.includes("cafe") ||
    lowerAll.includes("makan") ||
    lowerAll.includes("teh") ||
    lowerAll.includes("nasi") ||
    lowerAll.includes("bakso") ||
    lowerAll.includes("ayam") ||
    lowerAll.includes("burger")
  ) {
    category = "Food";
    spendingType = "wants";
  } else if (
    lowerAll.includes("indomaret") ||
    lowerAll.includes("alfamart") ||
    lowerAll.includes("superindo") ||
    lowerAll.includes("hypermart") ||
    lowerAll.includes("pasar") ||
    lowerAll.includes("sabun") ||
    lowerAll.includes("minyak") ||
    lowerAll.includes("beras")
  ) {
    category = "Groceries";
    spendingType = "needs";
  } else if (
    lowerAll.includes("apotek") ||
    lowerAll.includes("kimia farma") ||
    lowerAll.includes("obat") ||
    lowerAll.includes("dokter") ||
    lowerAll.includes("klinik")
  ) {
    category = "Health";
    spendingType = "needs";
  } else if (
    lowerAll.includes("spbu") ||
    lowerAll.includes("pertamina") ||
    lowerAll.includes("shell") ||
    lowerAll.includes("grab") ||
    lowerAll.includes("gojek")
  ) {
    category = "Transportation";
    spendingType = "needs";
  } else if (
    lowerAll.includes("pln") ||
    lowerAll.includes("pdam") ||
    lowerAll.includes("listrik") ||
    lowerAll.includes("wifi") ||
    lowerAll.includes("indihome")
  ) {
    category = "Bills";
    spendingType = "needs";
  }

  // Confidence calculation
  let confidence = 0.5;
  if (merchant !== "Struk Belanja") confidence += 0.2;
  if (amount > 0) confidence += 0.2;
  if (items.length > 0) confidence += 0.1;
  confidence = Math.min(1.0, confidence);

  if (amount === 0 && merchant === "Struk Belanja") {
    confidence = 0.1;
  }

  return {
    merchant,
    amount,
    category,
    spendingType,
    date: dateStr,
    source: "ocr",
    confidence,
    items,
  };
}
