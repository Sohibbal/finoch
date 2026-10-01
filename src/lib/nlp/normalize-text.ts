/**
 * Normalizes raw spoken Indonesian input text by lowercasing,
 * stripping extraneous punctuation, and cleaning whitespace.
 */
export function normalizeText(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  let cleaned = raw.toLowerCase().trim();

  // Remove trailing and leading punctuation like ! ? " '
  cleaned = cleaned.replace(/[!?"'()[\]{}#*~`]/g, " ");

  // Normalize multiple spaces and tabs into a single space
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}
