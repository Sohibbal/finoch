"use client";

import React from "react";
import { Printer, Download, CheckCircle2, ShieldCheck } from "lucide-react";
import { MonthlyReportSummary } from "@/types/report-types";
import { ExpenseRecord } from "@/lib/financial/report-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface ReportPrintableDocumentProps {
  summary: MonthlyReportSummary;
  expenses: ExpenseRecord[];
  studentName?: string;
  campusName?: string;
  onPrint?: () => void;
  onExportCsv?: () => void;
}

export function ReportPrintableDocument({
  summary,
  expenses,
  studentName = "Mahasiswa Finoch",
  campusName = "Perguruan Tinggi",
  onPrint,
  onExportCsv,
}: ReportPrintableDocumentProps) {
  const isSurplus = summary.netSavings >= 0;

  return (
    <div className="space-y-4">
      {/* Top Document Controls (Hidden when printed) */}
      <div className="print:hidden flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800">
        <div className="flex items-center gap-2 pl-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-navy-950 dark:text-cream-50">
            Format Resmi Pertanggungjawaban (A4 Print-Ready)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="px-3.5 py-1.5 rounded-xl border border-cream-300 dark:border-navy-800 hover:bg-cream-100 dark:hover:bg-navy-900 text-navy-700 dark:text-cream-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          )}

          {onPrint && (
            <button
              onClick={onPrint}
              className="px-4 py-1.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 dark:hover:bg-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF (A4)</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet (Standard A4 Proportions on Screen, Clean Pure Print on Paper) */}
      <div
        id="printable-report"
        className="rounded-3xl bg-white text-navy-950 border border-cream-300 dark:border-navy-800 p-8 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 space-y-6 max-w-4xl mx-auto"
      >
        {/* Document Header */}
        <div className="border-b-2 border-navy-900 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-navy-950">
                finoch<span className="text-emerald-600">.id</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-navy-100 text-navy-800 px-2 py-0.5 rounded">
                Official Statement
              </span>
            </div>
            <h2 className="text-lg font-bold text-navy-900 mt-1 uppercase tracking-wide">
              Laporan Keuangan & Akuntabilitas Mahasiswa
            </h2>
            <p className="text-xs text-navy-600">
              Periode Pelaporan: <strong>{summary.monthName} {summary.year}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-navy-600 space-y-0.5">
            <p><strong>Nama:</strong> {studentName}</p>
            <p><strong>Institusi:</strong> {campusName}</p>
            <p className="text-[10px] text-navy-500">
              Digenerate: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Financial Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-4 border border-navy-200 rounded-2xl p-4 bg-navy-50/40">
          <div>
            <span className="text-[10px] uppercase font-bold text-navy-500 block">
              1. Total Pemasukan / Uang Saku
            </span>
            <span className="text-base font-black text-navy-950">
              {formatRupiah(summary.totalIncome)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-navy-500 block">
              2. Total Realisasi Pengeluaran
            </span>
            <span className="text-base font-black text-rose-600">
              {formatRupiah(summary.totalExpenses)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-navy-500 block">
              3. Saldo Kas Bersih (Surplus)
            </span>
            <span className={`text-base font-black ${isSurplus ? "text-emerald-700" : "text-rose-700"}`}>
              {formatRupiah(summary.netSavings)}
            </span>
          </div>
        </div>

        {/* 50/30/20 Rule Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
            I. Klasifikasi Anggaran (Metode 50/30/20)
          </h3>
          <table className="w-full text-xs text-left border border-navy-200 rounded-xl overflow-hidden">
            <thead className="bg-navy-100 text-navy-900 font-bold border-b border-navy-200">
              <tr>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Deskripsi</th>
                <th className="py-2.5 px-3 text-right">Realisasi (IDR)</th>
                <th className="py-2.5 px-3 text-right">Porsi (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              <tr>
                <td className="py-2 px-3 font-semibold text-emerald-800">Kebutuhan Pokok (Needs)</td>
                <td className="py-2 px-3 text-navy-600">Makan, kost, utilitas, buku kuliah & bensin</td>
                <td className="py-2 px-3 text-right font-bold">{formatRupiah(summary.needsAmount)}</td>
                <td className="py-2 px-3 text-right">{summary.needsPercentage}%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-800">Keinginan & Gaya Hidup (Wants)</td>
                <td className="py-2 px-3 text-navy-600">Nongkrong, hiburan & jajan tambahan</td>
                <td className="py-2 px-3 text-right font-bold">{formatRupiah(summary.wantsAmount)}</td>
                <td className="py-2 px-3 text-right">{summary.wantsPercentage}%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-blue-800">Tabungan / Investasi (Savings)</td>
                <td className="py-2 px-3 text-navy-600">Dana darurat & saldo akhir</td>
                <td className="py-2 px-3 text-right font-bold">{formatRupiah(summary.savingsAmount)}</td>
                <td className="py-2 px-3 text-right">{summary.savingsPercentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Breakdown by Category */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
            II. Rincian Pengeluaran per Kategori
          </h3>
          <table className="w-full text-xs text-left border border-navy-200 rounded-xl overflow-hidden">
            <thead className="bg-navy-100 text-navy-900 font-bold border-b border-navy-200">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Pos Kategori</th>
                <th className="py-2.5 px-3 text-center">Jumlah Transaksi</th>
                <th className="py-2.5 px-3 text-right">Total Nominal</th>
                <th className="py-2.5 px-3 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {summary.topCategories.map((cat, idx) => (
                <tr key={cat.category}>
                  <td className="py-2 px-3 font-medium text-navy-500">{idx + 1}</td>
                  <td className="py-2 px-3 font-bold text-navy-900">{cat.category}</td>
                  <td className="py-2 px-3 text-center text-navy-600">{cat.transactionCount}x</td>
                  <td className="py-2 px-3 text-right font-bold">{formatRupiah(cat.amount)}</td>
                  <td className="py-2 px-3 text-right text-navy-600">{cat.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formal Signature Block */}
        <div className="pt-8 border-t border-navy-200 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-navy-600 mb-16">Disiapkan secara jujur & transparan oleh:</p>
            <p className="font-bold underline text-navy-950">{studentName}</p>
            <p className="text-[10px] text-navy-500">Mahasiswa / Penerima Dana</p>
          </div>

          <div>
            <p className="text-navy-600 mb-16">Mengetahui / Menerima:</p>
            <p className="font-bold underline text-navy-950">_________________________</p>
            <p className="text-[10px] text-navy-500">Orang Tua / Pengelola Beasiswa</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 text-center text-[10px] text-navy-500">
          Dokumen ini digenerate secara otomatis melalui platform <strong>finoch.id</strong> untuk transparansi keuangan mahasiswa.
        </div>
      </div>
    </div>
  );
}
