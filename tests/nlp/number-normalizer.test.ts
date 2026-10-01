// tests/nlp/number-normalizer.test.ts
import { describe, it, expect } from "vitest";
import { parseIndonesianNumber } from "@/lib/nlp/number-normalizer";

describe("Indonesian Number Normalizer", () => {
  it("parses single spoken words", () => {
    expect(parseIndonesianNumber("lima belas ribu")?.amount).toBe(15000);
    expect(parseIndonesianNumber("dua puluh lima ribu")?.amount).toBe(25000);
    expect(parseIndonesianNumber("dua juta lima ratus ribu")?.amount).toBe(2500000);
    expect(parseIndonesianNumber("seratus ribu")?.amount).toBe(100000);
    expect(parseIndonesianNumber("seribu")?.amount).toBe(1000);
    expect(parseIndonesianNumber("sepuluh ribu")?.amount).toBe(10000);
    expect(parseIndonesianNumber("sebelas ribu")?.amount).toBe(11000);
    expect(parseIndonesianNumber("dua puluh ribu")?.amount).toBe(20000);
  });

  it("parses colloquial abbreviations and numeric hybrid combinations", () => {
    expect(parseIndonesianNumber("15rb")?.amount).toBe(15000);
    expect(parseIndonesianNumber("15k")?.amount).toBe(15000);
    expect(parseIndonesianNumber("20 rb")?.amount).toBe(20000);
    expect(parseIndonesianNumber("25 k")?.amount).toBe(25000);
    expect(parseIndonesianNumber("2.5jt")?.amount).toBe(2500000);
    expect(parseIndonesianNumber("2,5 juta")?.amount).toBe(2500000);
    expect(parseIndonesianNumber("1.5 juta")?.amount).toBe(1500000);
  });

  it("parses Indonesian student slang denominations", () => {
    expect(parseIndonesianNumber("ceban")?.amount).toBe(10000);
    expect(parseIndonesianNumber("gocap")?.amount).toBe(50000);
    expect(parseIndonesianNumber("seceng")?.amount).toBe(1000);
    expect(parseIndonesianNumber("gopek")?.amount).toBe(500);
    expect(parseIndonesianNumber("setengah juta")?.amount).toBe(500000);
    expect(parseIndonesianNumber("sejuta")?.amount).toBe(1000000);
  });

  it("handles currency words gracefully", () => {
    expect(parseIndonesianNumber("sepuluh ribu rupiah")?.amount).toBe(10000);
    expect(parseIndonesianNumber("lima ribu perak")?.amount).toBe(5000);
    expect(parseIndonesianNumber("rp 15.000")?.amount).toBe(15000);
    expect(parseIndonesianNumber("rp. 20.000")?.amount).toBe(20000);
    expect(parseIndonesianNumber("50000")?.amount).toBe(50000);
  });

  it("extracts amount from inside a sentence and returns indices", () => {
    const result = parseIndonesianNumber("beli nasi goreng lima belas ribu enak");
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(15000);
    expect(result?.matchedText.trim()).toBe("lima belas ribu");
  });

  it("returns null for non-numeric sentences", () => {
    expect(parseIndonesianNumber("halo selamat pagi kawan")).toBeNull();
  });
});
