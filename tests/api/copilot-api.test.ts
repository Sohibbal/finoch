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

  it("establishes Finoch campus & anak kost persona", () => {
    const prompt = buildCopilotSystemPrompt({
      monthlyIncome: 2500000,
      monthlyExpense: 1800000,
      netSavings: 700000,
    });
    expect(prompt).toContain("Finoch AI Copilot");
    expect(prompt).toMatch(/Mahasiswa/i);
    expect(prompt).toMatch(/Anak Kost/i);
  });

  it("includes realistic anak kost guidelines and prohibits rigid 50/30/20 rule", () => {
    const prompt = buildCopilotSystemPrompt({
      monthlyIncome: 2000000,
      monthlyExpense: 1500000,
      netSavings: 500000,
    });
    expect(prompt).toContain("50/30/20");
    expect(prompt).toMatch(/warteg|mie|kopi/i);
    expect(prompt).toMatch(/tanggal tua/i);
  });
});
