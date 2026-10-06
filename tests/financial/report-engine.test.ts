import { describe, it, expect } from "vitest";
import {
  generateMonthlyReport,
  formatWhatsAppReport,
  generateCsvContent,
  generateLpjSpreadsheetCsv,
  MONTH_NAMES_ID,
} from "@/lib/financial/report-engine";

describe("Financial Report Engine", () => {
  const mockExpenses = [
    {
      id: "1",
      itemName: "Nasi Padang",
      amount: 25000,
      category: "Food & Drinks",
      createdAt: "2026-10-02T12:00:00Z",
    },
    {
      id: "2",
      itemName: "Kopi Susu Senja",
      amount: 20000,
      category: "Entertainment",
      createdAt: "2026-10-03T15:00:00Z",
    },
    {
      id: "3",
      itemName: "Token Listrik Kost",
      amount: 100000,
      category: "Bills & Utilities",
      createdAt: "2026-10-04T09:00:00Z",
    },
    {
      id: "4",
      itemName: "Pengeluaran Bulan Lalu",
      amount: 50000,
      category: "Food",
      createdAt: "2026-09-15T10:00:00Z", // September, should be filtered out
    },
  ];

  it("calculates monthly report summary for October correctly", () => {
    const summary = generateMonthlyReport(mockExpenses, 2000000, 10, 2026);

    expect(summary.month).toBe(10);
    expect(summary.year).toBe(2026);
    expect(summary.monthName).toBe("Oktober");
    expect(summary.totalIncome).toBe(2000000);
    expect(summary.totalExpenses).toBe(145000); // 25k + 20k + 100k
    expect(summary.netSavings).toBe(1855000);
    expect(summary.totalTransactions).toBe(3);

    expect(summary.needsAmount).toBe(125000); // 25k food + 100k bills
    expect(summary.wantsAmount).toBe(20000); // 20k coffee

    expect(summary.topCategories.length).toBeGreaterThan(0);
    expect(summary.topCategories[0].category).toBe("Bills & Utilities");
  });

  it("formats WhatsApp report for parents respectfully with proper rupiah formatting", () => {
    const summary = generateMonthlyReport(mockExpenses, 2000000, 10, 2026);
    const waText = formatWhatsAppReport(summary, {
      recipientType: "parents",
      studentName: "Budi",
      campusName: "UI",
      customNote: "Bulan ini hemat karena banyak masak di kost.",
    });

    expect(waText).toContain("Ayah & Ibu");
    expect(waText).toContain("Budi (UI)");
    expect(waText).toContain("Uang Saku Diterima:");
    expect(waText).toContain("Total Pengeluaran:");
    expect(waText).toContain("Bulan ini hemat karena banyak masak di kost.");
    expect(waText).toContain("finoch.id");
  });

  it("formats WhatsApp report for scholarship formally", () => {
    const summary = generateMonthlyReport(mockExpenses, 2000000, 10, 2026);
    const waText = formatWhatsAppReport(summary, {
      recipientType: "scholarship",
      studentName: "Siti Rahma",
      campusName: "ITB",
      customNote: "Dana digunakan untuk akomodasi dan buku kuliah.",
    });

    expect(waText).toContain("LAPORAN PERTANGGUNGJAWABAN BIAYA HIDUP MAHASISWA");
    expect(waText).toContain("Siti Rahma");
    expect(waText).toContain("ITB");
    expect(waText).toContain("Dana Bantuan Diterima:");
    expect(waText).toContain("AKUNTABILITAS");
  });

  it("generates CSV content with UTF-8 BOM and correct column headers", () => {
    const csv = generateCsvContent(mockExpenses);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Tanggal,Kategori,Nama Pengeluaran,Nominal (IDR)");
    expect(csv).toContain("Nasi Padang");
    expect(csv).toContain("Token Listrik Kost");
  });

  it("generates LPJ academic spreadsheet CSV with scholarship headers", () => {
    const summary = generateMonthlyReport(mockExpenses, 2000000, 10, 2026);
    const lpjCsv = generateLpjSpreadsheetCsv(mockExpenses, summary, "Ahmad Dani", "UGM");
    expect(lpjCsv.startsWith("\uFEFF")).toBe(true);
    expect(lpjCsv).toContain("LAPORAN PERTANGGUNGJAWABAN (LPJ) BIAYA HIDUP MAHASISWA");
    expect(lpjCsv).toContain("Ahmad Dani");
    expect(lpjCsv).toContain("UGM");
    expect(lpjCsv).toContain("Pos Anggaran");
    expect(lpjCsv).toContain("Saldo Berjalan (IDR)");
  });
});
