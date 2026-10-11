// tests/nlp/indonesian-expense-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { classifyExpenseCategory } from "@/lib/categorization/expense-category-classifier";
import { extractItemName } from "@/lib/nlp/item-extractor";

describe("Expense Category Classifier", () => {
  it("classifies items into appropriate natural categories accurately", () => {
    expect(classifyExpenseCategory("Nasi Padang")).toBe("Food & Drinks");
    expect(classifyExpenseCategory("Bensin Motor")).toBe("Transportation");
    expect(classifyExpenseCategory("Pulsa Telkomsel")).toBe("Bills & Utilities");
    expect(classifyExpenseCategory("Fotokopi Modul Kuliah")).toBe("Other");
    expect(classifyExpenseCategory("Obat Panadol")).toBe("Other");
    expect(classifyExpenseCategory("Beras 5kg")).toBe("Food & Drinks");
    expect(classifyExpenseCategory("Kopi Susu")).toBe("Food & Drinks");
    expect(classifyExpenseCategory("Top Up Diamond ML")).toBe("Shopping & Lifestyle");
    expect(classifyExpenseCategory("Checkout Shopee")).toBe("Shopping & Lifestyle");
    expect(classifyExpenseCategory("Kirim uang adik")).toBe("Other");
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
    expect(result[2].category).toBe("Bills & Utilities");
  });

  it("handles empty or unparseable input gracefully", () => {
    expect(parseIndonesianExpense("")).toHaveLength(0);
    expect(parseIndonesianExpense("halo selamat pagi")).toHaveLength(0);
  });
});

describe("Classifier keyword regressions", () => {
  it.each([
    ["Tiket Bioskop Malam", "Shopping & Lifestyle"],
    ["Tagihan Air Pdam", "Bills & Utilities"],
    ["Aqua Ml", "Food & Drinks"],
    ["Teh Botol", "Food & Drinks"],
    ["Es Jeruk", "Food & Drinks"],
    ["Kerupuk", "Food & Drinks"],
    ["Soto Ayam", "Food & Drinks"],
    ["Bakmi", "Food & Drinks"],
    ["Gofood", "Food & Drinks"],
    ["Ojek Pangkalan", "Transportation"],
    ["Taksi Bandara", "Transportation"],
    ["Bayar Kosan", "Bills & Utilities"],
    ["Fotocopy Tugas", "Other"],
    ["Kosmetik", "Other"],
  ])("classifies %s as %s", (item, expected) => {
    expect(classifyExpenseCategory(item)).toBe(expected);
  });
});

describe("Parser regressions", () => {
  it("lowers confidence when no category keyword matches", () => {
    const [known] = parseIndonesianExpense("nasi padang 15 ribu");
    const [unknown] = parseIndonesianExpense("barang random 15 ribu");
    expect(unknown.category).toBe("Other");
    expect(unknown.confidence).toBeLessThan(known.confidence);
  });

  it("does not turn a bare quantity word into a price", () => {
    const result = parseIndonesianExpense("es teh dua sama roti 10 ribu");
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(10000);
  });

  it("parses README example: nasi padang goceng sama es teh duaribu", () => {
    const result = parseIndonesianExpense("Beli nasi padang ayam gulai goceng sama es teh duaribu");
    expect(result.map((r) => r.amount)).toEqual([5000, 2000]);
    expect(result.every((r) => r.category === "Food & Drinks")).toBe(true);
    expect(result.reduce((sum, r) => sum + r.amount, 0)).toBe(7000);
  });

  it("parses README example: top up gopay lima puluh rebu bayar sewa bensin ceban cash", () => {
    const result = parseIndonesianExpense("Top up gopay lima puluh rebu bayar sewa bensin ceban cash");
    expect(result.map((r) => r.amount)).toEqual([50000, 10000]);
    expect(result[0].category).toBe("Shopping & Lifestyle");
    expect(result[1].category).toBe("Transportation");
  });
});

describe("splits items spoken without a comma or conjunction", () => {
  it.each([
    ["nasi padang 18rb es teh 5rb", [["Nasi Padang", 18000], ["Es Teh", 5000]]],
    ["makan warteg delapan belas ribu es teh lima ribu", [["Makan Warteg", 18000], ["Es Teh", 5000]]],
    ["nasi goreng 15 ribu teh manis 4 ribu kerupuk 2 ribu", [["Nasi Goreng", 15000], ["Teh Manis", 4000], ["Kerupuk", 2000]]],
    ["bensin 20rb parkir 2rb", [["Bensin", 20000], ["Parkir", 2000]]],
  ])("%s", (input, expected) => {
    expect(parseIndonesianExpense(input as string).map((i) => [i.itemName, i.amount])).toEqual(expected);
  });

  it.each([
    ["dua ribu lima ratus", 2500],
    ["parkir 2 ribu 500", 2500],
    ["seratus lima puluh ribu", 150000],
    ["fotokopi 100 lembar 15000", 15000],
  ])("keeps %s as one amount", (input, amount) => {
    const items = parseIndonesianExpense(input as string);
    expect(items).toHaveLength(1);
    expect(items[0].amount).toBe(amount);
  });
});
