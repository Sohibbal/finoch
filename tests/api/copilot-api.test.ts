import { describe, it, expect } from "vitest";
import { buildCopilotSystemPrompt } from "@/app/api/copilot/prompt-builder";

describe("Copilot Prompt Builder", () => {
  it("injects real financial facts into system prompt", () => {
    const prompt = buildCopilotSystemPrompt({
      nickname: "Alex",
      monthlyIncome: 3000000,
      monthlyExpense: 2150000,
      netBalance: 850000,
      topExpenseCategory: "Food (Rp920.000)",
      wishlistSummary: "1. Beli Laptop (Rp8.000.000)",
    });
    expect(prompt).toContain("Alex");
    expect(prompt).toContain("Rp3.000.000");
    expect(prompt).toContain("Rp2.150.000");
    expect(prompt).toContain("Beli Laptop");
    expect(prompt).toContain("Jangan mengarang");
  });

  it("establishes FinBot Gen-Z persona", () => {
    const prompt = buildCopilotSystemPrompt({
      nickname: "Salsa",
      monthlyIncome: 2500000,
      monthlyExpense: 1800000,
      netBalance: 700000,
    });
    expect(prompt).toContain("FinBot");
    expect(prompt).toMatch(/Gen-Z/i);
    expect(prompt).toMatch(/lo\/gue/i);
  });

  it("enforces zero hallucination and ground truth rules", () => {
    const prompt = buildCopilotSystemPrompt({
      nickname: "Rian",
      monthlyIncome: 2000000,
      monthlyExpense: 1500000,
      netBalance: 500000,
    });
    expect(prompt).toContain("ZERO HALLUCINATION");
    expect(prompt).toContain("data fakta database");
    expect(prompt).toMatch(/boncos/i);
  });
});
