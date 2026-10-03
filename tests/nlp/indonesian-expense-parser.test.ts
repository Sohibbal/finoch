// tests/nlp/indonesian-expense-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { classifyExpenseCategory } from "@/lib/categorization/expense-category-classifier";
import { extractItemName } from "@/lib/nlp/item-extractor";

describe("Expense Category Classifier", () => {
  it("classifies items into appropriate natural categories accurately", () => {
    expect(classifyExpenseCategory("Nasi Padang")).toBe("Food & Drinks");
    expect(classifyExpenseCategory("Bensin Motor")).toBe("Transportation");
    expect(classifyExpenseCategory("Pulsa Telkomsel")).toBe("Housing & Bills");
    expect(classifyExpenseCategory("Fotokopi Modul Kuliah")).toBe("Education & Career");
    expect(classifyExpenseCategory("Obat Panadol")).toBe("Health & Personal Care");
    expect(classifyExpenseCategory("Beras 5kg")).toBe("Food & Drinks");
    expect(classifyExpenseCategory("Kopi Susu")).toBe("Food & Drinks");
    expect(classifyExpenseCategory("Top Up Diamond ML")).toBe("Entertainment & Leisure");
    expect(classifyExpenseCategory("Checkout Shopee")).toBe("Shopping & Clothing");
    expect(classifyExpenseCategory("Kirim uang adik")).toBe("Social & Family");
  });
});

describe("Item Extractor", () => {
  it("strips filler phrases and title-cases item name", () => {
    expect(extractItemName("tadi beli nasi goreng lima belas ribu", "lima belas ribu")).toBe("Nasi Goreng");
    expect(extractItemName("bayar parkir motor dua ribu", "dua ribu")).toBe("Parkir Motor");
    expect(extractItemName("keluar uang buat pulsa 25rb", "25rb")).toBe("Pulsa");
  });
});

describe("Indonesian Expense Parser Complete Pipeline", () => {
  it("parses single student expense with filler removal", () => {
    const result = parseIndonesianExpense("tadi beli nasi padang lima belas ribu");
    expect(result).toHaveLength(1);
    expect(result[0].itemName.toLowerCase()).toBe("nasi padang");
    expect(result[0].amount).toBe(15000);
    expect(result[0].category).toBe("Food & Drinks");
    expect(result[0].confidence).toBeGreaterThan(0.8);
  });

  it("parses compound expense into appropriate categories", () => {
    const transcript = "beli ayam geprek dua puluh ribu sama bensin lima belas ribu";
    const result = parseIndonesianExpense(transcript);
    expect(result).toHaveLength(2);

    expect(result[0].itemName.toLowerCase()).toBe("ayam geprek");
    expect(result[0].amount).toBe(20000);
    expect(result[0].category).toBe("Food & Drinks");

    expect(result[1].itemName.toLowerCase()).toBe("bensin");
    expect(result[1].amount).toBe(15000);
    expect(result[1].category).toBe("Transportation");
  });

  it("parses 3-item multi transaction with abbreviations", () => {
    const transcript = "nasi uduk 10rb terus bensin 15rb sama pulsa 25rb";
    const result = parseIndonesianExpense(transcript);
    expect(result).toHaveLength(3);
    expect(result[0].amount).toBe(10000);
    expect(result[1].amount).toBe(15000);
    expect(result[2].amount).toBe(25000);
    expect(result[0].category).toBe("Food & Drinks");
    expect(result[1].category).toBe("Transportation");
    expect(result[2].category).toBe("Housing & Bills");
  });

  it("handles empty or unparseable input gracefully", () => {
    expect(parseIndonesianExpense("")).toHaveLength(0);
    expect(parseIndonesianExpense("halo selamat pagi")).toHaveLength(0);
  });
});
