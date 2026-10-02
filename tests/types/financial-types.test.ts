import { describe, it, expect } from "vitest";
import {
  SPENDING_CATEGORIES,
  DEFAULT_50_30_20_TARGETS,
  validateTransactionCandidate,
} from "@/types/financial-types";

describe("Financial Domain Types & Validation", () => {
  it("defines standard spending categories and 50/30/20 targets", () => {
    expect(SPENDING_CATEGORIES).toContain("Food");
    expect(SPENDING_CATEGORIES).toContain("Transportation");
    expect(SPENDING_CATEGORIES).toContain("Housing");
    expect(DEFAULT_50_30_20_TARGETS.needsRatio).toBe(0.5);
    expect(DEFAULT_50_30_20_TARGETS.wantsRatio).toBe(0.3);
    expect(DEFAULT_50_30_20_TARGETS.savingsRatio).toBe(0.2);
  });

  it("validates transaction candidate data", () => {
    const valid = validateTransactionCandidate({
      merchant: "Mie Gacoan",
      amount: 38000,
      category: "Food",
      spendingType: "needs",
      date: "2026-10-02",
      source: "ocr",
    });
    expect(valid.isValid).toBe(true);

    const invalid = validateTransactionCandidate({
      merchant: "",
      amount: -5000,
      category: "Unknown",
      spendingType: "needs",
      date: "invalid-date",
      source: "manual",
    });
    expect(invalid.isValid).toBe(false);
  });
});
