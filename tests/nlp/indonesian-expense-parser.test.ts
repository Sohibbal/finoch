// tests/nlp/indonesian-expense-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { classifyExpenseCategory } from "@/lib/categorization/expense-category-classifier";
import { extractItemName } from "@/lib/nlp/item-extractor";

describe("Expense Category Classifier", () => {
  it("classifies primer items accurately", () => {
    expect(classifyExpenseCategory("Nasi Padang")).toBe("primer");
    expect(classifyExpenseCategory("Bensin Motor")).toBe("primer");
    expect(classifyExpenseCategory("Pulsa Telkomsel")).toBe("primer");
    expect(classifyExpenseCategory("Fotokopi Modul Kuliah")).toBe("primer");
    expect(classifyExpenseCategory("Obat Panadol")).toBe("primer");
    expect(classifyExpenseCategory("Beras 5kg")).toBe("primer");
  });

  it("classifies bocor_halus items accurately", () => {
    expect(classifyExpenseCategory("Kopi Susu")).toBe("bocor_halus");
    expect(classifyExpenseCategory("Boba Chatime")).toBe("bocor_halus");
    expect(classifyExpenseCategory("Snack Ciki")).toBe("bocor_halus");
    expect(classifyExpenseCategory("Top Up Diamond ML")).toBe("bocor_halus");
    expect(classifyExpenseCategory("Rokok Surya")).toBe("bocor_halus");
    expect(classifyExpenseCategory("Nongkrong Cafe")).toBe("bocor_halus");
    expect(classifyExpenseCategory("Checkout Shopee")).toBe("bocor_halus");
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
    expect(result[0].category).toBe("primer");
    expect(result[0].confidence).toBeGreaterThan(0.8);
  });

  it("parses compound expense into primer and bocor_halus", () => {
    const transcript = "beli ayam geprek dua puluh ribu sama kopi susu lima belas ribu";
    const result = parseIndonesianExpense(transcript);
    expect(result).toHaveLength(2);

    expect(result[0].itemName.toLowerCase()).toBe("ayam geprek");
    expect(result[0].amount).toBe(20000);
    expect(result[0].category).toBe("primer");

    expect(result[1].itemName.toLowerCase()).toBe("kopi susu");
    expect(result[1].amount).toBe(15000);
    expect(result[1].category).toBe("bocor_halus");
  });

  it("parses 3-item multi transaction with abbreviations", () => {
    const transcript = "nasi uduk 10rb terus es teh 5rb sama rokok 25rb";
    const result = parseIndonesianExpense(transcript);
    expect(result).toHaveLength(3);
    expect(result[0].amount).toBe(10000);
    expect(result[1].amount).toBe(5000);
    expect(result[2].amount).toBe(25000);
    expect(result[0].category).toBe("primer");
    expect(result[1].category).toBe("bocor_halus");
    expect(result[2].category).toBe("bocor_halus");
  });

  it("handles empty or unparseable input gracefully", () => {
    expect(parseIndonesianExpense("")).toHaveLength(0);
    expect(parseIndonesianExpense("halo selamat pagi")).toHaveLength(0);
  });
});
