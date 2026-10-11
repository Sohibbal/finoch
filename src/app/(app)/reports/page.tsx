"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Download, FileSpreadsheet, FileText, MessageSquare, Printer } from "lucide-react";
import Link from "next/link";
import { MonthlyReportSummary } from "@/types/report-types";
import {
  generateMonthlyReport,
  generateCsvContent,
  generateLpjSpreadsheetCsv,
  MONTH_NAMES_ID,
  ExpenseRecord,
} from "@/lib/financial/report-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { useAuthContext } from "@/components/layout/auth-provider";

import { ReportWhatsAppModal } from "@/components/reports/report-whatsapp-modal";
import { ReportPrintableDocument } from "@/components/reports/report-printable-document";
import { ContentSkeleton, EMPTY_ACTION_CLASS, EmptyState, PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { isDemoMode } from "@/lib/storage/local-storage";
import { getBills } from "@/lib/storage/bill-storage";
import { monthLedger, fixedCostScope } from "@/lib/financial/month-ledger";
import type { RecurringBill } from "@/types/bill-types";

const SELECT_CLASS =
  "min-h-11 px-3 bg-paper-sheet border border-ink/30 text-body font-semibold text-ink rounded-none focus-visible:outline-offset-2";
const PRIMARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet dark:text-paper text-body font-semibold transition-colors";
const SECONDARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5 transition-colors";

export default function ReportsPage() {
  const { user } = useAuthContext();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const profile = useFinancialProfile();
  const [loaded, setLoaded] = useState(false);
  const studentName = user?.name || user?.email?.split("@")[0] || "Mahasiswa Finoch";
  const campusName = "Kampus Indonesia";

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Load profile and expenses
  const loadData = useCallback(async () => {
    try {
      // Demo mode shows only local demo rows; the server holds the real expenses.
      const res = isDemoMode() ? null : await fetch("/api/expenses");
      if (res?.ok) {
        const data = await res.json();
        if (Array.isArray(data.expenses) && data.expenses.length > 0) {
          setExpenses(data.expenses);
          return;
        }
      }

      const local = await expenseStorage.getExpenses();
      if (local && local.length > 0) {
        setExpenses(
          local.map((e) => ({
            id: e.id,
            itemName: e.itemName,
            amount: e.amount,
            category: e.category,
            createdAt: e.createdAt,
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fixed costs come from the same month ledger as every page, so the closing figure agrees with them.
  const [bills, setBills] = useState<RecurringBill[]>([]);
  useEffect(() => setBills(getBills()), []);
  const fixed = useMemo(
    () =>
      monthLedger({
        monthlyIncome: profile.monthlyIncome ?? 0,
        profileFixedCosts: profile.fixedExpenses ?? 0,
        bills,
        transactions: [],
        now: new Date(selectedYear, selectedMonth - 1, 1),
      }),
    [profile.monthlyIncome, profile.fixedExpenses, bills, selectedMonth, selectedYear]
  );

  // Compute summary for selected month & year
  const summary: MonthlyReportSummary = useMemo(() => {
    return generateMonthlyReport(expenses, profile.monthlyIncome ?? 0, selectedMonth, selectedYear, fixed.fixedCosts);
  }, [expenses, profile.monthlyIncome, selectedMonth, selectedYear, fixed.fixedCosts]);

  // Export CSV
  const handleExportCsv = () => {
    const csvContent = generateCsvContent(expenses);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `finoch-laporan-keuangan-${summary.monthName.toLowerCase()}-${summary.year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export LPJ Beasiswa Spreadsheet CSV
  const handleExportLpj = () => {
    const csvContent = generateLpjSpreadsheetCsv(expenses, summary, studentName, campusName);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `finoch-lpj-beasiswa-${summary.monthName.toLowerCase()}-${summary.year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <>
      <PageHeader className="print:hidden" title="Laporan & LPJ" subtitle="Rekap bulanan untuk orang tua atau beasiswa" />

      <ProfileGate profile={profile}>
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-10 space-y-6 print:p-0">
        <div className="max-w-4xl mx-auto flex flex-wrap items-end gap-x-6 gap-y-4 print:hidden">
          <div className="flex items-end gap-2">
            <label className="space-y-1">
              <span className="block text-meta text-ink-soft">Bulan</span>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={SELECT_CLASS}>
                {MONTH_NAMES_ID.map((name, idx) => (
                  <option key={idx} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-meta text-ink-soft">Tahun</span>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={SELECT_CLASS}>
                {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loaded && expenses.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <button type="button" onClick={() => setIsWhatsAppModalOpen(true)} className={PRIMARY_ACTION}>
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Kirim ke WhatsApp
              </button>
              <button type="button" onClick={handleExportLpj} className={SECONDARY_ACTION} title="Format LPJ beasiswa, dibuka di Excel">
                <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                LPJ Excel
              </button>
              <button type="button" onClick={handleExportCsv} className={SECONDARY_ACTION}>
                <Download className="w-4 h-4" aria-hidden="true" />
                CSV
              </button>
              <button type="button" onClick={handlePrint} className={SECONDARY_ACTION} title="Cetak atau simpan sebagai PDF A4">
                <Printer className="w-4 h-4" aria-hidden="true" />
                Cetak
              </button>
            </div>
          )}
        </div>

        {!loaded ? (
          <ContentSkeleton />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Belum ada transaksi untuk dilaporkan"
            action={
              <Link href="/dashboard" className={EMPTY_ACTION_CLASS}>
                Catat Pengeluaran
              </Link>
            }
          >
            Laporan bulanan dan ekspor LPJ dibuat dari pengeluaran yang kamu catat. Mulai catat, laporan tersusun otomatis.
          </EmptyState>
        ) : (
          <ReportPrintableDocument summary={summary} expenses={expenses} studentName={studentName} campusName={campusName} fixedCostLabel={fixedCostScope(fixed.fixedCostSource)} />
        )}
      </main>
      </ProfileGate>

      {/* WhatsApp Export Modal */}
      <ReportWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        summary={summary}
        defaultStudentName={studentName}
      />
    </>
  );
}
