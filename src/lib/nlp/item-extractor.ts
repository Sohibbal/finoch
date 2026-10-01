const FILLER_PATTERNS = [
  /\btadi\s+beli\b/gi,
  /\bbeli\s+tadi\b/gi,
  /\bbeli\b/gi,
  /\bbayarin\b/gi,
  /\bbayar\b/gi,
  /\bkeluar\s+uang\b/gi,
  /\bpengeluaran\b/gi,
  /\bseharga\b/gi,
  /\bsebesar\b/gi,
  /\bhabis\b/gi,
  /\bbuat\b/gi,
  /\buntuk\b/gi,
  /\btadi\b/gi,
];

/**
 * Extracts and cleans the item name from a transaction segment.
 * Strips out conversational preambles and the matched monetary string.
 */
export function extractItemName(segment: string, matchedAmountText?: string): string {
  if (!segment) return "";

  let cleaned = segment;

  // Remove the matched price text if provided
  if (matchedAmountText) {
    const escaped = matchedAmountText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(escaped, "gi"), " ");
  }

  // Remove filler words
  for (const pattern of FILLER_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }

  // Remove remaining numbers or residual currency words
  cleaned = cleaned.replace(/\b(?:rp|rupiah|perak|k|rb|jt|juta)\b/gi, " ");
  cleaned = cleaned.replace(/\b\d+\b/g, " ");

  // Clean whitespace and punctuation
  cleaned = cleaned.replace(/[^a-zA-Z\s-]/g, " ").replace(/\s+/g, " ").trim();

  if (!cleaned) return "Pengeluaran";

  // Convert to Title Case
  return cleaned
    .split(" ")
    .map(word => (word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
}
