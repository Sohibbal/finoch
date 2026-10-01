// tests/nlp/transaction-splitter.test.ts
import { describe, it, expect } from "vitest";
import { normalizeText } from "@/lib/nlp/normalize-text";
import { splitTransactions } from "@/lib/nlp/transaction-splitter";

describe("Text Normalizer", () => {
  it("cleans excessive whitespace, lowercase, and punctuation", () => {
    const raw = "  Tadi Beli Nasi Goreng  15rb!  ";
    expect(normalizeText(raw)).toBe("tadi beli nasi goreng 15rb");
  });

  it("handles empty or blank input", () => {
    expect(normalizeText("")).toBe("");
    expect(normalizeText("   ")).toBe("");
  });
});

describe("Transaction Splitter", () => {
  it("splits compound sentence with price before conjunction", () => {
    const raw = "beli nasi goreng lima belas ribu dan es teh lima ribu";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(2);
    expect(segments[0]).toContain("nasi goreng lima belas ribu");
    expect(segments[1]).toContain("es teh lima ribu");
  });

  it("splits multiple conjunctions: sama, lalu, terus", () => {
    const raw = "ayam geprek 15rb terus parkir 2rb sama pulsa 25rb";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(3);
    expect(segments[0]).toContain("ayam geprek 15rb");
    expect(segments[1]).toContain("parkir 2rb");
    expect(segments[2]).toContain("pulsa 25rb");
  });

  it("splits comma-separated transactions with prices", () => {
    const raw = "nasi padang 20 ribu, kopi 10 ribu";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(2);
  });

  it("does NOT split 'dan' when connecting items without preceding price (Review Focus guard)", () => {
    const raw = "beli nasi dan ayam bakar 25 ribu";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(1);
    expect(segments[0]).toBe("beli nasi dan ayam bakar 25 ribu");
  });

  it("does NOT split 'sama' when connecting food items without preceding price", () => {
    const raw = "beli roti sama susu sepuluh ribu";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(1);
    expect(segments[0]).toBe("beli roti sama susu sepuluh ribu");
  });
});
