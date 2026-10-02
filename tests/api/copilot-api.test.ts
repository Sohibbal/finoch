import { describe, it, expect } from "vitest";
import { buildCopilotSystemPrompt } from "@/app/api/copilot/prompt-builder";

describe("Copilot Prompt Builder", () => {
  it("injects real financial facts into system prompt", () => {
    const prompt = buildCopilotSystemPrompt({
      monthlyIncome: 3000000,
      monthlyExpense: 2150000,
      netSavings: 850000,
      topCategory: "Food (Rp920.000)",
      goalName: "Beli Laptop",
      goalStatus: "on_track",
    });
    expect(prompt).toContain("Rp3.000.000");
    expect(prompt).toContain("Rp2.150.000");
    expect(prompt).toContain("Beli Laptop");
    expect(prompt).toContain("Dilarang mengarang");
  });
});
