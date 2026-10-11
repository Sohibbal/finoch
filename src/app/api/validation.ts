export const EXPENSE_CATEGORIES = [
  "Food & Drinks", "Transportation", "Bills & Utilities", "Shopping & Lifestyle", "Other",
];

// Older screens and LLM/OCR output still emit legacy or free-form categories
// ("Shopping", "Housing & Bills", ...). Map them instead of rejecting, so those
// expenses can still sync.
const CATEGORY_ALIASES: Array<[RegExp, string]> = [
  [/food|makan|minum|drink/i, "Food & Drinks"],
  [/transport|bensin|parkir|ojek/i, "Transportation"],
  [/bill|utilit|housing|kos|listrik|pulsa|subscription/i, "Bills & Utilities"],
  [/shop|lifestyle|cloth|fashion|entertain|leisure|gadget/i, "Shopping & Lifestyle"],
];

export function normalizeExpenseCategory(category: unknown): string {
  if (typeof category !== "string") return "Other";
  if (EXPENSE_CATEGORIES.includes(category)) return category;
  return CATEGORY_ALIASES.find(([pattern]) => pattern.test(category))?.[1] ?? "Other";
}

export function jakartaDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}
