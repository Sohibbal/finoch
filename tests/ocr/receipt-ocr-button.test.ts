import { describe, it, expect } from "vitest";
import { candidateToSplitItems } from "@/components/split-bill/receipt-ocr-button";
import type { TransactionCandidate } from "@/types/financial-types";

const base: TransactionCandidate = {
  merchant: "MIE GACOAN",
  amount: 23000,
  category: "Food & Drinks",
  date: "2026-10-02",
  source: "ocr",
};

describe("candidateToSplitItems", () => {
  it("maps each receipt line item to a split item", () => {
    const items = candidateToSplitItems({
      ...base,
      items: [
        { name: "MIE HOMPIMPA", amount: 18000 },
        { name: "ES TEH", amount: 5000 },
      ],
    });
    expect(items).toEqual([
      { name: "MIE HOMPIMPA", price: 18000, quantity: 1, assignedParticipantIds: [] },
      { name: "ES TEH", price: 5000, quantity: 1, assignedParticipantIds: [] },
    ]);
  });

  it("falls back to a single item named after the merchant", () => {
    expect(candidateToSplitItems({ ...base, items: [] })).toEqual([
      { name: "MIE GACOAN", price: 23000, quantity: 1, assignedParticipantIds: [] },
    ]);
  });

  it("returns nothing without a valid amount", () => {
    expect(candidateToSplitItems({ ...base, amount: 0, items: [] })).toEqual([]);
  });
});
