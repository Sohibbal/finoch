"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Calendar,
  Download,
  Printer,
  Share2,
  MessageSquare,
  Sparkles,
  TrendingDown,
  PieChart,
  FileSpreadsheet,
} from "lucide-react";
import { MonthlyReportSummary } from "@/types/report-types";
import {
  generateMonthlyReport,
  generateCsvContent,
  generateLpjSpreadsheetCsv,
  MONTH_NAMES_ID,
  ExpenseRecord,
} from "@/lib/financial/report-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";

import { ReportSummaryCard } from "@/components/reports/report-summary-card";
import { ReportWhatsAppModal } from "@/components/reports/report-whatsapp-modal";
import { ReportPrintableDocument } from "@/components/reports/report-printable-document";

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [monthlyAllowance, setMonthlyAllowance] = useState<number>(2000000);
  const [studentName, setStudentName] = useState<string>("Mahasiswa Finoch");
  const [campusName, setCampusName] = useState<string>("Kampus Indonesia");

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Load profile and expenses
  const loadData = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData?.profile) {
          if (pData.profile.monthlyIncome) {
            setMonthlyAllowance(Number(pData.profile.monthlyIncome));
          }
          if (pData.profile.fullName) {
            setStudentName(pData.profile.fullName);
          } else if (user?.email) {
            setStudentName(user.email.split("@")[0]);
          }
        }
      }
    } catch {
      // fallback
    }

    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
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
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute summary for selected month & year
  const summary: MonthlyReportSummary = useMemo(() => {
    return generateMonthlyReport(expenses, monthlyAllowance, selectedMonth, selectedYear);
  }, [expenses, monthlyAllowance, selectedMonth, selectedYear]);

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
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      {/* Desktop Left Sidebar (Hidden on print) */}
      <DashboardSidebar className="hidden md:flex print:hidden" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12 h-screen overflow-y-auto custom-scrollbar print:h-auto print:overflow-visible print:p-0">
        {/* Top Header (Hidden on print) */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 pb-2 print:hidden">
          <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
            {/* Left: Mobile Back Button & Title */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-navy-700 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
                aria-label="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="md:hidden shrink-0 flex items-center" aria-label="Finoch Beranda">
                <BrandLogo variant="symbol" className="w-5 h-5 shrink-0" />
              </Link>
              <div className="min-w-0">
                <Breadcrumbs className="hidden md:flex mb-0.5" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide truncate">
                  Laporan &amp; Ekspor Bulanan
                </h1>
                <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block">
                  Format resmi pertanggungjawaban untuk orang tua atau beasiswa
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Month Selector Dropdown */}
              <div className="flex items-center gap-1.5 bg-cream-100 dark:bg-navy-900 px-3 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 text-xs font-semibold text-navy-800 dark:text-cream-200">
                <Calendar className="w-3.5 h-3.5 text-navy-500 dark:text-cream-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-navy-950 dark:text-cream-50 focus:outline-none font-bold"
                >
                  {MONTH_NAMES_ID.map((name, idx) => (
                    <option key={idx} value={idx + 1} className="dark:bg-navy-900">
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-navy-950 dark:text-cream-50 focus:outline-none font-bold"
                >
                  <option value={2026} className="dark:bg-navy-900">2026</option>
                  <option value={2025} className="dark:bg-navy-900">2025</option>
                </select>
              </div>

              {/* Desktop action buttons */}
              <button
                onClick={handleExportLpj}
                className="hidden lg:flex px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 items-center gap-1.5 transition-all shadow-sm"
                title="Unduh format formal LPJ Beasiswa / Excel Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>LPJ Excel</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="hidden lg:flex px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200 text-xs font-bold hover:bg-cream-100 dark:hover:bg-navy-900 items-center gap-1.5 transition-all"
                title="Unduh format spreadsheet CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="hidden sm:flex px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200 text-xs font-bold hover:bg-cream-100 dark:hover:bg-navy-900 items-center gap-1.5 transition-all"
                title="Cetak atau simpan sebagai PDF A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak A4</span>
              </button>

              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim WhatsApp</span>
                <span className="sm:hidden">Share WA</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
          {/* Summary Metric Cards */}
          <div className="print:hidden">
            <ReportSummaryCard summary={summary} />
          </div>

          {/* MOBILE PWA VIEW (md:hidden) */}
          <div className="md:hidden space-y-4 print:hidden">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
                Rincian Kategori ({summary.topCategories.length})
              </span>
              <span className="text-xs font-semibold text-navy-600 dark:text-cream-300">
                {summary.totalTransactions} Transaksi
              </span>
            </div>

            <div className="space-y-2.5">
              {summary.topCategories.map((cat, idx) => (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cream-200 dark:bg-navy-900 text-navy-700 dark:text-cream-300 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-navy-950 dark:text-cream-50">
                        {cat.category}
                      </span>
                    </div>
                    <span className="font-black text-xs text-navy-950 dark:text-cream-50">
                      {formatRupiah(cat.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-navy-500 dark:text-cream-400">
                    <span>{cat.transactionCount} transaksi</span>
                    <span>{cat.percentage}% dari total belanja</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-cream-200 dark:bg-navy-900 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Button for Mobile */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 text-center space-y-2">
              <h4 className="text-xs font-bold text-navy-950 dark:text-cream-50">
                Kirim Laporan Resmi ke Orang Tua
              </h4>
              <p className="text-[11px] text-navy-600 dark:text-cream-300">
                Format pesan sopan siap kirim via WhatsApp tanpa ribet rekap manual.
              </p>
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Buka Template WhatsApp</span>
              </button>
            </div>
          </div>

          {/* DESKTOP VIEW: Printable Document Section */}
          <div className="hidden md:block">
            <ReportPrintableDocument
              summary={summary}
              expenses={expenses}
              studentName={studentName}
              campusName={campusName}
              onPrint={handlePrint}
              onExportCsv={handleExportCsv}
            />
          </div>
        </main>
      </div>

      {/* MOBILE STICKY FLOATING DOCK (md:hidden, hidden on print) */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none flex justify-center print:hidden">
        <div className="pointer-events-auto w-full max-w-md bg-white/95 dark:bg-[#070E1A]/95 border border-cream-300 dark:border-navy-800 rounded-2xl shadow-xl p-2.5 flex items-center justify-between backdrop-blur-xl">
          <div className="pl-2">
            <span className="text-[10px] text-navy-500 dark:text-cream-400 block leading-tight">
              Sisa Saldo Kas
            </span>
            <span className="text-sm font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(summary.netSavings)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportLpj}
              className="min-h-[44px] px-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1"
              title="Unduh LPJ Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>LPJ</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="min-h-[44px] px-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-100 dark:bg-navy-900 text-navy-800 dark:text-cream-200 font-bold text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="min-h-[44px] px-3.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="print:hidden">
        <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
      </div>

      {/* WhatsApp Export Modal */}
      <ReportWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        summary={summary}
        defaultStudentName={studentName}
      />
    </div>
  );
}
