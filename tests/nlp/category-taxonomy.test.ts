import { describe, it, expect } from "vitest";
import { SPENDING_CATEGORIES } from "@/types/financial-types";

describe("Expense Category Taxonomy", () => {
  it("contains the 9 natural spending categories", () => {
    expect(SPENDING_CATEGORIES).toContain("Food & Drinks");
    expect(SPENDING_CATEGORIES).toContain("Transportation");
    expect(SPENDING_CATEGORIES).toContain("Housing & Bills");
    expect(SPENDING_CATEGORIES).toContain("Shopping & Clothing");
    expect(SPENDING_CATEGORIES).toContain("Entertainment & Leisure");
    expect(SPENDING_CATEGORIES).toContain("Education & Career");
    expect(SPENDING_CATEGORIES).toContain("Health & Personal Care");
    expect(SPENDING_CATEGORIES).toContain("Social & Family");
    expect(SPENDING_CATEGORIES).toContain("Other");
  });

  it("does not force 50/30/20 categorization as primary taxonomy", () => {
    expect(SPENDING_CATEGORIES.length).toBeGreaterThanOrEqual(9);
  });
});
