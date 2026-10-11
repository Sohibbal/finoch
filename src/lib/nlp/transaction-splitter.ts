import { normalizeText } from "./normalize-text";
import { parseIndonesianNumber } from "./number-normalizer";

const DELIMITER_REGEX = /\b(dan|sama|lalu|terus|kemudian|serta|bayar|beli)\b|,/gi;

/**
 * Splits a compound transcript into individual transaction segments.
 *
 * Employs a smart guard against false splits:
 * "dan" / "sama" / "bayar" / "beli" is only treated as a transaction separator if the segment preceding
 * it already contains a valid amount/price. If the preceding segment has no price,
 * the conjunction is presumed to connect items (e.g. "nasi dan ayam bakar 25 ribu").
 */
export function splitTransactions(rawTranscript: string): string[] {
  const normalized = normalizeText(rawTranscript);
  if (!normalized) return [];

  // Find all potential split points
  const splits: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = DELIMITER_REGEX.exec(normalized)) !== null) {
    const delimiterIndex = match.index;
    const delimiterLength = match[0].length;

    // Segment before this delimiter from the last split point
    const lastSplitIndex = splits.length > 0 ? splits[splits.length - 1] : 0;
    const precedingText = normalized.slice(lastSplitIndex, delimiterIndex).trim();

    // Check if preceding segment contains a valid price
    const hasPrecedingPrice = parseIndonesianNumber(precedingText) !== null;

    if (hasPrecedingPrice) {
      // Also ensure following text has content
      const followingText = normalized.slice(delimiterIndex + delimiterLength).trim();
      if (followingText.length > 0) {
        splits.push(delimiterIndex);
      }
    }
  }

  if (splits.length === 0) {
    return splitAfterAmounts(normalized);
  }

  const segments: string[] = [];
  let currentStart = 0;

  for (const splitIndex of splits) {
    const segment = normalized.slice(currentStart, splitIndex).trim();
    if (segment) {
      segments.push(segment);
    }
    // Advance past delimiter word/comma
    const remaining = normalized.slice(splitIndex);
    const delimMatch = remaining.match(/^(?:dan|sama|lalu|terus|kemudian|serta|bayar|beli|,)\s*/i);
    currentStart = splitIndex + (delimMatch ? delimMatch[0].length : 1);
  }

  const lastSegment = normalized.slice(currentStart).trim();
  if (lastSegment) {
    segments.push(lastSegment);
  }

  return segments.flatMap(splitAfterAmounts);
}

// A complete amount: digits with a unit (18rb, 18 ribu, 20k, 1,5 juta), a thousands-grouped or
// 4+ digit number (20.000, 15000), spoken number words ending in ribu/juta, or a slang amount.
const NUMBER_WORD = /(?:se|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|puluh|belas|ratus|seratus|setengah)/.source;
const AMOUNT_END_REGEX = new RegExp(
  [
    /\d+(?:[.,]\d+)?\s?(?:rb|ribu|rebu|k|jt|juta)\b/.source,
    /\b\d{1,3}(?:\.\d{3})+\b/.source,
    /\b\d{4,}\b/.source,
    String.raw`(?:\b${NUMBER_WORD}\s+)*\b${NUMBER_WORD}\s+(?:ribu|rebu|juta)\b`,
    /\b(?:goceng|ceban|gocap|goban|seceng|nopek|gopek|cepek)\b/.source,
  ].join("|"),
  "gi"
);
// What may follow an amount without starting a new item: more of the same number.
const CONTINUES_NUMBER = new RegExp(String.raw`^(?:\d|${NUMBER_WORD}\b|ribu\b|rebu\b|juta\b|rupiah\b|an\b)`, "i");

/**
 * Splits "nasi padang 18rb es teh 5rb" (no comma or conjunction) after each complete amount,
 * when what follows starts a new item and carries its own amount. "dua ribu lima ratus",
 * "18 ribu 500" and "fotokopi 100 lembar 15000" stay whole.
 */
function splitAfterAmounts(segment: string): string[] {
  const parts: string[] = [];
  let start = 0;
  AMOUNT_END_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = AMOUNT_END_REGEX.exec(segment)) !== null) {
    if (match[0].trim() === "") {
      AMOUNT_END_REGEX.lastIndex++;
      continue;
    }
    const end = match.index + match[0].length;
    const before = segment.slice(start, end).trim();
    const after = segment.slice(end).trim();
    if (!after || CONTINUES_NUMBER.test(after)) continue;
    // Both sides must stand alone: an item name before, and an amount of its own after.
    if (!/[a-z]{2,}/i.test(before.replace(match[0], "")) || parseIndonesianNumber(after) === null) continue;
    parts.push(before);
    start = end;
  }
  const rest = segment.slice(start).trim();
  if (rest) parts.push(rest);
  return parts.length ? parts : [segment];
}
