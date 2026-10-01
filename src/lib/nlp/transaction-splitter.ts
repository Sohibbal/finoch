import { normalizeText } from "./normalize-text";
import { parseIndonesianNumber } from "./number-normalizer";

const DELIMITER_REGEX = /\b(dan|sama|lalu|terus|kemudian|serta)\b|,/gi;

/**
 * Splits a compound transcript into individual transaction segments.
 *
 * Employs a smart guard against false splits:
 * "dan" / "sama" is only treated as a transaction separator if the segment preceding
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
    return [normalized];
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
    const delimMatch = remaining.match(/^(?:dan|sama|lalu|terus|kemudian|serta|,)\s*/i);
    currentStart = splitIndex + (delimMatch ? delimMatch[0].length : 1);
  }

  const lastSegment = normalized.slice(currentStart).trim();
  if (lastSegment) {
    segments.push(lastSegment);
  }

  return segments;
}
