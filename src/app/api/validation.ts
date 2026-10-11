export const EXPENSE_CATEGORIES = [
  "Food & Drinks", "Transportation", "Bills & Utilities", "Shopping & Lifestyle", "Other",
];

export function jakartaDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}
