import {
  SpendingCategory,
  SpendingType,
  TransactionCandidate,
} from "@/types/financial-types";

function parseIndonesianNumber(raw: string): number {
  // Drop a trailing 2-digit decimal part ("12.500,00", "25,000.00") before stripping separators
  const cleaned = raw.trim().replace(/[.,]\d{2}$/, "").replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function toLocalDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildDate(y: string, m: string, d: string): string | null {
  const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
  const date = new Date(year, parseInt(m, 10) - 1, parseInt(d, 10));
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== parseInt(m, 10) - 1 ||
    date.getDate() !== parseInt(d, 10)
  ) {
    return null;
  }
  return toLocalDateString(date);
}

const TOTAL_EXCLUDE = /tunai|cash|kembali|change|sub\s?total|item|qty|diskon|disc|hemat|potongan/i;
const GRAND_TOTAL = /grand\s?total|total\s+bayar|tagihan/i;

export function parseReceiptText(rawText: string): TransactionCandidate {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return {
      merchant: "Struk Belanja",
      amount: 0,
      category: "Other",
      spendingType: "wants",
      date: toLocalDateString(new Date()),
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
  let dateStr = toLocalDateString(new Date());
  const dateMatch = rawText.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})\b/);
  const isoMatch = rawText.match(/\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/);
  const parsedDate =
    (dateMatch && buildDate(dateMatch[3], dateMatch[2], dateMatch[1])) ||
    (isoMatch && buildDate(isoMatch[1], isoMatch[2], isoMatch[3]));
  if (parsedDate) {
    dateStr = parsedDate;
  }

  // 3. Extract Total Amount
  let amount = 0;
  let foundTotalLine = false;

  // Prefer an explicit grand total / total bayar, else the last total line
  for (const line of lines) {
    const lower = line.toLowerCase();
    // Exclude payment lines, subtotal, item counts and discounts
    if (TOTAL_EXCLUDE.test(lower)) {
      continue;
    }

    if (/total|tagihan|jumlah/.test(lower)) {
      const numMatch = line.match(/(?:rp\.?\s*)?([\d.,]+)\s*$/i);
      if (numMatch) {
        const parsed = parseIndonesianNumber(numMatch[1]);
        if (parsed > 0) {
          amount = parsed;
          foundTotalLine = true;
          if (GRAND_TOTAL.test(lower)) break;
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
      /---+|===+|total|subtotal|tunai|kembali|pajak|tax|ppn|service|svc|cash|diskon|disc|hemat|jumlah|tagihan|bayar|qty/i.test(line)
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
  const has = (keyword: string) => new RegExp(`\\b${keyword}\\b`).test(lowerAll);
  let category: SpendingCategory = "Other";
  let spendingType: SpendingType = "wants";

  if (
    has("mie") ||
    has("gacoan") ||
    has("kopi") ||
    has("resto") ||
    has("cafe") ||
    has("makan") ||
    has("teh") ||
    has("nasi") ||
    has("bakso") ||
    has("ayam") ||
    has("burger") ||
    has("indomaret") ||
    has("alfamart") ||
    has("superindo") ||
    has("hypermart") ||
    has("pasar") ||
    has("sembako") ||
    has("beras")
  ) {
    category = "Food & Drinks";
    spendingType = "needs";
  } else if (
    has("spbu") ||
    has("pertamina") ||
    has("shell") ||
    has("grab") ||
    has("gojek") ||
    has("parkir") ||
    has("bensin") ||
    has("tol") ||
    has("kereta")
  ) {
    category = "Transportation";
    spendingType = "needs";
  } else if (
    has("pln") ||
    has("pdam") ||
    has("listrik") ||
    has("wifi") ||
    has("indihome") ||
    has("pulsa") ||
    has("kuota") ||
    has("kos") ||
    has("kost")
  ) {
    category = "Bills & Utilities";
    spendingType = "needs";
  } else if (
    has("baju") ||
    has("celana") ||
    has("sepatu") ||
    has("shopee") ||
    has("tokopedia") ||
    has("bioskop") ||
    has("xxi") ||
    has("game") ||
    has("skincare") ||
    has("makeup")
  ) {
    category = "Shopping & Lifestyle";
    spendingType = "wants";
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
