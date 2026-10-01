import type { ParsedVoiceItem } from "../types/expense";
import { splitTransactions } from "./transaction-splitter";
import { parseIndonesianNumber } from "./number-normalizer";
import { extractItemName } from "./item-extractor";
import { classifyExpenseCategory } from "../categorization/expense-category-classifier";
import { calculateConfidence } from "./confidence";

/**
 * Pure TypeScript parser for Indonesian voice expense transcripts.
 *
 * Pipeline:
 * Raw transcript
 *   ↓
 * splitTransactions()
 *   ↓
 * parseIndonesianNumber()
 *   ↓
 * extractItemName()
 *   ↓
 * classifyExpenseCategory()
 *   ↓
 * calculateConfidence()
 *   ↓
 * ParsedVoiceItem[]
 *
 * Guaranteed zero React, DOM, or backend dependencies.
 */
export function parseIndonesianExpense(transcript: string): ParsedVoiceItem[] {
  if (!transcript || typeof transcript !== "string") {
    return [];
  }

  const segments = splitTransactions(transcript);
  const items: ParsedVoiceItem[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i].trim();
    if (!segment) continue;

    const numResult = parseIndonesianNumber(segment);
    if (!numResult || numResult.amount <= 0) {
      continue;
    }

    const itemName = extractItemName(segment, numResult.matchedText);
    const category = classifyExpenseCategory(itemName);
    const confidence = calculateConfidence(itemName, numResult.amount, true);

    items.push({
      id: `parsed-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      rawText: segment,
      itemName,
      amount: numResult.amount,
      category,
      confidence,
    });
  }

  return items;
}
