/**
 * User-facing labels. Categories are stored in English (API + sync contract);
 * this is the one place that turns them into Indonesian.
 */

const CATEGORY_LABELS: Record<string, string> = {
  "Food & Drinks": "Makan & Minum",
  Transportation: "Transportasi",
  "Bills & Utilities": "Tagihan",
  "Shopping & Lifestyle": "Belanja & Gaya Hidup",
  Other: "Lainnya",
  // Older rows written before the five categories were fixed.
  Food: "Makan & Minum",
  "Housing & Bills": "Tagihan",
  Bills: "Tagihan",
  "Shopping & Clothing": "Belanja & Gaya Hidup",
  "Entertainment & Leisure": "Belanja & Gaya Hidup",
};

export function categoryLabel(category?: string | null): string {
  if (!category) return "Lainnya";
  return CATEGORY_LABELS[category] ?? category;
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "Sab, 11 Okt" from a Date or a local YYYY-MM-DD key; "" when invalid. */
export function shortDate(value: Date | string): string {
  const d = typeof value === "string" ? parseLocalDay(value) : value;
  if (!d || isNaN(d.getTime())) return "";
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// "2026-10-11" must mean that local day, not UTC midnight.
function parseLocalDay(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(key);
  return isNaN(d.getTime()) ? null : d;
}

/** "Rp 15.000" with a non-breaking space; negatives as "−Rp 5.000". */
export function rupiah(amount: number): string {
  const n = Math.round(Math.abs(amount)).toLocaleString("id-ID");
  return `${amount < 0 ? "−" : ""}Rp ${n}`;
}
