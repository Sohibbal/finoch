export interface ParsedNumberResult {
  amount: number;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}

const SLANG_MAP: Record<string, number> = {
  cepek: 100,
  gopek: 500,
  seceng: 1000,
  goceng: 5000,
  ceban: 10000,
  noban: 20000,
  gocap: 50000,
  goban: 50000,
  nopek: 200000,
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
};

// "se-" prefixed words are shorthand for "satu <scale>" and must go through the scale logic
const SE_WORDS: Record<string, string> = {
  sebelas: "belas",
  sepuluh: "puluh",
  seratus: "ratus",
  seribu: "ribu",
  sejuta: "juta",
};

const SCALE_ALIASES: Record<string, string> = {
  rebu: "ribu",
  rb: "ribu",
  k: "ribu",
  jt: "juta",
};

const CURRENCY_WORDS = new Set(["rupiah", "perak"]);
const SCALE_WORDS = new Set(["belas", "puluh", "ratus", "ribu", "rebu", "juta"]);
// Abbreviations only count as a scale right after a number (e.g. "15k", "20 rb")
const ABBREVIATIONS = new Set(["rb", "k", "jt"]);

function isNumberWord(word: string): boolean {
  return (
    BASE_WORDS[word] !== undefined ||
    SE_WORDS[word] !== undefined ||
    SLANG_MAP[word] !== undefined ||
    SCALE_WORDS.has(word) ||
    word === "setengah"
  );
}

/**
 * Splits glued spoken numbers such as "duaribu" or "limapuluh" into separate words.
 */
function splitGluedWord(word: string): string[] {
  if (isNumberWord(word)) return [word];
  const glued = word.match(/^([a-z]+?)(belas|puluh|ratus|ribu|rebu|juta)$/);
  if (glued) {
    const head = splitGluedWord(glued[1]);
    if (head.every(isNumberWord)) return [...head, glued[2]];
  }
  return [word];
}

/**
 * Parses a digit token: "45.000" / "12,500" use thousands separators,
 * while "2.5" / "1,5" are decimals.
 */
function parseDigitToken(token: string): number {
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(token)) {
    return parseInt(token.replace(/[.,]/g, ""), 10);
  }
  return parseFloat(token.replace(",", "."));
}

/**
 * Converts a sequence of Indonesian number words (e.g. "dua puluh lima ribu") into a numeric value.
 */
export function wordsToNumber(words: string[]): number | null {
  if (words.length === 0) return null;

  let total = 0; // value already scaled by ribu/juta
  let chunk = 0; // current group below one thousand (e.g. "seratus lima puluh")
  let pending = 0; // last unit digit not yet attached to puluh/belas/ratus
  let lastScale = 0;
  let matchedAny = false;

  const applyScale = (scale: string) => {
    if (scale === "ribu" || scale === "juta") {
      const multiplier = scale === "ribu" ? 1000 : 1000000;
      total += (chunk + pending || 1) * multiplier;
      chunk = 0;
      lastScale = multiplier;
    } else {
      const unit = pending || 1;
      if (scale === "belas") chunk += unit + 10;
      else if (scale === "puluh") chunk += unit * 10;
      else chunk += unit * 100;
    }
    pending = 0;
  };

  const expanded = words.flatMap((w) => splitGluedWord(w.toLowerCase()));

  for (const raw of expanded) {
    const word = SCALE_ALIASES[raw] ?? raw;

    if (word === "rp" || CURRENCY_WORDS.has(word)) continue;

    if (SE_WORDS[word] !== undefined) {
      pending = 1;
      applyScale(SE_WORDS[word]);
    } else if (BASE_WORDS[word] !== undefined) {
      pending += BASE_WORDS[word];
    } else if (SLANG_MAP[word] !== undefined) {
      pending += SLANG_MAP[word];
    } else if (word === "setengah") {
      // "2 juta setengah" -> half of the last scale; "dua setengah juta" -> 2.5 juta
      if (chunk === 0 && pending === 0 && lastScale > 0) {
        total += lastScale / 2;
      } else {
        pending += 0.5;
      }
    } else if (SCALE_WORDS.has(word)) {
      applyScale(word);
    } else if (/^\d+(?:[.,]\d+)*$/.test(word)) {
      pending += parseDigitToken(word);
    } else {
      return null;
    }
    matchedAny = true;
  }

  return matchedAny ? Math.round(total + chunk + pending) : null;
}

interface Token {
  text: string;
  start: number;
  end: number;
}

interface Candidate {
  amount: number;
  start: number;
  end: number;
  hasUnit: boolean;
}

/**
 * Scans input text for Indonesian currency/number representations and extracts the best match.
 *
 * Every run of number tokens is evaluated; amounts carrying a currency marker
 * (rp, ribu, juta, slang, rupiah...) win, otherwise the last plain amount >= 100 is used.
 */
export function parseIndonesianNumber(input: string): ParsedNumberResult | null {
  if (!input || typeof input !== "string") return null;

  const raw = input.trim();
  const lower = raw.toLowerCase();

  const tokens: Token[] = [];
  const tokenRegex = /\d+(?:[.,]\d+)*|[a-z]+/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(lower)) !== null) {
    tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }

  const candidates: Candidate[] = [];
  let run: Token[] = [];
  let rpStart: number | null = null;

  const flush = () => {
    const numberTokens = run.filter((t) => !CURRENCY_WORDS.has(t.text));
    if (numberTokens.length > 0) {
      const amount = wordsToNumber(run.map((t) => t.text));
      if (amount !== null && amount > 0) {
        const hasUnit =
          rpStart !== null ||
          run.flatMap((t) => splitGluedWord(t.text)).some((w) => {
            const scale = SE_WORDS[w] ?? SCALE_ALIASES[w] ?? w;
            return scale === "ribu" || scale === "juta" || CURRENCY_WORDS.has(w) || SLANG_MAP[w] !== undefined;
          });
        candidates.push({
          amount,
          start: rpStart ?? run[0].start,
          end: run[run.length - 1].end,
          hasUnit,
        });
      }
    }
    run = [];
    rpStart = null;
  };

  for (const token of tokens) {
    const word = token.text;
    const prev = run[run.length - 1]?.text;
    const prevIsDigit = prev !== undefined && /^\d/.test(prev);
    const prevIsScale = prev !== undefined && /(?:ribu|rebu|juta|^rb|^k|^jt)$/.test(prev);
    const isDigit = /^\d/.test(word);

    if (word === "rp") {
      flush();
      rpStart = token.start;
      continue;
    }

    let belongs = false;
    if (isDigit) {
      // A new digit only continues a run after a scale word ("2 ribu 500")
      if (run.length > 0 && !prevIsScale) flush();
      belongs = true;
    } else if (ABBREVIATIONS.has(word)) {
      belongs = prevIsDigit || (prev !== undefined && isNumberWord(prev));
    } else if (CURRENCY_WORDS.has(word)) {
      belongs = run.length > 0;
    } else if (splitGluedWord(word).every(isNumberWord)) {
      if (prevIsDigit && !SCALE_WORDS.has(word) && word !== "setengah") flush();
      belongs = true;
    }

    if (belongs) {
      run.push(token);
    } else {
      flush();
    }
  }
  flush();

  // A bare small number ("es teh dua") is a quantity, not a price
  const best =
    candidates.find((c) => c.hasUnit) ??
    [...candidates].reverse().find((c) => c.amount >= 100);
  if (!best) return null;

  return {
    amount: best.amount,
    matchedText: raw.slice(best.start, best.end),
    startIndex: best.start,
    endIndex: best.end,
  };
}
