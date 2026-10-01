export interface ParsedNumberResult {
  amount: number;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}

const SLANG_MAP: Record<string, number> = {
  seceng: 1000,
  gopek: 500,
  cepek: 100,
  ceban: 10000,
  noban: 20000,
  gocap: 50000,
  "setengah juta": 500000,
  sejuta: 1000000,
  seribu: 1000,
  seratus: 100,
  sepuluh: 10,
  sebelas: 11,
};

const BASE_WORDS: Record<string, number> = {
  nol: 0,
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
  sepuluh: 10,
  sebelas: 11,
  seratus: 100,
  seribu: 1000,
  sejuta: 1000000,
};

/**
 * Converts a sequence of Indonesian number words (e.g. "dua puluh lima ribu") into a numeric value.
 */
export function wordsToNumber(words: string[]): number | null {
  if (words.length === 0) return null;

  let total = 0;
  let current = 0;
  let matchedAny = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();

    if (word === "rupiah" || word === "perak" || word === "rp") {
      continue;
    }

    if (SLANG_MAP[word] !== undefined) {
      current += SLANG_MAP[word];
      matchedAny = true;
      continue;
    }

    if (BASE_WORDS[word] !== undefined) {
      const val = BASE_WORDS[word];
      if (val === 1000 || val === 1000000) {
        current = current === 0 ? val : current * val;
        total += current;
        current = 0;
      } else {
        current += val;
      }
      matchedAny = true;
    } else if (word === "belas") {
      current += 10;
      matchedAny = true;
    } else if (word === "puluh") {
      current = (current === 0 ? 1 : current) * 10;
      matchedAny = true;
    } else if (word === "ratus") {
      current = (current === 0 ? 1 : current) * 100;
      matchedAny = true;
    } else if (word === "ribu") {
      current = (current === 0 ? 1 : current) * 1000;
      total += current;
      current = 0;
      matchedAny = true;
    } else if (word === "juta") {
      current = (current === 0 ? 1 : current) * 1000000;
      total += current;
      current = 0;
      matchedAny = true;
    } else {
      // Check if it's a numeric string like "15" or "15.000"
      const cleanNum = word.replace(/\./g, "").replace(/,/g, ".");
      const parsedNum = parseFloat(cleanNum);
      if (!isNaN(parsedNum)) {
        current += parsedNum;
        matchedAny = true;
      } else {
        return null;
      }
    }
  }

  total += current;
  return matchedAny ? total : null;
}

/**
 * Scans input text for Indonesian currency/number representations and extracts the best match.
 */
export function parseIndonesianNumber(input: string): ParsedNumberResult | null {
  if (!input || typeof input !== "string") return null;

  const raw = input.trim();
  const lower = raw.toLowerCase();

  // Pattern 1: Multi-word slang like "setengah juta"
  const multiSlang = lower.match(/\bsetengah\s+juta\b/);
  if (multiSlang && multiSlang.index !== undefined) {
    return {
      amount: 500000,
      matchedText: multiSlang[0],
      startIndex: multiSlang.index,
      endIndex: multiSlang.index + multiSlang[0].length,
    };
  }

  // Pattern 2: Digits with decimal and suffixes like "2.5jt", "2,5 juta", "15rb", "15k", "20 rb", "25 k"
  const hybridRegex = /\b(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)\b/i;
  const hybridMatch = lower.match(hybridRegex);
  if (hybridMatch && hybridMatch.index !== undefined) {
    const rawVal = parseFloat(hybridMatch[1].replace(",", "."));
    const unit = hybridMatch[2].toLowerCase();
    let multiplier = 1;
    if (unit === "k" || unit === "rb" || unit === "ribu") multiplier = 1000;
    if (unit === "jt" || unit === "juta") multiplier = 1000000;

    const amount = Math.round(rawVal * multiplier);
    return {
      amount,
      matchedText: hybridMatch[0],
      startIndex: hybridMatch.index,
      endIndex: hybridMatch.index + hybridMatch[0].length,
    };
  }

  // Pattern 3: Explicit standard currency numbers like "rp. 15.000", "rp 20.000", or raw digits "50000"
  const directCurrencyRegex = /(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:rupiah|perak)?\b/i;
  const directMatch = lower.match(directCurrencyRegex);
  if (directMatch && directMatch.index !== undefined && directMatch[1]) {
    const cleanDigits = directMatch[1].replace(/\./g, "");
    const amount = parseInt(cleanDigits, 10);
    // Only accept if preceded by rp or followed by currency, or value >= 100
    const matchedSegment = directMatch[0].trim();
    if (
      amount >= 100 ||
      matchedSegment.toLowerCase().startsWith("rp") ||
      matchedSegment.toLowerCase().includes("rupiah") ||
      matchedSegment.toLowerCase().includes("perak")
    ) {
      return {
        amount,
        matchedText: directMatch[0],
        startIndex: directMatch.index,
        endIndex: directMatch.index + directMatch[0].length,
      };
    }
  }

  // Pattern 4: Spoken words sequence (e.g. "dua puluh lima ribu", "ceban", "lima belas ribu perak")
  const validTokens = new Set([
    "nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas", "seratus", "seribu", "sejuta",
    "belas", "puluh", "ratus", "ribu", "juta",
    "seceng", "gopek", "cepek", "ceban", "noban", "gocap",
    "rupiah", "perak"
  ]);

  const wordsWithIndices: { word: string; start: number; end: number }[] = [];
  const tokenRegex = /[a-zA-Z]+/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(lower)) !== null) {
    wordsWithIndices.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Find contiguous sequence of number tokens
  let bestSequence: { word: string; start: number; end: number }[] = [];
  let currentSeq: { word: string; start: number; end: number }[] = [];

  for (const item of wordsWithIndices) {
    if (validTokens.has(item.word)) {
      currentSeq.push(item);
    } else {
      if (currentSeq.length > bestSequence.length) {
        bestSequence = currentSeq;
      }
      currentSeq = [];
    }
  }
  if (currentSeq.length > bestSequence.length) {
    bestSequence = currentSeq;
  }

  if (bestSequence.length > 0) {
    // Exclude if only "rupiah" or "perak" alone
    const nonCurrencyWords = bestSequence.filter(w => w.word !== "rupiah" && w.word !== "perak");
    if (nonCurrencyWords.length > 0) {
      const calculatedAmount = wordsToNumber(bestSequence.map(w => w.word));
      if (calculatedAmount !== null && calculatedAmount > 0) {
        const start = bestSequence[0].start;
        const end = bestSequence[bestSequence.length - 1].end;
        return {
          amount: calculatedAmount,
          matchedText: raw.slice(start, end),
          startIndex: start,
          endIndex: end,
        };
      }
    }
  }

  return null;
}
