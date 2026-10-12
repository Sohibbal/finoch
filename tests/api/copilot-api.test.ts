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

  it("instructs LLM to distinguish current month vs all-time and respect category filters", () => {
    const prompt = buildCopilotSystemPrompt({
      nickname: "Maya",
      monthlyIncome: 4000000,
      monthlyExpense: 2500000,
      netBalance: 1500000,
    });
    expect(prompt).toContain('"BULAN INI" VS "SELAMA INI / SEMUA"');
    expect(prompt).toContain("PERTANYAAN BULAN TERTENTU");
    expect(prompt).toContain("PERTANYAAN KATEGORI");
  });

  it("instructs LLM to evaluate today spending against daily allowance rather than net balance alone", () => {
    const prompt = buildCopilotSystemPrompt({
      nickname: "Budi",
      monthlyIncome: 3000000,
      monthlyExpense: 1000000,
      netBalance: 2000000,
      todayExpense: 120000,
      dailyAllowance: 50000,
    });
    expect(prompt).toContain("PERTANYAAN AMAN / BOROS / JATAH PENGELUARAN HARI INI");
    expect(prompt).toContain("TARGET JATAH HARIAN");
    expect(prompt).toContain("DILARANG KERAS MENGGUNAKAN TANDA STRIP EM DASH");
  });
});
